const express = require('express');
const router = express.Router();
const dispatchController = require('./dispatch.controller');
const { authGuard, requireRole } = require('../../middlewares/authGuard');

// Public or Customer: find closest cars and get trip estimate
router.post('/nearby', dispatchController.findNearby);
router.post('/estimate', dispatchController.estimate);

// Driver / Fleet Partner / Admin: send vehicle GPS telemetry ping
router.post('/telemetry/ping', authGuard, requireRole('owner', 'admin'), dispatchController.telemetryPing);

module.exports = router;
