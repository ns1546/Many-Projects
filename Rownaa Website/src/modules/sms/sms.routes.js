const express = require('express');
const smsController = require('./sms.controller');

const router = express.Router();

router.get('/logs', (req, res, next) => smsController.getLogs(req, res, next));
router.post('/dispatch', (req, res, next) => smsController.dispatch(req, res, next));

module.exports = router;
