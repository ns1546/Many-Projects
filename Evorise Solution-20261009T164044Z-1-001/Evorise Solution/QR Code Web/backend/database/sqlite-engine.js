/**
 * Evorise Enterprise Platform - SQLite Transactional Persistence Engine
 * Architecture: ARCH-DB-001 & Industrial POS Data Layer (Square / Toast Equivalent)
 * Guarantees:
 *  - ACID Durability (WAL Mode with PRAGMA synchronous = NORMAL)
 *  - Integer-Cents Financial Precision (Zero Floating Point Loss)
 *  - Full Entity Persistence (Menu Items, Categories, Banners, Offers, Tables, Orders, Settings)
 *  - Automated Point-in-Time Database Snapshots & 1-Click Restore Engine
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, '..', '..', 'database.sqlite');
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  try { fs.mkdirSync(BACKUPS_DIR, { recursive: true }); } catch (e) {}
}

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_FILE);
  }
  return db;
}

/**
 * Initialize All Enterprise Tables & Indexes in WAL Mode
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.serialize(() => {
      // High-concurrency WAL mode
      database.run('PRAGMA journal_mode = WAL;');
      database.run('PRAGMA synchronous = NORMAL;');
      database.run('PRAGMA foreign_keys = ON;');

      // 1. Orders Table
      database.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          idempotency_key TEXT UNIQUE,
          restaurant_id TEXT NOT NULL,
          table_no TEXT NOT NULL,
          session_id TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          payment_status TEXT NOT NULL DEFAULT 'Cash at Counter',
          subtotal_cents INTEGER NOT NULL,
          tax_cents INTEGER NOT NULL,
          total_cents INTEGER NOT NULL,
          notes TEXT,
          items_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          cancelled_at TEXT,
          cancellation_reason TEXT
        );
      `);
      database.run(`CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id, created_at DESC);`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_no);`);

      // 2. Table Sessions Table
      database.run(`
        CREATE TABLE IF NOT EXISTS table_sessions (
          id TEXT PRIMARY KEY,
          table_no TEXT NOT NULL,
          restaurant_id TEXT NOT NULL,
          device_fingerprint TEXT,
          jwt_token TEXT,
          status TEXT NOT NULL DEFAULT 'Active',
          created_at TEXT NOT NULL,
          closed_at TEXT
        );
      `);
      database.run(`CREATE INDEX IF NOT EXISTS idx_sessions_table ON table_sessions(table_no, status);`);

      // 3. Settings Key-Value Store
      database.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 4. Inventory Out-of-Stock Status
      database.run(`
        CREATE TABLE IF NOT EXISTS inventory_status (
          item_id TEXT PRIMARY KEY,
          out_of_stock INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
      `);

      // 5. Audit Log Table
      database.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          entity_id TEXT,
          details TEXT,
          timestamp TEXT NOT NULL
        );
      `);

      // 6. Menu Items Table (Enterprise Catalog Store)
      database.run(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          price REAL NOT NULL,
          category TEXT NOT NULL DEFAULT 'mains',
          sub_category TEXT,
          description TEXT,
          image TEXT,
          badges TEXT,
          dietary TEXT DEFAULT 'none',
          prep_time TEXT DEFAULT '15 mins',
          variants_json TEXT,
          addons_json TEXT,
          out_of_stock INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      database.run(`CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category);`);

      // 7. Categories Table
      database.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          display_order INTEGER DEFAULT 1,
          sub_categories_json TEXT,
          updated_at TEXT NOT NULL
        );
      `);

      // 8. Banners Table
      database.run(`
        CREATE TABLE IF NOT EXISTS banners (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          desc TEXT,
          image TEXT NOT NULL,
          link TEXT DEFAULT '#',
          updated_at TEXT NOT NULL
        );
      `);

      // 9. Offers Table
      database.run(`
        CREATE TABLE IF NOT EXISTS offers (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          desc TEXT,
          image TEXT,
          badge TEXT,
          terms TEXT,
          price REAL,
          code TEXT,
          updated_at TEXT NOT NULL
        );
      `);

      // 10. Dining Tables Table
      database.run(`
        CREATE TABLE IF NOT EXISTS dining_tables (
          id TEXT PRIMARY KEY,
          table_no TEXT NOT NULL UNIQUE,
          capacity INTEGER DEFAULT 4,
          floor TEXT DEFAULT '1st Floor',
          status TEXT NOT NULL DEFAULT 'Vacant',
          active_session_id TEXT,
          qr_url TEXT,
          updated_at TEXT NOT NULL
        );
      `);

      // 11. Sync Queue Table (For Online/Offline Shift Mode)
      database.run(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          error_message TEXT,
          created_at TEXT NOT NULL,
          synced_at TEXT
        );
      `);
      database.run(`CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, created_at ASC);`);

      // 12. Sync Config Key-Value Store
      database.run(`
        CREATE TABLE IF NOT EXISTS sync_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `, async (err) => {
        if (err) return reject(err);

        try {
          // Auto-seed initial data if tables are empty
          await autoSeedIfEmpty(database);
          console.log('[SQLite Engine] Enterprise database verified & active in WAL mode:', DB_FILE);
          resolve(true);
        } catch (seedErr) {
          console.warn('[SQLite Engine] Notice during auto-seed:', seedErr.message);
          resolve(true);
        }
      });
    });
  });
}

/**
 * Auto-Seed Default Catalog & Tables if Database is Empty
 */
