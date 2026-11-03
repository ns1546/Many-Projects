const pricingService = require('./pricing.service');

class PricingController {
    async getConfig(req, res, next) {
        try {
            const config = await pricingService.getConfig();
            res.json(config);
        } catch (err) {
            next(err);
        }
    }

    async updateConfig(req, res, next) {
        try {
            const updated = await pricingService.updateConfig(req.body);
            res.json({ success: true, message: 'Pricing rates updated', config: updated });
        } catch (err) {
            next(err);
        }
    }

    async calculate(req, res, next) {
        try {
            const calculation = await pricingService.calculate(req.body);
            res.json({ success: true, ...calculation });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new PricingController();
