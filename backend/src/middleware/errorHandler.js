'use strict';

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  logger.error(`[errorHandler] ${status} — ${err.message}`);
  if (!res.headersSent) res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorHandler;
