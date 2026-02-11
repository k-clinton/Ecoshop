const mysql = require('mysql2/promise');
require('dotenv').config();

const migration = `
USE ${process.env.DB_NAME || 'ecoshop_db'};

-- Create pending_registrations table if not exists
CREATE TABLE IF NOT EXISTS pending_registrations (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  verification_code VARCHAR(6) NOT NULL,
  code_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_verification_code (verification_code),
  INDEX idx_code_expires_at (code_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired pending registrations (older than 1 day)
DELETE FROM pending_registrations WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);
`;

async function runMigration() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ecoshop_db',
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Execute migration
    await connection.query(migration);

    console.log('✅ Migration completed successfully!');
    console.log('✅ pending_registrations table created');
    console.log('✅ Expired pending registrations cleaned up');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
