const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getIo } = require('../socket');

function emitSafe(event, data) {
  try { getIo().emit(event, data); } catch {}
}

// GET /api/price
router.get('/price', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prices ORDER BY updated_at DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed', details: err.message });
  }
});

// POST /api/price — always upsert single row
router.post('/price', async (req, res) => {
  try {
    const { gold1g, gold8g, silver1g, date, priceDropNote } = req.body;

    // Delete all old rows, insert fresh one — simple single-row upsert
    await pool.query('DELETE FROM prices');
    const { rows } = await pool.query(
      `INSERT INTO prices (gold1g, gold8g, silver1g, date, price_drop_note, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
      [gold1g || '', gold8g || '', silver1g || '', date || '', priceDropNote || '']
    );
    const price = rows[0];
    emitSafe('priceUpdate', price);
    res.json(price);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// GET /api/studio-state
router.get('/studio-state', async (req, res) => {
  try {
    let { rows } = await pool.query('SELECT * FROM studio_state LIMIT 1');
    if (!rows[0]) {
      ({ rows } = await pool.query('INSERT INTO studio_state (current_index) VALUES (-1) RETURNING *'));
    }
    const state = rows[0];
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    const total = parseInt(countRows[0].count);
    const safeIndex = total === 0 ? -1 : Math.min(state.current_index, total - 1);
    if (safeIndex !== state.current_index)
      await pool.query('UPDATE studio_state SET current_index=$1 WHERE id=$2', [safeIndex, state.id]);
    res.json({ ...state, current_index: safeIndex, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed', details: err.message });
  }
});

// PUT /api/studio-state
router.put('/studio-state', async (req, res) => {
  try {
    const { currentIndex } = req.body;
    let { rows } = await pool.query('SELECT * FROM studio_state LIMIT 1');
    if (!rows[0]) {
      ({ rows } = await pool.query(
        'INSERT INTO studio_state (current_index) VALUES ($1) RETURNING *', [currentIndex]
      ));
    } else {
      ({ rows } = await pool.query(
        'UPDATE studio_state SET current_index=$1, last_generated_at=NOW() WHERE id=$2 RETURNING *',
        [currentIndex, rows[0].id]
      ));
    }
    const state = rows[0];
    const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM images');
    const total = parseInt(countRows[0].count);
    const displayIndex = total === 0 ? 0 : (currentIndex % total) + 1;
    emitSafe('stateUpdate', { currentIndex, total, displayIndex });
    res.json({ ...state, total, displayIndex });
  } catch (err) {
    res.status(500).json({ error: 'State update failed', details: err.message });
  }
});

module.exports = router;
