import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vendure.sqlite');

const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(search_index_item)", [], (err, cols) => {
  console.log("search_index_item columns:", cols.map(c => `${c.name} (${c.type})`).join(', '));
  db.all("SELECT * FROM product LIMIT 2", [], (err2, p) => {
    console.log("Sample product:", p);
    db.close();
  });
});
