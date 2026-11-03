# PRD Deep Dive: Admin OMS & Analytics Dashboard
**Document ID:** PRD-OMS-002 | **Status:** DRAFT | **Author:** Product & Operations Team

## 1. Order Management System (OMS) Overview
The OMS is the command center for the restaurant staff. It is accessed via tablets (by waiters) or desktops (by managers). 

### 1.1 Role-Based Access Control (RBAC)
- **Role: Cashier/Waiter:** Can view orders, accept/reject, mark as delivered, and manage tables. Cannot view revenue analytics.
- **Role: Kitchen Staff (KDS View):** Can only view the "Preparing" queue. Can tap an order to move it to "Ready".
- **Role: Manager/Owner:** Full access, including analytics, menu editing, and shift scheduling.

---

## 2. The Kitchen Display System (KDS) & Triage
The heart of the staff experience is the active order board.

### 2.1 Kanban Board Layout
- **Column 1: New Orders (Pending)**
  - Flashes red and plays a sound when a new order arrives.
  - Staff must tap "Accept" (sends it to Column 2) or "Reject" (e.g., if item sold out).
  - *Auto-Accept Bypass:* If Auto-Accept is enabled in Settings, orders skip this column entirely and go straight to Column 2 to save time during rush hours.
- **Column 2: In Kitchen (Preparing)**
  - Displays the order timer (e.g., "14m 30s"). If the timer exceeds the restaurant's SLA (e.g., 20 mins), the card turns red.
- **Column 3: Ready for Delivery**
  - Triggers a notification to the waiter's device (or smartwatch) to pick up the food from the kitchen counter.
- **Column 4: Delivered**
  - Swipes the order off the active board and logs it to the database as completed.

---

## 3. Deep Analytics Engine

The Analytics Dashboard is powered by ClickHouse (ARCH-DB-001) and provides sub-second querying on massive datasets.

### 3.1 Real-Time KPIs (Top Banner)
- **Live Active Tables:** E.g., "14 / 20 Occupied".
- **Revenue Today:** Updates instantly via WebSockets as orders are paid.
- **Current Kitchen Load:** E.g., "28 items pending" (helps manager decide if they need to pause QR ordering).

### 3.2 Advanced Filtering & Charting
- **Date/Time Slicing:** Users can view revenue by hour (to identify peak hours) or compare "This Tuesday vs Last Tuesday".
- **Heatmaps:** A visual representation of which tables generate the most revenue (e.g., window seats vs corner booths).
- **Product Performance (ABC Analysis):**
  - **A Category:** High volume, high margin items (Promote these).
  - **B Category:** Moderate volume.
  - **C Category:** Low volume, low margin (Consider removing from the menu).

### 3.3 Data Export & Compliance
- **Accounting Export:** Managers can generate an end-of-month CSV or PDF report formatted strictly for accounting software (QuickBooks/Xero).
- Since this requires heavy processing, clicking "Export" triggers an asynchronous background job. The user receives an email with a secure, expiring download link 5 minutes later.

*End of Document. Refer to PRD-NFR-003 for Compliance & SLAs.*
