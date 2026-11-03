# Project Memory & Context

## Context
The project has evolved from a basic prototype to the planning stages of an enterprise-grade, high-performance Restaurant Management System. The user specifically requires extreme robustness: the system must handle "millions of visitors" and complex security threats. 

Key pain points to solve:
- Preventing fake orders from outside the restaurant.
- Preventing cross-floor fake ordering (e.g., ordering from the floor above/below).
- Handling extreme traffic spikes without the engine or dashboards failing.
- Ensuring seamless customer experience without requiring them to create accounts/login.

## Key Architectural Decisions (ADRs)
1. **Move to Microservices:** To handle massive scale, a simple Firebase/LocalStorage architecture is insufficient. We are planning a distributed cloud-native architecture using API Gateways, Edge caching, and message brokers (Kafka/Redis).
2. **Geofencing & Physical Security:** Implemented a multi-layered security approach using GPS for macro-location and Wi-Fi/BLE signature scanning for micro-location (floor-wise accuracy).
3. **Session Lifecycle:** Anonymous sessions are generated upon QR scan, cryptographically bound to the table, device fingerprint, and physical location. Sessions are aggressively managed and terminated when the user leaves the geofence or the order concludes.

## Current State
- **Phase:** Planning & Documentation Phase.
- **Completed:** Drafted comprehensive PRD, Architecture, Rules, Phases, Design, and Memory documents.
- **Next Action:** Await user review of the documentation. Once aligned, development will proceed strictly following the `phases.md` roadmap, starting with backend cloud infrastructure and edge security.
