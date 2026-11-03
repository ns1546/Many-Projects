const db = require('../../config/db');

class InventoryRepository {
    async findAll({ includeDeleted = false, ownerId, category, search }) {
        let sql = 'SELECT * FROM inventory WHERE 1=1';
        const params = [];

        if (includeDeleted === 'only') {
            sql += ' AND deletedAt IS NOT NULL';
        } else if (!includeDeleted) {
            sql += ' AND deletedAt IS NULL';
        }

        if (ownerId) {
            sql += ' AND ownerId = ?';
            params.push(ownerId);
        }
        if (category) {
            sql += ' AND category LIKE ?';
            params.push(`%${category}%`);
        }
        if (search) {
            sql += ' AND (name LIKE ? OR category LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY name ASC';
        const rows = await db.queryAll(sql, params);

        return rows.map(r => ({
            ...r,
            hasAc: Boolean(r.hasAc),
            isActive: Boolean(r.isActive),
            serviceTags: r.serviceTags ? (r.serviceTags.startsWith('[') ? JSON.parse(r.serviceTags) : r.serviceTags.split(',').map(s => s.trim())) : []
        }));
    }

    async findById(id) {
        const r = await db.queryOne('SELECT * FROM inventory WHERE id = ?', [id]);
        if (!r) return null;
        return {
            ...r,
            hasAc: Boolean(r.hasAc),
            isActive: Boolean(r.isActive),
            serviceTags: r.serviceTags ? (r.serviceTags.startsWith('[') ? JSON.parse(r.serviceTags) : r.serviceTags.split(',').map(s => s.trim())) : []
        };
    }

    async create(car) {
        const serviceTagsStr = Array.isArray(car.serviceTags) ? JSON.stringify(car.serviceTags) : (car.serviceTags || '');
        await db.execute(
            `INSERT INTO inventory (
                id, name, category, image, seats, bags, hasAc, serviceTags, 
                baseRate, isActive, ownerId, registration, createdAt,
                lat, lng, currentZone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                car.id,
                car.name,
                car.category,
                car.image || 'assets/hero-car.png',
                car.seats || 4,
                car.bags || 2,
                car.hasAc ? 1 : 0,
                serviceTagsStr,
                car.baseRate || 2000,
                car.isActive !== false ? 1 : 0,
                car.ownerId || null,
                car.registration || 'DHAKA METRO',
                new Date().toISOString(),
                car.lat !== undefined ? car.lat : null,
                car.lng !== undefined ? car.lng : null,
                car.currentZone || null
            ]
        );
        return this.findById(car.id);
    }

    async update(id, updates) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = { ...existing, ...updates };
        const serviceTagsStr = Array.isArray(merged.serviceTags) ? JSON.stringify(merged.serviceTags) : (merged.serviceTags || '');

        await db.execute(
            `UPDATE inventory SET
                name = ?, category = ?, image = ?, seats = ?, bags = ?,
                hasAc = ?, serviceTags = ?, baseRate = ?, isActive = ?,
                ownerId = ?, registration = ?, deletedAt = ?,
                lat = ?, lng = ?, currentZone = ?
             WHERE id = ?`,
            [
                merged.name,
                merged.category,
                merged.image,
                merged.seats,
                merged.bags,
                merged.hasAc ? 1 : 0,
                serviceTagsStr,
                merged.baseRate,
                merged.isActive ? 1 : 0,
                merged.ownerId,
                merged.registration || 'DHAKA METRO',
                merged.deletedAt || null,
                merged.lat !== undefined ? merged.lat : null,
                merged.lng !== undefined ? merged.lng : null,
                merged.currentZone || null,
                id
            ]
        );

        return this.findById(id);
    }

    async softDelete(id) {
        await db.execute('UPDATE inventory SET deletedAt = ? WHERE id = ?', [new Date().toISOString(), id]);
        return true;
    }
}

module.exports = new InventoryRepository();
