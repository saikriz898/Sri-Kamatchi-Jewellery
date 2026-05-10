const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageKit = require('@imagekit/nodejs');
const pool = require('../db');
const { getIo } = require('../socket');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

function emitSafe(event, data) {
  try { getIo().emit(event, data); } catch {}
}

async function reorderImages() {
  const { rows: valid } = await pool.query('SELECT id FROM images ORDER BY "order" ASC');
  for (let i = 0; i < valid.length; i++) {
    await pool.query('UPDATE images SET "order"=$1 WHERE id=$2', [i + 1, valid[i].id]);
  }
  return valid.length;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 50, fileSize: 25 * 1024 * 1024 }, // Increased for high-quality jewelry images
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

async function autoSync() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM images');
    console.log(`✅ Database Synced. ${rows[0].count} ImageKit assets indexed.`);
  } catch (err) {
    console.error('❌ Startup Sync Error:', err.message);
  }
}

// GET /api/image-library
router.get('/image-library', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    const total = parseInt(countRows[0].count);

    const { rows: images } = await pool.query(
      `SELECT id, image_url, "order" FROM images ORDER BY "order" ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      images: images.map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        // ImageKit automatic optimization via URL parameters
        compressedUrl: `${img.image_url}?tr=w-1200,q-80,f-auto`,
        order: img.order,
      })),
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('Library Load Error:', err);
    res.status(500).json({ error: 'Failed to load image library', details: err.message });
  }
});

// POST /api/upload-images
router.post('/upload-images', upload.array('photos', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No photos uploaded' });

    const { rows: maxRows } = await pool.query('SELECT MAX("order") as max FROM images');
    let nextOrder = (maxRows[0].max || 0) + 1;

    const saved = [];

    for (const file of req.files) {
      console.log(`⏳ Uploading ${file.originalname} (${file.size} bytes) to ImageKit...`);
      
      // Upload to ImageKit
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: '/jewellery/uploads',
        useUniqueFileName: true,
        tags: ['jewellery', 'gallery']
      });

      console.log(`✅ ImageKit Upload Success: ${uploadResponse.url}`);

      const { rows } = await pool.query(
        `INSERT INTO images (image_url, "order", created_at)
         VALUES ($1, $2, NOW()) RETURNING id, image_url, "order"`,
        [uploadResponse.url, nextOrder++]
      );
      saved.push(rows[0]);
    }

    console.log(`✅ Uploaded ${saved.length} images to ImageKit.`);
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    emitSafe('uploadProgress', { completed: saved.length, total: req.files.length });
    emitSafe('libraryUpdate', { total: parseInt(countRows[0].count), newImages: saved.length });

    res.json({
      message: `Successfully uploaded ${saved.length} photos to ImageKit.`,
      files: saved.map(img => ({
        id: img.id,
        imageUrl: img.image_url,
        compressedUrl: `${img.image_url}?tr=w-1200,q-80,f-auto`
      })),
    });
  } catch (err) {
    console.error('❌ UPLOAD CRASHED:', {
      message: err.message,
      stack: err.stack,
      imagekit_configured: !!process.env.IMAGEKIT_PRIVATE_KEY
    });
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// POST /api/sync-images — reorder, emit syncComplete
router.post('/sync-images', async (req, res) => {
  try {
    const total = await reorderImages();
    const message = `Sync complete: ${total} images indexed.`;
    emitSafe('syncComplete', { total, message });
    emitSafe('libraryUpdate', { total });
    res.json({ message, total });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// DELETE /api/images/:id
router.delete('/images/:id', async (req, res) => {
  try {
    const { rows: target } = await pool.query('SELECT image_url FROM images WHERE id=$1', [req.params.id]);
    if (!target[0]) return res.status(404).json({ error: 'Image not found' });

    // Note: We don't delete from ImageKit automatically here to avoid data loss, 
    // but you could use imagekit.deleteFile(fileId) if you store the fileId.
    
    await pool.query('DELETE FROM images WHERE id=$1', [req.params.id]);
    const total = await reorderImages();

    emitSafe('libraryUpdate', { total });
    res.json({ message: 'Image reference removed.', total });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

// GET /api/images — stats
router.get('/images', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM images`);
    res.json({ total: parseInt(rows[0].total) });
  } catch (err) {
    res.status(500).json({ error: 'Failed', details: err.message });
  }
});

module.exports = { router, autoSync };

