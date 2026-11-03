/**
 * Authoritative Database Seeder for Rownaa Car Rental Platform
 * Populates rownaa.db with verified enterprise test data:
 * - Users: Admin, Partner/Owner (biz-001), Customer (cust-1)
 * - Fleet Inventory: Standard Bangladesh fleet vehicles
 * - Seed Bookings: Sample bookings for owner & customer metrics
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'rownaa.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    console.log('[Seed] Initializing database tables...');

    await new Promise((resolve, reject) => {
        db.serialize(() => {
            // Ensure Tables
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT,
                status TEXT DEFAULT 'approved'
            )`);

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
            )`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    console.log('[Seed] Seeding users with secure bcrypt hashes...');
    const adminPass = await bcrypt.hash('admin123', 10);
    const ownerPass = await bcrypt.hash('owner123', 10);
    const customerPass = await bcrypt.hash('customer123', 10);

    const users = [
        { id: 'usr-admin-1', name: 'Rownaa Super Admin', username: 'admin', password: adminPass, role: 'admin', status: 'approved' },
        { id: 'biz-001', name: 'Samiul Transport Agency', username: 'owner', password: ownerPass, role: 'owner', status: 'approved' },
        { id: 'cust-1', name: 'Faisal Ahmed', username: 'customer', password: customerPass, role: 'customer', status: 'approved' }
    ];

    for (const u of users) {
        await new Promise((resolve) => {
            db.run(
                `INSERT INTO users (id, name, username, password, role, status)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON CONFLICT(username) DO UPDATE SET
                    name=excluded.name,
                    password=excluded.password,
                    role=excluded.role,
                    status=excluded.status`,
                [u.id, u.name, u.username, u.password, u.role, u.status],
                (err) => {
                    if (err) console.error(`[Seed] Error seeding user ${u.username}:`, err.message);
                    else console.log(`[Seed] Seeded user: ${u.username} (${u.role})`);
                    resolve();
                }
            );
        });
    }

    console.log('[Seed] Seeding fleet inventory...');
    const inventory = [
        {
            id: 'veh-001',
            name: 'Toyota Axio',
            category: 'Sedan (Economy)',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
            seats: 4,
            bags: 2,
            hasAc: 1,
            serviceTags: JSON.stringify(['hourly', 'airport', 'intercity']),
            baseRate: 1500,
            isActive: 1,
            ownerId: 'biz-001'
        },
        {
            id: 'veh-002',
            name: 'Toyota Premio',
            category: 'Sedan (Premium)',
            image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
            seats: 4,
            bags: 2,
            hasAc: 1,
            serviceTags: JSON.stringify(['hourly', 'airport', 'intercity']),
            baseRate: 2000,
            isActive: 1,
            ownerId: 'biz-001'
        },
        {
            id: 'veh-003',
            name: 'Toyota Noah',
            category: 'Microbus',
            image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
            seats: 7,
            bags: 4,
            hasAc: 1,
            serviceTags: JSON.stringify(['hourly', 'airport', 'intercity', 'tour']),
            baseRate: 2500,
            isActive: 1,
            ownerId: 'biz-001'
        },
        {
            id: 'veh-004',
            name: 'Toyota HiAce',
            category: 'Van / Microbus',
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
            seats: 11,
            bags: 6,
            hasAc: 1,
            serviceTags: JSON.stringify(['hourly', 'airport', 'intercity', 'tour', 'corporate']),
            baseRate: 3500,
            isActive: 1,
            ownerId: 'biz-001'
        },
        {
            id: 'veh-005',
            name: 'Toyota Prado',
            category: 'Luxury SUV',
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
            seats: 5,
            bags: 3,
            hasAc: 1,
            serviceTags: JSON.stringify(['hourly', 'airport', 'intercity', 'corporate']),
            baseRate: 4500,
            isActive: 1,
            ownerId: 'biz-001'
        }
    ];

    for (const v of inventory) {
        await new Promise((resolve) => {
            db.run(
                `INSERT INTO inventory (id, name, category, image, seats, bags, hasAc, serviceTags, baseRate, isActive, ownerId)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                    name=excluded.name,
                    category=excluded.category,
                    image=excluded.image,
                    seats=excluded.seats,
                    bags=excluded.bags,
                    hasAc=excluded.hasAc,
                    serviceTags=excluded.serviceTags,
                    baseRate=excluded.baseRate,
                    isActive=excluded.isActive,
                    ownerId=excluded.ownerId`,
                [v.id, v.name, v.category, v.image, v.seats, v.bags, v.hasAc, v.serviceTags, v.baseRate, v.isActive, v.ownerId],
                (err) => {
                    if (err) console.error(`[Seed] Error seeding vehicle ${v.name}:`, err.message);
                    else console.log(`[Seed] Seeded vehicle: ${v.name} (৳${v.baseRate})`);
                    resolve();
                }
            );
        });
    }

    console.log('[Seed] Seeding sample operational bookings...');
    const bookings = [
        {
            id: 'bkg-001',
            service: 'Airport Transfer',
            vehicle: 'Toyota Axio',
            customerName: 'Faisal Ahmed',
            customerPhone: '+880 1711 000000',
            pickupLocation: 'Gulshan 2, Dhaka',
            dropoffLocation: 'Hazrat Shahjalal International Airport',
            customerId: 'cust-1',
            ownerId: 'biz-001',
            price: '৳1500',
            status: 'Confirmed',
            dateTime: '2026-11-05 10:00',
            createdAt: new Date().toISOString()
        },
        {
            id: 'bkg-002',
            service: 'Hourly Rental',
            vehicle: 'Toyota Premio',
            customerName: 'Faisal Ahmed',
            customerPhone: '+880 1711 000000',
            pickupLocation: 'Dhanmondi, Dhaka',
            dropoffLocation: 'Banani, Dhaka',
            customerId: 'cust-1',
            ownerId: 'biz-001',
            price: '৳2000',
            status: 'Completed',
            dateTime: '2026-11-01 14:00',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    for (const b of bookings) {
        await new Promise((resolve) => {
            db.run(
                `INSERT INTO bookings (id, service, customerName, customerId, ownerId, price, status, dateTime, vehicle, pickupLocation, dropoffLocation, customerPhone, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                    vehicle=excluded.vehicle,
                    pickupLocation=excluded.pickupLocation,
                    dropoffLocation=excluded.dropoffLocation,
                    customerPhone=excluded.customerPhone,
                    status=excluded.status,
                    price=excluded.price`,
                [b.id, b.service, b.customerName, b.customerId, b.ownerId, b.price, b.status, b.dateTime, b.vehicle, b.pickupLocation, b.dropoffLocation, b.customerPhone, b.createdAt],
                (err) => {
                    if (err) console.error(`[Seed] Error seeding booking ${b.id}:`, err.message);
                    else console.log(`[Seed] Seeded booking: ${b.id} (${b.status})`);
                    resolve();
                }
            );
        });
    }

    db.close((err) => {
        if (err) console.error('[Seed] Database close error:', err);
        else console.log('[Seed] Database seeding completed successfully.');
    });
}

seed().catch(err => {
    console.error('[Seed] Fatal error:', err);
    process.exit(1);
});
