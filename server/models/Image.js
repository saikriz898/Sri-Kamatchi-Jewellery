const pool = require('../db');

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_images_order ON images("order");
    CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC);
  `);
}

module.exports = { pool, init };
