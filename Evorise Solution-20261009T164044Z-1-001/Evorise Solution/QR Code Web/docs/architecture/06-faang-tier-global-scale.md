# FAANG-Tier Global Architecture: Scaling to Billions
**Document ID:** ARCH-006 | **Status:** APPROVED | **Target:** Global Active-Active

To reach the engineering capacity of Facebook, Google, or Netflix, a single-region AWS VPC with a standard RDS PostgreSQL database is fundamentally inadequate. 

To support **millions of concurrent restaurants and billions of transactions per day with zero downtime during regional AWS outages**, we are upgrading the architecture to a **Hyperscale Global Active-Active** model.

## 1. Global Edge Compute & Anycast (The Frontend Layer)
*   **Previous Model:** Cloudflare CDN -> ALB -> K8s.
*   **FAANG Model:** We deploy **V8 Isolates (Cloudflare Workers / AWS Lambda@Edge)** directly at 300+ Edge locations globally. 
*   **The Execution:** When a user scans a QR code, the Haversine GPS geofence math and the ECDSA JWT validation are executed at the Edge within `~5ms`. Fraudulent bot traffic never even reaches our core Kubernetes clusters.

## 2. Distributed SQL (The Data Layer)
*   **Previous Model:** Amazon RDS PostgreSQL (Master/Replica). Fails if the `us-east-1` region goes down. Write throughput is limited by a single master node.
*   **FAANG Model:** **Google Cloud Spanner** or **CockroachDB**.
*   **The Execution:** We implement a globally distributed, ACID-compliant database using the Raft consensus algorithm and TrueTime/Atomic Clocks. This allows us to write data to multiple continents simultaneously (Active-Active). If the entire US East Coast loses power, European and Asian data centers continue processing orders without losing a single byte of transaction data.

## 3. Kernel-Level Networking (The Network Layer)
*   **Previous Model:** Standard Kubernetes `kube-proxy` (iptables).
*   **FAANG Model:** **eBPF (Extended Berkeley Packet Filter) via Cilium.**
*   **The Execution:** Standard `iptables` rules collapse under the weight of 50,000+ microservices. We bypass the Linux network stack entirely. Cilium injects routing logic directly into the Linux Kernel using eBPF, reducing network latency between microservices by 40% and providing cryptographic identity via SPIFFE.

## 4. Real-Time Stream Processing (The Analytics Layer)
*   **Previous Model:** Simple Kafka Topics -> ClickHouse.
*   **FAANG Model:** **Apache Flink + Kafka Tiered Storage.**
*   **The Execution:** Flink acts as a stateful stream processor. It analyzes thousands of orders per second in real-time, matching GPS coordinates against Bluetooth RSSI triangulations over a 5-second tumbling window. If it detects velocity impossible for a human (e.g., ordering from a table in New York, then 2 seconds later in London), it issues an instant TCP reset kill-switch to the session.

This is the standard required to operate at hyperscale. The infrastructure code will now reflect this reality.
