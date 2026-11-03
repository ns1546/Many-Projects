
const repo = require('../repositories/inventory.repository');
const cache = require('../infrastructure/cache');
const mq = require('../infrastructure/rabbitmq');

class InventoryService {
    async getAvailableCars() {
        // Cache-aside Pattern (Uber/Facebook standard)
        const cached = await cache.get('inventory:active');
        if (cached) return JSON.parse(cached);

        const cars = await repo.findAllActive();
        
        // Save to cache for 5 minutes
        await cache.set('inventory:active', JSON.stringify(cars), 'EX', 300);
        
        // Emit Analytics Event
        mq.publishEvent('inventory.viewed', { timestamp: new Date(), count: cars.length });
        
        return cars;
    }
}
module.exports = new InventoryService();
