const express = require('express');
const inventoryController = require('./inventory.controller');
const { optionalAuth, authGuard, requireRole } = require('../../middlewares/authGuard');
const { validate } = require('../../middlewares/validator');
const { createCarSchema, updateCarSchema } = require('../../../shared/validations');

const router = express.Router();

router.get('/', (req, res, next) => inventoryController.getAll(req, res, next));
router.get('/:id', (req, res, next) => inventoryController.getById(req, res, next));
router.post('/', authGuard, requireRole('owner', 'admin'), validate(createCarSchema), (req, res, next) => inventoryController.create(req, res, next));
router.put('/:id', authGuard, requireRole('owner', 'admin'), validate(updateCarSchema), (req, res, next) => inventoryController.update(req, res, next));
router.delete('/:id', authGuard, requireRole('owner', 'admin'), (req, res, next) => inventoryController.delete(req, res, next));
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'inventory-service' }));

module.exports = router;
