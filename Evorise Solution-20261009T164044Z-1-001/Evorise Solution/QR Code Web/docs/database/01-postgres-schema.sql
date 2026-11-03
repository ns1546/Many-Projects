-- EVORISE ENTERPRISE RESTAURANT SYSTEM
-- PRIMARY TRANSACTIONAL DATABASE SCHEMA (POSTGRESQL 16)
-- ARCHITECTURE: POLYGLOT PERSISTENCE (This DB handles financial truth only)

BEGIN;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For cryptographic functions

-- 2. ENUMS
CREATE TYPE order_status AS ENUM (
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'REFUNDED'
);
CREATE TYPE payment_status AS ENUM (
    'UNPAID', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'
);

-- 3. CORE TENANT TABLES (Multi-Tenant Architecture)
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    gps_lat DECIMAL(10, 8) NOT NULL,
    gps_lng DECIMAL(11, 8) NOT NULL,
    geofence_radius_meters INT NOT NULL DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_label VARCHAR(50) NOT NULL,
    floor_level INT NOT NULL DEFAULT 1,
    ble_beacon_uuid UUID, -- For micro-location
    current_session_id VARCHAR(255), -- Lock mechanism to prevent double seating
    UNIQUE(restaurant_id, table_label)
);
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);

-- 4. MENU & CATALOG (Heavily read-optimized)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
    image_url VARCHAR(1024),
    is_available BOOLEAN NOT NULL DEFAULT true,
    inventory_count INT -- NULL means unlimited
);
CREATE INDEX idx_products_category ON products(category_id);

-- 5. ORDER ENGINE (High Throughput)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    table_id UUID NOT NULL REFERENCES tables(id),
    session_jti UUID NOT NULL, -- Ties to the JWT token ID
    status order_status NOT NULL DEFAULT 'PENDING',
    payment_status payment_status NOT NULL DEFAULT 'UNPAID',
    subtotal_cents BIGINT NOT NULL,
    tax_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- BRIN index for massive time-series queries
CREATE INDEX idx_orders_created_brin ON orders USING BRIN (created_at);
-- Partial index for active OMS dashboards (Ultra fast reads)
CREATE INDEX idx_orders_active_dashboard ON orders (restaurant_id, created_at DESC)
WHERE status IN ('PENDING', 'ACCEPTED', 'PREPARING', 'READY');

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL,
    modifiers JSONB, -- Stored as JSONB for dynamic schema flexibility
    notes VARCHAR(500)
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_modifiers ON order_items USING GIN (modifiers);

-- 6. TRIGGERS & FUNCTIONS
-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

COMMIT;
