const pool = require('../db');

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS studio_state (
      id SERIAL PRIMARY KEY,
      current_index INTEGER DEFAULT -1,
      last_generated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

module.exports = { pool, init };
