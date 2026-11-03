
const inventoryService = require('../services/inventory.service');
exports.getInventory = async (req, res, next) => {
    try {
        const data = await inventoryService.getAvailableCars();
        res.json({ success: true, data });
    } catch (error) {
        next(error); // Pass to global error handler
    }
};
