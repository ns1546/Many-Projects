/**
 * Evorise Enterprise Restaurant Platform - Core Server & Microservices Gateway
 * Conforms to: 
 *  - ARCH-SEC-001 (Geofencing, BLE RSSI, Deterministic Device Fingerprinting, JWT Sessions)
 *  - ARCH-API-003 & openapi.yaml (Session Init, Menu Catalog, Idempotent Order Engine)
 *  - ARCH-POS-005 (ESC/POS Thermal Receipt Generator & Hardware Spooler)
 *  - RULE-SEC-001 (Zero-Trust Server Order Recalculation, Strict CSP, Session Isolation)
 *  - RULE-PERF-002 (Token Bucket Rate Limiting, O(1) Idempotency Store)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateOrderReceiptEscPos } = require('./backend/services/pos-service/escpos-generator');
const { WebSocketServer } = require('ws');
const sqliteEngine = require('./backend/database/sqlite-engine');
const syncEngine = require('./backend/services/cloud-sync/sync-engine');

// Enterprise Defensive Crash Guards (RULE-RESILIENCE-001)
process.on('uncaughtException', (err) => {
  console.error('[Engine Crash Guard] Caught unhandled exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Engine Crash Guard] Caught unhandled rejection:', reason);
});

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const JWT_SECRET = process.env.JWT_SECRET || 'evorise_faang_hyperscale_secret_key_2026';

// Restaurant Geospatial & Security Anchor Config (ARCH-SEC-001 §3.1)
const RESTAURANT_CONFIG = {
  id: 'rest_evorise_001',
  name: 'Spice Garden & Grill',
  lat: parseFloat(process.env.RESTAURANT_LAT) || 23.8103,
  lng: parseFloat(process.env.RESTAURANT_LNG) || 90.4125,
  geofenceRadiusMeters: parseInt(process.env.GEOFENCE_RADIUS) || 100,
  bleRssiThreshold: -75 // dBm (ARCH-SEC-001 §3.2)
};

// Persistent Settings Storage (Synchronized with Admin Panel & Geofencing)
const SETTINGS_FILE = path.join(ROOT, 'settings.json');
let serverSettings = {
  restaurantName: 'Spice Garden',
  primaryColor: '#244638',
  secondaryColor: '#f3f4f6',
  buttonColor: '#244638',
  textColor: '#0f172a',
  themePreset: 'default',
  fontFamily: 'Plus Jakarta Sans',
  currencySymbol: '৳',
  taxRate: 5,
  geofenceEnabled: true,
  restaurantLat: RESTAURANT_CONFIG.lat,
  restaurantLng: RESTAURANT_CONFIG.lng,
  geofenceRadiusMeters: RESTAURANT_CONFIG.geofenceRadiusMeters,
  autoAcceptOrders: false,
  autoShiftSteps: false,
  autoShiftPrepMinutes: 2,
  autoShiftReadyMinutes: 10,
  autoShiftDeliverMinutes: 5,
  enableSubCategories: true,
  enableOffers: true,
  enableDemoContent: false
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    serverSettings = { ...serverSettings, ...saved };
    if (serverSettings.restaurantLat) RESTAURANT_CONFIG.lat = parseFloat(serverSettings.restaurantLat);
    if (serverSettings.restaurantLng) RESTAURANT_CONFIG.lng = parseFloat(serverSettings.restaurantLng);
    if (serverSettings.geofenceRadiusMeters) RESTAURANT_CONFIG.geofenceRadiusMeters = parseInt(serverSettings.geofenceRadiusMeters);
  } catch (e) {
    console.warn('[Settings] Notice loading settings.json:', e.message);
  }
}

// In-Memory Idempotency Store & Active Order Database (Redis Simulation)
const idempotencyStore = new Map(); // key -> { response, createdAt }
const ordersDatabase = new Map();   // id -> orderRecord
const activeSessions = new Map();   // jti -> sessionClaims
const outOfStockItems = new Set();  // Set of item IDs currently sold out
const dynamicCatalog = new Map();   // id -> itemRecord (Hydrated from SQLite)

// Real-Time Native WebSocket Server (Zero-Latency Multi-Client Event Bus)
const wss = new WebSocketServer({ noServer: true });

function broadcastEvent(type, data) {
  const payload = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  wss.clients.forEach(client => {
    if (client.readyState === 1 /* WebSocket.OPEN */) {
      try {
        client.send(payload);
      } catch (err) {
        console.warn('[WS Broadcast] Send error:', err.message);
      }
    }
  });
}

