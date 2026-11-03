const express = require('express');
const authController = require('./auth.controller');
const { authGuard, optionalAuth } = require('../../middlewares/authGuard');
const { validate } = require('../../middlewares/validator');
const { loginSchema, registerSchema } = require('../../../shared/validations');

const router = express.Router();

router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/me', optionalAuth, (req, res, next) => authController.me(req, res, next));
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

module.exports = router;
