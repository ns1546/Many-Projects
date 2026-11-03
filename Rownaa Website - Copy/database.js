const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'rownaa.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        status TEXT DEFAULT 'pending'
    )`);

    // Bookings Table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        service TEXT,
        customerName TEXT,
        customerId TEXT,
        ownerId TEXT,
        price TEXT,
        status TEXT,
        dateTime TEXT,
        createdAt TEXT,
        deletedAt TEXT
    )`);

    // Seed mock users if not exists
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && row.count === 0) {
            // Seeded in server.js
        }
    });

    // Run alter table just in case it exists without the column
    db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {
        // Will error if column already exists, that's fine
    });

    // Inventory Table
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
        deletedAt TEXT
    )`);
});

module.exports = db;
