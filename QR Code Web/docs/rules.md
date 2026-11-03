# Development Rules & Standards

## 1. Security First (Zero Trust)
- **Never trust the client.** All data (prices, quantities, location coordinates) must be validated securely on the backend server.
- Implement strict Rate Limiting per IP and per Table Session to prevent spam.
- All API endpoints must require authorization tokens, even temporary ones generated for anonymous QR code users.

## 2. High-Performance Coding
- **No Blocking Operations:** Backend code must be strictly asynchronous.
- **Caching Strategy:** Cache aggressively at the edge (CDN) and in-memory (Redis). Database queries should be the last resort for read-heavy operations like viewing the menu catalog.
- **Pagination & Indexing:** All database queries must be properly indexed and paginated to prevent memory exhaustion.

## 3. Code Quality & Maintenance
- Use TypeScript (or strictly typed languages) for robust type checking.
- Enforce ESLint and Prettier for consistent code formatting across the team.
- Mandate strict Unit Test and Integration Test coverage, especially for the `Order Engine` and `Payment/Billing` modules.

## 4. Architectural Rules
- **Microservices Isolation:** Services must not share databases directly. They must communicate via well-defined REST/gRPC APIs or event buses.
- **Fail Gracefully:** If the `Analytics Engine` is down, the `Order Engine` must continue to function perfectly. Never let non-critical systems break the critical path (ordering).

## 5. UI/UX Rules
- Mobile-first approach for the customer QR interface.
- Implement Skeleton loaders for all async operations to improve perceived performance.
- Prevent layout shifts (Target Cumulative Layout Shift = 0) to ensure a premium feel.
