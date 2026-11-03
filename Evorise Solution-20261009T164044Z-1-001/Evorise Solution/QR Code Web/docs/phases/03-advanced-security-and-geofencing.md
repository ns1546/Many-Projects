# Phase 3 Deep Dive: Advanced Security & Geofencing
**Document ID:** PHASE-003 | **Status:** DRAFT | **Duration:** 4 Weeks

## 1. Macro-Location: GPS & WAF Defense
### 1.1 Geolocation Algorithms (Sprint 9)
- **Task 1.1.1:** Implement the Haversine formula on the backend (`GeoSvc`) to calculate the exact distance between the restaurant and the client's HTTP request coordinates.
- **Task 1.1.2:** Configure the frontend PWA to request `navigator.geolocation` securely and handle "Permission Denied" states gracefully.

### 1.2 Anti-Bot & Fingerprinting (Sprint 10)
- **Task 1.2.1:** Integrate Canvas and WebGL fingerprinting on the client to generate a unique `device_hash`.
- **Task 1.2.2:** Modify the API Gateway (Kong) to perform synchronous validation of the `device_hash` against the active JWT token before routing traffic to internal services.

## 2. Micro-Location: Bluetooth (BLE) Floor Security
### 2.1 Hardware Calibration (Sprint 11)
- **Task 2.1.1:** Procure and configure Estimote BLE beacons. Install one beacon per floor in the test environment.
- **Task 2.1.2:** Develop the Web Bluetooth API frontend logic to scan for the beacon UUID.
- **Task 2.1.3:** Calibrate the RSSI threshold algorithms to strictly reject signals weaker than `-75 dBm` (simulating a concrete floor barrier).

## 3. Security Auditing (Sprint 12)
- **Task 3.1.1:** Hire a 3rd party penetration testing firm.
- **Task 3.1.2:** Conduct simulated DDoS attacks (Layer 7 HTTP Floods) targeting the ordering endpoints to verify the API Gateway's Token Bucket rate limiting holds up.
- **Gate / Milestone:** "Security Fortress Verified". The system mathematically rejects any order placed from outside the geofence or from a spoofed floor.
