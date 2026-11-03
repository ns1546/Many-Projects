import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('vendure.sqlite');

async function run() {
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            console.log('1. Updating global_settings custom fields...');
            db.run(`
                UPDATE global_settings 
                SET customFieldsHerotitle = 'Experience Next-Gen Sound & Design',
                    customFieldsHerosubtitle = 'Discover studio-tuned acoustics, CNC mechanical keyboards, and aerospace titanium wearables built for creators who demand excellence.',
                    customFieldsHerobanner = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop',
                    customFieldsHerolink = '/search',
                    customFieldsPromotext = 'SPRING EVENT: Up to 35% off flagship audio & tech essentials. Use code TECH20 for an extra 20% off.',
                    customFieldsPromolink = '/search',
                    trackInventory = 0
                WHERE id = 1
            `);

            console.log('2. Setting product_variant trackInventory to FALSE for all variants...');
            db.run(`UPDATE product_variant SET trackInventory = 'FALSE', enabled = 1`);

            console.log('3. Inserting/updating stock_level records with 500 units for all variants...');
            db.all(`SELECT id FROM product_variant`, (err, variants) => {
                if (err) {
                    console.error('Error selecting variants:', err);
                    return;
                }
                const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
                for (const v of variants) {
                    db.run(`
                        INSERT INTO stock_level (createdAt, updatedAt, stockOnHand, stockAllocated, productVariantId, stockLocationId)
                        VALUES (?, ?, 500, 0, ?, 1)
                        ON CONFLICT(productVariantId, stockLocationId) DO UPDATE SET stockOnHand = 500, stockAllocated = 0
                    `, [now, now, v.id], (err2) => {
                        if (err2) {
                            // If table doesn't have unique constraint, check if exists
                            db.all(`SELECT id FROM stock_level WHERE productVariantId = ?`, [v.id], (err3, existing) => {
                                if (existing && existing.length > 0) {
                                    db.run(`UPDATE stock_level SET stockOnHand = 500, stockAllocated = 0 WHERE productVariantId = ?`, [v.id]);
                                } else {
                                    db.run(`INSERT INTO stock_level (createdAt, updatedAt, stockOnHand, stockAllocated, productVariantId, stockLocationId) VALUES (?, ?, 500, 0, ?, 1)`, [now, now, v.id]);
                                }
                            });
                        }
                    });
                }
            });

            console.log('4. Assigning featuredAssetId to Collections...');
            db.run(`UPDATE collection SET featuredAssetId = 101 WHERE id = 10`); // Audio & Sound
            db.run(`UPDATE collection SET featuredAssetId = 105 WHERE id = 11`); // Computing & Desk
            db.run(`UPDATE collection SET featuredAssetId = 109 WHERE id = 12`); // Wearables & Watches
            db.run(`UPDATE collection SET featuredAssetId = 113 WHERE id = 13`); // Power & Travel
            db.run(`UPDATE collection SET featuredAssetId = 101 WHERE id = 2`);  // Electronics

            console.log('5. Ensuring search_index_item has inStock = 1...');
            db.run(`UPDATE search_index_item SET inStock = 1, productInStock = 1`);

            setTimeout(() => {
                console.log('Database updates completed successfully!');
                resolve(true);
            }, 1000);
        });
    });
}

run().catch(console.error);
