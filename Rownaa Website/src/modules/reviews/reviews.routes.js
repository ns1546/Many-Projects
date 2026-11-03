const express = require('express');
const reviewsController = require('./reviews.controller');
const { optionalAuth, authGuard, requireRole } = require('../../middlewares/authGuard');

const router = express.Router();

router.get('/metrics', (req, res, next) => reviewsController.getMetrics(req, res, next));
router.get('/experience-metrics', (req, res, next) => reviewsController.getMetrics(req, res, next));
router.get('/', (req, res, next) => reviewsController.getAll(req, res, next));
router.get('/:id', (req, res, next) => reviewsController.getById(req, res, next));
router.get('/booking/:bookingId', (req, res, next) => reviewsController.getByBookingId(req, res, next));
router.post('/', optionalAuth, (req, res, next) => reviewsController.create(req, res, next));
router.patch('/:id/respond', authGuard, requireRole('admin'), (req, res, next) => reviewsController.respond(req, res, next));
router.post('/:id/respond', authGuard, requireRole('admin'), (req, res, next) => reviewsController.respond(req, res, next));

module.exports = router;
