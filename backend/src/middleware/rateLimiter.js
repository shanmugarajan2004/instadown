'use strict';

const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
});