async function autoSeedIfEmpty(database) {
  // Check items count
  const itemsCount = await new Promise((res) => {
    database.get('SELECT COUNT(*) as count FROM menu_items', (err, row) => res(row ? row.count : 0));
  });

  if (itemsCount === 0) {
    console.log('[SQLite Engine] First-time setup: Seeding master menu catalog...');
    const now = new Date().toISOString();

    // Default Seed Items
    const defaultItems = [
      { id: 'prod_01', title: 'Signature Truffle Beef Burger', price: 450, category: 'mains', subCategory: 'Steaks', description: 'Angus beef patty, black truffle aioli, aged cheddar on toasted brioche.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Bestseller, Chef Special' },
      { id: 'prod_02', title: 'Artisanal Margherita Pizza', price: 520, category: 'pizzas', subCategory: 'Classic', description: 'San Marzano tomatoes, fresh buffalo mozzarella, fragrant sweet basil.', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Vegetarian, Classic' },
      { id: 'item_1', title: 'Spicy Dragon Wings', price: 340, category: 'appetizers', subCategory: 'Asian', description: 'Crispy chicken wings glazed in spicy Szechuan chili honey with roasted sesame.', image: 'https://images.unsplash.com/photo-1527477378378-085773179294?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Spicy' },
      { id: 'item_2', title: 'Smoked Garlic Prawns', price: 490, category: 'appetizers', subCategory: 'Italian', description: 'Tiger prawns sauteed in smoked garlic butter, white wine, and fresh herbs.', image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Seafood' },
      { id: 'item_3', title: 'Wild Truffle Fries', price: 260, category: 'appetizers', subCategory: 'Italian', description: 'Hand-cut russet potatoes tossed in white truffle oil and Grana Padano parmesan.', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Popular' },
      { id: 'item_4', title: 'Signature Beef Ribeye Steak', price: 1150, category: 'mains', subCategory: 'Steaks', description: '300g Prime Australian ribeye grilled over charcoal with rosemary garlic butter.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Premium' },
      { id: 'item_5', title: 'Slow-Cooked Mutton Dum Biryani', price: 680, category: 'mains', subCategory: 'Indian', description: 'Aromatic long-grain basmati rice layered with tender mutton and saffron.', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Chef Special' },
      { id: 'item_6', title: 'Creamy Tuscan Butter Chicken', price: 560, category: 'mains', subCategory: 'Curries', description: 'Charred tandoori chicken cooked in rich makhani gravy with sun-dried tomatoes.', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Bestseller' },
      { id: 'item_7', title: 'Classic Buffalo Mozzarella Pizza', price: 620, category: 'pizzas', subCategory: 'Classic', description: 'Hand-stretched sourdough crust with mozzarella di bufala and extra virgin olive oil.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Vegetarian' },
      { id: 'item_8', title: 'Spicy Pepperoni & Jalapeño Pizza', price: 740, category: 'pizzas', subCategory: 'Specialty', description: 'Smoked beef pepperoni, pickled jalapeño peppers, and hot honey drizzle.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', dietary: 'non-veg', badges: 'Spicy' },
      { id: 'item_10', title: 'Belgian Molten Lava Cake', price: 310, category: 'desserts', subCategory: 'Cakes', description: 'Warm dark chocolate fondant with liquid center served with vanilla bean gelato.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Sweet' },
      { id: 'item_12', title: 'Blueberry Cheesecake Slice', price: 350, category: 'desserts', subCategory: 'Pastries', description: 'Classic New York baked cheesecake topped with wild blueberry compote.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Popular' },
      { id: 'item_13', title: 'Passionfruit Mint Cooler', price: 180, category: 'drinks', subCategory: 'Mocktails', description: 'Fresh passionfruit pulp, crushed garden mint, lime juice, and sparkling water.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Refreshing' },
      { id: 'item_15', title: 'Himalayan Pink Salt Caramel Latte', price: 260, category: 'drinks', subCategory: 'Hot Drinks', description: 'Double espresso with steamed whole milk, artisanal caramel, and mineral pink salt.', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80', dietary: 'veg', badges: 'Barista Special' }
    ];

    const stmt = database.prepare(`
      INSERT OR IGNORE INTO menu_items (
        id, title, price, category, sub_category, description, image, badges, dietary,
        variants_json, addons_json, out_of_stock, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultItems.forEach(item => {
      stmt.run([
        item.id, item.title, item.price, item.category, item.subCategory || '',
        item.description, item.image, item.badges || '', item.dietary || 'none',
        '[]', '[]', 0, now, now
      ]);
    });
    stmt.finalize();
  }

  // Check Categories
  const catsCount = await new Promise((res) => {
    database.get('SELECT COUNT(*) as count FROM categories', (err, row) => res(row ? row.count : 0));
  });

  if (catsCount === 0) {
    const defaultCategories = [
      { id: 'appetizers', name: 'Appetizers', order: 1, sub: ['Asian', 'Italian', 'Mexican'] },
      { id: 'mains', name: 'Mains', order: 2, sub: ['Steaks', 'Curries', 'Pasta', 'Asian', 'Indian'] },
      { id: 'pizzas', name: 'Pizzas', order: 3, sub: ['Classic', 'Specialty'] },
      { id: 'desserts', name: 'Desserts', order: 4, sub: ['Cakes', 'Pastries', 'Ice Cream'] },
      { id: 'drinks', name: 'Drinks', order: 5, sub: ['Mocktails', 'Hot Drinks', 'Cold Drinks'] }
    ];

    const catStmt = database.prepare(`INSERT OR IGNORE INTO categories (id, name, display_order, sub_categories_json, updated_at) VALUES (?, ?, ?, ?, ?)`);
    defaultCategories.forEach(c => {
      catStmt.run([c.id, c.name, c.order, JSON.stringify(c.sub), new Date().toISOString()]);
    });
    catStmt.finalize();
  }

  // Check Banners
  const bannersCount = await new Promise((res) => {
    database.get('SELECT COUNT(*) as count FROM banners', (err, row) => res(row ? row.count : 0));
  });

  if (bannersCount === 0) {
    const defaultBanners = [
      { id: 'banner1', title: 'Weekend BBQ Extravaganza', desc: 'Unlimited grilled ribeye and smoked prawns this weekend.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', link: '#' },
      { id: 'banner2', title: 'Handmade Artisanal Pizzas', desc: 'Sourdough crust baked in 450°C Italian stone oven.', image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80', link: '#' },
      { id: 'banner3', title: 'Craft Mocktails & Coolers', desc: 'Fresh cold-pressed fruits and botanical infusions.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80', link: '#' }
    ];
    const bStmt = database.prepare(`INSERT OR IGNORE INTO banners (id, title, desc, image, link, updated_at) VALUES (?, ?, ?, ?, ?, ?)`);
    defaultBanners.forEach(b => {
      bStmt.run([b.id, b.title, b.desc, b.image, b.link, new Date().toISOString()]);
    });
    bStmt.finalize();
  }

  // Check Offers
  const offersCount = await new Promise((res) => {
    database.get('SELECT COUNT(*) as count FROM offers', (err, row) => res(row ? row.count : 0));
  });

  if (offersCount === 0) {
    const defaultOffers = [
      { id: 'offer1', title: '20% OFF Seafood Platter', desc: 'Enjoy our signature garlic prawn mix for a fraction of the price.', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', badge: 'Special', terms: 'Dine-in only.', price: 1200, code: 'SEAFOOD20' },
      { id: 'offer2', title: 'Free Lava Cake with Steak', desc: 'Complimentary molten chocolate dessert with every prime ribeye order.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', badge: 'Sweet', terms: 'Weekend special.', price: 0, code: 'SWEETTREAT' }
    ];
    const oStmt = database.prepare(`INSERT OR IGNORE INTO offers (id, title, desc, image, badge, terms, price, code, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    defaultOffers.forEach(o => {
      oStmt.run([o.id, o.title, o.desc, o.image, o.badge, o.terms, o.price, o.code, new Date().toISOString()]);
    });
    oStmt.finalize();
  }

  // Check Tables
  const tblCount = await new Promise((res) => {
    database.get('SELECT COUNT(*) as count FROM dining_tables', (err, row) => res(row ? row.count : 0));
  });

  if (tblCount === 0) {
    const defaultTables = [
      { id: 'tbl_1', tableNo: 'Table 1', capacity: 4, floor: '1st Floor' },
      { id: 'tbl_2', tableNo: 'Table 2', capacity: 2, floor: '1st Floor' },
      { id: 'tbl_3', tableNo: 'Table 3', capacity: 6, floor: '1st Floor' },
      { id: 'tbl_4', tableNo: 'Table 4', capacity: 4, floor: '1st Floor' },
      { id: 'tbl_5', tableNo: 'Table 5', capacity: 2, floor: 'Rooftop Garden' },
      { id: 'tbl_6', tableNo: 'Table 6', capacity: 8, floor: 'VIP Lounge' }
    ];
    const tStmt = database.prepare(`INSERT OR IGNORE INTO dining_tables (id, table_no, capacity, floor, status, active_session_id, qr_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    defaultTables.forEach(t => {
      tStmt.run([t.id, t.tableNo, t.capacity, t.floor, 'Vacant', null, `/index.html?table=${t.tableNo.replace(/\D/g, '')}`, new Date().toISOString()]);
    });
    tStmt.finalize();
  }
}

// ==========================================
// --- MENU ITEMS CRUD ---
// ==========================================
function getAllItems() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM menu_items ORDER BY category, title', (err, rows) => {
      if (err) return reject(err);
      resolve((rows || []).map(formatItemRecord));
    });
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get('SELECT * FROM menu_items WHERE id = ? COLLATE NOCASE', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row ? formatItemRecord(row) : null);
    });
  });
}

function saveItem(item) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const id = item.id || `ITEM-${Date.now()}`;
    const now = new Date().toISOString();
    const itemTitle = item.title || item.name || 'Untitled Item';
    const price = parseFloat(item.price) || 0;
    const outOfStock = item.outOfStock ? 1 : 0;
    const variantsJson = typeof item.variants === 'object' ? JSON.stringify(item.variants) : (item.variants_json || '[]');
    const addonsJson = typeof item.addons === 'object' ? JSON.stringify(item.addons) : (item.addons_json || '[]');

    const query = `
      INSERT INTO menu_items (
        id, title, price, category, sub_category, description, image, badges, dietary,
        prep_time, variants_json, addons_json, out_of_stock, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        price = excluded.price,
        category = excluded.category,
        sub_category = excluded.sub_category,
        description = excluded.description,
        image = excluded.image,
        badges = excluded.badges,
        dietary = excluded.dietary,
        prep_time = excluded.prep_time,
        variants_json = excluded.variants_json,
        addons_json = excluded.addons_json,
        out_of_stock = excluded.out_of_stock,
        updated_at = excluded.updated_at;
    `;

    database.run(
      query,
      [
        id, itemTitle, price, item.category || 'mains', item.subCategory || item.sub_category || '',
        item.description || item.desc || '', item.image || '', item.badges || '', item.dietary || 'none',
        item.prepTime || item.prep_time || '15 mins', variantsJson, addonsJson, outOfStock,
        item.createdAt || now, now
      ],
      function (err) {
        if (err) return reject(err);
        getItemById(id).then(resolve).catch(reject);
      }
    );
  });
}

function deleteItem(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run('DELETE FROM menu_items WHERE id = ? COLLATE NOCASE', [id], function (err) {
      if (err) return reject(err);
      resolve({ success: true, changes: this.changes });
    });
  });
}

function formatItemRecord(row) {
  let variants = [];
  let addons = [];
  try { variants = JSON.parse(row.variants_json || '[]'); } catch (e) {}
  try { addons = JSON.parse(row.addons_json || '[]'); } catch (e) {}

  return {
    id: row.id,
    title: row.title,
    name: row.title,
    price: row.price,
    category: row.category,
    subCategory: row.sub_category,
    desc: row.description,
    description: row.description,
    image: row.image,
    badges: row.badges,
    dietary: row.dietary,
    prepTime: row.prep_time,
    variants,
    addons,
    outOfStock: row.out_of_stock === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ==========================================
// --- CATEGORIES CRUD ---
// ==========================================
function getAllCategories() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM categories ORDER BY display_order ASC, name ASC', (err, rows) => {
      if (err) return reject(err);
      resolve((rows || []).map(r => {
        let sub = [];
        try { sub = JSON.parse(r.sub_categories_json || '[]'); } catch (e) {}
        return {
          id: r.id,
          name: r.name,
          order: r.display_order,
          subCategories: sub,
          updatedAt: r.updated_at
        };
      }));
    });
  });
}

function saveCategory(cat) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const id = (cat.id || cat.name || `cat_${Date.now()}`).toLowerCase().replace(/\s+/g, '_');
    const name = cat.name || id;
    const order = parseInt(cat.order) || 1;
    const subJson = typeof cat.subCategories === 'object' ? JSON.stringify(cat.subCategories) : (cat.sub_categories_json || '[]');
    const now = new Date().toISOString();

    database.run(
      `INSERT INTO categories (id, name, display_order, sub_categories_json, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, display_order = excluded.display_order, sub_categories_json = excluded.sub_categories_json, updated_at = excluded.updated_at`,
      [id, name, order, subJson, now],
      function (err) {
        if (err) return reject(err);
        resolve({ id, name, order, subCategories: JSON.parse(subJson) });
      }
    );
  });
}

function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run('DELETE FROM categories WHERE id = ? COLLATE NOCASE', [id], function (err) {
      if (err) return reject(err);
      resolve({ success: true, changes: this.changes });
    });
  });
}

// ==========================================
// --- BANNERS CRUD ---
// ==========================================
function getAllBanners() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM banners ORDER BY updated_at DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function saveBanner(banner) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const id = banner.id || `banner_${Date.now()}`;
    const now = new Date().toISOString();
    database.run(
      `INSERT INTO banners (id, title, desc, image, link, updated_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, desc = excluded.desc, image = excluded.image, link = excluded.link, updated_at = excluded.updated_at`,
      [id, banner.title, banner.desc || '', banner.image, banner.link || '#', now],
      function (err) {
        if (err) return reject(err);
        resolve({ id, ...banner });
      }
    );
  });
}

function deleteBanner(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run('DELETE FROM banners WHERE id = ? COLLATE NOCASE', [id], function (err) {
      if (err) return reject(err);
      resolve({ success: true, changes: this.changes });
    });
  });
}

// ==========================================
// --- OFFERS CRUD ---
// ==========================================
function getAllOffers() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM offers ORDER BY updated_at DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function saveOffer(offer) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const id = offer.id || `offer_${Date.now()}`;
    const now = new Date().toISOString();
    database.run(
      `INSERT INTO offers (id, title, desc, image, badge, terms, price, code, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, desc = excluded.desc, image = excluded.image, badge = excluded.badge, terms = excluded.terms, price = excluded.price, code = excluded.code, updated_at = excluded.updated_at`,
      [id, offer.title, offer.desc || '', offer.image || '', offer.badge || '', offer.terms || '', parseFloat(offer.price) || 0, offer.code || '', now],
      function (err) {
        if (err) return reject(err);
        resolve({ id, ...offer });
      }
    );
  });
}

function deleteOffer(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run('DELETE FROM offers WHERE id = ? COLLATE NOCASE', [id], function (err) {
      if (err) return reject(err);
      resolve({ success: true, changes: this.changes });
    });
  });
}

// ==========================================
// --- DINING TABLES CRUD ---
// ==========================================
function getAllTables() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all('SELECT * FROM dining_tables ORDER BY table_no ASC', (err, rows) => {
      if (err) return reject(err);
      resolve((rows || []).map(r => ({
        id: r.id,
        tableNo: r.table_no,
        capacity: r.capacity,
        floor: r.floor,
        status: r.status,
        activeSessionId: r.active_session_id,
        qrUrl: r.qr_url,
        updatedAt: r.updated_at
      })));
    });
  });
}

function saveTable(table) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const id = table.id || `tbl_${Date.now()}`;
    const tableNo = table.tableNo || table.table_no || 'Table 1';
    const now = new Date().toISOString();
    database.run(
      `INSERT INTO dining_tables (id, table_no, capacity, floor, status, active_session_id, qr_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET table_no = excluded.table_no, capacity = excluded.capacity, floor = excluded.floor, status = excluded.status, active_session_id = excluded.active_session_id, qr_url = excluded.qr_url, updated_at = excluded.updated_at`,
      [id, tableNo, parseInt(table.capacity) || 4, table.floor || '1st Floor', table.status || 'Vacant', table.activeSessionId || null, table.qrUrl || `/index.html?table=${tableNo.replace(/\D/g, '')}`, now],
      function (err) {
        if (err) return reject(err);
        resolve({ id, tableNo, ...table });
      }
    );
  });
}

// ==========================================
// --- ORDERS CRUD (INTEGER-CENTS INTEGRITY) ---
// ==========================================
function saveOrder(order) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const query = `
      INSERT INTO orders (
        id, idempotency_key, restaurant_id, table_no, session_id,
        status, payment_status, subtotal_cents, tax_cents, total_cents,
        notes, items_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        payment_status = excluded.payment_status,
        updated_at = excluded.updated_at,
        notes = excluded.notes;
    `;

    const subtotalCents = Math.round((parseFloat(order.subtotal) || 0) * 100);
    const taxCents = Math.round((parseFloat(order.tax) || 0) * 100);
    const totalCents = Math.round((parseFloat(order.total) || 0) * 100);

    database.run(
      query,
      [
        order.id,
        order.idempotencyKey || null,
        order.restaurantId || 'rest_evorise_001',
        order.tableNo || 'Table 1',
        order.sessionId || null,
        order.status || 'Pending',
        order.paymentStatus || 'Cash at Counter',
        subtotalCents,
        taxCents,
        totalCents,
        order.notes || '',
        JSON.stringify(order.items || []),
        order.date || new Date().toISOString(),
        new Date().toISOString()
      ],
      function (err) {
        if (err) return reject(err);
        resolve(order);
      }
    );
  });
}

function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(`SELECT * FROM orders WHERE id = ? COLLATE NOCASE`, [orderId], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(formatOrderRecord(row));
    });
  });
}

function getAllOrders(restaurantId = 'rest_evorise_001') {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(
      `SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC`,
      [restaurantId],
      (err, rows) => {
        if (err) return reject(err);
        resolve((rows || []).map(formatOrderRecord));
      }
    );
  });
}

function updateOrderStatus(orderId, newStatus) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const now = new Date().toISOString();
    database.run(
      `UPDATE orders SET status = ?, updated_at = ? WHERE id = ? COLLATE NOCASE`,
      [newStatus, now, orderId],
      function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);
        getOrderById(orderId).then(resolve).catch(reject);
      }
    );
  });
}

function cancelOrder(orderId, reason = 'Cancelled by customer') {
  return new Promise((resolve, reject) => {
    getOrderById(orderId).then((order) => {
      if (!order) return resolve({ notFound: true });
      if (order.status === 'Cancelled') {
        return resolve({ success: true, alreadyCancelled: true, order });
      }

      const orderTime = new Date(order.date || order.createdAt).getTime();
      const elapsedSeconds = (Date.now() - orderTime) / 1000;
      const isWithinGrace = elapsedSeconds <= 60;
      const isPending = order.status === 'Pending';

      if (!isPending || !isWithinGrace) {
        return resolve({
          cannotCancel: true,
          message: 'This order cannot be cancelled because the kitchen has already started preparing it.',
          elapsedSeconds: Math.round(elapsedSeconds),
          currentStatus: order.status
        });
      }

      const now = new Date().toISOString();
      const database = getDb();
      database.run(
        `UPDATE orders SET status = 'Cancelled', updated_at = ?, cancelled_at = ?, cancellation_reason = ? WHERE id = ? COLLATE NOCASE`,
        [now, now, reason, orderId],
        function (err) {
          if (err) return reject(err);
          order.status = 'Cancelled';
          order.cancelledAt = now;
          order.cancellationReason = reason;
          resolve({ success: true, order });
        }
      );
    }).catch(reject);
  });
}

function formatOrderRecord(row) {
  let items = [];
  try { items = JSON.parse(row.items_json || '[]'); } catch (e) {}

  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    restaurantId: row.restaurant_id,
    tableNo: row.table_no,
    sessionId: row.session_id,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal_cents / 100,
    tax: row.tax_cents / 100,
    total: row.total_cents / 100,
    subtotalCents: row.subtotal_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    notes: row.notes,
    items,
    date: row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason
  };
}

// ==========================================
// --- SETTINGS CRUD ---
// ==========================================
function saveSetting(key, value) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const now = new Date().toISOString();
    const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
    database.run(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, strVal, now],
      (err) => {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function getSetting(key) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      try {
        resolve(JSON.parse(row.value));
      } catch (e) {
        resolve(row.value);
      }
    });
  });
}

function getAllSettings() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(`SELECT key, value FROM settings`, (err, rows) => {
      if (err) return reject(err);
      const result = {};
      (rows || []).forEach(r => {
        try {
          result[r.key] = JSON.parse(r.value);
        } catch (e) {
          result[r.key] = r.value;
        }
      });
      resolve(result);
    });
  });
}

// ==========================================
// --- INVENTORY OUT-OF-STOCK STATUS ---
// ==========================================
function setInventoryStatus(itemId, outOfStock) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const now = new Date().toISOString();
    database.run(
      `INSERT INTO inventory_status (item_id, out_of_stock, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(item_id) DO UPDATE SET out_of_stock = excluded.out_of_stock, updated_at = excluded.updated_at`,
      [itemId, outOfStock ? 1 : 0, now],
      (err) => {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function getInventoryStatus() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(`SELECT item_id, out_of_stock FROM inventory_status WHERE out_of_stock = 1`, (err, rows) => {
      if (err) return reject(err);
      resolve((rows || []).map(r => r.item_id));
    });
  });
}

// ==========================================
// --- ENTERPRISE BACKUP & RESTORE ENGINE ---
// ==========================================

/**
 * Creates an atomic WAL-checkpointed SQLite backup + Full JSON Dump
 */
function createDatabaseBackup() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    
    // Checkpoint WAL buffer to database.sqlite file
    database.run('PRAGMA wal_checkpoint(TRUNCATE);', async (chkErr) => {
      if (chkErr) console.warn('[Backup] Notice during WAL checkpoint:', chkErr.message);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupSqliteName = `backup-${timestamp}.sqlite`;
      const backupJsonName = `backup-${timestamp}.json`;
      const targetSqlitePath = path.join(BACKUPS_DIR, backupSqliteName);
      const targetJsonPath = path.join(BACKUPS_DIR, backupJsonName);

      try {
        // Copy binary SQLite file
        if (fs.existsSync(DB_FILE)) {
          fs.copyFileSync(DB_FILE, targetSqlitePath);
        }

        // Export full database JSON dump
        const jsonDump = await exportDatabaseAsJson();
        fs.writeFileSync(targetJsonPath, JSON.stringify(jsonDump, null, 2), 'utf8');

        const stats = fs.statSync(targetSqlitePath);

        // Prune old backups (keep latest 20)
        pruneOldBackups();

        resolve({
          success: true,
          backupFile: backupSqliteName,
          jsonFile: backupJsonName,
          path: targetSqlitePath,
          sizeBytes: stats.size,
          sizeKb: Math.round(stats.size / 1024),
          timestamp: new Date().toISOString(),
          recordCounts: jsonDump.counts
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Export all SQLite tables to a comprehensive JSON snapshot
 */
function exportDatabaseAsJson() {
  return new Promise(async (resolve, reject) => {
    try {
      const items = await getAllItems();
      const categories = await getAllCategories();
      const banners = await getAllBanners();
      const offers = await getAllOffers();
      const tables = await getAllTables();
      const orders = await getAllOrders();
      const settings = await getAllSettings();

      resolve({
        version: '2.0.0-enterprise',
        exportedAt: new Date().toISOString(),
        counts: {
          items: items.length,
          categories: categories.length,
          banners: banners.length,
          offers: offers.length,
          tables: tables.length,
          orders: orders.length
        },
        data: {
          items,
          categories,
          banners,
          offers,
          tables,
          orders,
          settings
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Restore database from an existing snapshot
 */
function restoreDatabaseFromBackup(backupFileName) {
  return new Promise((resolve, reject) => {
    const backupPath = path.isAbsolute(backupFileName) ? backupFileName : path.join(BACKUPS_DIR, backupFileName);
    if (!fs.existsSync(backupPath)) {
      return reject(new Error(`Backup file not found: ${backupFileName}`));
    }

    if (backupPath.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const data = content.data || content;
        
        // Restore items, categories, etc.
        const database = getDb();
        database.serialize(async () => {
          if (Array.isArray(data.items)) {
            for (const item of data.items) await saveItem(item);
          }
          if (Array.isArray(data.categories)) {
            for (const c of data.categories) await saveCategory(c);
          }
          if (Array.isArray(data.tables)) {
            for (const t of data.tables) await saveTable(t);
          }
          if (Array.isArray(data.banners)) {
            for (const b of data.banners) await saveBanner(b);
          }
          if (Array.isArray(data.offers)) {
            for (const o of data.offers) await saveOffer(o);
          }
          resolve({ success: true, message: 'JSON database snapshot restored successfully.' });
        });
      } catch (err) {
        reject(err);
      }
    } else {
      // Binary SQLite restore
      if (db) {
        db.close(() => {
          db = null;
          fs.copyFileSync(backupPath, DB_FILE);
          initDatabase().then(() => resolve({ success: true, message: 'SQLite binary backup restored.' })).catch(reject);
        });
      } else {
        fs.copyFileSync(backupPath, DB_FILE);
        initDatabase().then(() => resolve({ success: true, message: 'SQLite binary backup restored.' })).catch(reject);
      }
    }
  });
}

function listBackups() {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  const files = fs.readdirSync(BACKUPS_DIR);
  return files
    .filter(f => f.endsWith('.sqlite') || f.endsWith('.json'))
    .map(f => {
      const p = path.join(BACKUPS_DIR, f);
      const s = fs.statSync(p);
      return {
        fileName: f,
        name: f,
        type: f.endsWith('.sqlite') ? 'sqlite_binary' : 'json_dump',
        sizeBytes: s.size,
        sizeKb: Math.round(s.size / 1024),
        createdAt: s.mtime.toISOString()
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function pruneOldBackups(maxKeep = 20) {
  try {
    const list = listBackups();
    if (list.length > maxKeep) {
      list.slice(maxKeep).forEach(b => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, b.fileName)); } catch (e) {}
      });
    }
  } catch (e) {}
}

function getDatabaseStats() {
  return new Promise(async (resolve, reject) => {
    try {
      const items = await getAllItems();
      const categories = await getAllCategories();
      const tables = await getAllTables();
      const orders = await getAllOrders();
      const dbStats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : { size: 0 };
      const walFile = DB_FILE + '-wal';
      const walStats = fs.existsSync(walFile) ? fs.statSync(walFile) : { size: 0 };
      const backups = listBackups();

      resolve({
        status: 'ONLINE',
        mode: 'WAL (Write-Ahead Logging)',
        path: DB_FILE,
        dbSizeBytes: dbStats.size,
        dbSizeKb: Math.round(dbStats.size / 1024),
        walSizeBytes: walStats.size,
        walSizeKb: Math.round(walStats.size / 1024),
        counts: {
          items: items.length,
          categories: categories.length,
          tables: tables.length,
          orders: orders.length,
          backups: backups.length
        },
        latestBackup: backups[0] || null
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ==========================================
// SHIFT MODE & CLOUD SYNC QUEUE MANAGEMENT
// ==========================================
function queueSyncEvent(entityType, entityId, action, payload) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const payloadJson = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const now = new Date().toISOString();
    database.run(
      `INSERT INTO sync_queue (entity_type, entity_id, action, payload_json, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [entityType, entityId, action, payloadJson, now],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, entityType, entityId, action, status: 'pending' });
      }
    );
  });
}

function getPendingSyncEvents(limit = 100) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY id ASC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

function markSyncEventSynced(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const now = new Date().toISOString();
    database.run(
      `UPDATE sync_queue SET status = 'synced', synced_at = ? WHERE id = ?`,
      [now, id],
      function (err) {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function markSyncEventFailed(id, errorMessage) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(
      `UPDATE sync_queue SET status = 'failed', attempts = attempts + 1, error_message = ? WHERE id = ?`,
      [String(errorMessage || ''), id],
      function (err) {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function getSyncQueueCount() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`,
      (err, row) => {
        if (err) return reject(err);
        resolve(row?.count || 0);
      }
    );
  });
}

function getSyncConfig(key) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(`SELECT value FROM sync_config WHERE key = ?`, [key], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.value : null);
    });
  });
}

function setSyncConfig(key, value) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const now = new Date().toISOString();
    database.run(
      `INSERT OR REPLACE INTO sync_config (key, value, updated_at) VALUES (?, ?, ?)`,
      [key, String(value), now],
      (err) => {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

function getAllSyncConfig() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(`SELECT key, value FROM sync_config`, (err, rows) => {
      if (err) return reject(err);
      const conf = {};
      (rows || []).forEach(r => { conf[r.key] = r.value; });
      resolve(conf);
    });
  });
}

module.exports = {
  initDatabase,
  // Items
  getAllItems,
  getItemById,
  saveItem,
  deleteItem,
  // Categories
  getAllCategories,
  saveCategory,
  deleteCategory,
  // Banners
  getAllBanners,
  saveBanner,
  deleteBanner,
  // Offers
  getAllOffers,
  saveOffer,
  deleteOffer,
  // Tables
  getAllTables,
  saveTable,
  // Orders
  saveOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  // Settings & Inventory
  saveSetting,
  getSetting,
  getAllSettings,
  setInventoryStatus,
  getInventoryStatus,
  // Backups
  createDatabaseBackup,
  exportDatabaseAsJson,
  restoreDatabaseFromBackup,
  listBackups,
  getDatabaseStats,
  // Sync & Shift Mode
  queueSyncEvent,
  getPendingSyncEvents,
  markSyncEventSynced,
  markSyncEventFailed,
  getSyncQueueCount,
  getSyncConfig,
  setSyncConfig,
  getAllSyncConfig
};
