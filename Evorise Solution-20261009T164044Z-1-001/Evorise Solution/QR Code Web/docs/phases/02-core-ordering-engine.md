# Phase 2 Deep Dive: Core Ordering Engine
**Document ID:** PHASE-002 | **Status:** DRAFT | **Duration:** 6 Weeks

## 1. Menu & Catalog Microservice (MenuSvc)
### 1.1 Data Modeling (Sprint 5)
- **Task 1.1.1:** Implement PostgreSQL DDL for Products, Categories, and Modifiers (using JSONB for dynamic modifier structures).
- **Task 1.1.2:** Build the Admin CRUD (Create, Read, Update, Delete) REST API endpoints.
- **Task 1.1.3:** Implement Redis caching layer. Every time the admin updates a product, the Node.js backend invalidates the `menu:{rest_id}` cache key via Pub/Sub.

## 2. Order Processing Engine (OrderSvc)
This is the mission-critical component. It must be written in a highly concurrent language (Go/Node.js) and heavily tested.

### 2.1 Idempotent Checkout (Sprint 6)
- **Task 2.1.1:** Build the `POST /api/v1/orders/place` endpoint.
- **Task 2.1.2:** Implement Redis `SETNX` distributed locking to ensure a user cannot submit the exact same cart twice within a 60-second window.
- **Task 2.1.3:** Configure the Kafka Producer. Instead of writing directly to Postgres, the endpoint validates the request and pushes an `OrderCreatedEvent` to Kafka.

### 2.2 State Machine & Workers (Sprint 7)
- **Task 2.2.1:** Write the Kafka Consumer groups. These workers pull from `OrderCreatedEvent`, execute the Postgres SQL transaction (charging the user/updating inventory), and update the status to `ACCEPTED`.
- **Task 2.2.2:** Build the WebSockets Service (`WSSvc`) to push real-time updates (Pending -> Preparing -> Ready) to the frontend UI.

## 3. Frontend Integration (Sprint 8)
- **Task 3.1:** Connect the existing QR Frontend UI to the new microservice APIs.
- **Task 3.2:** Implement the Skeleton Loaders and error boundary handling.
- **Gate / Milestone:** "Core Loop Complete". A user can scan a code, view the live menu, place an order, and see it update via WebSockets on a simulated Kitchen Display System.
