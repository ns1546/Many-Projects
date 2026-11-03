import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vendure.sqlite');

const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Tables:", tables.map(t => t.name).join(', '));

  db.all("SELECT COUNT(*) as count FROM search_index_item", [], (err2, r2) => {
    console.log("search_index_item count:", r2 ? r2[0].count : err2);
    db.all("SELECT COUNT(*) as count FROM product", [], (err3, r3) => {
      console.log("product count:", r3 ? r3[0].count : err3);
      db.all("SELECT COUNT(*) as count FROM product_variant", [], (err4, r4) => {
        console.log("product_variant count:", r4 ? r4[0].count : err4);
        db.close();
      });
    });
  });
});
