const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require' // Explicitly set to match Neon's expectation
  },
  max: 10,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
