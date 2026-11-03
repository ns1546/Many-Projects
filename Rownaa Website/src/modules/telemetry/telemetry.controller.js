const telemetryService = require('./telemetry.service');

class TelemetryController {
    async getMetrics(req, res, next) {
        try {
            const metrics = await telemetryService.getEngineMetrics();
            res.json({ success: true, ...metrics });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new TelemetryController();
