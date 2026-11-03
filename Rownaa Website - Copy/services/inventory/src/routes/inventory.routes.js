
const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');

router.get('/', controller.getInventory);
module.exports = router;
