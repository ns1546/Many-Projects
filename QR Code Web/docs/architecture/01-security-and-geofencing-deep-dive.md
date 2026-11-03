# Architecture Deep Dive: Security, Geofencing & Zero-Trust
**Document ID:** ARCH-SEC-001 | **Status:** DRAFT | **Author:** Core Security Team

## 1. Perimeter Defense (Layer 3/4 & Layer 7)

### 1.1 Web Application Firewall (WAF) Configurations
To handle DDoS attacks and malicious bots targeting the public QR ordering endpoints, the API Gateway (Kong/Envoy) operates behind a Cloudflare Enterprise edge.
- **Rule ID 1001 (Strict Location Check):** Drops all requests where `CF-IPCountry` does not match the allowed operating country of the restaurant tenant.
- **Rule ID 1002 (Bot Management):** Implements JS Challenge for any request lacking a valid `Evorise-Device-Signature` header (generated client-side).
- **Rule ID 1003 (Rate Limiting):**
  - **Endpoint:** `/api/v1/orders/place`
  - **Limit:** 3 requests per IP per 10 seconds.
  - **Action:** Ban IP for 15 minutes, return HTTP 429.

### 1.2 Device Fingerprinting Implementation
To prevent users from sharing a session token off-site, a deterministic device fingerprint is generated upon QR scan and attached to the session.
- **Vectors Analyzed:**
  - `User-Agent` string parsing.
  - `Navigator.hardwareConcurrency` (CPU Cores).
  - WebGL Renderer String (e.g., `ANGLE (Apple, Apple M1 Pro, OpenGL 4.1)`).
  - Canvas Fingerprinting (rendering a hidden 2D text element and hashing the base64 output).
- **Hash Generation:** 
  ```javascript
  const rawData = `${ua}-${cores}-${webgl}-${canvasHash}`;
  const deviceHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
  ```
- **Validation:** If the `deviceHash` attached to an incoming HTTP request does not perfectly match the `device_hash` claim in the session JWT, the API Gateway immediately drops the request with `401 Unauthorized` and triggers a Slack security alert for "Session Hijacking Attempt".

---

## 2. Cryptography & Session Management

### 2.1 JWT (JSON Web Token) Specification
Since users do not log in, the JWT acts as a bearer token representing a physical presence at a specific table.
- **Signing Algorithm:** `ES256` (ECDSA using P-256 and SHA-256). Chosen over `RS256` for smaller token size and faster verification at scale.
- **Key Rotation:** Asymmetric keys rotated every 24 hours via HashiCorp Vault.
- **Exact Payload Structure:**
  ```json
  {
    "jti": "urn:uuid:f47ac10b-58cc-4372-a567-0e02b2c3d479", 
    "sub": "anonymous_guest",
    "aud": "evorise-order-engine",
    "tid": "tbl_987654321", // Internal Table ID
    "rid": "rest_123456789", // Restaurant Tenant ID
    "d_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "flr": 2, // Floor Number (Verified)
    "iat": 1698765432, // Issued At
    "exp": 1698772632  // Expires exactly 2 hours after issue
  }
  ```

---

## 3. Advanced Geofencing & Micro-Location (Floor Security)

### 3.1 Macro-Location: GPS Haversine Validation
When the QR code is scanned, the PWA requests `navigator.geolocation`. The coordinates are sent to the backend `/api/v1/sessions/init`.
The backend uses the Haversine formula (accounting for the Earth's curvature) to calculate the distance between the user and the restaurant's fixed coordinates.

**Go Implementation Snippet (OrderSvc):**
```go
package geo

import "math"

const earthRadiusMeters = 6371000.0

// CalculateDistance returns the distance in meters between two coordinates
func CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	lat1 = lat1 * (math.Pi / 180.0)
	lat2 = lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(lat1)*math.Cos(lat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadiusMeters * c
}

// Handler Logic:
// if CalculateDistance(userLat, userLon, restLat, restLon) > 50.0 {
//     return ErrOutsideGeofence
// }
```

### 3.2 Micro-Location: Bluetooth Low Energy (BLE) Floor Spoofing Prevention
GPS is notoriously inaccurate on the Z-axis (altitude). To prevent users on the 3rd floor from ordering to a table on the 1st floor (or people outside the window), we implement BLE Beacon integration.
- **Hardware:** Estimote or Kontakt.io BLE beacons installed on the ceiling of each floor.
- **Client Execution:** The PWA uses the Web Bluetooth API to scan for the restaurant's specific `Service UUID`.
- **RSSI Triangulation & Thresholds:**
  - The signal strength (RSSI) is measured in decibels (dBm).
  - A signal of `-40 dBm` means the user is directly under the beacon.
  - A signal of `-90 dBm` means the user is far away or separated by a concrete floor.
  - **Rule:** The session initialization payload must include a signed payload from the beacon with an `RSSI > -75 dBm`. If the user is on the wrong floor, the physical concrete blocks the signal to `<-85 dBm`, and the session is rejected.

---

## 4. Zero-Trust Internal Network (Service Mesh)
Inside the Kubernetes cluster, no microservice trusts another implicitly.
- **Istio Service Mesh:** Deployed as a sidecar proxy (Envoy) to every pod.
- **mTLS (Mutual TLS):** All traffic between the `Menu Service`, `Order Engine`, and `Database` is encrypted. 
- **Authorization Policies:** 
  - `Order Engine` is the *only* service allowed to write to the `orders` table in PostgreSQL. 
  - `Analytics Service` is explicitly denied read access to PII (Personally Identifiable Information) columns using Istio Layer 7 rules.

---
*End of Document. Refer to ARCH-DB-001 for Database Schemas.*
