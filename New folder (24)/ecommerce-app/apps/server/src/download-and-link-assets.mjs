import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vendure.sqlite');
const assetsDir = path.join(__dirname, '../static/assets/preview');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const images = [
  { id: 101, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { id: 102, url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80" },
  { id: 103, url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80" },
  { id: 104, url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80" },
  { id: 105, url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" },
  { id: 106, url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80" },
  { id: 107, url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80" },
  { id: 108, url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=600&q=80" },
  { id: 109, url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
  { id: 110, url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80" },
  { id: 111, url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80" },
  { id: 112, url: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=600&q=80" },
  { id: 113, url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80" },
  { id: 114, url: "https://images.unsplash.com/photo-1609592807664-885f67b57fa4?auto=format&fit=crop&w=600&q=80" },
  { id: 115, url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" },
  { id: 116, url: "https://images.unsplash.com/photo-1609592807869-7d0e4f4838b9?auto=format&fit=crop&w=600&q=80" }
];

async function run() {
  console.log("Downloading 16 product images...");
  for (const item of images) {
    const filename = `product-${item.id}.jpg`;
    const targetFile = path.join(assetsDir, filename);
    const relPath = `preview/${filename}`;

    try {
      const res = await fetch(item.url);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(targetFile, Buffer.from(buf));
      console.log(`Saved ${filename} (${buf.byteLength} bytes)`);

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE asset SET preview = ?, source = ? WHERE id = ?`,
          [relPath, relPath, item.id],
          err => (err ? reject(err) : resolve())
        );
      });

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE search_index_item SET productPreview = ?, productVariantPreview = ? WHERE productId = ?`,
          [relPath, relPath, item.id],
          err => (err ? reject(err) : resolve())
        );
      });
    } catch (err) {
      console.error(`Failed for ${item.id}:`, err);
    }
  }

  console.log("All assets downloaded and database records updated!");
  db.close();
}

run();
