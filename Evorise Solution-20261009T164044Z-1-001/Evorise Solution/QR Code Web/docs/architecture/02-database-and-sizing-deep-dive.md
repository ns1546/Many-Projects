# Architecture Deep Dive 02: Globally Distributed Database & Sizing
**Document ID:** ARCH-002 | **Status:** APPROVED (HYPERSCALE)

## 1. The Database Architecture (Google Cloud Spanner)
A standard Primary/Replica PostgreSQL setup fails under global write loads. We are utilizing **Google Cloud Spanner**, a globally distributed, ACID-compliant database.

### 1.1 Atomic Clocks (TrueTime)
Spanner uses GPS receivers and atomic clocks in its data centers to guarantee strict serializability of transactions globally. This means an order placed in New York and an inventory update in Tokyo are mathematically guaranteed to sequence correctly without locking the database.

### 1.2 Active-Active Multi-Continent Topology
The `evorise_orders` database spans:
- `us-east4` (Virginia)
- `europe-west1` (Belgium)
- `asia-northeast1` (Tokyo)
If the US data center goes offline, European and Asian nodes continue processing orders via the Paxos/Raft consensus algorithm. Downtime is literally zero.

## 2. Real-Time Stream Processing (Apache Flink)
To handle the massive ingest of orders, we do not query the database directly for analytics.

### 2.1 The Data Pipeline
1. **Ingest:** API Gateway pushes `OrderCreated` JSON payloads to a 10,000-partition Apache Kafka cluster.
2. **Compute:** Apache Flink consumes the Kafka streams in real-time, executing tumbling windows to calculate live revenue metrics, detect fraudulent velocity, and aggregate restaurant popularity.
3. **Storage:** Flink sinks the aggregated results into ClickHouse (Columnar OLAP database) where the Admin Dashboard queries it in <50ms.

## 3. Caching Tier (L1/L2/L3)
- **L1 (Edge):** Cloudflare Workers cache static menu JSON directly in the user's city.
- **L2 (Local RAM):** Go microservices hold LRU (Least Recently Used) caches for active table sessions.
- **L3 (Redis Cluster):** A 1TB Redis cluster manages the distributed locks (`SETNX`) to ensure double-charging is impossible, even during network retries.
