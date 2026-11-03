const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');

const app = express();

// Start Microservices
const services = [
    { name: 'Auth', path: 'services/auth/server.js', port: 3001 },
    { name: 'Booking', path: 'services/booking/server.js', port: 3002 },
    { name: 'Inventory', path: 'services/inventory/server.js', port: 3003 },
    { name: 'Pricing', path: 'services/pricing/server.js', port: 3004 },
    { name: 'Users', path: 'services/users/server.js', port: 3005 }
];

services.forEach(svc => {
    const child = spawn('node', [path.join(__dirname, svc.path)], {
        env: { ...process.env, PORT: svc.port, JWT_SECRET: 'super_secret_local_dev_key_123' },
        stdio: 'inherit'
    });
    console.log(`[Gateway] Started ${svc.name} service on port ${svc.port}`);
});

const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));

// Setup Proxies
const authProxy = createProxyMiddleware({ 
    target: 'http://127.0.0.1:3001', 
    changeOrigin: true,
    pathRewrite: (path, req) => {
        return path.replace(/^\/api\/auth/, '').replace(/^\/api/, '') || '/';
    }
});
app.use('/api', (req, res, next) => {
    if (['/login', '/register', '/logout', '/me', '/health'].includes(req.path) || req.path.startsWith('/auth')) {
        return authProxy(req, res, next);
    }
    next();
});
app.use('/api/bookings', createProxyMiddleware({ 
    target: 'http://127.0.0.1:3002', 
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/^\/api\/bookings/, '') || '/'
}));
app.use('/api/inventory', createProxyMiddleware({ 
    target: 'http://127.0.0.1:3003', 
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/^\/api\/inventory/, '') || '/'
}));
app.use('/api/pricing', createProxyMiddleware({ 
    target: 'http://127.0.0.1:3004', 
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/^\/api\/pricing/, '') || '/'
}));
app.use('/api/users', createProxyMiddleware({ 
    target: 'http://127.0.0.1:3005', 
    changeOrigin: true,
    pathRewrite: (path, req) => path.replace(/^\/api\/users/, '') || '/'
}));
// Proxy socket.io traffic to the booking service
app.use('/socket.io', createProxyMiddleware({ target: 'http://127.0.0.1:3002', changeOrigin: true, ws: true }));

// Serve static frontend assets
app.use(express.static(__dirname));

app.listen(3000, () => {
    console.log('[Gateway] API Gateway running on port 3000');
    console.log('[Gateway] Routing /api/auth -> 3001, /api/bookings -> 3002, /api/inventory -> 3003, /api/pricing -> 3004, /api/users -> 3005');
});
