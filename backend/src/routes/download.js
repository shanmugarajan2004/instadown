'use strict';

const { Router } = require('express');
const { validateInstagramUrl, normaliseUrl } = require('../utils/urlValidator');
const { streamVideo } = require('../services/ytdlp');
const logger = require('../utils/logger');

const router = Router();

router.get('/', (req, res) => {
  const { url, quality } = req.query;

  if (!url) return res.status(400).json({ error: 'url query param required.' });

  if (!validateInstagramUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL. Provide a public Instagram post, reel, or IGTV link.',
    });
  }

  const clean = normaliseUrl(url);
  logger.info(`[download] streaming ${clean} quality=${quality || 'best'}`);

  // Parse height from quality string e.g. "1080p" → 1080
  const height = quality ? parseInt(quality.replace('p', ''), 10) : null;

  streamVideo(clean, res, height);
});

module.exports = router;
