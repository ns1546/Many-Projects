/**
 * API Gateway: Enterprise Kong / Reverse Proxy Layer
 * Conforms to: ARCH-SEC-001 §1.2, ARCH-API-001, & PHASE-003 Task 1.2.2
 */

const http = require('http');
const PORT = process.env.PORT || 4000;

// Upstream Microservice Endpoints
const UPSTREAMS = {
  menu: process.env.MENU_SVC_URL || 'http://localhost:4001',
  order: process.env.ORDER_SVC_URL || 'http://localhost:4002',
  geo: process.env.GEO_SVC_URL || 'http://localhost:4003'
};

// Token Bucket Rate Limiter Simulation (PHASE-003 Task 3.1.2)
// Bucket size: 60 tokens, Refill rate: 1 token / second
const rateLimitBuckets = new Map(); // clientIp -> { tokens, lastRefill }

function checkRateLimit(ip) {
  const now = Date.now();
  const maxTokens = 60;
  const refillInterval = 1000; // 1 token every second

  let bucket = rateLimitBuckets.get(ip);
  if (!bucket) {
    bucket = { tokens: maxTokens - 1, lastRefill: now };
    rateLimitBuckets.set(ip, bucket);
    return true;
  }

  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / refillInterval);
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }
  return false;
}

/**
 * HTTP Reverse Proxy Forwarder
 */
function forwardRequest(targetUrl, req, res) {
  const parsedTarget = new URL(targetUrl);
  const options = {
    hostname: parsedTarget.hostname,
    port: parsedTarget.port,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-for': req.socket.remoteAddress,
      'x-gateway-proxy': 'evorise-kong-ingress'
    }
  };

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', err => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'BAD_GATEWAY',
      upstream: targetUrl,
      message: 'Failed to connect to upstream microservice. Ensure service is active.',
      details: err.message
    }));
  });

  req.pipe(proxyReq);
}

const gateway = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Device-Fingerprint');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // 1. Enforce Token Bucket Rate Limiting (ARCH-SEC-001)
  if (!checkRateLimit(clientIp)) {
    res.writeHead(429, { 
      'Content-Type': 'application/json',
      'Retry-After': '5'
    });
    res.end(JSON.stringify({ 
      error: 'RATE_LIMIT_EXCEEDED', 
      message: 'Too many requests. Token bucket exhausted.' 
    }));
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Gateway Health Check
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'HEALTHY',
      component: 'KongApiGateway',
      upstreams: UPSTREAMS,
      activeRateLimitBuckets: rateLimitBuckets.size,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Routing Rules
  if (url.pathname.startsWith('/api/v1/menu')) {
    forwardRequest(UPSTREAMS.menu, req, res);
  } else if (url.pathname.startsWith('/api/v1/orders')) {
    forwardRequest(UPSTREAMS.order, req, res);
  } else if (url.pathname.startsWith('/api/v1/geo')) {
    forwardRequest(UPSTREAMS.geo, req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ROUTE_NOT_FOUND', gateway: 'Evorise Kong Ingress' }));
  }
});

gateway.listen(PORT, () => {
  console.log(`[Kong Gateway] Ingress Reverse Proxy listening on port ${PORT}`);
  console.log(`Routes: /api/v1/menu -> ${UPSTREAMS.menu}, /api/v1/orders -> ${UPSTREAMS.order}, /api/v1/geo -> ${UPSTREAMS.geo}`);
});
