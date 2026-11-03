
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventory.routes');
const metricsMiddleware = require('./middlewares/metrics');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware); // Observability

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'inventory-service' }));
app.use('/api/inventory', inventoryRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Inventory Service Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