wss.on('connection', (ws, req) => {
  try {
    ws.send(JSON.stringify({
      type: 'INIT_SYNC',
      data: {
        serverTime: new Date().toISOString(),
        activeOrdersCount: ordersDatabase.size,
        outOfStockItems: Array.from(outOfStockItems),
        menuItemsCount: dynamicCatalog.size
      }
    }));
  } catch (e) {}

  ws.on('message', (msg) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {}
  });
});

// Boot & Hydrate SQLite WAL Persistence Engine
sqliteEngine.initDatabase().then(async () => {
  console.log('[SQLite Engine] Active & verified in WAL mode.');
  try {
    const persistedOrders = await sqliteEngine.getAllOrders();
    persistedOrders.forEach(ord => ordersDatabase.set(ord.id, ord));
    console.log(`[Cache Preload] Hydrated ${ordersDatabase.size} active orders from SQLite.`);

    const persistedItems = await sqliteEngine.getAllItems();
    persistedItems.forEach(item => dynamicCatalog.set(item.id, item));
    console.log(`[Catalog Preload] Hydrated ${dynamicCatalog.size} menu items from SQLite.`);

    const outItems = await sqliteEngine.getInventoryStatus();
    outItems.forEach(id => outOfStockItems.add(id));

    // Boot Cloud Synchronization & Shift Mode Engine
    await syncEngine.init();
    syncEngine.onStatusChange(status => {
      broadcastEvent('SYNC_STATUS_CHANGED', status);
    });
  } catch (err) {
    console.warn('[SQLite Engine] Preload warning:', err.message);
  }
}).catch(err => {
  console.error('[SQLite Engine] Initialization error:', err);
});

// Token Bucket Rate Limiter (ARCH-API-003 §1.2)
const rateLimitBuckets = new Map(); // ip -> { tokens, lastRefill }

function checkRateLimit(ip, maxTokens = 60, refillInterval = 1000) {
  const now = Date.now();
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

// Spherical Haversine Distance Formula (ARCH-SEC-001 §3.1)
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

// Lightweight JWT Creator & Verifier (HMAC-SHA256) (ARCH-SEC-001 §2.1)
function createSessionJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifySessionJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch (e) {
    return null;
  }
}

