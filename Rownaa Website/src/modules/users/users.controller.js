const usersService = require('./users.service');

class UsersController {
    async getCustomers(req, res, next) {
        try {
            const customers = await usersService.getCustomers();
            res.json({ success: true, count: customers.length, customers });
        } catch (err) {
            next(err);
        }
    }

    async getOwners(req, res, next) {
        try {
            const owners = await usersService.getOwners();
            res.json({ success: true, count: owners.length, owners });
        } catch (err) {
            next(err);
        }
    }

    async getRegistrations(req, res, next) {
        try {
            const registrations = await usersService.getRegistrations();
            res.json({ success: true, count: registrations.length, registrations });
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.body.id || (req.user ? req.user.userId : null);
            if (!userId) {
                return res.status(400).json({ success: false, error: 'User ID is required' });
            }
            const updated = await usersService.updateProfile(userId, req.body);
            res.json({ success: true, message: 'Profile updated successfully', user: updated });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await usersService.updateStatus(id, status);
            res.json({ success: true, message: `Status updated to ${status}`, user: updated });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UsersController();
