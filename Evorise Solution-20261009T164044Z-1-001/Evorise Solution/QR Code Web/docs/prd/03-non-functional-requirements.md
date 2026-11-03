# PRD Deep Dive: Non-Functional Requirements & Compliance
**Document ID:** PRD-NFR-003 | **Status:** DRAFT | **Author:** Platform Engineering Team

## 1. Compliance & Data Privacy

### 1.1 PII (Personally Identifiable Information) Handling
Because the system relies on frictionless QR scanning, we collect minimal PII. However, IP addresses, GPS coordinates, and Device Fingerprints are considered sensitive data under GDPR and CCPA.
- **Retention Policy:**
  - Active Session Data (Redis): Dropped immediately upon session termination (max 2 hours).
  - Historical Analytics (ClickHouse): IP addresses and Device Fingerprints are hashed (using SHA-256 with a salt) before being written to the database. We store the hash to track returning customers without knowing who they are.
  - GPS Coordinates: Never stored in the database. Evaluated purely in memory during the `GeoSvc` handshake and immediately discarded.

### 1.2 PCI-DSS Compliance (For POS/Payments)
While the initial QR flow does not process online payments, the POS and future online payment integrations must adhere to strict PCI standards.
- No credit card PAN (Primary Account Number) or CVV is ever stored on Evorise servers.
- All payment processing uses iframe tokenization (e.g., Stripe Elements or Square Web Payments SDK). The Evorise backend only stores the safe `payment_intent_id`.

---

## 2. Service Level Agreements (SLAs) & Performance Targets

### 2.1 Uptime & Availability
- **Target:** 99.99% (Four Nines) uptime for the `Order Engine` and `Menu Service`.
- **Target:** 99.9% uptime for the `Analytics Dashboard`. (If analytics goes down, the restaurant can still make money. If the Order Engine goes down, operations stop).
- **Mean Time To Recovery (MTTR):** < 5 minutes (achieved via automated K8s pod restarts and Blue/Green rollbacks).

### 2.2 Latency Targets (99th Percentile - p99)
- **Menu Load Time:** < 50ms (served strictly from Cloudflare CDN).
- **Order Placement (API Gateway to HTTP 202):** < 150ms.
- **WebSocket Notification Delay:** < 500ms from the chef clicking "Ready" to the customer's phone updating.

---

## 3. Disaster Recovery & Failovers

### 3.1 Network Partition Handling (Restaurant Offline)
- If the restaurant's physical ISP (Internet Service Provider) goes down, the Cloud backend cannot communicate with the local POS or KDS screens.
- **Fallback Action:** The `OrderSvc` detects the WebSocket disconnect from the restaurant's KDS. It instantly auto-disables the QR ordering endpoints.
- **Customer UI:** If a customer scans the QR code during an outage, the UI gracefully displays: *"Our digital ordering system is temporarily paused due to local network issues. Please wave to a waiter to place your order."*

### 3.2 Database Catastrophic Failure (Postgres Goes Down)
- We use Amazon RDS / Google Cloud SQL with Multi-AZ (Availability Zone) synchronous replication.
- If the primary database hardware catches fire, the Cloud provider automatically promotes the standby replica to Primary.
- **Expected Downtime:** 30 to 60 seconds of `503 Service Unavailable` errors while DNS propagates to the new Primary database.

*End of Document. PRD Library Complete.*
