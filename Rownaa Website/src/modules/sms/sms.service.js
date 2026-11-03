const { randomUUID } = require('crypto');
const db = require('../../config/db');
const eventBus = require('../../infrastructure/eventBus');

class SmsService {
    constructor() {
        this.io = null;
    }

    setSocketIO(io) {
        this.io = io;
    }

    async dispatch({ recipient, recipientRole = 'customer', message, type = 'booking_confirmation', bookingId = null, status = 'Delivered' }) {
        const id = `sms-${randomUUID().slice(0, 8)}`;
        const createdAt = new Date().toISOString();

        await db.execute(
            `INSERT INTO sms_logs (id, recipient, recipientRole, message, type, bookingId, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, recipient, recipientRole, message, type, bookingId, status, createdAt]
        );

        const record = {
            id,
            recipient,
            recipientRole,
            message,
            type,
            bookingId,
            status,
            createdAt
        };

        if (process.env.NODE_ENV !== 'test') {
            console.log(`[SMS GATEWAY] Dispatched [${type}] to ${recipient} (${recipientRole}): "${message}"`);
        }

        // Publish to domain event bus and real-time websockets
        await eventBus.publish('sms:dispatched', record, {
            room: 'admin',
            broadcastWs: true
        });

        if (this.io) {
            this.io.emit('sms_dispatched', record);
        }

        return record;
    }

    async getLogs(limit = 50) {
        return await db.queryAll(
            'SELECT * FROM sms_logs ORDER BY createdAt DESC LIMIT ?',
            [limit]
        );
    }
}

module.exports = new SmsService();
