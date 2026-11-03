const express = require('express');
const driversController = require('./drivers.controller');

const router = express.Router();

router.get('/', (req, res, next) => driversController.getAll(req, res, next));
router.get('/:id', (req, res, next) => driversController.getById(req, res, next));
router.post('/', (req, res, next) => driversController.register(req, res, next));
router.post('/register', (req, res, next) => driversController.register(req, res, next));
router.patch('/:id/status', (req, res, next) => driversController.updateStatus(req, res, next));

module.exports = router;
