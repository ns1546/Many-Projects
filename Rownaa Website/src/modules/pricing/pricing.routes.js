const express = require('express');
const pricingController = require('./pricing.controller');
const { authGuard, optionalAuth, requireRole } = require('../../middlewares/authGuard');

const router = express.Router();

router.get('/', (req, res, next) => pricingController.getConfig(req, res, next));
router.post('/', authGuard, requireRole('admin'), (req, res, next) => pricingController.updateConfig(req, res, next));
router.put('/', authGuard, requireRole('admin'), (req, res, next) => pricingController.updateConfig(req, res, next));
router.put('/config', authGuard, requireRole('admin'), (req, res, next) => pricingController.updateConfig(req, res, next));
router.post('/calculate', (req, res, next) => pricingController.calculate(req, res, next));
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'pricing-service' }));

module.exports = router;
