# Design Deep Dive: UI Components & Accessibility
**Document ID:** DES-UI-002 | **Status:** DRAFT | **Author:** UX/UI Architecture Team

## 1. Micro-Interactions & Animation Standards
Animations must feel physical, snappy, and never delay the user. We strictly avoid long, linear animations.

### 1.1 Easing Curves
- **Standard UI Elements (Buttons, Toggles):**
  - `--ease-out-snappy: cubic-bezier(0.2, 0.8, 0.2, 1);`
  - Duration: `150ms`
- **Large Transitions (Modals sliding up):**
  - `--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);` (Slight bounce at the end)
  - Duration: `300ms`

### 1.2 Skeleton Loading States
Never show a blank white screen. While waiting for the API Gateway (`MenuSvc`), the UI must display a "Skeleton" structure.
- **Animation:** A soft, left-to-right shimmer effect.
- **CSS Implementation:**
  ```css
  .skeleton-shimmer {
    background: linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  ```

---

## 2. Accessibility (WCAG 2.1 AA Mandates)
The system must be fully usable by individuals with visual or motor impairments.

### 2.1 Color Contrast Ratios
- All primary text against background surfaces must pass the `4.5:1` contrast ratio.
- Large headers (18pt or larger) must pass a `3.0:1` ratio.
- *Automated Testing:* CI/CD pipeline runs `axe-core` to block PR merges if contrast fails.

### 2.2 Screen Readers & ARIA Labels
Since this is a heavy JavaScript application (PWA), the DOM changes dynamically without page reloads.
- **Live Regions:** The order tracker uses `aria-live="polite"` so screen readers (VoiceOver/TalkBack) announce when the order moves from "Preparing" to "Ready".
- **Hidden Labels:** Action buttons without text (e.g., an icon-only "X" close button on a modal) MUST have `aria-label="Close menu details"`.
- **Focus Trapping:** When the "Custom Burger" modal opens, keyboard focus MUST be trapped inside the modal. The user cannot tab to the background elements until the modal is closed.

### 2.3 Reduced Motion Override
Respect the user's OS-level accessibility settings. If they have disabled animations on their phone to prevent motion sickness, the app must instantly strip all animations.
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

*End of Document.*
