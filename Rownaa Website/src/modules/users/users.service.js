const usersRepo = require('./users.repository');
const { AppError } = require('../../middlewares/errorHandler');

class UsersService {
    async getCustomers() {
        return await usersRepo.findCustomers();
    }

    async getOwners() {
        return await usersRepo.findOwners();
    }

    async getRegistrations() {
        return await usersRepo.findRegistrations();
    }

    async updateProfile(userId, { name, phone }) {
        const existing = await usersRepo.findById(userId);
        if (!existing) throw new AppError('User not found', 404);
        return await usersRepo.updateProfile(userId, { name, phone });
    }

    async updateStatus(id, status) {
        const existing = await usersRepo.findById(id);
        if (!existing) throw new AppError('Partner record not found', 404);
        return await usersRepo.updateStatus(id, status);
    }
}

module.exports = new UsersService();
