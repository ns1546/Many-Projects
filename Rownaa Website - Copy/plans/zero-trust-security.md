# 🛡️ FAANG-Level Zero-Trust Security Sweep (Blueprint)
**Status**: IN PROGRESS
**Orchestrator**: Lead Security Architect

## Execution Graph
```mermaid
graph TD
    Step1[✅ Install Security Core Dependencies] --> Step2[✅ Rewrite Auth Service: Strict Schemas, Secrets, Rate-Limiting]
    Step2 --> Step3[✅ Rewrite Booking Service: IDOR Prevention, Payload Validation]
    Step3 --> Step4[✅ Rewrite Inventory Service: Rate Limiting, Payload Validation]
    Step4 --> Step5[✅ Frontend Integration: HTTPOnly, SameSite]
```

## Phase 1: Security Core Dependencies
- Install `zod`, `express-rate-limit`, `csurf` in all microservices.

## Phase 2: Auth Service Lockdown
- Move `JWT_SECRET` strictly to `.env` throwing errors if missing.
- Add `express-rate-limit` for `/login` and `/register`.
- Create `auth.schema.js` and validate via Zod middleware.
- Generate and attach `CSRF Token`.

## Phase 3: Booking & Inventory Data Isolation (IDOR Prevention)
- Secure `GET /` to strictly filter by `req.user.userId`.
- Secure `PUT /:id/status`, `DELETE /:id` to verify ownership via `prisma.booking.findFirst({ where: { id, customerId: req.user.userId } })`.
- Add Zod middleware for all payload validations.

## Phase 4: Client-Side Security Headers
- Ensure the frontend fetches and attaches the CSRF token to all requests.
