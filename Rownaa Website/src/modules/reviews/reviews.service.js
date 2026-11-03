const { randomUUID } = require('crypto');
const reviewsRepo = require('./reviews.repository');
const notificationsService = require('../notifications/notifications.service');
const eventBus = require('../../infrastructure/eventBus');
const { AppError } = require('../../middlewares/errorHandler');

class ReviewsService {
    async getAll() {
        return await reviewsRepo.findAll();
    }

    async getById(id) {
        return await reviewsRepo.findById(id);
    }

    async getByBookingId(bookingId) {
        return await reviewsRepo.findByBookingId(bookingId);
    }

    async addReview({ bookingId, customerId, rating, comment, sentiment, category, userFeeling }, user) {
        const existing = await reviewsRepo.findByBookingId(bookingId);
        if (existing) {
            throw new AppError('This trip has already been reviewed.', 400);
        }

        const parsedRating = parseInt(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            throw new AppError('Rating must be an integer between 1 and 5.', 400);
        }

        // Automatic sentiment deduction if not explicitly supplied
        let derivedSentiment = sentiment;
        if (!derivedSentiment) {
            if (parsedRating === 5) derivedSentiment = 'delighted';
            else if (parsedRating === 4) derivedSentiment = 'positive';
            else if (parsedRating === 3) derivedSentiment = 'constructive';
            else derivedSentiment = 'frustrated';
        }

        const id = `REV-${randomUUID().slice(0, 6).toUpperCase()}`;
        const createdAt = new Date().toISOString();
        const finalCustomerId = (user && user.userId) ? user.userId : (customerId || 'cust-1');

        const createdReview = await reviewsRepo.create({
            id,
            bookingId,
            customerId: finalCustomerId,
            rating: parsedRating,
            comment: comment || '',
            sentiment: derivedSentiment,
            category: category || 'overall',
            userFeeling: userFeeling || comment || '',
            createdAt
        });

        // Publish to real-time eventBus so Admin Panel & Customer Panel react immediately
        eventBus.publish('user_experience:created', {
            reviewId: id,
            bookingId,
            customerId: finalCustomerId,
            rating: parsedRating,
            sentiment: derivedSentiment,
            userFeeling: userFeeling || comment || ''
        });

        return createdReview;
    }

    async respondToReview(id, { adminResponse, status = 'resolved', actionTaken = '' }, adminUser) {
        if (!adminResponse || !adminResponse.trim()) {
            throw new AppError('Admin response text is required.', 400);
        }

        const existing = await reviewsRepo.findById(id);
        if (!existing) {
            throw new AppError('Review not found.', 404);
        }

        const adminName = adminUser?.name || adminUser?.username || 'System Administrator';
        const updated = await reviewsRepo.updateAdminResponse(id, {
            adminResponse: adminResponse.trim(),
            adminRespondedBy: adminName,
            adminRespondedAt: new Date().toISOString(),
            status,
            actionTaken: actionTaken.trim()
        });

        // Send real-time notification to the customer
        if (existing.customerId) {
            await notificationsService.createNotification({
                userId: existing.customerId,
                title: 'Official Response to Your Trip Feedback',
                message: `Admin (${adminName}) replied to your trip feedback: "${adminResponse.trim()}"`,
                type: 'success'
            }).catch(() => {});
        }

        // Publish to eventBus
        eventBus.publish('user_experience:responded', {
            reviewId: id,
            customerId: existing.customerId,
            adminResponse: adminResponse.trim(),
            status,
            actionTaken
        });

        return updated;
    }

    async getExperienceMetrics() {
        return await reviewsRepo.getExperienceMetrics();
    }
}

module.exports = new ReviewsService();
