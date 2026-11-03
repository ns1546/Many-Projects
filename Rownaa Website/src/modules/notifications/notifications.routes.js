const express = require('express');
const notificationsController = require('./notifications.controller');
const { optionalAuth } = require('../../middlewares/authGuard');

const router = express.Router();

router.get('/', optionalAuth, (req, res, next) => notificationsController.getMyNotifications(req, res, next));
router.post('/', (req, res, next) => notificationsController.create(req, res, next));
router.patch('/read-all', optionalAuth, (req, res, next) => notificationsController.markAllRead(req, res, next));
router.patch('/:id/read', optionalAuth, (req, res, next) => notificationsController.markRead(req, res, next));
router.delete('/', optionalAuth, (req, res, next) => notificationsController.clear(req, res, next));

module.exports = router;
