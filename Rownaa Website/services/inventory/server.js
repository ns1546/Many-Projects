const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const db = require('../../database');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const inventoryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.get('/', inventoryLimiter, (req, res) => {
    let { includeDeleted, ownerId } = req.query;
    
    let query = "SELECT * FROM inventory";
    let conditions = [];
    let params = [];
    
    if (includeDeleted !== 'only' && includeDeleted !== 'true') {
        conditions.push("deletedAt IS NULL");
    } else if (includeDeleted === 'only') {
        conditions.push("deletedAt IS NOT NULL");
    }

    if (ownerId) {
        conditions.push("ownerId = ?");
        params.push(ownerId);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    query += " LIMIT 50";

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Inventory Fetch Error:", err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const formatted = rows.map(r => {
            let tags = [];
            if (r.serviceTags) {
                try {
                    tags = typeof r.serviceTags === 'string' && r.serviceTags.startsWith('[')
                        ? JSON.parse(r.serviceTags)
                        : (Array.isArray(r.serviceTags) ? r.serviceTags : r.serviceTags.split(',').map(s => s.trim()));
                } catch {
                    tags = typeof r.serviceTags === 'string' ? r.serviceTags.split(',').map(s => s.trim()) : [];
                }
            }
            return {
                ...r,
                serviceTags: tags
            };
        });
        res.json({ success: true, data: formatted });
    });
});

app.post('/', (req, res) => {
    const { id, name, category, image, seats, bags, hasAc, serviceTags, baseRate, isActive, ownerId } = req.body;
    const newId = id || require('crypto').randomUUID();
    const query = `INSERT INTO inventory (id, name, category, image, seats, bags, hasAc, serviceTags, baseRate, isActive, ownerId) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [newId, name, category, image, seats, bags, hasAc, JSON.stringify(serviceTags), baseRate, isActive, ownerId];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, id: newId });
    });
});

app.put('/:id', (req, res) => {
    const { name, category, seats, bags, hasAc, baseRate } = req.body;
    const query = `UPDATE inventory SET name=?, category=?, seats=?, bags=?, hasAc=?, baseRate=? WHERE id=?`;
    const params = [name, category, seats, bags, hasAc, baseRate, req.params.id];
    
    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.delete('/:id', (req, res) => {
    db.run("UPDATE inventory SET deletedAt = ? WHERE id = ?", [new Date().toISOString(), req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ success: true });
    });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'inventory-service' }));

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`inventory-service running securely on port ${PORT}`));
}

module.exports = app;
