/**
 * MenuSvc: Menu & Catalog Microservice with Redis Invalidation
 * Conforms to: PHASE-002 §1 & ARCH-DB-001
 */

const http = require('http');
const PORT = process.env.PORT || 4001;

// Simulated Catalog Database & Redis In-Memory Cache
const menuCatalog = [
  {
    id: "prod_01",
    title: "Signature Truffle Beef Burger",
    category: "Mains",
    price: 450,
    dietary: "non-veg",
    desc: "Aged black angus patty, black truffle aioli, melted mature cheddar, brioche bun.",
    prepTime: "15-20 mins",
    variants: [
      { id: "var_1", name: "Single Patty (180g)", priceDelta: 0 },
      { id: "var_2", name: "Double Patty (360g)", priceDelta: 160 }
    ],
    addons: [
      { id: "add_1", name: "Crispy Beef Bacon", price: 80 },
      { id: "add_2", name: "Extra Truffle Aioli", price: 50 },
      { id: "add_3", name: "Smoked Cheddar Slice", price: 40 }
    ]
  },
  {
    id: "prod_02",
    title: "Artisanal Margherita Pizza",
    category: "Pizza",
    price: 520,
    dietary: "veg",
    desc: "San Marzano D.O.P. tomato sauce, fresh buffalo mozzarella, organic basil, extra virgin olive oil.",
    prepTime: "12-15 mins",
    variants: [
      { id: "var_p1", name: "Medium 10-inch", priceDelta: 0 },
      { id: "var_p2", name: "Large 14-inch", priceDelta: 220 }
    ],
    addons: [
      { id: "add_p1", name: "Burrata Ball Topping", price: 140 },
      { id: "add_p2", name: "Fresh Garlic Dip", price: 30 }
    ]
  }
];

// Redis Cache Mock
let redisCache = null;
let cacheValid = false;

function getMenuFromCache() {
  if (cacheValid && redisCache) {
    return { data: redisCache, fromCache: true };
  }
  redisCache = [...menuCatalog];
  cacheValid = true;
  return { data: redisCache, fromCache: false };
}

function invalidateMenuCache(reason = 'ADMIN_UPDATE') {
  cacheValid = false;
  redisCache = null;
  console.log(`[Redis Pub/Sub] Invalided cache key 'menu:rest_001' -> Reason: ${reason}`);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'HEALTHY', service: 'MenuSvc', cacheActive: cacheValid }));
    return;
  }

  // 1. Get Catalog (GET /api/v1/menu)
  if (url.pathname === '/api/v1/menu' && req.method === 'GET') {
    const { data, fromCache } = getMenuFromCache();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Cache-Lookup': fromCache ? 'HIT_REDIS' : 'MISS_POSTGRES'
    });
    res.end(JSON.stringify({ items: data, count: data.length }));
    return;
  }

  // 2. Add New Product (POST /api/v1/menu/items)
  if (url.pathname === '/api/v1/menu/items' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body || '{}');
        newItem.id = newItem.id || `prod_${Date.now().toString().slice(-4)}`;
        menuCatalog.push(newItem);
        
        // Trigger Cache Invalidation per PHASE-002 Task 1.1.3
        invalidateMenuCache('ITEM_CREATED');

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'CATALOG_MUTATION_FAILED', details: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND' }));
});

server.listen(PORT, () => {
  console.log(`[MenuSvc] Menu & Catalog Microservice running on port ${PORT}`);
});
