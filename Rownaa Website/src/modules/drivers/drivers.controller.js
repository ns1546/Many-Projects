const driversService = require('./drivers.service');

class DriversController {
    async getAll(req, res, next) {
        try {
            const status = req.query.status || null;
            const drivers = await driversService.getAllDrivers(status);
            res.json({
                success: true,
                count: drivers.length,
                drivers
            });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const driver = await driversService.getDriverById(req.params.id);
            res.json({ success: true, driver });
        } catch (err) {
            next(err);
        }
    }

    async register(req, res, next) {
        try {
            const created = await driversService.registerDriver(req.body);
            res.status(201).json({
                success: true,
                message: 'Driver registered successfully',
                driver: created
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const updated = await driversService.updateStatus(req.params.id, status);
            res.json({
                success: true,
                message: `Driver status updated to ${status}`,
                driver: updated
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new DriversController();
