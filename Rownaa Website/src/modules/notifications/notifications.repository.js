const db = require('../../config/db');

class NotificationsRepository {
    async findByUserId(userId) {
        return await db.queryAll('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    }

    async countUnread(userId) {
        const row = await db.queryOne('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0', [userId]);
        return row ? row.count : 0;
    }

    async create({ id, userId, title, message, type = 'info', createdAt }) {
        await db.execute(
            `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
             VALUES (?, ?, ?, ?, ?, 0, ?)`,
            [id, userId, title, message, type, createdAt]
        );
        return await db.queryOne('SELECT * FROM notifications WHERE id = ?', [id]);
    }

    async markAsRead(id, userId) {
        await db.execute('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [id, userId]);
        return true;
    }

    async markAllAsRead(userId) {
        await db.execute('UPDATE notifications SET isRead = 1 WHERE userId = ?', [userId]);
        return true;
    }

    async clearAll(userId) {
        await db.execute('DELETE FROM notifications WHERE userId = ?', [userId]);
        return true;
    }
}

module.exports = new NotificationsRepository();
