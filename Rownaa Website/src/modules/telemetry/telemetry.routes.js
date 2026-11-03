const express = require('express');
const router = express.Router();
const telemetryController = require('./telemetry.controller');

// Public system telemetry endpoint for monitoring & uptime bots
router.get('/', telemetryController.getMetrics);

module.exports = router;
