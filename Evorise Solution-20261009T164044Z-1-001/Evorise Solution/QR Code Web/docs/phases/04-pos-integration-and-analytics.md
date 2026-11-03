# Phase 4 Deep Dive: POS Integration & Analytics
**Document ID:** PHASE-004 | **Status:** DRAFT | **Duration:** 5 Weeks

## 1. Unified POS System
### 1.1 Local Print Spooler (Sprint 13)
- **Task 1.1.1:** Develop the local Node.js print agent that runs on a Raspberry Pi or Windows machine inside the restaurant.
- **Task 1.1.2:** Write the ESC/POS byte generators to format beautiful receipts (Logo, Items, Totals, QR Codes) for thermal printers (e.g., Epson TM-T88V).
- **Task 1.1.3:** Setup WebSocket tunnels between the Cloud `AdminSvc` and the Local Print Spooler.

### 1.2 Inventory Synchronization (Sprint 14)
- **Task 1.2.1:** Implement the stock deduction logic. When an order is accepted (QR or physical POS), trigger an event to decrement stock.
- **Task 1.2.2:** Push "Sold Out" events instantly to all active QR customer sessions via WebSockets, greying out unavailable items in real-time.

## 2. ClickHouse Analytics Engine
### 2.1 Data Ingestion Pipeline (Sprint 15)
- **Task 2.1.1:** Setup Debezium (Kafka Connect) to tail the PostgreSQL WAL (Write-Ahead Log) for the `orders` table.
- **Task 2.1.2:** Configure the ClickHouse Kafka Engine to natively consume the events and insert them into the `order_events` MergeTree table.

### 2.2 Admin Dashboard UI (Sprint 16)
- **Task 2.2.1:** Build the custom Date/Time slicer components in the React Admin panel.
- **Task 2.2.2:** Integrate Chart.js or Recharts to visualize the ClickHouse data (Heatmaps, Top Sellers, Revenue Over Time).
- **Task 2.2.3:** Implement asynchronous CSV export via background workers and email delivery.

## 3. Final Production Rollout (Sprint 17)
- **Task 3.1.1:** Conduct beta testing with real restaurant staff in a controlled environment.
- **Task 3.1.2:** Finalize SLA agreements and PagerDuty alert routing.
- **Gate / Milestone:** "V1.0 Go Live". System is fully operational, secure, and processing millions of analytical data points effortlessly.
