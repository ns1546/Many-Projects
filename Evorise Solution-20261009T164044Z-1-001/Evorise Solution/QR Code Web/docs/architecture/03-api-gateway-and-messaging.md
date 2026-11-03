# Architecture Deep Dive: API Gateway & Event Messaging
**Document ID:** ARCH-API-003 | **Status:** DRAFT | **Author:** Core Platform Team

## 1. API Gateway (Kong / Envoy) Configuration
The API Gateway acts as the single entry point (Reverse Proxy) for all incoming mobile and web traffic. It strips SSL, performs rate limiting, and authenticates the JWT before traffic ever touches a microservice.

### 1.1 Gateway Routing Rules
- **`/api/v1/menu/*`** -> Routes to `MenuSvc`. (Methods: GET). Caching plugin enabled (TTL 5 mins).
- **`/api/v1/sessions/*`** -> Routes to `GeoSvc`. (Methods: POST). Strict rate limit (1 req/sec).
- **`/api/v1/orders/*`** -> Routes to `OrderSvc`. (Methods: POST, GET). Requires valid JWT. Idempotency plugin enabled.
- **`/ws/*`** -> Upgrades connection to WebSockets and routes to `WSSvc`.

### 1.2 Rate Limiting (Token Bucket) Configuration
```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 60
      hour: 1000
      policy: redis
      redis_host: redis-cluster-internal.svc.cluster.local
      fault_tolerant: true # If Redis fails, gateway allows traffic to prevent full outage
```

---

## 2. Event-Driven Architecture (Apache Kafka)
To guarantee zero dropped orders during massive spikes (e.g., millions of clicks during a lunch rush), the Order Engine does not write to the database synchronously while the user waits. It uses an Event-Driven architecture.

### 2.1 Kafka Cluster Topology
- **Brokers:** 5-Node Kafka Cluster spread across 3 Availability Zones (AZs) for high availability.
- **Replication Factor:** 3 (Data is copied to 3 different servers).
- **Min In-Sync Replicas (acks=all):** 2 (A write is only considered successful if at least 2 brokers confirm receipt, ensuring zero data loss if a server crashes).

### 2.2 Core Kafka Topics
1. **Topic:** `evorise.orders.created`
   - **Partitions:** 24 (Allows 24 consumer pods to process orders in parallel).
   - **Retention:** 7 days.
   - **Payload (Protobuf):**
     ```protobuf
     syntax = "proto3";
     message OrderCreatedEvent {
       string order_id = 1;
       string table_id = 2;
       string restaurant_id = 3;
       int64 total_cents = 4;
       int64 timestamp = 5;
     }
     ```

2. **Topic:** `evorise.orders.status_changed`
   - Consumed by the `WSSvc` to push real-time updates to the customer's phone and the Admin Dashboard.

### 2.3 The "Spike Absorption" Flow
When 100,000 users click "Place Order" at exactly 12:00 PM:
1. API Gateway accepts the requests (latency ~10ms).
2. `OrderSvc` validates the payload and instantly publishes an `OrderCreatedEvent` to Kafka.
3. `OrderSvc` returns `HTTP 202 Accepted` to the user immediately. The UI shows "Processing...".
4. Background worker pods consume the Kafka topic, execute the heavy Postgres database transactions, and publish to `status_changed`.
5. The WebSocket pushes the "Order Confirmed" state to the user's phone.
*Result: The database is never overwhelmed, and users never see a loading spinner crash.*

---

## 3. Real-Time WebSockets (WSSvc)
WebSockets are notoriously hard to scale horizontally because they maintain stateful, persistent TCP connections.

### 3.1 Redis Pub/Sub Backplane
Since a customer might be connected to `Pod A` and the Restaurant Admin connected to `Pod B`, Pod A cannot directly send a message to the Admin.
- When an order updates, Kafka triggers `WSSvc`.
- Any `WSSvc` pod publishes the update to Redis Pub/Sub on channel `restaurant:{restaurant_id}`.
- ALL `WSSvc` pods subscribe to this channel. When they receive the message, they check their local memory. If they hold the TCP connection for that specific Admin or Customer, they push the JSON payload down the socket.

*End of Document.*
