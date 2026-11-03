
const db = require('../infrastructure/database');
class InventoryRepository {
    async findAllActive() {
        const result = await db.query('SELECT * FROM inventory WHERE "isActive" = true AND "deletedAt" IS NULL');
        return result.rows;
    }
}
module.exports = new InventoryRepository();
