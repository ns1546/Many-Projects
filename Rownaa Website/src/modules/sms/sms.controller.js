const smsService = require('./sms.service');

class SmsController {
    async getLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit, 10) || 50;
            const logs = await smsService.getLogs(limit);
            res.json({
                success: true,
                count: logs.length,
                logs
            });
        } catch (err) {
            next(err);
        }
    }

    async dispatch(req, res, next) {
        try {
            const { recipient, recipientRole, message, type, bookingId } = req.body;
            if (!recipient || !message) {
                return res.status(400).json({ success: false, error: 'Recipient and message are required' });
            }
            const record = await smsService.dispatch({
                recipient,
                recipientRole,
                message,
                type,
                bookingId
            });
            res.status(201).json({ success: true, sms: record });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SmsController();
