import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('vendure.sqlite');

db.all("PRAGMA table_info(product_variant)", (err, rows) => {
    if (err) console.error(err);
    else console.log('ProductVariant columns:', rows.map(r => r.name));
});

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    if (err) console.error(err);
    else console.log('All tables:', rows.map(r => r.name));
});
