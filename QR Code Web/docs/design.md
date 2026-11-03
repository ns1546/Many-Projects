# System Design & UI/UX Guidelines

## 1. Design Philosophy
- **Customer Facing (QR Menu):** Minimalist, highly visual, zero-learning-curve. Dark/Light mode support. Large tap targets for accessibility. The interface must feel instantaneous.
- **Admin/Staff Facing (Dashboard):** Data-dense but clearly organized. High contrast for critical alerts. Optimized for tablets (staff on the floor) and desktops (managers).
- **POS Interface:** Fast, keyboard-shortcut friendly, and touch-optimized for rapid order entry.

## 2. Design System
- **Typography:** Modern sans-serif (e.g., Inter, Roboto, or Outfit) for maximum legibility on small screens.
- **Color Palette:**
  - Primary: Brand specific (e.g., Deep Blue/Emerald Green).
  - Success: #10B981 (Order Ready, Delivered).
  - Warning: #F59E0B (Pending, Delayed).
  - Danger: #EF4444 (Cancelled, Security Alert, Out of Range).
- **Components:** Reusable UI components (Buttons, Modals, Steppers) built with robust CSS frameworks (like Tailwind CSS) to ensure scalability and consistency.

## 3. Key User Flows
- **The Frictionless Order Flow:**
  1. Customer scans QR code on table.
  2. Menu Loads instantly (cached via CDN).
  3. Customer adds items to Cart.
  4. Checkout (Location/Geofence verified in background securely).
  5. Live Tracking Screen displays real-time stepper.
- **The Admin Auto-Accept Flow:**
  1. Order hits API Gateway.
  2. Rules engine checks shift schedule and current kitchen load.
  3. System Auto-accepts order.
  4. Pushes instantly to Kitchen Display System (KDS) via WebSockets.
- **The Session Closure Flow:**
  1. Order marked 'Delivered' OR customer GPS goes out of range.
  2. Backend revokes session token.
  3. Table is instantly reset in the Admin panel for the next customer.
