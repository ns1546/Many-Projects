const express = require('express');
const usersController = require('./users.controller');
const { optionalAuth, authGuard, requireRole } = require('../../middlewares/authGuard');

const router = express.Router();

router.get('/customers', (req, res, next) => usersController.getCustomers(req, res, next));
router.get('/owners', (req, res, next) => usersController.getOwners(req, res, next));
router.get('/registrations', (req, res, next) => usersController.getRegistrations(req, res, next));
router.put('/profile', optionalAuth, (req, res, next) => usersController.updateProfile(req, res, next));
router.put('/:id/status', (req, res, next) => usersController.updateStatus(req, res, next));
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'users-service' }));

module.exports = router;
