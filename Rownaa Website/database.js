const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'rownaa.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // High-Concurrency Enterprise Pragmas (Uber/Pathao Scale SQLite WAL Mode)
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA busy_timeout = 10000;');
    db.run('PRAGMA synchronous = NORMAL;');
    db.run('PRAGMA foreign_keys = ON;');

    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        status TEXT DEFAULT 'pending',
        phone TEXT,
        createdAt TEXT
    )`);
    db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN createdAt TEXT`, () => {});

    // 2. Bookings Table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        service TEXT,
        customerName TEXT,
        customerId TEXT,
        ownerId TEXT,
        price TEXT,
        status TEXT,
        dateTime TEXT,
        vehicle TEXT,
        pickupLocation TEXT,
        dropoffLocation TEXT,
        customerPhone TEXT,
        createdAt TEXT,
        deletedAt TEXT
    )`);
    db.run(`ALTER TABLE bookings ADD COLUMN vehicle TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN pickupLocation TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN dropoffLocation TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN customerPhone TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN driverName TEXT`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN driverPhone TEXT`, () => {});

    // 3. Inventory Table
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        image TEXT,
        seats INTEGER,
        bags INTEGER,
        hasAc BOOLEAN,
        serviceTags TEXT,
        baseRate INTEGER,
        isActive BOOLEAN,
        ownerId TEXT,
        registration TEXT,
        createdAt TEXT,
        deletedAt TEXT
    )`);
    db.run(`ALTER TABLE inventory ADD COLUMN registration TEXT`, () => {});
    db.run(`ALTER TABLE inventory ADD COLUMN createdAt TEXT`, () => {});

    // 4. Notifications Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT,
        title TEXT,
        message TEXT,
        type TEXT DEFAULT 'info',
        isRead BOOLEAN DEFAULT 0,
        createdAt TEXT
    )`);

    // 5. Reviews & User Experience Table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        bookingId TEXT UNIQUE,
        customerId TEXT,
        rating INTEGER,
        comment TEXT,
        sentiment TEXT DEFAULT 'positive',
        category TEXT DEFAULT 'overall',
        userFeeling TEXT,
        adminResponse TEXT,
        adminRespondedAt TEXT,
        adminRespondedBy TEXT,
        status TEXT DEFAULT 'pending_review',
        actionTaken TEXT,
        createdAt TEXT
    )`);
    db.run(`ALTER TABLE reviews ADD COLUMN sentiment TEXT DEFAULT 'positive'`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN category TEXT DEFAULT 'overall'`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN userFeeling TEXT`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN adminResponse TEXT`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN adminRespondedAt TEXT`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN adminRespondedBy TEXT`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending_review'`, () => {});
    db.run(`ALTER TABLE reviews ADD COLUMN actionTaken TEXT`, () => {});

    // 6. Pricing Config Table
    db.run(`CREATE TABLE IF NOT EXISTS pricing_config (
        id TEXT PRIMARY KEY,
        configKey TEXT UNIQUE,
        configData TEXT,
        updatedAt TEXT
    )`);

    // Geospatial & Telemetry Columns for Uber/Pathao Fleet Routing
    db.run(`ALTER TABLE bookings ADD COLUMN pickupLat REAL`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN pickupLng REAL`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN dropoffLat REAL`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN dropoffLng REAL`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN distanceKm REAL`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN estimatedMinutes INTEGER`, () => {});
    db.run(`ALTER TABLE bookings ADD COLUMN surgeMultiplier REAL DEFAULT 1.0`, () => {});

    db.run(`ALTER TABLE inventory ADD COLUMN lat REAL`, () => {});
    db.run(`ALTER TABLE inventory ADD COLUMN lng REAL`, () => {});
    db.run(`ALTER TABLE inventory ADD COLUMN currentZone TEXT`, () => {});

    // 7. Drivers Table (Enterprise Chauffeur Registry)
    db.run(`CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        licenseNumber TEXT,
        nidNumber TEXT,
        vehicleAssigned TEXT,
        status TEXT DEFAULT 'available',
        rating REAL DEFAULT 5.0,
        totalTrips INTEGER DEFAULT 0,
        createdAt TEXT
    )`);

    // 8. SMS Gateway Dispatch Log Table
    db.run(`CREATE TABLE IF NOT EXISTS sms_logs (
        id TEXT PRIMARY KEY,
        recipient TEXT NOT NULL,
        recipientRole TEXT,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'booking_confirmation',
        bookingId TEXT,
        status TEXT DEFAULT 'Delivered',
        createdAt TEXT
    )`);

    // Indexes for high performance & geospatial queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_customerId ON bookings(customerId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_ownerId ON bookings(ownerId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_ownerId ON inventory(ownerId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_inventory_zone ON inventory(currentZone)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_bookingId ON reviews(bookingId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_sms_logs_createdAt ON sms_logs(createdAt)`);

    // Seed initial active drivers if table is fresh
    db.get('SELECT COUNT(*) as count FROM drivers', (err, row) => {
        if (!err && (!row || row.count === 0)) {
            const seedDrivers = [
                ['drv-001', 'Kamal Hossain', '+880 1711 223344', 'DL-DH-44821', '19882694580001', 'Toyota Axio', 'available', 4.9, 142, new Date().toISOString()],
                ['drv-002', 'Rafiq Islam', '+880 1822 334455', 'DL-DH-55912', '19852694580002', 'Toyota Premio', 'available', 4.8, 98, new Date().toISOString()],
                ['drv-003', 'Sultan Mahmud', '+880 1933 445566', 'DL-DH-66723', '19902694580003', 'Toyota Noah', 'available', 5.0, 215, new Date().toISOString()],
                ['drv-004', 'Abdul Gafur', '+880 1644 556677', 'DL-DH-77834', '19872694580004', 'Toyota HiAce', 'available', 4.9, 87, new Date().toISOString()]
            ];
            const stmt = db.prepare('INSERT INTO drivers (id, name, phone, licenseNumber, nidNumber, vehicleAssigned, status, rating, totalTrips, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            seedDrivers.forEach(d => stmt.run(d));
            stmt.finalize();
        }
    });
});

// Async helper extensions for clean repository architecture
db.queryOne = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
};

db.queryAll = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

db.execute = function(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

db.transaction = async function(callback) {
    await db.execute('BEGIN IMMEDIATE');
    try {
        const result = await callback(db);
        await db.execute('COMMIT');
        return result;
    } catch (err) {
        try { await db.execute('ROLLBACK'); } catch (_) {}
        throw err;
    }
};

db.getPoolStats = function() {
    return {
        engine: 'SQLite-WAL',
        journalMode: 'WAL',
        busyTimeoutMs: 10000,
        isConnected: true,
        concurrency: 'Multi-Reader-Single-Writer-NonBlocking'
    };
};

module.exports = db;

