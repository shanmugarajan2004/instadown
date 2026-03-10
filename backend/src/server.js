'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const logger       = require('./utils/logger');
const rateLimiter  = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const healthRouter   = require('./routes/health');
const fetchRouter    = require('./routes/fetch');
const downloadRouter = require('./routes/download');

/* ─── App ─────────────────────────────────────────────────────────────────── */
const app  = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

/* ─── CORS ────────────────────────────────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);           // curl / Postman / SSR
      if (allowedOrigins.includes(origin)) return cb(null, true);
      logger.warn(`[CORS] blocked: ${origin}`);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false,
  })
);
app.options('*', cors());                           // preflight

/* ─── Helmet — CSP OFF (JSON API only, no HTML served) ───────────────────── */
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

/* ─── Body parsing ────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

/* ─── Logging ─────────────────────────────────────────────────────────────── */
app.use(morgan('combined', { stream: { write: (m) => logger.info(m.trim()) } }));

/* ─── Rate limiting (in-memory, no Redis) ────────────────────────────────── */
app.use('/api/', rateLimiter);

/* ─── Routes ──────────────────────────────────────────────────────────────── */
app.use('/health',        healthRouter);
app.use('/api/fetch',     fetchRouter);
app.use('/api/download',  downloadRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

/* ─── Start ───────────────────────────────────────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅  Backend  →  http://localhost:${PORT}`);
  logger.info(`   Origins  :  ${allowedOrigins.join(', ')}`);
  logger.info(`   yt-dlp   :  ${process.env.YTDLP_PATH || 'yt-dlp'}`);
  logger.info(`   Node     :  ${process.version}`);
});

module.exports = app;
