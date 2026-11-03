# PRD Deep Dive: Customer Ordering Journey & UX Specs
**Document ID:** PRD-FE-001 | **Status:** DRAFT | **Author:** Product & UX Team

## 1. Zero-Friction Onboarding (The QR Scan)
The fundamental requirement of the Evorise Restaurant System is that customers **never** encounter a login screen, app download prompt, or registration form.

### 1.1 The Scan Event
- **Trigger:** Customer scans the QR code using their native phone camera.
- **Payload:** The QR code contains a deep link: `https://order.evorise.com/r/{restaurant_id}/t/{table_identifier}`
- **Permissions Flow:** 
  1. UI immediately renders a skeleton loading screen of the menu (cached via Service Worker).
  2. A native browser prompt asks for Location Access.
  3. *Error State (Denied):* If denied, a blocking modal appears: *"To ensure you are inside the restaurant and prevent fake orders, we need location access. Alternatively, wave to a waiter to order."*
  4. *Success State:* Location is verified against the backend Haversine formula (See ARCH-SEC-001). A JWT is issued transparently in the background and stored in `sessionStorage` (not `localStorage` to prevent session persistence across browser restarts).

---

## 2. Catalog Browsing & Cart Interactions

### 2.1 Infinite Scroll & Categories
- **Layout:** Horizontal sticky scrollbar for categories at the top (e.g., Starters, Mains, Desserts).
- **Behavior:** As the user scrolls down the page, the category tab highlights the active section in view using the Intersection Observer API.
- **Image Optimization:** All menu images are loaded via a CDN edge image resizing service. Initial load is a 10px blurred placeholder (BlurHash), transitioning to the full WebP image.

### 2.2 Product Detail Modal (PDP)
When a user taps an item (e.g., "Custom Burger"):
- A bottom-sheet modal slides up.
- **Modifiers (Required):** Radio buttons for meat cooking level (Rare, Medium, Well Done).
- **Modifiers (Optional):** Checkboxes for add-ons (+ $1.50 Bacon, + $0.50 Extra Cheese).
- **Validation:** The "Add to Cart" button remains disabled until all required modifiers are selected.

### 2.3 The Floating Cart
- A floating Action Button (FAB) or a persistent bottom bar showing the total item count and running total amount.
- **Animation:** When an item is added, a subtle micro-interaction (badge pop) confirms the action.

---

## 3. Checkout & Live Tracking

### 3.1 Idempotent Checkout
When the user taps "Place Order":
1. **Idempotency Key Generation:** The client generates a unique UUID `checkout_{hash}`.
2. **Network Tolerance:** If the restaurant's Wi-Fi drops for 3 seconds, the Service Worker queues the `POST` request. The UI shows a "Connecting to Kitchen..." spinner. Once network resumes, the request fires.
3. If the user angrily taps the button 5 times, the Idempotency Key ensures the API Gateway only processes the very first request.

### 3.2 The Live Tracker (WebSockets)
Once the order is `HTTP 202 Accepted`, the UI transitions to the Live Tracker screen.
- **State 1 (Pending):** "Sending to Kitchen..." (Pulse animation).
- **State 2 (Preparing):** "Chef is preparing your food." (Lottie animation of cooking).
- **State 3 (Ready):** "Food is ready! A waiter is bringing it to your table." (Green success state).
- **State 4 (Delivered):** "Enjoy your meal!" -> 10 seconds later, the screen transitions to the receipt/feedback view.

*End of Document. Refer to PRD-OMS-002 for Admin workflows.*
