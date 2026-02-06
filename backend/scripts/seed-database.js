const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import mock data structure (we'll inline it here to avoid path issues)
// Import mock data structure from external file
const mockData = require('./full-data');

async function seedDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecoshop_db'
    });

    console.log('Connected to database');

    // Clear existing data (in correct order to respect foreign keys)
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM email_verification_codes');
    await connection.execute('DELETE FROM users');
    await connection.execute('DELETE FROM product_variants');
    await connection.execute('DELETE FROM product_tags');
    await connection.execute('DELETE FROM product_images');
    await connection.execute('DELETE FROM products');
    await connection.execute('DELETE FROM categories');
    console.log('✓ Cleared existing data');

    // Seed Categories
    console.log('Seeding categories...');
    for (const category of mockData.categories) {
      await connection.execute(
        'INSERT INTO categories (id, name, slug, image, description) VALUES (?, ?, ?, ?, ?)',
        [category.id, category.name, category.slug, category.image, category.description]
      );
    }
    console.log(`✓ Seeded ${mockData.categories.length} categories`);

    // Seed Products
    console.log('Seeding products...');
    for (const product of mockData.products) {
      // Insert product
      await connection.execute(
        `INSERT INTO products (id, name, slug, description, price, compare_at_price, category, featured, rating, review_count, stock, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.name,
          product.slug,
          product.description,
          product.price,
          product.compareAtPrice || null,
          product.category,
          product.featured,
          product.rating,
          product.reviewCount,
          product.stock,
          product.createdAt
        ]
      );

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
          [variant.id, product.id, variant.name, variant.sku, variant.price, variant.stock, variant.available]
        );
      }
    }
    console.log(`✓ Seeded ${mockData.products.length} products`);

    // Create default admin user
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('Admin@2024', 10);
    await connection.execute(
      `INSERT INTO users (id, email, password, name, role, email_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['user-admin', 'omondiclinn@gmail.com', hashedPassword, 'Admin User', 'admin', true]
    );
    console.log('✓ Created admin user (email: omondiclinn@gmail.com, password: Admin@2024)');

    console.log('\n✅ Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
