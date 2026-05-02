const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const pool = require('../db');
const { getIo } = require('../socket');

function emitSafe(event, data) {
  try { getIo().emit(event, data); } catch {}
}

// Store uploads in memory — we save to DB, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 50, fileSize: 10 * 1024 * 1024, fieldSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.originalname)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

async function compressBuffer(buffer, quality = 80) {
  try {
    return await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  } catch {
    return buffer; // fallback: store original
  }
}

async function autoSync() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM images');
  console.log(`✅ DB has ${rows[0].count} images.`);
}

// GET /api/image-library
router.get('/image-library', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    const total = parseInt(countRows[0].count);

    // Exclude binary data from list query for performance
    const { rows: images } = await pool.query(
      `SELECT id, image_url, "order", is_used, used_at, file_size, compressed_size, mime_type
       FROM images ORDER BY "order" ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      images: images.map(img => ({
        id: img.id,
        imageUrl: `/api/image/${img.id}`,
        compressedUrl: `/api/compressed-image/${img.id}`,
        order: img.order,
        isUsed: img.is_used,
        usedAt: img.used_at,
        fileSize: img.file_size,
        compressedSize: img.compressed_size,
      })),
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load image library', details: err.message });
  }
});

// GET /api/image/:id — serve original from DB
router.get('/image/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT mime_type, image_data FROM images WHERE id = $1',
      [req.params.id]
    );
    const img = rows[0];
    if (!img || !img.image_data) return res.status(404).json({ error: 'Image not found' });

    res.set('Content-Type', img.mime_type || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*'); // Explicit CORS for binary data
    res.send(img.image_data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to serve image', details: err.message });
  }
});

// GET /api/compressed-image/:id — serve compressed from DB
router.get('/compressed-image/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT mime_type, compressed_data, image_data FROM images WHERE id = $1',
      [req.params.id]
    );
    const img = rows[0];
    if (!img) return res.status(404).json({ error: 'Image not found' });

    const data = img.compressed_data || img.image_data;
    if (!data) return res.status(404).json({ error: 'Image data not found' });

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*'); // Explicit CORS for binary data
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to serve compressed image', details: err.message });
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
      const originalBuffer = file.buffer;
      const compressedBuffer = await compressBuffer(originalBuffer, 80);

      const { rows } = await pool.query(
        `INSERT INTO images
           (image_url, mime_type, "order", is_used, used_at,
            file_size, compressed_size, image_data, compressed_data, created_at)
         VALUES ($1,$2,$3,false,null,$4,$5,$6,$7,NOW()) RETURNING id, "order", file_size, compressed_size`,
        [
          '/api/image/tmp',
          file.mimetype,
          nextOrder++,
          originalBuffer.length,
          compressedBuffer.length,
          originalBuffer,
          compressedBuffer,
        ]
      );
      const img = rows[0];
      await pool.query('UPDATE images SET image_url=$1 WHERE id=$2', [`/api/image/${img.id}`, img.id]);
      saved.push(img);
    }

    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    emitSafe('uploadProgress', { completed: saved.length, total: req.files.length });
    emitSafe('libraryUpdate', { total: parseInt(countRows[0].count), newImages: saved.length });

    res.json({
      message: `Successfully uploaded ${saved.length} photo${saved.length > 1 ? 's' : ''}.`,
      files: saved.map(img => ({
        imageUrl: `/api/image/${img.id}`,
        compressedUrl: `/api/compressed-image/${img.id}`,
        fileSize: img.file_size,
        compressedSize: img.compressed_size,
      })),
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// POST /api/sync-images — remove invalid rows, reorder, emit syncComplete
router.post('/sync-images', async (req, res) => {
  try {
    // Delete rows with no image binary data (old disk-based uploads)
    const { rowCount: removed } = await pool.query(
      'DELETE FROM images WHERE image_data IS NULL'
    );

    // Reorder remaining sequentially
    const { rows: valid } = await pool.query('SELECT id FROM images ORDER BY "order" ASC');
    for (let i = 0; i < valid.length; i++) {
      await pool.query('UPDATE images SET "order"=$1 WHERE id=$2', [i + 1, valid[i].id]);
    }

    // Clamp studio state index
    const { rows: stateRows } = await pool.query('SELECT * FROM studio_state LIMIT 1');
    if (stateRows[0]) {
      const safeIndex = valid.length === 0 ? -1 : Math.min(stateRows[0].current_index, valid.length - 1);
      await pool.query('UPDATE studio_state SET current_index=$1 WHERE id=$2', [safeIndex, stateRows[0].id]);
    }

    const total = valid.length;
    const message = `Sync complete: ${total} images in DB${removed > 0 ? `, ${removed} invalid removed` : ''}.`;

    emitSafe('syncComplete', { total, removed, message });
    emitSafe('libraryUpdate', { total });

    res.json({ message, total, removed });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// DELETE /api/image/:id
router.delete('/image/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM images WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Image not found' });
    const { rows } = await pool.query('SELECT COUNT(*) FROM images');
    emitSafe('libraryUpdate', { total: parseInt(rows[0].count) });
    res.json({ message: 'Image deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image', details: err.message });
  }
});

// DELETE /api/images/:id — delete and reorder
router.delete('/images/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM images WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Image not found' });

    // Reorder remaining sequentially to close the gap
    const { rows: remaining } = await pool.query('SELECT id FROM images ORDER BY "order" ASC');
    for (let i = 0; i < remaining.length; i++) {
      await pool.query('UPDATE images SET "order"=$1 WHERE id=$2', [i + 1, remaining[i].id]);
    }

    const total = remaining.length;

    // Clamp studio state
    const { rows: stateRows } = await pool.query('SELECT * FROM studio_state LIMIT 1');
    if (stateRows[0]) {
      const safeIndex = total === 0 ? -1 : Math.min(stateRows[0].current_index, total - 1);
      await pool.query('UPDATE studio_state SET current_index=$1 WHERE id=$2', [safeIndex, stateRows[0].id]);
      emitSafe('stateUpdate', { currentIndex: safeIndex, total });
    }

    emitSafe('libraryUpdate', { total });
    res.json({ message: 'Image deleted.', total });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

// GET /api/images — stats
router.get('/images', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_used) as used FROM images`
    );
    const total = parseInt(rows[0].total);
    const used = parseInt(rows[0].used);
    const { rows: nextRows } = await pool.query(
      `SELECT "order" FROM images WHERE is_used=false ORDER BY "order" ASC LIMIT 1`
    );
    res.json({ total, used, remaining: total - used, nextImageOrder: nextRows[0]?.order || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed', details: err.message });
  }
});

