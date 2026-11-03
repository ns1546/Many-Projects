const reviewsService = require('./reviews.service');

class ReviewsController {
    async getAll(req, res, next) {
        try {
            const reviews = await reviewsService.getAll();
            res.json({ success: true, count: reviews.length, reviews });
        } catch (err) {
            next(err);
        }
    }

    async getById(req, res, next) {
        try {
            const review = await reviewsService.getById(req.params.id);
            if (!review) {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
            res.json({ success: true, review });
        } catch (err) {
            next(err);
        }
    }

    async getByBookingId(req, res, next) {
        try {
            const review = await reviewsService.getByBookingId(req.params.bookingId);
            res.json({ success: true, review });
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const review = await reviewsService.addReview(req.body, req.user);
            res.status(201).json({ success: true, message: 'Review submitted', review });
        } catch (err) {
            next(err);
        }
    }

    async respond(req, res, next) {
        try {
            const updated = await reviewsService.respondToReview(req.params.id, req.body, req.user);
            res.json({ success: true, message: 'Admin response published successfully', review: updated });
        } catch (err) {
            next(err);
        }
    }

    async getMetrics(req, res, next) {
        try {
            const metrics = await reviewsService.getExperienceMetrics();
            res.json({ success: true, metrics });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ReviewsController();
