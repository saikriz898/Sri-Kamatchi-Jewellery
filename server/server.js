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

async function initializeDatabase() {
  try {
    console.log('⏳ Connecting to PostgreSQL (Neon)...');
    console.log('🔗 URL:', process.env.DATABASE_URL ? 'Defined (Hidden)' : 'MISSING');
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');

    console.log('⏳ Running database initializations...');
    console.log('   -> Initializing Images...');
    await initImages();
    console.log('   -> Initializing Prices...');
    await initPrices();
    console.log('   -> Initializing Studio State...');
    await initStudio();
    console.log('   -> Running AutoSync...');
    await autoSync();
    console.log('✅ All systems initialized');
  } catch (err) {
    console.error('❌ Database initialization failed!');
    console.error('   Error Name:', err.name);
    console.error('   Error Message:', err.message);
    console.error('   Error Stack:', err.stack);
    console.error('⚠️ The server is running but database-dependent features may fail.');
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  initializeDatabase();
});
