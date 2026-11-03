const express = require('express');
const { getInventory } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', getInventory);

module.exports = router;