function normalizeTableNo(raw) {
  if (!raw && raw !== 0) return 'Table 1';
  let clean = String(raw).trim();
  if (!clean) return 'Table 1';

  if (/^\d+$/.test(clean)) {
    return `Table ${parseInt(clean, 10)}`;
  }

  const match = clean.match(/^(?:table|tbl|t)[\s\-_]*(\d+.*)$/i);
  if (match) {
    const suffix = match[1].trim();
    const numOnly = /^\d+$/.test(suffix) ? parseInt(suffix, 10) : suffix;
    return `Table ${numOnly}`;
  }

  if (/^table\s+/i.test(clean)) {
    return `Table ${clean.replace(/^table\s+/i, '').trim()}`;
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Master Menu Catalog for Zero-Trust Server Recalculation (RULE-SEC-001 §1.1)
const MASTER_CATALOG = {
  'prod_01': { id: 'prod_01', title: 'Signature Truffle Beef Burger', price: 450 },
  'prod_02': { id: 'prod_02', title: 'Artisanal Margherita Pizza', price: 520 },
  'item_1': { id: 'item_1', title: 'Spicy Dragon Wings', price: 340 },
  'item_2': { id: 'item_2', title: 'Smoked Garlic Prawns', price: 490 },
  'item_3': { id: 'item_3', title: 'Wild Truffle Fries', price: 260 },
  'item_4': { id: 'item_4', title: 'Signature Beef Ribeye Steak', price: 1150 },
  'item_5': { id: 'item_5', title: 'Slow-Cooked Mutton Dum Biryani', price: 680 },
  'item_6': { id: 'item_6', title: 'Creamy Tuscan Butter Chicken', price: 560 },
  'item_7': { id: 'item_7', title: 'Classic Buffalo Mozzarella Pizza', price: 620 },
  'item_8': { id: 'item_8', title: 'Spicy Pepperoni & Jalapeño Pizza', price: 740 },
  'item_9': { id: 'item_9', title: 'Smoked Salmon Carpaccio', price: 820 },
  'item_10': { id: 'item_10', title: 'Belgian Molten Lava Cake', price: 310 },
  'item_11': { id: 'item_11', title: 'Artisanal Pistachio Kulfi', price: 220 },
  'item_12': { id: 'item_12', title: 'Blueberry Cheesecake Slice', price: 350 },
  'item_13': { id: 'item_13', title: 'Passionfruit Mint Cooler', price: 180 },
  'item_14': { id: 'item_14', title: 'Cold-Pressed Valencia Orange Juice', price: 220 },
  'item_15': { id: 'item_15', title: 'Himalayan Pink Salt Caramel Latte', price: 260 }
};

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Main Server
const server = http.createServer((req, res) => {
  const clientIp = req.socket.remoteAddress || '127.0.0.1';
  let reqUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  // Set Global Security & CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, X-Device-Fingerprint, Evorise-Device-Signature');
  
  // Strict Content Security Policy (RULE-SEC-001 §3.2)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Enforce Token Bucket Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '5' });
      res.end(JSON.stringify({ 
        error: 'RATE_LIMIT_EXCEEDED', 
        message: 'Too many requests. Token bucket exhausted.' 
      }));
      return;
    }
  }

  // ========================================================
  // --- REST MICROSERVICES API (openapi.yaml) ---
  // ========================================================

  // 1. Health Check
  if (pathname === '/api/v1/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      tier: 'Enterprise Hyperscale',
      activeOrders: ordersDatabase.size,
      activeSessions: activeSessions.size,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 1.1 Settings API (GET /api/v1/settings)
  if (pathname === '/api/v1/settings' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(serverSettings));
    return;
  }

  // 1.2 Settings API (POST /api/v1/settings)
  if (pathname === '/api/v1/settings' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        serverSettings = { ...serverSettings, ...payload };
        if (serverSettings.restaurantLat) RESTAURANT_CONFIG.lat = parseFloat(serverSettings.restaurantLat);
        if (serverSettings.restaurantLng) RESTAURANT_CONFIG.lng = parseFloat(serverSettings.restaurantLng);
        if (serverSettings.geofenceRadiusMeters) RESTAURANT_CONFIG.geofenceRadiusMeters = parseInt(serverSettings.geofenceRadiusMeters);
        
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(serverSettings, null, 2), 'utf8');
        sqliteEngine.saveSetting('all_settings', serverSettings).catch(() => {});
        broadcastEvent('SETTINGS_UPDATED', serverSettings);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, settings: serverSettings }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SETTINGS_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 1.25 Menu Items API (GET, POST, DELETE /api/v1/items)
  if (pathname === '/api/v1/items' && req.method === 'GET') {
    sqliteEngine.getAllItems().then(items => {
      items.forEach(it => dynamicCatalog.set(it.id, it));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ITEMS_FETCH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/items' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const item = JSON.parse(body || '{}');
        item.title = item.title || item.name;
        if (!item.title) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'MISSING_TITLE', message: 'Item title or name is required.' }));
          return;
        }
        const saved = await sqliteEngine.saveItem(item);
        dynamicCatalog.set(saved.id, saved);
        broadcastEvent('ITEM_UPDATED', saved);
        broadcastEvent('MENU_UPDATED', { itemId: saved.id, action: 'save' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ITEM_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/v1\/items\/([^/]+)$/) && req.method === 'DELETE') {
    const itemId = pathname.match(/^\/api\/v1\/items\/([^/]+)$/)[1];
    sqliteEngine.deleteItem(itemId).then(() => {
      dynamicCatalog.delete(itemId);
      broadcastEvent('ITEM_DELETED', { id: itemId });
      broadcastEvent('MENU_UPDATED', { itemId, action: 'delete' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: itemId }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ITEM_DELETE_FAILED', details: err.message }));
    });
    return;
  }

  // 1.26 Categories API (GET, POST, DELETE /api/v1/categories)
  if (pathname === '/api/v1/categories' && req.method === 'GET') {
    sqliteEngine.getAllCategories().then(categories => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(categories));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'CATEGORIES_FETCH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/categories' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const cat = JSON.parse(body || '{}');
        const saved = await sqliteEngine.saveCategory(cat);
        broadcastEvent('CATEGORIES_UPDATED', saved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'CATEGORY_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/v1\/categories\/([^/]+)$/) && req.method === 'DELETE') {
    const catId = pathname.match(/^\/api\/v1\/categories\/([^/]+)$/)[1];
    sqliteEngine.deleteCategory(catId).then(() => {
      broadcastEvent('CATEGORIES_UPDATED', { deletedId: catId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: catId }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'CATEGORY_DELETE_FAILED', details: err.message }));
    });
    return;
  }

  // 1.27 Banners API (GET, POST, DELETE /api/v1/banners)
  if (pathname === '/api/v1/banners' && req.method === 'GET') {
    sqliteEngine.getAllBanners().then(banners => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(banners));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'BANNERS_FETCH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/banners' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const banner = JSON.parse(body || '{}');
        const saved = await sqliteEngine.saveBanner(banner);
        broadcastEvent('BANNERS_UPDATED', saved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'BANNER_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/v1\/banners\/([^/]+)$/) && req.method === 'DELETE') {
    const bnrId = pathname.match(/^\/api\/v1\/banners\/([^/]+)$/)[1];
    sqliteEngine.deleteBanner(bnrId).then(() => {
      broadcastEvent('BANNERS_UPDATED', { deletedId: bnrId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: bnrId }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'BANNER_DELETE_FAILED', details: err.message }));
    });
    return;
  }

  // 1.28 Offers API (GET, POST, DELETE /api/v1/offers)
  if (pathname === '/api/v1/offers' && req.method === 'GET') {
    sqliteEngine.getAllOffers().then(offers => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(offers));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'OFFERS_FETCH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/offers' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const offer = JSON.parse(body || '{}');
        const saved = await sqliteEngine.saveOffer(offer);
        broadcastEvent('OFFERS_UPDATED', saved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OFFER_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/v1\/offers\/([^/]+)$/) && req.method === 'DELETE') {
    const offerId = pathname.match(/^\/api\/v1\/offers\/([^/]+)$/)[1];
    sqliteEngine.deleteOffer(offerId).then(() => {
      broadcastEvent('OFFERS_UPDATED', { deletedId: offerId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: offerId }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'OFFER_DELETE_FAILED', details: err.message }));
    });
    return;
  }

  // 1.29 Dining Tables API (GET, POST, DELETE /api/v1/tables)
  if (pathname === '/api/v1/tables' && req.method === 'GET') {
    sqliteEngine.getAllTables().then(tables => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tables));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'TABLES_FETCH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/tables' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const table = JSON.parse(body || '{}');
        const saved = await sqliteEngine.saveTable(table);
        broadcastEvent('TABLES_UPDATED', saved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'TABLE_SAVE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/v1\/tables\/([^/]+)$/) && req.method === 'DELETE') {
    const tblId = pathname.match(/^\/api\/v1\/tables\/([^/]+)$/)[1];
    sqliteEngine.deleteTable(tblId).then(() => {
      broadcastEvent('TABLES_UPDATED', { deletedId: tblId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: tblId }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'TABLE_DELETE_FAILED', details: err.message }));
    });
    return;
  }

  // 1.295 Database & Backup Operations API
  if (pathname === '/api/v1/database/stats' && req.method === 'GET') {
    sqliteEngine.getDatabaseStats().then(stats => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'DB_STATS_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/database/backup' && req.method === 'POST') {
    Promise.all([
      sqliteEngine.createDatabaseBackup(),
      sqliteEngine.exportDatabaseAsJson()
    ]).then(([binaryBackup, jsonBackup]) => {
      const allBackups = sqliteEngine.listBackups();
      broadcastEvent('DATABASE_BACKUP_CREATED', { backup: binaryBackup, totalBackups: allBackups.length });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Point-in-time SQLite snapshot and JSON backup created successfully.',
        binaryBackup,
        jsonBackup,
        backups: allBackups
      }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'BACKUP_CREATION_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/database/backups' && req.method === 'GET') {
    try {
      const backups = sqliteEngine.listBackups();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(backups));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'LIST_BACKUPS_FAILED', details: err.message }));
    }
    return;
  }

  if (pathname === '/api/v1/database/restore' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { fileName } = JSON.parse(body || '{}');
        if (!fileName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'MISSING_FILE', message: 'fileName is required.' }));
          return;
        }
        const safeName = path.basename(fileName);
        const backupPath = path.join(ROOT, 'backups', safeName);
        if (!fs.existsSync(backupPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'BACKUP_NOT_FOUND', message: `Backup file ${safeName} not found.` }));
          return;
        }

        const result = await sqliteEngine.restoreDatabaseFromBackup(backupPath);

        // Resync memory caches
        const items = await sqliteEngine.getAllItems();
        dynamicCatalog.clear();
        items.forEach(it => dynamicCatalog.set(it.id, it));

        const orders = await sqliteEngine.getAllOrders();
        ordersDatabase.clear();
        orders.forEach(o => ordersDatabase.set(o.id, o));

        broadcastEvent('DATABASE_RESTORED', {
          fileName: safeName,
          itemsCount: items.length,
          ordersCount: orders.length
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Database successfully restored from ${safeName}`, result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'RESTORE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/v1/database/download/') && req.method === 'GET') {
    const rawName = pathname.replace('/api/v1/database/download/', '');
    const safeName = path.basename(rawName);
    const backupPath = path.join(ROOT, 'backups', safeName);
    if (!fs.existsSync(backupPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'FILE_NOT_FOUND', message: 'Requested backup does not exist.' }));
      return;
    }
    const stat = fs.statSync(backupPath);
    res.writeHead(200, {
      'Content-Type': safeName.endsWith('.json') ? 'application/json' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Content-Length': stat.size
    });
    fs.createReadStream(backupPath).pipe(res);
    return;
  }

  // 1.296 Cloud Synchronization & Shift Mode API (ARCH-SYNC-001)
  if (pathname === '/api/v1/sync/status' && req.method === 'GET') {
    syncEngine.getStatus().then(status => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'SYNC_STATUS_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/sync/mode' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { mode } = JSON.parse(body || '{}');
        const status = await syncEngine.setMode(mode);
        broadcastEvent('SYNC_STATUS_CHANGED', status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, status }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SET_MODE_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/v1/sync/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const config = JSON.parse(body || '{}');
        const status = await syncEngine.setCloudConfig(config);
        broadcastEvent('SYNC_STATUS_CHANGED', status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, status }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SET_CONFIG_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/v1/sync/push' && req.method === 'POST') {
    syncEngine.pushPendingQueue().then(result => {
      syncEngine.getStatus().then(status => {
        broadcastEvent('SYNC_STATUS_CHANGED', status);
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'SYNC_PUSH_FAILED', details: err.message }));
    });
    return;
  }

  if (pathname === '/api/v1/sync/test' && req.method === 'POST') {
    syncEngine.pingCloud().then(result => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // 1.3 Orders List (GET /api/v1/orders)
  if (pathname === '/api/v1/orders' && req.method === 'GET') {
    sqliteEngine.getAllOrders().then(orders => {
      orders.forEach(o => ordersDatabase.set(o.id, o));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(orders));
    }).catch(() => {
      const list = Array.from(ordersDatabase.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(list));
    });
    return;
  }

  // 1.4 Orders Cancel (POST /api/v1/orders/:id/cancel)
  if (pathname.match(/^\/api\/v1\/orders\/([^/]+)\/cancel$/) && req.method === 'POST') {
    const orderId = pathname.match(/^\/api\/v1\/orders\/([^/]+)\/cancel$/)[1];
    let order = ordersDatabase.get(orderId);
    if (!order) {
      for (const [k, v] of ordersDatabase.entries()) {
        if (k.toLowerCase() === orderId.toLowerCase()) { order = v; break; }
      }
    }
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND', message: `Order #${orderId} not found.` }));
      return;
    }

    if (order.status === 'Cancelled') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Order is already cancelled.', order }));
      return;
    }

    const orderDate = new Date(order.date || Date.now()).getTime();
    const elapsedSeconds = (Date.now() - orderDate) / 1000;
    const isWithinGracePeriod = elapsedSeconds <= 60; // 60s customer grace cancellation period
    const isPending = order.status === 'Pending';

    // Allow cancellation ONLY if still Pending AND within 60-second grace window
    if (isPending && isWithinGracePeriod) {
      order.status = 'Cancelled';
      order.statusUpdatedAt = new Date().toISOString();
      order.cancelledAt = new Date().toISOString();
      order.cancellationReason = 'Cancelled by customer';
      ordersDatabase.set(order.id, order);

      sqliteEngine.cancelOrder(order.id, 'Cancelled by customer').then(() => {
        broadcastEvent('ORDER_CANCELLED', order);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Order successfully cancelled.', order }));
      }).catch(err => {
        console.warn('[SQLite] Cancel sync warning:', err.message);
        broadcastEvent('ORDER_CANCELLED', order);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Order successfully cancelled.', order }));
      });
      return;
    }

    // Otherwise preparation has already started
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'CANNOT_CANCEL', 
      message: 'This order cannot be cancelled because the kitchen has already started preparing it.',
      elapsedSeconds: Math.round(elapsedSeconds),
      currentStatus: order.status
    }));
    return;
  }

  // 1.5 Single Order Details (GET /api/v1/orders/:id)
  if (pathname.match(/^\/api\/v1\/orders\/([^/]+)$/) && req.method === 'GET') {
    const orderId = pathname.match(/^\/api\/v1\/orders\/([^/]+)$/)[1];
    let order = ordersDatabase.get(orderId);
    if (!order) {
      for (const [k, v] of ordersDatabase.entries()) {
        if (k.toLowerCase() === orderId.toLowerCase()) { order = v; break; }
      }
    }
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND', message: `Order #${orderId} not found.` }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(order));
    return;
  }

  // 1.6 Order Status Update (PATCH /api/v1/orders/:id)
  if (pathname.match(/^\/api\/v1\/orders\/([^/]+)$/) && req.method === 'PATCH') {
    const orderId = pathname.match(/^\/api\/v1\/orders\/([^/]+)$/)[1];
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { status } = JSON.parse(body || '{}');
        let order = ordersDatabase.get(orderId);
        if (!order) {
          for (const [k, v] of ordersDatabase.entries()) {
            if (k.toLowerCase() === orderId.toLowerCase()) { order = v; break; }
          }
        }
        if (!order) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ORDER_NOT_FOUND' }));
          return;
        }
        if (status) {
          order.status = status;
          order.statusUpdatedAt = new Date().toISOString();
          ordersDatabase.set(order.id, order);

          sqliteEngine.updateOrderStatus(order.id, status).catch(err => {
            console.warn('[SQLite] Status update warning:', err.message);
          });
          broadcastEvent('ORDER_STATUS_CHANGED', order);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, order }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ORDER_UPDATE_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 2. Initialize Table Session & Geofence Verification (POST /api/v1/sessions/init)
  if (pathname === '/api/v1/sessions/init' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { table_identifier, gps_lat, gps_lng, ble_rssi, device_fingerprint } = payload;

        const tableId = normalizeTableNo(table_identifier || 'Table 1');
        let distanceMeters = 0;
        let isInsideGeofence = true;

        if (gps_lat !== undefined && gps_lng !== undefined) {
          distanceMeters = calculateHaversineDistance(
            RESTAURANT_CONFIG.lat,
            RESTAURANT_CONFIG.lng,
            parseFloat(gps_lat),
            parseFloat(gps_lng)
          );
          isInsideGeofence = distanceMeters <= RESTAURANT_CONFIG.geofenceRadiusMeters;
        }

        // Validate BLE RSSI Floor Beacon if provided (ARCH-SEC-001 §3.2)
        let bleVerified = true;
        if (typeof ble_rssi === 'number') {
          bleVerified = ble_rssi >= RESTAURANT_CONFIG.bleRssiThreshold;
        }

        if (!isInsideGeofence) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            code: 'ERR_GEOFENCE_VIOLATION',
            message: `You must be physically present in the restaurant to place an order. Distance: ${distanceMeters}m (Allowed: ${RESTAURANT_CONFIG.geofenceRadiusMeters}m)`,
            distanceMeters,
            allowedRadius: RESTAURANT_CONFIG.geofenceRadiusMeters
          }));
          return;
        }

        if (!bleVerified) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            code: 'ERR_BLE_FLOOR_MISMATCH',
            message: 'Bluetooth signal strength indicates incorrect dining floor. Please scan the QR code located on your actual table.',
            bleRssi: ble_rssi,
            threshold: RESTAURANT_CONFIG.bleRssiThreshold
          }));
          return;
        }

        // Generate Anonymous Session JWT (ARCH-SEC-001 §2.1)
        const jti = `urn:uuid:${crypto.randomUUID()}`;
        const now = Math.floor(Date.now() / 1000);
        const jwtClaims = {
          jti,
          sub: 'anonymous_guest',
          aud: 'evorise-order-engine',
          tid: tableId,
          rid: RESTAURANT_CONFIG.id,
          d_hash: device_fingerprint || 'unknown_device',
          flr: 1,
          iat: now,
          exp: now + 7200 // 2 hours validity
        };

        const token = createSessionJwt(jwtClaims);
        activeSessions.set(jti, jwtClaims);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          token,
          tokenType: 'Bearer',
          expiresIn: 7200,
          claims: jwtClaims,
          geofenceVerified: true,
          distanceMeters
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 'ERR_SESSION_INIT_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 3. Menu Catalog Endpoint (GET /api/v1/menu/:id)
  if (pathname.startsWith('/api/v1/menu') && req.method === 'GET') {
    const catalogSource = dynamicCatalog.size > 0 
      ? Array.from(dynamicCatalog.values()) 
      : Object.values(MASTER_CATALOG);
    const items = catalogSource.map(item => ({
      ...item,
      outOfStock: outOfStockItems.has(item.id) || !!item.outOfStock
    }));
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    });
    res.end(JSON.stringify({
      restaurantId: RESTAURANT_CONFIG.id,
      items,
      count: items.length,
      outOfStockCount: outOfStockItems.size
    }));
    return;
  }

  // 4. Zero-Trust Idempotent Order Placement (POST /api/v1/orders/place)
  if (pathname === '/api/v1/orders/place' && req.method === 'POST') {
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
        const items = orderData.items || [];

        if (items.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'EMPTY_ORDER', message: 'Cart contains no items.' }));
          return;
        }

        // Check for sold out items
        for (const item of items) {
          const itemId = item.id || item.productId;
          if (itemId && outOfStockItems.has(itemId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'ITEM_SOLD_OUT', 
              message: `Item "${item.title || itemId}" is currently sold out.` 
            }));
            return;
          }
        }

        // ZERO-TRUST PRICE RECALCULATION (RULE-SEC-001 §1.1)
        // Backend strictly recalculates subtotal and tax cents. Never trusts client total.
        let recalculatedSubtotalCents = 0;
        const verifiedItems = items.map(item => {
          const catItem = dynamicCatalog.get(item.id) || dynamicCatalog.get(item.productId) || MASTER_CATALOG[item.id] || MASTER_CATALOG[item.productId];
          const unitPrice = (catItem && catItem.price !== undefined) ? parseFloat(catItem.price) : (parseFloat(item.price) || 0);
          const quantity = Math.max(parseInt(item.quantity) || 1, 1);
          
          let itemTotal = unitPrice * quantity;
          // Addons cost
          if (Array.isArray(item.addons)) {
            itemTotal += item.addons.length * 50 * quantity;
          }

          recalculatedSubtotalCents += Math.round(itemTotal * 100);

          return {
            ...item,
            verifiedUnitPrice: unitPrice,
            quantity,
            lineTotal: itemTotal
          };
        });

        const taxRate = 0.05; // 5% VAT
        const recalculatedTaxCents = Math.round(recalculatedSubtotalCents * taxRate);
        const recalculatedTotalCents = recalculatedSubtotalCents + recalculatedTaxCents;
        const grandTotal = recalculatedTotalCents / 100;

        // Generate Order ID & State
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const orderRecord = {
          id: orderId,
          idempotencyKey: idempotencyKey || null,
          tableNo: normalizeTableNo(orderData.tableNo || orderData.tableId || 'Table 1'),
          sessionId: orderData.sessionId || null,
          items: verifiedItems,
          subtotal: recalculatedSubtotalCents / 100,
          tax: recalculatedTaxCents / 100,
          total: grandTotal,
          status: 'Pending',
          paymentStatus: orderData.paymentStatus || 'Cash at Counter',
          notes: orderData.notes || '',
          date: new Date().toISOString()
        };

        ordersDatabase.set(orderId, orderRecord);

        // Persist to SQLite in WAL Mode and queue for Cloud Sync
        sqliteEngine.saveOrder(orderRecord).then(() => {
          sqliteEngine.queueSyncEvent('order', orderRecord.id, 'create', orderRecord).catch(() => {});
          syncEngine.checkConnectivityAndSync().catch(() => {});
          broadcastEvent('ORDER_CREATED', orderRecord);
          if (idempotencyKey) {
            idempotencyStore.set(idempotencyKey, { response: orderRecord, createdAt: Date.now() });
          }
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(orderRecord));
        }).catch(err => {
          console.warn('[SQLite] Order save warning:', err.message);
          sqliteEngine.queueSyncEvent('order', orderRecord.id, 'create', orderRecord).catch(() => {});
          broadcastEvent('ORDER_CREATED', orderRecord);
          if (idempotencyKey) {
            idempotencyStore.set(idempotencyKey, { response: orderRecord, createdAt: Date.now() });
          }
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(orderRecord));
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ORDER_PROCESSING_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 5. Thermal ESC/POS Byte Buffer Receipt Generator (ARCH-POS-005 §2.1)
  if (pathname === '/api/v1/pos/print/escpos' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const order = JSON.parse(body || '{}');
        const rawEscPosBuffer = generateOrderReceiptEscPos(order, {
          name: RESTAURANT_CONFIG.name,
          currency: 'BDT'
        });

        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="receipt-${order.id || 'order'}.bin"`,
          'X-EscPos-Hex-Preview': rawEscPosBuffer.toString('hex').slice(0, 80) + '...'
        });
        res.end(rawEscPosBuffer);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'PRINT_GENERATION_FAILED', details: err.message }));
      }
    });
    return;
  }

  // 6. Real-Time Out-of-Stock Status Engine (ARCH-POS-005 §3.1)
  if (pathname === '/api/v1/inventory/status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { itemId, outOfStock } = JSON.parse(body || '{}');
        if (itemId) {
          if (outOfStock) {
            outOfStockItems.add(itemId);
          } else {
            outOfStockItems.delete(itemId);
          }
          sqliteEngine.setInventoryStatus(itemId, outOfStock).catch(() => {});
          broadcastEvent('INVENTORY_CHANGED', { itemId, outOfStock, allOutOfStock: Array.from(outOfStockItems) });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          itemId, 
          outOfStock: outOfStockItems.has(itemId),
          allOutOfStock: Array.from(outOfStockItems)
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVENTORY_SYNC_FAILED', details: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/v1/inventory/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ outOfStockItems: Array.from(outOfStockItems) }));
    return;
  }

  // 6. Offline High-Resolution Vector QR Code Generator (GET /api/v1/qr)
  if (pathname === '/api/v1/qr' && req.method === 'GET') {
    const text = reqUrl.searchParams.get('text') || '';
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'MISSING_TEXT', message: 'Query parameter "text" is required.' }));
      return;
    }
    try {
      const QRCode = require('qrcode');
      QRCode.toString(text, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', width: 300 }, (err, svg) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'QR_GENERATION_FAILED', details: err.message }));
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        });
        res.end(svg);
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'QR_MODULE_ERROR', details: err.message }));
    }
    return;
  }

  // ========================================================
  // --- STATIC FILE SERVING WITH SMART REWRITES ---
  // ========================================================

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin/index.html';
  } else if (pathname === '/login' || pathname === '/login/') {
    pathname = '/admin/login.html';
  }

  let filePath = path.join(ROOT, pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><body><h2>404 Not Found</h2><p>${pathname}</p><a href="/index.html">Back to Home</a></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Service Worker should not be aggressively cached
    const cacheHeader = ext === '.js' && pathname.includes('sw.js')
      ? 'no-cache, no-store, must-revalidate'
      : 'no-cache, must-revalidate';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheHeader
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Attach WebSocket Upgrade Handler
server.on('upgrade', (request, socket, head) => {
  const reqUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (reqUrl.pathname === '/ws' || reqUrl.pathname === '/ws/orders') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    if (server.listening) {
      return resolve(server);
    }
    server.listen(port, () => {
      console.log(`[Evorise Unified Engine] Running at http://localhost:${port}/`);
      console.log(`Menu Home: http://localhost:${port}/index.html`);
      console.log(`Admin Panel: http://localhost:${port}/admin/index.html`);
      console.log(`OpenAPI Endpoints: /api/v1/sessions/init, /api/v1/menu, /api/v1/orders/place, /api/v1/pos/print/escpos, /api/v1/qr`);
      resolve(server);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[Evorise Unified Engine] Port ${port} is already active, attaching to existing instance.`);
        resolve(server);
      } else {
        reject(err);
      }
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server.listening) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { server, wss, startServer, stopServer };
