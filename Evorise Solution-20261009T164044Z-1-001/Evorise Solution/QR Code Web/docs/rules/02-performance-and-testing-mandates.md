# Rules Deep Dive: Performance & Testing Mandates
**Document ID:** RULE-PERF-002 | **Status:** DRAFT | **Author:** QA & Performance Team

## 1. Algorithmic Complexity (Big-O) Rules
Because this system must scale to millions of concurrent operations, inefficient loops will cause total CPU exhaustion on the backend nodes.

### 1.1 The N+1 Query Problem (Backend)
- **Rule:** You are strictly forbidden from executing database queries inside a loop (The N+1 problem).
- **Scenario:** Loading a list of 50 orders and checking the user details for each one.
  - ❌ BAD: 1 query for orders + 50 individual queries for user names = 51 queries.
  - ✅ GOOD: 1 query for orders, extract all user IDs, and run 1 `WHERE id IN (...)` query = 2 queries.

### 1.2 In-Memory Operations
- **Rule:** Any data transformation on arrays larger than 10,000 items (e.g., in the Analytics Service) must avoid `O(n^2)` operations (nested loops). Use Hash Maps `O(1)` for cross-referencing datasets.

---

## 2. Frontend Performance Standards
Google Core Web Vitals are considered a critical business metric. If the QR menu takes longer than 2 seconds to load on a 3G mobile connection, customers will abandon it.

### 2.1 Bundle Size Limits
- **Rule:** The initial JavaScript bundle sent to the client (uncompressed) must not exceed `150 KB`.
- **Enforcement:** The CI/CD pipeline (e.g., Webpack/Vite size-limit plugins) will automatically block any Pull Request that pushes the bundle size over the threshold. Code splitting and dynamic imports (lazy loading) are mandatory for non-critical routes (like past order history).

### 2.2 Memory Leaks
- **Rule:** All event listeners attached to the `window` or `document` (e.g., scroll listeners for the sticky category header) MUST be properly removed/destroyed when the component unmounts. Failure to do so on single-page applications (SPAs) causes the browser tab to crash on older mobile phones.

---

## 3. Mandatory Testing Thresholds (Quality Assurance)
Code is not considered "done" until it is proven in automated testing.

### 3.1 Unit Testing (Backend & Frontend Logic)
- **Framework:** Jest (Node/React) or native `go test` (Golang).
- **Rule:** `85%` minimum line coverage across all microservices. `100%` coverage required for the `Payment Processing` and `Idempotency Engine` modules.

### 3.2 End-to-End (E2E) Testing
- **Framework:** Playwright or Cypress.
- **Rule:** Critical User Journeys (CUJs) must be fully automated and run against a staging environment before every release.
- **Required CUJs:**
  1. Scan QR -> Load Menu -> Add to Cart -> Checkout -> Live Tracking.
  2. Admin Login -> Auto-Accept Trigger -> Websocket Push to Customer.
  3. Geofence Denial (Simulate a GPS coordinate 500 miles away -> Ensure HTTP 403 response).

### 3.3 Load Testing (Chaos Engineering)
- **Framework:** K6 by Grafana or Artillery.io.
- **Rule:** Before any major architectural release, the staging cluster must survive a simulated load of 10,000 requests per second (RPS) for 15 minutes. 
- The error rate must remain `< 0.1%` and p99 latency `< 500ms`.

*End of Document. Violations of these rules will result in blocked PRs.*