// GET /api/next-image
router.get('/next-image', async (req, res) => {
  try {
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    const total = parseInt(countRows[0].count);
    if (total === 0) return res.status(404).json({ error: 'No images found.' });

    let { rows } = await pool.query(
      `SELECT id, "order" FROM images WHERE is_used=false ORDER BY "order" ASC LIMIT 1`
    );
    if (!rows[0]) {
      await pool.query('UPDATE images SET is_used=false, used_at=null');
      ({ rows } = await pool.query(
        `SELECT id, "order" FROM images WHERE is_used=false ORDER BY "order" ASC LIMIT 1`
      ));
    }

    const img = rows[0];
    await pool.query('UPDATE images SET is_used=true, used_at=NOW() WHERE id=$1', [img.id]);
    const { rows: remRows } = await pool.query('SELECT COUNT(*) FROM images WHERE is_used=false');
    res.json({ imageUrl: `/api/image/${img.id}`, order: img.order, remaining: parseInt(remRows[0].count), total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get image', details: err.message });
  }
});

// POST /api/reset-images
router.post('/reset-images', async (req, res) => {
  try {
    const { rowCount } = await pool.query('UPDATE images SET is_used=false, used_at=null');
    res.json({ message: `Cycle reset. ${rowCount} images ready from #1.` });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed', details: err.message });
  }
});

module.exports = { router, autoSync };
