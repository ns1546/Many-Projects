const { randomUUID } = require('crypto');
const notificationsRepo = require('./notifications.repository');

class NotificationsService {
    async getUserNotifications(userId) {
        const notifications = await notificationsRepo.findByUserId(userId);
        const unreadCount = await notificationsRepo.countUnread(userId);
        return { notifications, unreadCount };
    }

    async createNotification({ userId, title, message, type = 'info' }) {
        const id = `notif-${randomUUID().slice(0, 8)}`;
        const createdAt = new Date().toISOString();
        return await notificationsRepo.create({ id, userId, title, message, type, createdAt });
    }

    async markRead(id, userId) {
        return await notificationsRepo.markAsRead(id, userId);
    }

    async markAllRead(userId) {
        return await notificationsRepo.markAllAsRead(userId);
    }

    async clear(userId) {
        return await notificationsRepo.clearAll(userId);
    }
}

module.exports = new NotificationsService();
