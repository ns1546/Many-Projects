const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const app = require('./src/app');
const { PORT, NODE_ENV } = require('./src/config/env');
const bookingsService = require('./src/modules/bookings/bookings.service');
const eventBus = require('./src/infrastructure/eventBus');

const server = http.createServer(app);

// Initialize Enterprise Socket.IO Real-Time Engine
const io = new SocketIOServer(server, {
    cors: {
        origin: true,
        credentials: true
    }
});

const driversService = require('./src/modules/drivers/drivers.service');

// Inject IO into services & EventBus
bookingsService.setSocketIO(io);
driversService.setSocketIO(io);
eventBus.setSocketIO(io);

io.on('connection', (socket) => {
    if (NODE_ENV !== 'test') {
        console.log(`[WebSocket] Client connected: ${socket.id}`);
    }

    socket.on('join_user_channel', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('join_fleet_channel', (ownerId) => {
        socket.join(`owner_${ownerId}`);
    });

    socket.on('disconnect', () => {
        if (NODE_ENV !== 'test') {
            console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        }
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log('================================================================');
        console.log(`🚀 ROWNAA ENTERPRISE ENGINE ACTIVE`);
        console.log(`📡 HTTP Server & REST API: http://127.0.0.1:${PORT}`);
        console.log(`⚡ WebSocket Server: Ready for real-time fleet events`);
        console.log(`🔒 Security: HttpOnly Cookies, Helmet, Zod Validation, BCrypt`);
        console.log(`💾 Database: SQLite3 persistence connected at rownaa.db`);
        console.log('================================================================');
    });

    // Graceful Shutdown Handler
    const shutdown = () => {
        console.log('\n[Server] Gracefully shutting down...');
        server.close(() => {
            console.log('[Server] HTTP and Socket server closed.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

module.exports = server;
module.exports.app = app;
