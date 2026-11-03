# Design Deep Dive: System Architecture & Tokens
**Document ID:** DES-SYS-001 | **Status:** DRAFT | **Author:** UX/UI Architecture Team

## 1. Core Design Philosophy
The Evorise UI is engineered for absolute speed and cognitive ease. Customers scanning a QR code are often hungry and distracted. The UI must eliminate "decision fatigue" using high-contrast visual hierarchy and predictive spacing.

## 2. Design Tokens (CSS/SCSS Variables)
Design tokens are the atomic values needed to construct and maintain a design system. All styling MUST reference these tokens rather than hardcoded hex values or pixel sizes.

### 2.1 Color Semantics & Palettes
- **Brand Primary (Deep Emerald):**
  - `--color-primary-500: #10B981;` (CTAs, Active States)
  - `--color-primary-600: #059669;` (Hover States)
  - `--color-primary-100: #D1FAE5;` (Background Highlights)
- **Status/Feedback Colors:**
  - `--color-success: #34D399;` (Order Ready, Payment Success)
  - `--color-warning: #FBBF24;` (Order Delayed, Low Stock)
  - `--color-danger: #EF4444;` (Geofence Error, Item Sold Out, Payment Failed)
- **Surface & Typography (Dark Mode First Architecture):**
  - `--color-surface-base: #0F172A;` (App Background)
  - `--color-surface-elevated: #1E293B;` (Cards, Modals)
  - `--text-primary: #F8FAFC;` (Headers, Prices)
  - `--text-secondary: #94A3B8;` (Descriptions, Muted Text)

### 2.2 Typography Scale (Fluid Typography)
Uses the `clamp()` CSS function to dynamically scale fonts across mobile devices without media query breakpoints.
- **Font Family:** `Inter, system-ui, sans-serif` (Optimal x-height for mobile readability).
- `--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);` (Legal, fine print)
- `--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);` (Body copy, item descriptions)
- `--text-3xl: clamp(1.875rem, 1.75rem + 0.625vw, 2.25rem);` (Hero Headers)

### 2.3 The 8-Point Grid System & Spacing
All padding, margins, and component dimensions must be a multiple of 8 to ensure vertical and horizontal rhythm.
- `--space-1: 8px;`
- `--space-2: 16px;`
- `--space-3: 24px;`
- `--space-4: 32px;`

### 2.4 Z-Index Architecture
To absolutely prevent "z-index wars" (where a dropdown hides behind a sticky header), we enforce a strict, 5-tier z-index scale:
```css
:root {
  --z-base: 0;
  --z-sticky: 100;      /* Sticky category headers */
  --z-floating: 200;    /* Floating Cart FAB */
  --z-overlay: 300;     /* Dark modal backdrop */
  --z-modal: 400;       /* PDP Modals, Checkout Drawers */
  --z-toast: 500;       /* Urgent error notifications (e.g. Printer Jam) */
}
```

*End of Document. Refer to DES-UI-002 for Accessibility & Interaction limits.*
