const mysql = require('mysql2/promise');

// Load environment variables if they aren't loaded yet
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 18004,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

console.log(`[Database Connection] Host: ${poolConfig.host}, Port: ${poolConfig.port}, Database: ${poolConfig.database}`);

const pool = mysql.createPool(poolConfig);

module.exports = {
  query: (sql, params) => pool.query(sql, params),
  execute: (sql, params) => pool.execute(sql, params),
  getConnection: () => pool.getConnection(),
  end: () => pool.end(),
  pool: pool
};
