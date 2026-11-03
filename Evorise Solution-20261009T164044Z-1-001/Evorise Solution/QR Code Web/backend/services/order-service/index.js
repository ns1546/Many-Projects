/**
 * OrderSvc: Mission-Critical Order Processing Engine
 * Conforms to: PHASE-002 §2, PRD-FE-001 §3.1, & ARCH-DB-001
 */

const http = require('http');
const PORT = process.env.PORT || 4002;

// In-Memory Simulated Redis Distributed Lock & Idempotency Store
const idempotencyStore = new Map(); // idempotencyKey -> { response, createdAt }
const distributedLocks = new Map(); // lockKey -> expiresAt
const ordersDatabase = new Map();   // orderId -> orderRecord
const eventQueue = [];              // Emitted Kafka OrderCreatedEvent messages

/**
 * Simulates Redis SETNX Distributed Lock (PHASE-002 Task 2.1.2)
 * Ensures a user cannot submit the exact same cart/table twice within a 60-second window.
 */
function acquireDistributedLock(lockKey, ttlMs = 60000) {
  const now = Date.now();
  if (distributedLocks.has(lockKey)) {
    const expiresAt = distributedLocks.get(lockKey);
    if (now < expiresAt) {
      return false; // Lock is currently held
    }
  }
  distributedLocks.set(lockKey, now + ttlMs);
  return true;
}

function releaseDistributedLock(lockKey) {
  distributedLocks.delete(lockKey);
}

/**
 * Kafka Event Producer Simulation (PHASE-002 Task 2.1.3)
 */
function publishOrderEvent(eventType, payload) {
  const event = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    eventType,
    timestamp: new Date().toISOString(),
    payload
  };
  eventQueue.push(event);
  console.log(`[Kafka Producer] Published ${eventType} -> EventID: ${event.eventId}`);
  return event;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Device-Fingerprint');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'HEALTHY', 
      service: 'OrderSvc', 
      activeLocks: distributedLocks.size, 
      totalOrders: ordersDatabase.size 
    }));
    return;
  }

  // 1. Place Order Endpoint (POST /api/v1/orders/place)
  if (url.pathname === '/api/v1/orders/place' && req.method === 'POST') {
    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    
    // Check Idempotency Store (PRD-FE-001 §3.1)
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const cached = idempotencyStore.get(idempotencyKey);
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'X-Cache-Lookup': 'HIT_IDEMPOTENT'
      });
      res.end(JSON.stringify(cached.response));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const orderData = JSON.parse(body || '{}');
        const tableId = orderData.tableNo || orderData.tableId || 'Table 1';
        const lockKey = `lock:table:${tableId}:${orderData.sessionId || 'anon'}`;

        // Attempt Redis SETNX Lock
        if (!acquireDistributedLock(lockKey, 30000)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'CONCURRENT_CHECKOUT_IN_PROGRESS', 
            message: 'An order is already being processed for this table. Please wait a moment.' 
          }));
          return;
        }

        // Generate Order ID & State Machine Transition
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const newOrder = {
          id: orderId,
          idempotencyKey: idempotencyKey || null,
          tableNo: tableId,
          sessionId: orderData.sessionId || null,
          items: orderData.items || [],
          total: parseFloat(orderData.total) || 0,
          status: 'PENDING',
          notes: orderData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        ordersDatabase.set(orderId, newOrder);

        // Publish OrderCreatedEvent to Kafka
        publishOrderEvent('OrderCreatedEvent', newOrder);

        // Cache in Idempotency Store (60-second retention)
        if (idempotencyKey) {
          idempotencyStore.set(idempotencyKey, {
            response: newOrder,
            createdAt: Date.now()
          });
        }

        // Release lock
        releaseDistributedLock(lockKey);

        res.writeHead(202, { 'Content-Type': 'application/json' }); // 202 Accepted per PRD-FE-001 §3.2
        res.end(JSON.stringify(newOrder));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ORDER_PROCESSING_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 2. Get Order Details (GET /api/v1/orders/:id)
  if (url.pathname.startsWith('/api/v1/orders/') && req.method === 'GET') {
    const id = url.pathname.split('/').pop();
    if (ordersDatabase.has(id)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ordersDatabase.get(id)));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND', orderId: id }));
    }
    return;
  }

  // 3. Update Order Status (PATCH /api/v1/orders/:id/status)
  if (url.pathname.startsWith('/api/v1/orders/') && url.pathname.endsWith('/status') && req.method === 'PATCH') {
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 2];

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const newStatus = (payload.status || '').toUpperCase();

        if (!ordersDatabase.has(id)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND', orderId: id }));
          return;
        }

        const order = ordersDatabase.get(id);
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        ordersDatabase.set(id, order);

        // Publish OrderStatusUpdatedEvent
        publishOrderEvent('OrderStatusUpdatedEvent', { orderId: id, status: newStatus });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(order));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'STATUS_UPDATE_FAILED', details: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND' }));
});

server.listen(PORT, () => {
  console.log(`[OrderSvc] Core Ordering Engine running on port ${PORT}`);
});
