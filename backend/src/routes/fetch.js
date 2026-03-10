'use strict';

const { Router } = require('express');
const { validateInstagramUrl, normaliseUrl } = require('../utils/urlValidator');
const { fetchMetadata } = require('../services/ytdlp');
const logger = require('../utils/logger');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: 'url is required.' });

    if (!validateInstagramUrl(url)) {
      return res.status(400).json({
        error:
          'Invalid URL. Please paste a public Instagram post, reel, or IGTV link.',
      });
    }

    const clean = normaliseUrl(url);
    logger.info(`[fetch] ${clean}`);

    const meta = await fetchMetadata(clean);

    /* Build a clean, predictable response shape */
    const formats = buildFormats(meta);

    return res.json({
      id: meta.id || '',
      title: meta.title || meta.description || 'Instagram Video',
      description: meta.description || '',
      thumbnail:
        meta.thumbnail ||
        (Array.isArray(meta.thumbnails) && meta.thumbnails.length
          ? meta.thumbnails[meta.thumbnails.length - 1].url
          : null),
      duration: meta.duration || 0,
      uploader: meta.uploader || meta.channel || '',
      upload_date: meta.upload_date || '',
      view_count: meta.view_count || 0,
      like_count: meta.like_count || 0,
      webpage_url: meta.webpage_url || clean,
      formats,
    });
  } catch (err) {
    logger.error(`[fetch] ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

/* Pick the best combined video+audio formats */
function buildFormats(meta) {
  const formats = [];

  if (Array.isArray(meta.formats)) {
    const combined = meta.formats
      .filter((f) => f.url && f.vcodec !== 'none' && f.acodec !== 'none')
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    // Deduplicate by height, keep best bitrate per height
    const seen = new Set();
    for (const f of combined) {
      const key = f.height || 'unknown';
      if (seen.has(key)) continue;
      seen.add(key);
      formats.push({
        quality: f.height ? `${f.height}p` : 'Best',
        url: f.url,
        ext: f.ext || 'mp4',
        filesize: f.filesize || f.filesize_approx || null,
      });
      if (formats.length >= 3) break; // max 3 quality options
    }
  }

  // Fallback: top-level url
  if (formats.length === 0 && meta.url) {
    formats.push({
      quality: 'Best',
      url: meta.url,
      ext: meta.ext || 'mp4',
      filesize: meta.filesize || null,
    });
  }

  return formats;
}

module.exports = router;
