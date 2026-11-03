# Blueprint: Rownaa Enterprise Interactive Flows

## Objective
Migrate all remaining dummy frontend logic, fake alerts, and dead buttons (Add Data, Update Status, Edit Profile) into real C-R-U-D operations hooked to the respective Microservices.

## Step 1: Inventory Microservice Expansion (CRUD)
**Dependencies**: None
**Task**: 
- Edit `services/inventory/server.js` to add `POST /` (Create Car), `PUT /:id` (Update Car), and `DELETE /:id` (Soft Delete Car) endpoints.
- Validate payload inputs (baseRate, name, category).
- Ensure it saves to `rownaa.db` `inventory` table.

## Step 2: Users Microservice Expansion (Admin Approval)
**Dependencies**: None
**Task**: 
- Edit `services/users/server.js` to add `PUT /:id/status` or `PATCH /:id` to approve/reject pending owners.
- Add an `accountStatus` column to `rownaa.db` `users` table if not exists (or use a status field).

## Step 3: Frontend Wiring (Owner Panel)
**Dependencies**: Step 1
**Task**:
- Update `owner-panel.html` and `js/inventory.js`.
- Replace dummy "Accept/Reject/Start Trip" logic with calls to `window.BookingsManager.updateStatus()`.
- Replace "Add Vehicle" dummy button with a working modal form that calls `window.InventoryManager.add()`.

## Step 4: Frontend Wiring (Admin Panel)
**Dependencies**: Step 2
**Task**:
- Update `admin-panel.html` and `js/users.js`.
- Replace dummy "Review/Approve" buttons in the Registrations tab with actual API calls to approve partners.

## Step 5: Frontend Wiring (Customer Panel)
**Dependencies**: None
**Task**:
- Update `customer-panel.html`.
- Wire up the "Cancel Booking" and "Edit Profile" logic to call backend endpoints instead of doing nothing.

## Step 6: Adversarial Review & E2E Validation
**Dependencies**: Steps 3, 4, 5
**Task**:
- Run the `e2e-runner` DevFleet agent to simulate a real user creating a booking, the owner accepting it, the admin viewing it, and the inventory being updated.
