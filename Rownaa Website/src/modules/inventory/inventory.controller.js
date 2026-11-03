const inventoryService = require('./inventory.service');

class InventoryController {
    async getAll(req, res, next) {
        try {
            const { includeDeleted, ownerId, category, search } = req.query;
            const cars = await inventoryService.getInventory({
                includeDeleted,
                ownerId,
                category,
                search
            });
            // Return array directly or wrapped in data for API compatibility
            res.json({ success: true, count: cars.length, data: cars });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const car = await inventoryService.getCarById(req.params.id);
            res.json(car);
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const car = await inventoryService.addCar(req.body, req.user);
            res.status(201).json({ success: true, message: 'Vehicle added to fleet', car, data: car });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const car = await inventoryService.updateCar(req.params.id, req.body, req.user);
            res.json({ success: true, message: 'Vehicle updated successfully', car, data: car });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await inventoryService.deleteCar(req.params.id, req.user);
            res.json({ success: true, message: 'Vehicle removed from active fleet' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new InventoryController();
