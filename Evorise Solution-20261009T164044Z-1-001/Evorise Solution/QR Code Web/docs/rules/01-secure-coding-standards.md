# Rules Deep Dive: Secure Coding Standards
**Document ID:** RULE-SEC-001 | **Status:** DRAFT | **Author:** Security Engineering

## 1. Zero-Trust Data Validation
**Rule:** NEVER trust the client. A malicious user can intercept frontend JavaScript and send modified POST requests via Postman/cURL.

### 1.1 Payload Sanitization
- **Backend Responsibility:** The API (`OrderSvc`) must completely recalculate the order total based on the database's `MenuSvc` prices. It must NEVER accept a `total_amount` field from the client.
- **Validation Engine:** All incoming JSON bodies must be strictly validated using schema libraries (e.g., `Zod` for TypeScript or `go-playground/validator` for Go). If an unknown field is present, reject the payload (HTTP 400).

### 1.2 SQL Injection Prevention
- **Rule:** Parameterized queries (Prepared Statements) are mandatory. ORMs (like Prisma or GORM) handle this natively, but raw SQL queries MUST use parameters.
- **Example (Postgres via Node.js):**
  - ❌ BAD: `db.query("SELECT * FROM orders WHERE id = '" + req.body.id + "'")`
  - ✅ GOOD: `db.query("SELECT * FROM orders WHERE id = $1", [req.body.id])`

---

## 2. Session & Token Handling

### 2.1 JWT Storage (Client Side)
- **Rule:** The JWT generated from the QR scan must NOT be stored in `localStorage`. 
- **Reason:** `localStorage` is vulnerable to Cross-Site Scripting (XSS). If a bad actor injects a script, they can steal the token and impersonate the table.
- **Mandate:** Use `sessionStorage` (cleared when tab closes) OR, preferably, issue the JWT via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie from the API Gateway.

### 2.2 Cross-Site Request Forgery (CSRF)
If using cookies for sessions, the API Gateway must enforce strict CORS (Cross-Origin Resource Sharing) policies.
- **Rule:** Only allow `Origin: https://order.evorise.com`. Reject any preflight `OPTIONS` requests from other domains instantly.

---

## 3. Threat Modeling & Vulnerability Mitigation

### 3.1 IDOR (Insecure Direct Object Reference)
- **Threat:** User at Table 1 changes their HTTP request to `GET /api/v1/orders/12345` to view Table 2's receipt.
- **Mitigation:** The backend MUST extract the `table_id` from the secure JWT context.
  ```javascript
  // Mandatory authorization check in controller
  const order = await db.getOrder(req.params.id);
  if (order.table_id !== req.jwt.table_id) {
      throw new ForbiddenError("Cannot access orders belonging to another table.");
  }
  ```

### 3.2 Content Security Policy (CSP)
- **Rule:** A strict CSP header must be returned on the `index.html` payload.
- `Content-Security-Policy: default-src 'self'; img-src 'self' cdn.evorise.com; script-src 'self' 'nonce-{random}';`
- This completely neutralizes XSS attacks because the browser will refuse to run inline scripts or load external malicious scripts.

*End of Document. Strict enforcement required via CI/CD linting.*
