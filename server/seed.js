require('dotenv').config();
const pool = require('./db');

const images = [
  'IMAGE 1.png','IMAGE 2.png','IMAGE 3.png','IMAGE 4.png',
  'IMAGE 5.png','IMAGE 6.png','IMAGE 7.png','IMAGE 8.png',
];

async function seed() {
  await pool.query('DELETE FROM images');
  for (let i = 0; i < images.length; i++) {
    await pool.query(
      `INSERT INTO images (image_url, file_path, "order", is_used, used_at) VALUES ($1,$2,$3,false,null)`,
      [`/uploads/${images[i]}`, `/uploads/${images[i]}`, i + 1]
    );
  }
  console.log(`✅ Seeded ${images.length} images`);
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
