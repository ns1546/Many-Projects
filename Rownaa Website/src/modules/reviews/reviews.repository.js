const db = require('../../config/db');

class ReviewsRepository {
    async findAll() {
        return await db.queryAll('SELECT * FROM reviews ORDER BY createdAt DESC');
    }

    async findById(id) {
        return await db.queryOne('SELECT * FROM reviews WHERE id = ?', [id]);
    }

    async findByBookingId(bookingId) {
        return await db.queryOne('SELECT * FROM reviews WHERE bookingId = ?', [bookingId]);
    }

    async create({ id, bookingId, customerId, rating, comment, sentiment = 'positive', category = 'overall', userFeeling = '', createdAt }) {
        await db.execute(
            `INSERT INTO reviews (id, bookingId, customerId, rating, comment, sentiment, category, userFeeling, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?)`,
            [id, bookingId, customerId, rating, comment, sentiment, category, userFeeling, createdAt]
        );
        return await this.findByBookingId(bookingId);
    }

    async updateAdminResponse(id, { adminResponse, adminRespondedBy = 'System Admin', adminRespondedAt, status = 'resolved', actionTaken = '' }) {
        await db.execute(
            `UPDATE reviews 
             SET adminResponse = ?, adminRespondedBy = ?, adminRespondedAt = ?, status = ?, actionTaken = ?
             WHERE id = ?`,
            [adminResponse, adminRespondedBy, adminRespondedAt, status, actionTaken, id]
        );
        return await this.findById(id);
    }

    async getExperienceMetrics() {
        const reviews = await this.findAll();
        const total = reviews.length;
        if (total === 0) {
            return {
                totalExperiences: 0,
                averageRating: 5.0,
                csatPercentage: 100,
                sentiments: { positive: 0, constructive: 0, frustrated: 0 },
                responseRate: 100,
                pendingResponses: 0
            };
        }

        let totalRating = 0;
        let positiveCount = 0;
        let constructiveCount = 0;
        let frustratedCount = 0;
        let respondedCount = 0;

        reviews.forEach(r => {
            totalRating += Number(r.rating) || 5;
            const sent = (r.sentiment || 'positive').toLowerCase();
            if (sent === 'positive' || sent === 'delighted') positiveCount++;
            else if (sent === 'frustrated' || sent === 'critical') frustratedCount++;
            else constructiveCount++;

            if (r.adminResponse) respondedCount++;
        });

        const avg = (totalRating / total).toFixed(2);
        const csat = Math.round((positiveCount / total) * 100);
        const respRate = Math.round((respondedCount / total) * 100);

        return {
            totalExperiences: total,
            averageRating: parseFloat(avg),
            csatPercentage: csat,
            sentiments: {
                positive: positiveCount,
                constructive: constructiveCount,
                frustrated: frustratedCount
            },
            responseRate: respRate,
            pendingResponses: total - respondedCount
        };
    }
}

module.exports = new ReviewsRepository();
