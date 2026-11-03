const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const pricingRoutes = require('./modules/pricing/pricing.routes');
const usersRoutes = require('./modules/users/users.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');
const dispatchRoutes = require('./modules/dispatch/dispatch.routes');
const telemetryRoutes = require('./modules/telemetry/telemetry.routes');
const driversRoutes = require('./modules/drivers/drivers.routes');
const smsRoutes = require('./modules/sms/sms.routes');

const app = express();

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Allow external fonts, CDNs, and inline scripts
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body & Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            if (req.url.startsWith('/api')) {
                console.log(`[API] ${req.method} ${req.url} ${res.statusCode} - ${Date.now() - start}ms`);
            }
        });
        next();
    });
}

// ========================================================
// API DOMAIN MODULE ROUTING
// ========================================================
app.use('/api/auth', authRoutes);
// Legacy compatibility aliases for auth endpoints
app.use('/api', (req, res, next) => {
    if (['/login', '/register', '/logout', '/me'].includes(req.path)) {
        return authRoutes(req, res, next);
    }
    next();
});

app.use('/api/bookings', bookingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/sms-logs', smsRoutes);
app.use('/api/sms', smsRoutes);

// System Health Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        engine: 'Rownaa Enterprise Full-Stack Core'
    });
});

// ========================================================
// FRONTEND STATIC ASSET SERVING
// ========================================================
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Serve workspace root assets directly for live consistency
app.use(express.static(rootDir));
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
}

// 404 for unhandled API routes
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: `API route '${req.method} ${req.url}' not found` });
});

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
