const { run, all } = require('../config/db');

const getBookings = async (req, res) => {
    try {
        let { includeDeleted, ownerId, customerId } = req.query;
        let query = 'SELECT * FROM bookings WHERE 1=1';
        let params = [];
        
        if (includeDeleted !== 'only' && includeDeleted !== 'true') {
            query += ' AND deletedAt IS NULL';
        } else if (includeDeleted === 'only') {
            query += ' AND deletedAt IS NOT NULL';
        }

        if (ownerId) {
            query += ' AND ownerId = ?';
            params.push(ownerId);
        }

        if (customerId) {
            query += ' AND customerId = ?';
            params.push(customerId);
        }
        
        // Admin can see all, Owner can see theirs, Customer can see theirs
        if (req.user.role === 'owner' && !ownerId) {
            query += ' AND ownerId = ?';
            params.push(req.user.userId);
        } else if (req.user.role === 'customer' && !customerId) {
            query += ' AND customerId = ?';
            params.push(req.user.userId);
        }

        const rows = await all(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const b = req.body;
        const id = 'BKG-' + Math.floor(Math.random() * 100000);
        const status = 'Pending';
        const createdAt = new Date().toISOString();
        
        await run(`INSERT INTO bookings (id, service, customerName, customerId, ownerId, price, status, dateTime, createdAt) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id, b.service, b.customerName || req.user.name, req.user.userId, b.ownerId || '', b.price || '0', status, b.dateTime || '', createdAt]);
        
        res.json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const softDeleteBooking = async (req, res) => {
    try {
        const deletedAt = new Date().toISOString();
        await run('UPDATE bookings SET deletedAt = ? WHERE id = ?', [deletedAt, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const restoreBooking = async (req, res) => {
    try {
        await run('UPDATE bookings SET deletedAt = NULL WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getBookings,
    createBooking,
    updateStatus,
    softDeleteBooking,
    restoreBooking
};
