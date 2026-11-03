import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vendure.sqlite');

const db = new sqlite3.Database(dbPath);

const categories = [
  {
    id: 10,
    name: "Audio & Sound",
    slug: "audio-sound",
    description: "High-fidelity headphones, wireless earbuds, and studio monitors."
  },
  {
    id: 11,
    name: "Computing & Desk",
    slug: "computing-desk",
    description: "Mechanical keyboards, ergonomic mice, and ultrawide displays."
  },
  {
    id: 12,
    name: "Wearables & Watches",
    slug: "wearables-watches",
    description: "Titanium smartwatches, health rings, and automatic timepieces."
  },
  {
    id: 13,
    name: "Power & Travel Gear",
    slug: "power-travel",
    description: "Fast GaN chargers, wireless docks, and weatherproof backpacks."
  }
];

const products = [
  // Category 1: Audio & Sound
  {
    name: "AeroSound Apex Pro Wireless Headphones",
    slug: "aerosound-apex-pro",
    sku: "AERO-APEX-PRO",
    price: 34900,
    categoryId: 10,
    categorySlug: "audio-sound",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    description: "Flagship active noise-cancelling headphones featuring custom 40mm beryllium drivers, 45-hour battery life, and spatial audio with dynamic head tracking."
  },
  {
    name: "SonicPulse Pro True Wireless Earbuds",
    slug: "sonicpulse-pro-earbuds",
    sku: "SONIC-PULSE-PRO",
    price: 17900,
    categoryId: 10,
    categorySlug: "audio-sound",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
    description: "Studio-tuned in-ear monitors with adaptive ANC, IPX7 waterproof rating, wireless Qi charging, and ultra-clear beamforming microphone array."
  },
  {
    name: "Acoustica Horizon Hi-Fi Bookshelf Speaker",
    slug: "acoustica-horizon-speaker",
    sku: "ACOU-HORIZON-SPK",
    price: 29900,
    categoryId: 10,
    categorySlug: "audio-sound",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80",
    description: "Crafted from walnut wood veneer with Kevlar mid-bass drivers and silk dome tweeters for room-filling audiophile acoustics."
  },
  {
    name: "StudioStream XLR Broadcast Microphone",
    slug: "studiostream-xlr-mic",
    sku: "STUDIO-STREAM-MIC",
    price: 14900,
    categoryId: 10,
    categorySlug: "audio-sound",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=80",
    description: "Broadcast-grade cardioid condenser microphone engineered for podcasters, vocalists, and streaming professionals with built-in pop filter."
  },

  // Category 2: Computing & Desk
  {
    name: "CyberDeck 75% Wireless Mechanical Keyboard",
    slug: "cyberdeck-75-keyboard",
    sku: "CYBER-DECK-75",
    price: 18900,
    categoryId: 11,
    categorySlug: "computing-desk",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
    description: "Gasket-mounted hot-swappable keyboard with CNC anodized aluminum frame, pre-lubed tactile switches, PBT keycaps, and customizable RGB."
  },
  {
    name: "ErgoGlide Precision Wireless Mouse",
    slug: "ergoglide-precision-mouse",
    sku: "ERGO-GLIDE-MOU",
    price: 8900,
    categoryId: 11,
    categorySlug: "computing-desk",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80",
    description: "Sculpted ergonomic mouse with electromagnetic MagSpeed scroll wheel, 8000 DPI sensor on glass, and cross-device seamless flow."
  },
  {
    name: "UltraView 34-Inch Curved QD-OLED Monitor",
    slug: "ultraview-34-curved-monitor",
    sku: "ULTRA-VIEW-34",
    price: 79900,
    categoryId: 11,
    categorySlug: "computing-desk",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80",
    description: "Immersive 3440x1440 curved gaming and workstation display with 175Hz refresh rate, 0.03ms response time, and 99.3% DCI-P3 color accuracy."
  },
  {
    name: "AeroDesk Motorized Solid Oak Standing Desk",
    slug: "aerodesk-standing-desk",
    sku: "AERO-DESK-OAK",
    price: 54900,
    categoryId: 11,
    categorySlug: "computing-desk",
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1000&q=80",
    description: "Dual-motor motorized height adjustable standing desk with natural solid oak top, anti-collision gyroscope sensor, and 4 memory presets."
  },

  // Category 3: Wearables & Watches
  {
    name: "Chronos Titanium Smartwatch Ultra",
    slug: "chronos-titanium-smartwatch",
    sku: "CHRONOS-TI-ULTRA",
    price: 39900,
    categoryId: 12,
    categorySlug: "wearables-watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    description: "Grade 5 titanium sapphire crystal smartwatch with ECG monitoring, dual-band GPS topo maps, and 14-day expedition battery life."
  },
  {
    name: "Lumina Minimalist Health Ring",
    slug: "lumina-health-ring",
    sku: "LUMINA-RING-GEN3",
    price: 24900,
    categoryId: 12,
    categorySlug: "wearables-watches",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80",
    description: "Ultralight aerospace titanium ring tracking sleep stages, recovery readiness, skin temperature, and continuous heart rate variability."
  },
  {
    name: "Vanguard Classic Automatic Chronograph",
    slug: "vanguard-classic-automatic",
    sku: "VANGUARD-AUTO-CHR",
    price: 48000,
    categoryId: 12,
    categorySlug: "wearables-watches",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80",
    description: "Swiss mechanical automatic watch with domed anti-reflective sapphire crystal, exhibition caseback, and Italian full-grain leather strap."
  },
  {
    name: "AeroVR Spatial Mixed Reality Headset",
    slug: "aerovr-spatial-headset",
    sku: "AERO-VR-SPATIAL",
    price: 89900,
    categoryId: 12,
    categorySlug: "wearables-watches",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=80",
    description: "Dual 4K micro-OLED displays with eye-tracking, real-time spatial 3D audio, and ultra-low latency color passthrough for work and entertainment."
  },

  // Category 4: Power & Travel Gear
  {
    name: "VoltStream 140W GaN Desktop Fast Charger",
    slug: "voltstream-140w-gan-charger",
    sku: "VOLT-STREAM-140W",
    price: 7900,
    categoryId: 13,
    categorySlug: "power-travel",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80",
    description: "Ultra-compact Gallium Nitride 4-port fast charger capable of powering two MacBook Pros and two iPhones simultaneously with smart power distribution."
  },
  {
    name: "MagCharge 3-in-1 Foldable Travel Station",
    slug: "magcharge-3in1-travel-station",
    sku: "MAG-CHARGE-3IN1",
    price: 9900,
    categoryId: 13,
    categorySlug: "power-travel",
    image: "https://images.unsplash.com/photo-1609592807664-885f67b57fa4?auto=format&fit=crop&w=1000&q=80",
    description: "MagSafe certified magnetic wireless charging station for iPhone, Apple Watch, and AirPods in premium aerospace aluminum folding design."
  },
  {
    name: "Nomad Pro Weatherproof Commuter Backpack",
    slug: "nomad-pro-waterproof-backpack",
    sku: "NOMAD-PRO-BPK",
    price: 16500,
    categoryId: 13,
    categorySlug: "power-travel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    description: "Weatherproof recycled Cordura backpack with dedicated padded 16\" laptop compartment, luggage pass-through strap, and concealed passport pocket."
  },
  {
    name: "MagPower 25,000mAh 100W Laptop Power Bank",
    slug: "magpower-25000-power-bank",
    sku: "MAG-POWER-25K",
    price: 11900,
    categoryId: 13,
    categorySlug: "power-travel",
    image: "https://images.unsplash.com/photo-1609592807869-7d0e4f4838b9?auto=format&fit=crop&w=1000&q=80",
    description: "High-capacity external battery with smart real-time OLED power readout, 100W Power Delivery USB-C output, and airline carry-on flight approval."
  }
];

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function seed() {
  console.log("Seeding comprehensive e-commerce catalog...");

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. Create or update Collections
  for (const cat of categories) {
    const existing = await getQuery("SELECT id FROM collection WHERE id = ?", [cat.id]);
    if (!existing) {
      await runQuery(
        `INSERT INTO collection (id, createdAt, updatedAt, isRoot, position, isPrivate, filters, inheritFilters, featuredAssetId, parentId)
         VALUES (?, ?, ?, 0, ?, 0, '[]', 1, NULL, 1)`,
        [cat.id, now, now, cat.id]
      );
      await runQuery(
        `INSERT INTO collection_translation (id, createdAt, updatedAt, languageCode, name, slug, description, baseId)
         VALUES (?, ?, ?, 'en', ?, ?, ?, ?)`,
        [cat.id, now, now, cat.name, cat.slug, cat.description, cat.id]
      );
      await runQuery(
        `INSERT OR IGNORE INTO collection_channels_channel (collectionId, channelId)
         VALUES (?, 1)`,
        [cat.id]
      );
      await runQuery(
        `INSERT OR IGNORE INTO collection_closure (id_ancestor, id_descendant)
         VALUES (1, ?)`,
        [cat.id]
      );
      await runQuery(
        `INSERT OR IGNORE INTO collection_closure (id_ancestor, id_descendant)
         VALUES (?, ?)`,
        [cat.id, cat.id]
      );
    } else {
      await runQuery(
        `UPDATE collection_translation SET name = ?, slug = ?, description = ? WHERE baseId = ? AND languageCode = 'en'`,
        [cat.name, cat.slug, cat.description, cat.id]
      );
    }
  }

  // 2. Clean old test products (IDs 1 to 50) and insert fresh catalog
  console.log("Setting up products, assets, variants, and search index...");
  await runQuery("DELETE FROM search_index_item");
  await runQuery("DELETE FROM collection_product_variants_product_variant WHERE collectionId >= 10");

  let pId = 100;
  let vId = 100;
  let aId = 100;

  for (const p of products) {
    pId++;
    vId++;
    aId++;

    // Insert Asset
    await runQuery(
      `INSERT OR REPLACE INTO asset (id, createdAt, updatedAt, type, mimeType, width, height, fileSize, source, preview, focalPoint)
       VALUES (?, ?, ?, 'IMAGE', 'image/jpeg', 1000, 1000, 200000, ?, ?, NULL)`,
      [aId, now, now, p.image, p.image]
    );
    await runQuery(
      `INSERT OR IGNORE INTO asset_channels_channel (assetId, channelId) VALUES (?, 1)`,
      [aId]
    );

    // Insert Product
    await runQuery(
      `INSERT OR REPLACE INTO product (id, createdAt, updatedAt, enabled, featuredAssetId)
       VALUES (?, ?, ?, 1, ?)`,
      [pId, now, now, aId]
    );
    await runQuery(
      `INSERT OR REPLACE INTO product_translation (id, createdAt, updatedAt, languageCode, name, slug, description, baseId)
       VALUES (?, ?, ?, 'en', ?, ?, ?, ?)`,
      [pId, now, now, p.name, p.slug, p.description, pId]
    );
    await runQuery(
      `INSERT OR IGNORE INTO product_channels_channel (productId, channelId) VALUES (?, 1)`,
      [pId]
    );
    await runQuery(
      `INSERT OR REPLACE INTO product_asset (id, createdAt, updatedAt, assetId, position, productId)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [pId, now, now, aId, pId]
    );

    // Insert Product Variant
    await runQuery(
      `INSERT OR REPLACE INTO product_variant (id, createdAt, updatedAt, enabled, sku, outOfStockThreshold, useGlobalOutOfStockThreshold, trackInventory, featuredAssetId, taxCategoryId, productId)
       VALUES (?, ?, ?, 1, ?, 0, 1, 'INHERIT', ?, 1, ?)`,
      [vId, now, now, p.sku, aId, pId]
    );
    await runQuery(
      `INSERT OR REPLACE INTO product_variant_translation (id, createdAt, updatedAt, languageCode, name, baseId)
       VALUES (?, ?, ?, 'en', 'Default', ?)`,
      [vId, now, now, vId]
    );
    await runQuery(
      `INSERT OR REPLACE INTO product_variant_price (id, createdAt, updatedAt, currencyCode, channelId, price, variantId)
       VALUES (?, ?, ?, 'USD', 1, ?, ?)`,
      [vId, now, now, p.price, vId]
    );
    await runQuery(
      `INSERT OR IGNORE INTO product_variant_channels_channel (productVariantId, channelId) VALUES (?, 1)`,
      [vId]
    );

    // Assign to Collection
    await runQuery(
      `INSERT OR IGNORE INTO collection_product_variants_product_variant (collectionId, productVariantId)
       VALUES (?, ?)`,
      [p.categoryId, vId]
    );

    // Populate search_index_item directly so search/featured products work instantaneously!
    await runQuery(
      `INSERT INTO search_index_item (
        languageCode, enabled, productName, productVariantName, description, slug, sku,
        facetIds, facetValueIds, collectionIds, collectionSlugs, channelIds,
        productPreview, productPreviewFocalPoint, productVariantPreview, productVariantPreviewFocalPoint,
        inStock, productInStock, productVariantId, channelId, productId, productAssetId, productVariantAssetId,
        price, priceWithTax
       ) VALUES (
        'en', 1, ?, 'Default', ?, ?, ?,
        '', '', ?, ?, ',1,',
        ?, NULL, ?, NULL,
        1, 1, ?, 1, ?, ?, ?,
        ?, ?
       )`,
      [
        p.name,
        p.description,
        p.slug,
        p.sku,
        `,${p.categoryId},`,
        `,${p.categorySlug},`,
        p.image,
        p.image,
        vId,
        pId,
        aId,
        aId,
        p.price,
        p.price
      ]
    );
  }

  // Update Global Settings
  const heroImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=80";
  await runQuery(
    `UPDATE global_settings SET 
      customFieldsHerotitle = ?,
      customFieldsHerosubtitle = ?,
      customFieldsHerobanner = ?,
      customFieldsHerolink = ?,
      customFieldsPromotext = ?,
      customFieldsPromolink = ?
     WHERE id = 1`,
    [
      "Experience Next-Gen Sound & Design",
      "Curated flagship audio, mechanical workspace gear, and precision EDC engineered for creators.",
      heroImage,
      "/search",
      "SPRING EVENT: Up to 35% off flagship audio & tech essentials. Free worldwide shipping on orders over $50.",
      "/search"
    ]
  );

  console.log(`Successfully seeded ${products.length} products and ${categories.length} categories!`);
  db.close();
}

seed().catch(err => {
  console.error("Seed error:", err);
  db.close();
});
