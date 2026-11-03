/**
 * GeoSvc: Enterprise Micro-Location & Physical Boundary Verification Service
 * Conforms to: ARCH-SEC-001 & PHASE-003
 */

const http = require('http');
const PORT = process.env.PORT || 4003;

// Default Restaurant Coordinates (Central Restaurant Anchor)
const RESTAURANT_CONFIG = {
  lat: parseFloat(process.env.RESTAURANT_LAT) || 23.8103,
  lng: parseFloat(process.env.RESTAURANT_LNG) || 90.4125,
  radiusMeters: parseInt(process.env.GEOFENCE_RADIUS) || 100,
  bleRssiThreshold: -75 // dBm (ARCH-SEC-001 §2.1)
};

/**
 * Exact Spherical Haversine Formula (ARCH-SEC-001 §1.1)
 * Calculates ground distance between two WGS84 GPS coordinates in meters.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Validates Bluetooth Low Energy (BLE) Signal Strength (ARCH-SEC-001 §2.1)
 */
function evaluateBleProximity(rssi) {
  if (typeof rssi !== 'number') return { verified: true, reason: 'BLE bypassed or not present' };
  const verified = rssi >= RESTAURANT_CONFIG.bleRssiThreshold;
  return {
    verified,
    threshold: RESTAURANT_CONFIG.bleRssiThreshold,
    measured: rssi,
    status: verified ? 'CORRECT_FLOOR_VERIFIED' : 'SIGNAL_WEAK_SUSPECT_FLOOR_SPOOF'
  };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Fingerprint');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'HEALTHY', service: 'GeoSvc', timestamp: new Date().toISOString() }));
    return;
  }

  if (url.pathname === '/api/v1/geo/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const clientLat = parseFloat(payload.latitude);
        const clientLng = parseFloat(payload.longitude);
        const clientRssi = payload.bleRssi;

        if (isNaN(clientLat) || isNaN(clientLng)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'INVALID_COORDINATES', message: 'latitude and longitude are required numbers.' }));
          return;
        }

        const distanceMeters = calculateHaversineDistance(
          RESTAURANT_CONFIG.lat,
          RESTAURANT_CONFIG.lng,
          clientLat,
          clientLng
        );

        const isInsideGeofence = distanceMeters <= RESTAURANT_CONFIG.radiusMeters;
        const bleResult = evaluateBleProximity(clientRssi);

        const isAuthorized = isInsideGeofence && bleResult.verified;

        const responsePayload = {
          authorized: isAuthorized,
          distanceMeters,
          allowedRadiusMeters: RESTAURANT_CONFIG.radiusMeters,
          restaurantAnchor: { lat: RESTAURANT_CONFIG.lat, lng: RESTAURANT_CONFIG.lng },
          clientCoordinates: { lat: clientLat, lng: clientLng },
          bleVerification: bleResult,
          timestamp: new Date().toISOString()
        };

        res.writeHead(isAuthorized ? 200 : 403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responsePayload));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INTERNAL_GEO_ERROR', details: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND' }));
});

server.listen(PORT, () => {
  console.log(`[GeoSvc] Macro & Micro Location Service running on port ${PORT}`);
});
