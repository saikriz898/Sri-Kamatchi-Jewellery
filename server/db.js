const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 10, // Neon free tier limit
  connectionTimeoutMillis: 30000, // Increased to 30s for Neon cold start
  idleTimeoutMillis: 30000,
});

module.exports = pool;
