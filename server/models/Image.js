const pool = require('../db');

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      file_path TEXT,
      compressed_path TEXT,
      mime_type TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      is_used BOOLEAN DEFAULT FALSE,
      used_at TIMESTAMPTZ,
      file_size INTEGER,
      compressed_size INTEGER,
      image_data BYTEA,
      compressed_data BYTEA,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_images_order ON images("order");
    CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC);
  `);

  // Migrate old schema: drop NOT NULL on file_path and compressed_path
  await pool.query(`ALTER TABLE images ALTER COLUMN file_path DROP NOT NULL`).catch(() => {});
  await pool.query(`ALTER TABLE images ALTER COLUMN compressed_path DROP NOT NULL`).catch(() => {});

  // Add BYTEA columns if missing
  await pool.query(`ALTER TABLE images ADD COLUMN IF NOT EXISTS image_data BYTEA`).catch(() => {});
  await pool.query(`ALTER TABLE images ADD COLUMN IF NOT EXISTS compressed_data BYTEA`).catch(() => {});
}

module.exports = { pool, init };
