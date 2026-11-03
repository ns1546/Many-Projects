const { randomUUID } = require('crypto');
const inventoryRepo = require('./inventory.repository');
const { AppError } = require('../../middlewares/errorHandler');
const cache = require('../../infrastructure/cache');

class InventoryService {
    async getInventory({ includeDeleted, ownerId, category, search }) {
        const cacheKey = `inventory:${ownerId || 'all'}:${category || 'all'}:${search || 'none'}:${includeDeleted ? 'all' : 'active'}`;
        return await cache.getOrSet(cacheKey, async () => {
            return await inventoryRepo.findAll({ includeDeleted, ownerId, category, search });
        }, 60);
    }

    async getCarById(id) {
        const cacheKey = `car:${id}`;
        return await cache.getOrSet(cacheKey, async () => {
            const car = await inventoryRepo.findById(id);
            if (!car) throw new AppError('Vehicle not found', 404);
            return car;
        }, 120);
    }

    async addCar(carData, user) {
        const id = carData.id || `veh-${randomUUID().slice(0, 8)}`;
        const ownerId = (user && user.role === 'owner') ? user.userId : (carData.ownerId || null);

        const created = await inventoryRepo.create({
            ...carData,
            id,
            ownerId
        });

        // Invalidate fleet cache
        await cache.delPattern('inventory:*');
        return created;
    }

    async updateCar(id, updates, user) {
        const existing = await inventoryRepo.findById(id);
        if (!existing) throw new AppError('Vehicle not found', 404);

        if (user && user.role === 'owner' && existing.ownerId !== user.userId) {
            throw new AppError('Forbidden: You can only edit your own vehicles.', 403);
        }

        const updated = await inventoryRepo.update(id, updates);

        // Invalidate caches
        await cache.del(`car:${id}`);
        await cache.delPattern('inventory:*');
        return updated;
    }

    async updateLocation(id, { lat, lng, currentZone }) {
        const existing = await inventoryRepo.findById(id);
        if (!existing) throw new AppError('Vehicle not found', 404);

        const updated = await inventoryRepo.update(id, { lat, lng, currentZone });
        await cache.del(`car:${id}`);
        await cache.delPattern('inventory:*');
        return updated;
    }

    async deleteCar(id, user) {
        const existing = await inventoryRepo.findById(id);
        if (!existing) throw new AppError('Vehicle not found', 404);

        if (user && user.role === 'owner' && existing.ownerId !== user.userId) {
            throw new AppError('Forbidden: You can only delete your own vehicles.', 403);
        }

        await inventoryRepo.softDelete(id);

        // Invalidate caches
        await cache.del(`car:${id}`);
        await cache.delPattern('inventory:*');
        return { success: true };
    }
}

module.exports = new InventoryService();
