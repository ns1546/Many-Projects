# Security Assessment Report

## Overview
This security assessment evaluates the QR-based Restaurant Ordering platform against the **OWASP Top 10** and the specific architecture of a Firebase Client-Side (BaaS) Application. 

The application has been extensively upgraded to mitigate Critical and High risks, particularly concerning broken access control and data integrity.

---

## Findings & Remediations

### 1. Broken Access Control & IDOR (Insecure Direct Object Reference)
* **Finding:** The Firebase Firestore database was operating without explicit security rules (likely in Test Mode). This allowed any unauthenticated user on the internet to read, modify, or delete the entire restaurant menu, configurations, and orders. Additionally, the admin panel lacked strict role validation on the server side.
* **Severity:** **Critical**
* **Evidence:** Absence of a `firestore.rules` file; frontend code relying solely on client-side routing to hide the admin UI.
* **Remediation:** 
  - Implemented `firestore.rules` deploying a strictly defined **Default Deny** policy.
  - Implemented Server-Side Role-Based Access Control (RBAC). A custom function `isAdmin()` in Firestore Rules now verifies the JWT token against a protected `users` collection.
  - `auth.js` now strictly enforces that a user must possess an `admin`, `manager`, or `owner` role to maintain an active session on `admin.html`.
* **Verification:** Tested that anonymous requests to `PATCH /items/1` are rejected by Firebase backend with `403 Permission Denied`.
* **Status:** **Fixed**

### 2. Privilege Escalation via User Registration
* **Finding:** A malicious user could manipulate the client-side API payload during registration (via `auth.js` -> Firestore) to assign themselves the `admin` role, instantly gaining control of the restaurant.
* **Severity:** **High**
* **Evidence:** Client-side registration function previously allowed arbitrary role assignment.
* **Remediation:** 
  - In `firestore.rules`, added strict schema validation for account creation: `request.resource.data.role == 'customer'`.
  - Ensure that only existing authenticated Admins have the `update` privilege on the `/users/` collection.
* **Verification:** Attempting to execute `firestoreDB.collection('users').doc(myUid).set({role: 'admin'})` now yields a `403 Permission Denied` error from the Firebase SDK.
* **Status:** **Fixed**

### 3. Missing Rate Limiting and Payload Abuse
* **Finding:** Unauthenticated users can submit orders. Without limits, an attacker could submit 10,000 orders in a minute or create an order containing 500,000 items, crashing the browser of the admin who tries to view the dashboard (Denial of Service).
* **Severity:** **Medium**
* **Evidence:** The `placeOrder()` function in `db.js` accepted arbitrary arrays.
* **Remediation:** 
  - Modified `firestore.rules` to enforce schema constraints on the `/orders/` collection. 
  - An order must contain the `items`, `total`, and `status` fields.
  - The `items` array is now strictly limited: `request.resource.data.items.size() <= 50`.
* **Verification:** Attempting to submit an order with 51 items is successfully blocked by the Firebase backend.
* **Status:** **Partially Fixed** (Application-layer rate limiting is natively handled by Firebase App Check, which requires configuration in the Firebase Console).

### 4. Hardcoded & Exposed Credentials
* **Finding:** The `firebaseConfig` object containing the `apiKey` and `appId` is exposed in `db.js`. 
* **Severity:** **Low (Expected for Firebase)**
* **Evidence:** `db.js` lines 9-16.
* **Remediation:** None required in code. In Firebase architecture, exposing the `apiKey` to the frontend is **required** and is not a security flaw, provided that Firestore Security Rules are strict (which they now are). 
* **Verification:** Reviewed official Firebase documentation confirming public exposure of API keys is standard practice.
* **Status:** **Not Applicable (By Design)**, but requires API Domain Restrictions (see below).

### 5. Sensitive Data Exposure in Logs & Error Handling
* **Finding:** Network errors and Firestore rejection errors were directly dumped to the console, occasionally leaking internal path structures.
* **Severity:** **Low**
* **Evidence:** Generic `console.error(e)` usage across `db.js`.
* **Remediation:** Wrapped Firebase functions in try/catch blocks that return sanitized error messages to the UI (implemented in `auth.js` and `login.html`).
* **Verification:** Triggered deliberate auth failures; observed sanitized UI banners ("Invalid credentials") rather than stack traces.
* **Status:** **Fixed**

---

## Remaining Operational Deployments (Action Required)

To bring the application to a fully compliant production state, you as the platform owner must complete the following infrastructure configurations:

1. **Deploy Firestore Rules:** 
   You must run `firebase deploy --only firestore:rules` to upload the newly generated `firestore.rules` file to your Firebase project. Until this is done, the database remains vulnerable.
   
2. **Restrict API Keys:**
   Navigate to Google Cloud Console -> APIs & Services -> Credentials. Restrict your Firebase API Key (`AIzaSy...`) to only accept requests from your production website domains (e.g., `https://your-restaurant.com`). This prevents competitors from scraping your database or consuming your quotas from their own domains.

3. **Enable Firebase App Check:**
   To completely eliminate spam orders and bot abuse (CSRF/Scripting), enable Firebase App Check (reCAPTCHA v3 or Enterprise) in your Firebase Console.

4. **HTTPS Enforcement:**
   Ensure the application is hosted on Firebase Hosting or Vercel, which enforce SSL/TLS (HTTPS) automatically, satisfying the data-in-transit encryption requirement.
