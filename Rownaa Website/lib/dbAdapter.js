const fs = require('fs').promises;
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'db');

// Abstract Database Adapter ready for Firebase transition
class DBAdapter {
  constructor(collection) {
    this.collection = collection;
    this.filePath = path.join(DB_DIR, `${collection}.json`);
  }

  async _ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch (e) {
      await fs.writeFile(this.filePath, JSON.stringify({}));
    }
  }

  async get() {
    await this._ensureFile();
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async set(data) {
    await this._ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    return data;
  }
}

module.exports = DBAdapter;
