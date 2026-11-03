require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const path = require('path');
const morgan = require('morgan'); // HTTP request logger
const cookieParser = require('cookie-parser'); // Secure Cookie parsing
const bcrypt = require('bcryptjs');

const authRoutes = require('./backend/routes/authRoutes');
const bookingRoutes = require('./backend/routes/bookingRoutes');
const inventoryRoutes = require('./backend/routes/inventoryRoutes');
const { setupSecurity } = require('./backend/middlewares/securityMiddleware');
const { errorHandler, notFoundHandler } = require('./backend/middlewares/errorMiddleware');
const logger = require('./backend/utils/logger'); // Enterprise Winston Logger

const app = express();
const PORT = process.env.PORT || 3000;

// Apply enterprise security (Helmet, CORS, Rate Limiting)
setupSecurity(app);

// Parse cookies securely
app.use(cookieParser());

// HTTP Logging using Morgan & Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.json({ limit: '10kb' })); // Limit body payload to prevent huge payloads
app.use(express.static(path.join(__dirname)));

// ================= API ROUTES =================
app.use('/api', authRoutes); // /api/login, /api/register
app.use('/api/bookings', bookingRoutes);
app.use('/api/inventory', inventoryRoutes);

// Seed Data Route (for testing since there's no UI for admin creation yet)
app.post('/api/seed', async (req, res) => {
    try {
        const adminHash = await bcrypt.hash('admin', 10);
        await run('INSERT OR IGNORE INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)', ['admin', 'admin', adminHash, 'System Admin', 'admin']);
        
        const custHash = await bcrypt.hash('customer', 10);
        await run('INSERT OR IGNORE INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)', ['cust-1', 'customer', custHash, 'Faisal Ahmed', 'customer']);
        
        const ownerHash = await bcrypt.hash('owner', 10);
        await run('INSERT OR IGNORE INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)', ['biz-001', 'owner', ownerHash, 'Samiul Transport', 'owner']);
        
        res.json({ success: true, msg: 'Mock users seeded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check if tables exist and seed mock bookings if empty
setTimeout(async () => {
    try {
        const count = await get("SELECT COUNT(*) as count FROM bookings");
        if (count.count === 0) {
            console.log("Seeding initial bookings...");
            const seedBs = [
                { id: 'BKG-10294', service: 'Airport Transfer', customerName: 'John Doe', price: '৳ 2,500', status: 'Completed', ownerId: 'biz-001', dateTime: 'Oct 12, 10:00 AM' },
                { id: 'BKG-59321', service: 'Intercity', customerName: 'Jane Smith', price: '৳ 8,000', status: 'Confirmed', ownerId: 'biz-001', dateTime: 'Oct 13, 08:00 AM' },
                { id: 'BKG-88123', service: 'Hourly', customerName: 'Bob Lee', price: '৳ 1,500', status: 'Pending', ownerId: 'biz-001', dateTime: 'Oct 15, 02:00 PM' },
                { id: 'BKG-99441', service: 'Corporate', customerName: 'Alice', price: '৳ 12,000', status: 'Completed', ownerId: 'biz-002', dateTime: 'Oct 10, 09:00 AM' }
            ];
            for (let b of seedBs) {
                await run(`INSERT INTO bookings (id, service, customerName, customerId, ownerId, price, status, dateTime, createdAt) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [b.id, b.service, b.customerName, 'cust-1', b.ownerId, b.price, b.status, b.dateTime, new Date().toISOString()]);
            }
        }
        
        const invCount = await get("SELECT COUNT(*) as count FROM inventory");
        if (invCount.count === 0) {
            console.log("Seeding initial inventory...");
            const seedInv = [
                { id: 'car-1', name: 'Toyota Axio or Similar', category: 'Standard Sedan', image: 'assets/car1.jpg', seats: 4, bags: 2, hasAc: true, serviceTags: ['airport', 'intercity', 'hourly'], baseRate: 2500, isActive: true, ownerId: 'biz-001' },
                { id: 'car-2', name: 'Honda Grace / Premio', category: 'Executive Sedan', image: 'assets/car2.jpg', seats: 4, bags: 3, hasAc: true, serviceTags: ['airport', 'intercity', 'corporate'], baseRate: 3500, isActive: true, ownerId: 'biz-001' },
                { id: 'car-3', name: 'Toyota Prado', category: 'Premium SUV', image: 'assets/car3.jpg', seats: 7, bags: 4, hasAc: true, serviceTags: ['corporate', 'intercity'], baseRate: 8000, isActive: true, ownerId: 'biz-001' },
                { id: 'car-4', name: 'Toyota Hiace', category: 'Microbus', image: 'assets/car-micro.jpg', seats: 10, bags: 5, hasAc: true, serviceTags: ['intercity', 'corporate', 'airport'], baseRate: 5000, isActive: true, ownerId: 'biz-002' }
            ];
            for (let c of seedInv) {
                await run(`INSERT INTO inventory (id, name, category, image, seats, bags, hasAc, serviceTags, baseRate, isActive, ownerId) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [c.id, c.name, c.category, c.image, c.seats, c.bags, c.hasAc, JSON.stringify(c.serviceTags), c.baseRate, c.isActive, c.ownerId]);
            }
        }
    } catch (e) { console.error("Error seeding:", e); }
}, 2000);

// Global Error Handlers (must be the very last middlewares)
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
