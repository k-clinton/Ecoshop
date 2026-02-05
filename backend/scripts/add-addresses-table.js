const mysql = require('mysql2/promise');
require('dotenv').config();

const schema = `
USE ${process.env.DB_NAME || 'ecoshop_db'};

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function addAddressesTable() {
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

    console.log('Connected to MySQL database');
    
    await connection.query(schema);
    
    console.log('Addresses table created successfully!');
    
  } catch (error) {
    console.error('Error adding addresses table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAddressesTable();
