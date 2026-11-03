/**
 * K6 Hyperscale Load Testing Script
 * Conforms to: RULE-PERF-002 §3.3 (Chaos Engineering & Load Mandates)
 * Simulates peak lunch rush of up to 10,000 Virtual Users (RPS) over 15 minutes.
 * 
 * Execution: k6 run tests/load/k6-ordering-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 500 },    // Ramp up to 500 VUs
    { duration: '3m', target: 2000 },   // Scale to 2,000 VUs
    { duration: '5m', target: 5000 },   // Spike to 5,000 VUs (Peak Lunch Rush)
    { duration: '3m', target: 10000 },  // Extreme Hyperscale Surge (10,000 RPS)
    { duration: '3m', target: 0 },      // Ramp down
  ],
  thresholds: {
    // 99% of requests must complete below 500ms (RULE-PERF-002 §3.3)
    http_req_duration: ['p(99)<500'],
    // Error rate must remain strictly below 0.1% (<0.001)
    http_req_failed: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const idempotencyKey = `load_${vuId}_${iterId}_${Date.now()}`;

  // 1. Initialize Table Session & Geofence (Macro & Micro validation)
  const sessionPayload = JSON.stringify({
    table_identifier: `Table ${(vuId % 20) + 1}`,
    gps_lat: 23.8103,
    gps_lng: 90.4125,
    ble_rssi: -65,
    device_fingerprint: `vu_fingerprint_${vuId}`
  });

  const sessionRes = http.post(`${BASE_URL}/api/v1/sessions/init`, sessionPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(sessionRes, {
    'session init status is 201': (r) => r.status === 201,
    'session token returned': (r) => r.json('token') !== undefined,
  });

  const token = sessionRes.json('token') || '';

  // 2. Fetch Menu Catalog (Edge Cache Hit target <50ms)
  const menuRes = http.get(`${BASE_URL}/api/v1/menu`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  check(menuRes, {
    'menu status is 200': (r) => r.status === 200,
    'menu items returned': (r) => r.json('items') !== undefined,
  });

  // 3. Place Idempotent Order (Target <150ms HTTP 202 Accepted)
  const orderPayload = JSON.stringify({
    tableNo: `Table ${(vuId % 20) + 1}`,
    items: [
      { id: 'prod_01', quantity: 1, price: 450 },
      { id: 'item_3', quantity: 2, price: 260 }
    ],
    notes: 'Load testing automated request'
  });

  const orderRes = http.post(`${BASE_URL}/api/v1/orders/place`, orderPayload, {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'Authorization': `Bearer ${token}`
    },
  });

  check(orderRes, {
    'order accepted with 202': (r) => r.status === 202,
    'order has valid ID': (r) => r.json('id') !== undefined,
  });

  sleep(1);
}
