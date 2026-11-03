# Architecture Deep Dive: Database Engineering & Sizing
**Document ID:** ARCH-DB-001 | **Status:** DRAFT | **Author:** Core Data Team

## 1. Database Topology Strategy
To support millions of concurrent clicks and rapid order insertion without locking, the monolithic database approach is replaced by a polyglot persistence model.

1. **PostgreSQL 16 (Primary Transactional System of Record):** Handles tables, restaurants, staff, and order financial integrity.
2. **Redis Cluster (In-Memory Data Grid):** Handles active session tracking, distributed locking, WebSocket pub/sub, and heavily cached menu reads.
3. **ClickHouse (OLAP / Analytics):** Handles time-series event ingestion for the admin dashboards.
4. **Apache Kafka (Event Broker):** The central nervous system decoupling writes.

---

## 2. PostgreSQL Detailed Schema (ACID Core)

### 2.1 UUIDv7 Standard
All primary keys use `UUIDv7`. Unlike UUIDv4 (which is completely random and causes massive B-Tree index fragmentation leading to high disk I/O), UUIDv7 is time-ordered. This ensures sequential disk writes and extremely fast range queries for orders.

### 2.2 DDL Specifications (Orders Module)

```sql
-- Enforce UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants Table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    tenant_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    gps_lat DECIMAL(9,6) NOT NULL,
    gps_lng DECIMAL(9,6) NOT NULL,
    geofence_radius_meters INT DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_restaurants_tenant ON restaurants(tenant_id);

-- Tables (Physical Restaurant Tables)
CREATE TABLE dining_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_identifier VARCHAR(20) NOT NULL, -- e.g. "T-12", "Balcony-3"
    floor_level INT NOT NULL,
    ble_beacon_uuid VARCHAR(36),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(restaurant_id, table_identifier)
);
CREATE INDEX idx_dining_tables_rest ON dining_tables(restaurant_id);

-- Orders (Optimized for fast inserts and status updates)
CREATE TYPE order_status_enum AS ENUM (
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'REFUNDED'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
    table_id UUID REFERENCES dining_tables(id) NOT NULL,
    session_jwt_id VARCHAR(36) NOT NULL, -- Ties back to the JTI of the session token
    status order_status_enum DEFAULT 'PENDING',
    subtotal_cents BIGINT NOT NULL, -- Storing currency as integers to prevent floating point math errors
    tax_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial Indexes for extreme speed on the OMS Dashboard
-- The dashboard ONLY queries orders that are not yet delivered.
CREATE INDEX idx_orders_active_dashboard 
ON orders(restaurant_id, created_at DESC) 
WHERE status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY');

-- Order Items (Line Items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- References the catalog
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL,
    modifiers JSONB -- Flexible JSON for variations (e.g., {"spice": "high", "extra": "cheese"})
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
-- GIN Index for fast searching inside the JSONB modifiers
CREATE INDEX idx_order_items_modifiers ON order_items USING GIN (modifiers);
```

---

## 3. Redis Sizing & Configuration

To handle millions of users, Redis is deployed in Cluster Mode across 6 shards (3 Primaries, 3 Replicas).

### 3.1 Memory Allocation & Eviction
- **Total Cluster RAM:** 64 GB
- **Eviction Policy:** `volatile-lru`. We set explicit TTLs on all session data and cached menus. If memory maxes out, it evicts the least recently used keys *that have an expiration set*.

### 3.2 Data Structures
- **Menu Cache:** `GET menu:rest_{id}`
  - Serialized as a compressed JSON string or MessagePack. TTL: 24 hours. Invalidated via Pub/Sub on admin update.
- **Session Tracking:** `HASH session:{table_id}`
  - Fields: `jwt_jti`, `device_hash`, `started_at`, `status`.
  - Enables O(1) checks to see if a table is currently occupied when someone scans a QR code.
- **Idempotency Keys:** `SETNX idempotency:{order_hash} "1" EX 3600`
  - Prevents double charging. The `order_hash` is generated from the cart contents + device ID. If a user clicks "Order" 10 times in 1 second, Redis `SETNX` ensures only the first request succeeds.

---

## 4. ClickHouse Analytics Ingestion

ClickHouse is used because PostgreSQL cannot aggregate millions of rows in milliseconds for the real-time Admin dashboard.

### 4.1 Ingestion Pipeline
1. `Order Engine` writes to Postgres.
2. Debezium (Kafka Connect) uses logical decoding on the Postgres WAL (Write-Ahead Log) to capture the exact row change.
3. The event is pushed to Kafka topic `db.evorise.orders.changes`.
4. ClickHouse Kafka Engine natively consumes the topic and materializes it.

### 4.2 ClickHouse Table Definition
```sql
CREATE TABLE evorise_analytics.order_events (
    timestamp DateTime,
    restaurant_id UUID,
    order_id UUID,
    status String,
    total_revenue_cents UInt64,
    items_count UInt16
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp) -- Partitions data by month for easy archival
ORDER BY (restaurant_id, timestamp); -- The Primary Key: optimizes queries filtering by restaurant and time
```
*End of Document. Refer to ARCH-K8S-001 for Kubernetes Deployment Specs.*
