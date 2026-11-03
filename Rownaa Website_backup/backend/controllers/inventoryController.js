const { all } = require('../config/db');

const getInventory = async (req, res) => {
    try {
        let { includeDeleted, ownerId } = req.query;
        let query = 'SELECT * FROM inventory WHERE 1=1';
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

        const rows = await all(query, params);
        res.json(rows.map(r => ({
            ...r,
            hasAc: !!r.hasAc,
            isActive: !!r.isActive,
            serviceTags: r.serviceTags ? JSON.parse(r.serviceTags) : []
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getInventory };
