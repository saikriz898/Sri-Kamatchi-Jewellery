require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const pool = require('./db');
const { router: imageRoutes, autoSync } = require('./routes/imageRoutes');
const priceRoutes = require('./routes/priceRoutes');
const socketManager = require('./socket');
const { init: initImages } = require('./models/Image');
const { init: initPrices } = require('./models/Price');
const { init: initStudio } = require('./models/StudioState');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(compression());
socketManager.init(server);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', imageRoutes);
app.use('/api', priceRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL (Neon) connected');
    await initImages();
    await initPrices();
    await initStudio();
    await autoSync();
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

start();
