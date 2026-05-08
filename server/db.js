const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 10, // Neon free tier limit
  connectionTimeoutMillis: 10000, // Wait 10s for compute to wake up
  idleTimeoutMillis: 30000,
});

module.exports = pool;
