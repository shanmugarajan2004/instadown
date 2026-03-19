'use strict';

const { Router } = require('express');
const { validateInstagramUrl, normaliseUrl } = require('../utils/urlValidator');
const { streamVideo } = require('../services/ytdlp');
const logger = require('../utils/logger');

const router = Router();

router.get('/', (req, res) => {
  const { url, format_id } = req.query;

  if (!url) return res.status(400).json({ error: 'url query param required.' });

  if (!validateInstagramUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL. Provide a public Instagram post, reel, or IGTV link.',
    });
  }

  const clean = normaliseUrl(url);
  logger.info(`[download] streaming ${clean} format_id=${format_id || 'best'}`);

  streamVideo(clean, res, format_id);
});

module.exports = router;
