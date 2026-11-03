const bookingsService = require('./bookings.service');

class BookingsController {
    async getAll(req, res, next) {
        try {
            const { page, limit, status, search, includeDeleted, ownerId, customerId } = req.query;
            const result = await bookingsService.getBookings({
                user: req.user,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 50,
                status,
                search,
                includeDeleted: includeDeleted === 'true' || includeDeleted === '1',
                ownerId,
                customerId
            });
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const booking = await bookingsService.getBookingById(req.params.id, req.user);
            res.json(booking);
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const created = await bookingsService.createBooking(req.body, req.user);
            res.status(201).json({
                success: true,
                message: 'Booking confirmed successfully',
                id: created.id,
                booking: created
            });
        } catch (err) {
            next(err);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const status = req.body.status || 'Confirmed';
            const updated = await bookingsService.updateStatus(req.params.id, req.body, req.user);
            res.json({
                success: true,
                message: `Booking status updated to ${status}`,
                booking: updated
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await bookingsService.deleteBooking(req.params.id, req.user);
            res.json({ success: true, message: 'Booking soft-deleted successfully' });
        } catch (err) {
            next(err);
        }
    }

    async restore(req, res, next) {
        try {
            const restored = await bookingsService.restoreBooking(req.params.id, req.user);
            res.json({ success: true, message: 'Booking restored successfully', booking: restored });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new BookingsController();
