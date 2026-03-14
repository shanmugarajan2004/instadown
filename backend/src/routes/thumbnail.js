'use strict';

const { Router } = require('express');
const https = require('https');
const http  = require('http');
const logger = require('../utils/logger');

const router = Router();

/* Proxy Instagram thumbnails to avoid hotlink/CORS blocks */
router.get('/', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  let decoded;
  try {
    decoded = decodeURIComponent(url);
    new URL(decoded); // validate
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  // Only allow CDN domains
  const allowed = [
    'cdninstagram.com',
    'instagram.com',
    'fbcdn.net',
    'facebook.com',
    'scontent',
  ];
  const isAllowed = allowed.some((d) => decoded.includes(d));
  if (!isAllowed) return res.status(403).json({ error: 'Domain not allowed' });

  logger.info(`[thumbnail] proxying ${decoded.slice(0, 80)}...`);

  const client = decoded.startsWith('https') ? https : http;

  const proxyReq = client.get(
    decoded,
    {
      headers: {
        'User-Agent':  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':     'https://www.instagram.com/',
        'Accept':      'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      timeout: 10000,
    },
    (proxyRes) => {
      if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
        // Follow one redirect
        const location = proxyRes.headers['location'];
        if (location) {
          return res.redirect(`/api/thumbnail?url=${encodeURIComponent(location)}`);
        }
      }

      if (proxyRes.statusCode !== 200) {
        return res.status(proxyRes.statusCode || 502).json({ error: 'Upstream error' });
      }

      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    logger.error(`[thumbnail] proxy error: ${err.message}`);
    if (!res.headersSent) res.status(502).json({ error: 'Failed to fetch thumbnail' });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'Thumbnail fetch timed out' });
  });
});

module.exports = router;
