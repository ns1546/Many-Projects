const notificationsService = require('./notifications.service');

class NotificationsController {
    async getMyNotifications(req, res, next) {
        try {
            const userId = req.query.userId || (req.user ? req.user.userId : null);
            if (!userId) {
                return res.json({ success: true, count: 0, notifications: [], unreadCount: 0 });
            }
            const data = await notificationsService.getUserNotifications(userId);
            res.json({ success: true, ...data });
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const notif = await notificationsService.createNotification(req.body);
            res.status(201).json({ success: true, notification: notif });
        } catch (err) {
            next(err);
        }
    }

    async markRead(req, res, next) {
        try {
            const userId = req.body.userId || (req.user ? req.user.userId : null);
            await notificationsService.markRead(req.params.id, userId);
            res.json({ success: true, message: 'Notification marked as read' });
        } catch (err) {
            next(err);
        }
    }

    async markAllRead(req, res, next) {
        try {
            const userId = req.body.userId || (req.user ? req.user.userId : null);
            await notificationsService.markAllRead(userId);
            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (err) {
            next(err);
        }
    }

    async clear(req, res, next) {
        try {
            const userId = req.query.userId || (req.user ? req.user.userId : null);
            await notificationsService.clear(userId);
            res.json({ success: true, message: 'Notifications cleared' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NotificationsController();
