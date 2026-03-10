'use strict';

/**
 * Returns true if the URL is a public Instagram post / reel / IGTV.
 */
function validateInstagramUrl(url) {
  if (!url || typeof url !== 'string') return false;
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }

  const validHosts = ['www.instagram.com', 'instagram.com'];
  if (!validHosts.includes(parsed.hostname)) return false;

  const patterns = [
    /^\/p\/[\w-]+\/?$/,
    /^\/reel\/[\w-]+\/?$/,
    /^\/reels\/[\w-]+\/?$/,
    /^\/tv\/[\w-]+\/?$/,
    /^\/[\w.]+\/p\/[\w-]+\/?$/,
    /^\/[\w.]+\/reel\/[\w-]+\/?$/,
    /^\/[\w.]+\/tv\/[\w-]+\/?$/,
  ];

  return patterns.some((re) => re.test(parsed.pathname));
}

/**
 * Strip query-string tracking params — keeps yt-dlp calls clean.
 */
function normaliseUrl(url) {
  try {
    const p = new URL(url.trim());
    return p.origin + p.pathname.replace(/\/$/, '');
  } catch {
    return url.trim();
  }
}

module.exports = { validateInstagramUrl, normaliseUrl };
