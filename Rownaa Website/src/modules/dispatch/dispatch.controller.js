const dispatchService = require('./dispatch.service');

class DispatchController {
    async findNearby(req, res, next) {
        try {
            const result = await dispatchService.findNearbyFleet(req.body);
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }

    async estimate(req, res, next) {
        try {
            const result = await dispatchService.estimateTrip(req.body);
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    }

    async telemetryPing(req, res, next) {
        try {
            const result = await dispatchService.recordTelemetryPing(req.body, req.user);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new DispatchController();
