const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
// const { PrismaClient } = require('@prisma/client');
const { validate, createBookingSchema, updateBookingStatusSchema } = require('../../shared/validations');

const db = require('../../database');
const { randomUUID: uuidv4 } = require('crypto');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is missing.");
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const authGuard = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
};

app.get('/', authGuard, (req, res) => {
    let query = "SELECT * FROM bookings WHERE deletedAt IS NULL";
    let params = [];
    
    if (req.user.role === 'owner') {
        query += " AND ownerId = ?";
        params.push(req.user.userId);
    } else {
        query += " AND customerId = ?";
        params.push(req.user.userId);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        res.json({ success: true, data: rows });
    });
});

app.post('/', authGuard, validate(createBookingSchema), (req, res) => {
    const b = req.body;
    const vehicleName = b.vehicle || 'Unknown Vehicle';
    const dateTime = b.dateTime || '';
    
    // Single Source of Truth: Look up vehicle in inventory
    db.get("SELECT baseRate, ownerId FROM inventory WHERE name = ? AND deletedAt IS NULL", [vehicleName], (err, car) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!car) return res.status(404).json({ error: "Vehicle not found in inventory." });
        
        // Anti-Double Booking Check
        const serviceString = `${b.service} - ${vehicleName}`;
        db.get("SELECT id FROM bookings WHERE service = ? AND dateTime = ? AND status != 'Cancelled' AND deletedAt IS NULL", [serviceString, dateTime], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existing) return res.status(409).json({ error: "Double booking detected. Vehicle is already booked for this time." });
            
            const id = uuidv4();
            const customerName = b.customerName || req.user.name;
            const customerId = req.user.userId;
            const ownerId = car.ownerId; // Trust server ownerId
            const authenticPrice = '$' + car.baseRate; // Trust server price
            const vehicle = car.name;
            const pickupLocation = b.pickupLocation || '';
            const dropoffLocation = b.dropoffLocation || '';
            const customerPhone = b.customerPhone || '';
            const status = 'Pending';
            const createdAt = new Date().toISOString();
            
            db.run("INSERT INTO bookings (id, service, customerName, customerId, ownerId, price, status, dateTime, vehicle, pickupLocation, dropoffLocation, customerPhone, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, serviceString, customerName, customerId, ownerId, authenticPrice, status, dateTime, vehicle, pickupLocation, dropoffLocation, customerPhone, createdAt], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                
                const booking = { id, service: serviceString, customerName, customerId, ownerId, price: authenticPrice, status, dateTime, vehicle, pickupLocation, dropoffLocation, customerPhone, createdAt };
                io.emit('booking_created', booking);
                res.json({ success: true, id });
            });
        });
    });
});

app.patch('/:id/status', authGuard, validate(updateBookingStatusSchema), (req, res) => {
    const { status } = req.body;
    const id = req.params.id;

    db.get("SELECT * FROM bookings WHERE id = ?", [id], (err, existingBooking) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!existingBooking) return res.status(404).json({ error: 'Booking not found' });

        if (req.user.role === 'owner' && existingBooking.ownerId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden. You do not own this booking.' });
        }
        if (req.user.role === 'customer' && existingBooking.customerId !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden. You do not own this booking.' });
        }
        // Admins can update any booking.

        db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            existingBooking.status = status;
            io.emit('booking_updated', existingBooking);
            res.json({ success: true });
        });
    });
});

app.delete('/:id', authGuard, (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM bookings WHERE id = ?", [id], (err, existing) => {
        if (err || !existing) return res.status(404).json({ error: 'Not found' });
        if (req.user.role === 'owner' && existing.ownerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
        if (req.user.role === 'customer' && existing.customerId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
        
        db.run("UPDATE bookings SET deletedAt = ? WHERE id = ?", [new Date().toISOString(), id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.patch('/:id/restore', authGuard, (req, res) => {
    const id = req.params.id;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can restore bookings.' });
    
    db.run("UPDATE bookings SET deletedAt = NULL WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'booking-service' }));

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`booking-service running securely on port ${PORT} with WebSockets`));
}

module.exports = app;
module.exports.server = server;
