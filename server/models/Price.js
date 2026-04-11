const pool = require('../db');

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      gold1g TEXT NOT NULL,
      gold8g TEXT NOT NULL,
      silver1g TEXT NOT NULL,
      date TEXT NOT NULL,
      price_drop_note TEXT DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

module.exports = { pool, init };
