const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Category mapping from frontend to backend IDs
const categoryMap = {
  'home': 'cat-home',
  'beauty': 'cat-beauty',
  'fashion': 'cat-eco-fashion',
  'kitchen': 'cat-kitchen',
  'appliances': 'cat-appliances',
  'books': 'cat-books',
  'sports': 'cat-sports',
  'phones': 'cat-phones',
  'clothes': 'cat-clothes',
  'bags': 'cat-bags',
  'watches': 'cat-watches',
  'health': 'cat-health',
  'computers': 'cat-computers'
};

async function seedMockProducts() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoshop_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('╔════════════════════════════════════════╗');
  console.log('║  Seeding Mock Products to Database    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Load products from JSON file
    const productsPath = path.join(__dirname, '../../tmp_rovodev_products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const mockProducts = JSON.parse(productsData);

    console.log(`Loaded ${mockProducts.length} products from JSON file\n`);

    let successCount = 0;
    let failCount = 0;

    for (const product of mockProducts) {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        const mappedCategory = categoryMap[product.category] || product.category;
        process.stdout.write(`[${product.id.padStart(2, '0')}] ${product.name.padEnd(40, ' ')} ... `);

        // Insert or update product
        await connection.execute(
          `INSERT INTO products (id, name, slug, description, price, compare_at_price, category,
                                 featured, rating, review_count, stock, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           name = VALUES(name), description = VALUES(description), price = VALUES(price),
           compare_at_price = VALUES(compare_at_price), featured = VALUES(featured),
           rating = VALUES(rating), review_count = VALUES(review_count), stock = VALUES(stock)`,
          [
            product.id, product.name, product.slug, product.description,
            product.price, product.compareAtPrice || null, mappedCategory,
            product.featured ? 1 : 0, product.rating, product.reviewCount,
            product.stock, product.createdAt
          ]
        );

        // Delete existing related data for clean insert
        await connection.execute('DELETE FROM product_images WHERE product_id = ?', [product.id]);
        await connection.execute('DELETE FROM product_tags WHERE product_id = ?', [product.id]);
        await connection.execute('DELETE FROM product_variants WHERE product_id = ?', [product.id]);

        // Insert images
        for (let i = 0; i < product.images.length; i++) {
          await connection.execute(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
            [product.id, product.images[i], i]
          );
        }

        // Insert tags
        for (const tag of product.tags) {
          await connection.execute(
            'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
            [product.id, tag]
          );
        }

        // Insert variants
        for (const variant of product.variants) {
          await connection.execute(
            `INSERT INTO product_variants (id, product_id, name, sku, price, stock, available)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              variant.id, product.id, variant.name, variant.sku,
              variant.price, variant.stock, variant.available ? 1 : 0
            ]
          );
        }

        await connection.commit();
        console.log('✓');
        successCount++;

      } catch (error) {
        await connection.rollback();
        console.log(`✗ (${error.message})`);
        failCount++;
      } finally {
        connection.release();
      }
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║  ✅ Seeding Complete!                  ║`);
    console.log(`║  Success: ${successCount.toString().padEnd(28, ' ')} ║`);
    console.log(`║  Failed:  ${failCount.toString().padEnd(28, ' ')} ║`);
    console.log('╚════════════════════════════════════════╝\n');
    
    await pool.end();

  } catch (error) {
    console.error('\n❌ Error seeding mock products:', error);
    process.exit(1);
  }
}

seedMockProducts();

/*
 * NOTE: This script requires tmp_rovodev_products.json file
 * 
 * To regenerate the JSON from mockData.ts, run:
 * 
 * python3 tmp_rovodev_extract_all.py
 * 
 * Or manually update the mockProducts array in this file with your products.
 */
