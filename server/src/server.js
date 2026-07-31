require('dotenv').config();

// Vercel semver bundling is now handled by includeFiles in vercel.json


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Vercel বা অন্য কোনো রিভার্স প্রক্সির পেছনে থাকার কারণে ট্রাস্ট প্রক্সি অন করা হলো
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL || 'https://people-esheba.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // লোকাল ডেভেলপমেন্ট সহজ করার জন্য আপাতত ট্রু রাখা হলো
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 200 : 30,    // প্রোডাকশনে রিয়েল ইউজারদের জন্য সামান্য বাড়ানো হলো (30)
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => isDev && req.ip === '::1',
  validate: { trustProxy: false },
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 500,
  skip: (req) => isDev && req.ip === '::1',
  validate: { trustProxy: false },
}));

// ── Body Parsing (Vercel রিকোয়েস্ট লিমিট অনুযায়ী ফিক্সড) ───────
app.use(express.json({ limit: '4.5mb' }));
app.use(express.urlencoded({ extended: true, limit: '4.5mb' }));

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Static Uploads (Vercel serverless environment এ কাজ করবে না, তাই বন্ধ করা হলো) ──
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'People E-Sheba API is running 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api', routes);

// ── Serve Client Static Files & SPA Fallback ──────────────────
const clientDistPath = path.join(__dirname, '../../client/dist');
const hasClientDist = fs.existsSync(clientDistPath);

if (hasClientDist) {
  app.use(express.static(clientDistPath));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  if (hasClientDist) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    res.json({
      success: true,
      message: 'People E-Sheba API Server is running 🚀',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
// Vercel serverless environment-এ app.listen() কল করা যাবে না

// ── Automated Web Scraper (Cron Job) ──────────────────────────
const cron = require('node-cron');
const { runScrapers } = require('./services/scraperService');
const { runJobScrapers } = require('./services/jobScraperService');

// Schedule task to run every 12 hours for notices
cron.schedule('0 */12 * * *', async () => {
  console.log('[Cron] Running scheduled automated notice scrapers...');
  await runScrapers();
});

// Schedule task to run every 6 hours for jobs
cron.schedule('0 */6 * * *', async () => {
  console.log('[Cron] Running scheduled automated job scrapers...');
  await runJobScrapers();
});

// Run it once immediately when the server starts in dev mode for testing (Optional)
if (process.env.NODE_ENV !== 'production') {
  // setTimeout(() => runScrapers(), 5000); // Wait 5s then test scrape
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 People E-Sheba API`);
    console.log(`   → http://localhost:${PORT}`);
    console.log(`   → Health: http://localhost:${PORT}/health`);
    console.log(`   → ENV: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;