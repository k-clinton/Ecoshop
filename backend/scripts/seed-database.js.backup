const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import mock data structure (we'll inline it here to avoid path issues)
const mockData = {
  categories: [
    { id: 'cat-eco-fashion', name: 'Eco Fashion', slug: 'eco-fashion', image: '/images/category-fashion.jpg', description: 'Sustainable and ethical clothing' },
    { id: 'cat-home', name: 'Home & Living', slug: 'home-living', image: '/images/category-home.jpg', description: 'Eco-friendly home essentials' },
    { id: 'cat-beauty', name: 'Beauty & Personal Care', slug: 'beauty', image: '/images/category-beauty.jpg', description: 'Natural and organic beauty products' },
    { id: 'cat-kitchen', name: 'Kitchen & Dining', slug: 'kitchen', image: '/images/category-kitchen.jpg', description: 'Sustainable kitchenware' },
    { id: 'cat-bags', name: 'Bags & Accessories', slug: 'bags', image: '/images/category-bags.jpg', description: 'Eco-friendly bags and accessories' },
    { id: 'cat-sports', name: 'Sports & Outdoors', slug: 'sports', image: '/images/category-sports.jpg', description: 'Sustainable sports equipment' },
    { id: 'cat-books', name: 'Books', slug: 'books', image: '/images/category-books.jpg', description: 'Books on sustainability' },
    { id: 'cat-appliances', name: 'Appliances', slug: 'appliances', image: '/images/category-appliances.jpg', description: 'Energy-efficient appliances' },
    { id: 'cat-health', name: 'Health & Wellness', slug: 'health', image: '/images/category-health.jpg', description: 'Natural health products' },
    { id: 'cat-phones', name: 'Phones & Accessories', slug: 'phones', image: '/images/category-phones.jpg', description: 'Eco-friendly phone accessories' },
    { id: 'cat-computers', name: 'Computers', slug: 'computers', image: '/images/category-computers.jpg', description: 'Sustainable tech accessories' },
    { id: 'cat-watches', name: 'Watches', slug: 'watches', image: '/images/category-watches.jpg', description: 'Eco-friendly watches' },
    { id: 'cat-clothes', name: 'Clothing', slug: 'clothing', image: '/images/category-clothes.jpg', description: 'Sustainable clothing' }
  ],
  products: [
    {
      id: 'prod-organic-tshirt',
      name: 'Organic Cotton T-Shirt',
      slug: 'organic-cotton-tshirt',
      description: 'Made from 100% organic cotton, this comfortable t-shirt is perfect for everyday wear. Sustainably sourced and ethically produced.',
      price: 29.99,
      compareAtPrice: 39.99,
      images: ['/images/product-tshirt.jpg'],
      category: 'cat-eco-fashion',
      tags: ['organic', 'cotton', 'sustainable', 'clothing'],
      variants: [
        { id: 'var-tshirt-s', name: 'Small', sku: 'TSHIRT-ORG-S', price: 29.99, stock: 50, available: true },
        { id: 'var-tshirt-m', name: 'Medium', sku: 'TSHIRT-ORG-M', price: 29.99, stock: 75, available: true },
        { id: 'var-tshirt-l', name: 'Large', sku: 'TSHIRT-ORG-L', price: 29.99, stock: 60, available: true },
        { id: 'var-tshirt-xl', name: 'X-Large', sku: 'TSHIRT-ORG-XL', price: 29.99, stock: 40, available: true }
      ],
      featured: true,
      rating: 4.5,
      reviewCount: 128,
      stock: 225,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    },
    {
      id: 'prod-bamboo-toothbrush',
      name: 'Bamboo Toothbrush Set',
      slug: 'bamboo-toothbrush-set',
      description: 'Eco-friendly bamboo toothbrush set of 4. Biodegradable and sustainable alternative to plastic toothbrushes.',
      price: 12.99,
      images: ['/images/product-toothbrush.jpg'],
      category: 'cat-beauty',
      tags: ['bamboo', 'eco-friendly', 'sustainable', 'oral-care'],
      variants: [
        { id: 'var-toothbrush-set', name: 'Set of 4', sku: 'TOOTH-BAM-4', price: 12.99, stock: 200, available: true }
      ],
      featured: true,
      rating: 4.8,
      reviewCount: 95,
      stock: 200,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    },
    {
      id: 'prod-reusable-water-bottle',
      name: 'Stainless Steel Water Bottle',
      slug: 'stainless-steel-water-bottle',
      description: 'Keep your drinks cold for 24 hours or hot for 12 hours with this insulated stainless steel bottle. BPA-free and eco-friendly.',
      price: 24.99,
      compareAtPrice: 34.99,
      images: ['/images/product-water-bottle.jpg'],
      category: 'cat-sports',
      tags: ['stainless-steel', 'reusable', 'insulated', 'water-bottle'],
      variants: [
        { id: 'var-bottle-500ml', name: '500ml', sku: 'BOTTLE-SS-500', price: 24.99, stock: 100, available: true },
        { id: 'var-bottle-750ml', name: '750ml', sku: 'BOTTLE-SS-750', price: 29.99, stock: 80, available: true },
        { id: 'var-bottle-1000ml', name: '1000ml', sku: 'BOTTLE-SS-1000', price: 34.99, stock: 60, available: true }
      ],
      featured: true,
      rating: 4.7,
      reviewCount: 203,
      stock: 240,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  ]
};

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

    // Seed Categories
    console.log('Seeding categories...');
    for (const category of mockData.categories) {
      await connection.execute(
        'INSERT INTO categories (id, name, slug, image, description) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
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
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price)`,
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
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE image_url=VALUES(image_url)',
          [product.id, product.images[i], i]
        );
      }

      // Insert tags
      for (const tag of product.tags) {
        await connection.execute(
          'INSERT INTO product_tags (product_id, tag) VALUES (?, ?) ON DUPLICATE KEY UPDATE tag=VALUES(tag)',
          [product.id, tag]
        );
      }

      // Insert variants
      for (const variant of product.variants) {
        await connection.execute(
          `INSERT INTO product_variants (id, product_id, name, sku, price, stock, available)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE price=VALUES(price), stock=VALUES(stock)`,
          [variant.id, product.id, variant.name, variant.sku, variant.price, variant.stock, variant.available]
        );
      }
    }
    console.log(`✓ Seeded ${mockData.products.length} products`);

    // Create default admin user
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      `INSERT INTO users (id, email, password, name, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=VALUES(email)`,
      ['user-admin', 'admin@ecoshop.com', hashedPassword, 'Admin User', 'admin']
    );
    console.log('✓ Created admin user (email: admin@ecoshop.com, password: admin123)');

    // Create default customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    await connection.execute(
      `INSERT INTO users (id, email, password, name, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=VALUES(email)`,
      ['user-customer', 'customer@ecoshop.com', customerPassword, 'Customer User', 'customer']
    );
    console.log('✓ Created customer user (email: customer@ecoshop.com, password: customer123)');

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
