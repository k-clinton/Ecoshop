import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecoshop_db',
  waitForConnections: true,
  connectionLimit: 50, // Increased from 10 to handle more concurrent requests
  maxIdle: 10, // Maximum number of idle connections
  idleTimeout: 60000, // Close idle connections after 60 seconds
  queueLimit: 0, // No limit on queued connection requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export default pool;
