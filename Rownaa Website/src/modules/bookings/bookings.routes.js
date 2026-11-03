const express = require('express');
const bookingsController = require('./bookings.controller');
const { authGuard, optionalAuth } = require('../../middlewares/authGuard');
const { validate } = require('../../middlewares/validator');
const { createBookingSchema, updateBookingStatusSchema } = require('../../../shared/validations');

const router = express.Router();

router.get('/', authGuard, (req, res, next) => bookingsController.getAll(req, res, next));
router.get('/:id', optionalAuth, (req, res, next) => bookingsController.getById(req, res, next));
router.post('/', authGuard, validate(createBookingSchema), (req, res, next) => bookingsController.create(req, res, next));
router.patch('/:id/status', authGuard, validate(updateBookingStatusSchema), (req, res, next) => bookingsController.updateStatus(req, res, next));
router.delete('/:id', authGuard, (req, res, next) => bookingsController.delete(req, res, next));
router.patch('/:id/restore', authGuard, (req, res, next) => bookingsController.restore(req, res, next));
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'booking-service' }));

module.exports = router;
