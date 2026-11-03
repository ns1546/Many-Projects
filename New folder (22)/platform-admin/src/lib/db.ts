import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'saas.db'))
db.pragma('journal_mode = WAL')

// Initialize DB schema (Deep E-Commerce)
db.exec(`
  CREATE TABLE IF NOT EXISTS Tenant (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    logoUrl TEXT,
    themeColor TEXT DEFAULT '#000000',
    currency TEXT DEFAULT 'USD',
    supportEmail TEXT,
    supportPhone TEXT,
    status TEXT DEFAULT 'ACTIVE',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    tenantId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    price REAL NOT NULL,
    compareAtPrice REAL,
    stock INTEGER DEFAULT 0,
    imageUrl TEXT,
    categoryId TEXT,
    isActive INTEGER DEFAULT 1,
    tenantId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(categoryId) REFERENCES Category(id),
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Customer (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    totalOrders INTEGER DEFAULT 0,
    totalSpent REAL DEFAULT 0.0,
    tenantId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Orders (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0.0,
    shippingCost REAL DEFAULT 0.0,
    discount REAL DEFAULT 0.0,
    total REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    paymentMethod TEXT NOT NULL,
    paymentStatus TEXT DEFAULT 'UNPAID',
    shippingAddress TEXT,
    trackingNumber TEXT,
    tenantId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customerId) REFERENCES Customer(id),
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS OrderItem (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY(orderId) REFERENCES Orders(id),
    FOREIGN KEY(productId) REFERENCES Product(id)
  );

  CREATE TABLE IF NOT EXISTS StoreBanner (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    ctaText TEXT,
    ctaLink TEXT,
    sortOrder INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS ProductReview (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    customerId TEXT,
    tenantId TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    authorName TEXT NOT NULL,
    authorEmail TEXT,
    isVerified INTEGER DEFAULT 0,
    isApproved INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productId) REFERENCES Product(id),
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Coupon (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'PERCENT',
    value REAL NOT NULL,
    minOrderAmount REAL DEFAULT 0,
    maxUses INTEGER,
    usedCount INTEGER DEFAULT 0,
    expiresAt DATETIME,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Wishlist (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    productId TEXT NOT NULL,
    tenantId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customerId) REFERENCES Customer(id),
    FOREIGN KEY(productId) REFERENCES Product(id)
  );

  CREATE TABLE IF NOT EXISTS ProductImage (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    altText TEXT,
    sortOrder INTEGER DEFAULT 0,
    FOREIGN KEY(productId) REFERENCES Product(id)
  );

  CREATE TABLE IF NOT EXISTS StoreSettings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL UNIQUE,
    storeName TEXT,
    storeDescription TEXT,
    logoUrl TEXT,
    faviconUrl TEXT,
    themeColor TEXT DEFAULT '#000000',
    accentColor TEXT DEFAULT '#6366f1',
    currency TEXT DEFAULT 'USD',
    weightUnit TEXT DEFAULT 'kg',
    timezone TEXT DEFAULT 'UTC',
    emailFrom TEXT,
    freeShippingThreshold REAL DEFAULT 100,
    defaultShippingCost REAL DEFAULT 10,
    taxRate REAL DEFAULT 0.05,
    facebookUrl TEXT,
    instagramUrl TEXT,
    twitterUrl TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );

  CREATE TABLE IF NOT EXISTS Notification (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    isRead INTEGER DEFAULT 0,
    relatedId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES Tenant(id)
  );
`)

// Ensure StoreSettings row exists for each tenant
db.exec(`
  INSERT OR IGNORE INTO StoreSettings (id, tenantId)
  SELECT 'ss_' || id, id FROM Tenant;
`)

export default db
