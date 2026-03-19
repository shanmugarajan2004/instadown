'use strict';

const { spawn } = require('child_process');
const logger = require('../utils/logger');

const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';
const TIMEOUT = parseInt(process.env.DOWNLOAD_TIMEOUT_MS || '180000', 10);

/* ─── Common yt-dlp flags ─────────────────────────────────────────────────── */
const BASE_FLAGS = [
  '--no-playlist',
  '--no-warnings',
  '--no-call-home',
  '--no-check-certificate',
];

/* ─── Fetch metadata ─────────────────────────────────────────────────────── */
function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    const args = [...BASE_FLAGS, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '--dump-json', url];
    logger.info(`[ytdlp] fetchMetadata → ${url}`);

    const proc = spawn(YTDLP, args, {
      timeout: TIMEOUT,
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d));
    proc.stderr.on('data', (d) => (stderr += d));

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.error(`[ytdlp] exit ${code}: ${stderr.slice(0, 400)}`);
        if (/[Pp]rivate|[Ll]ogin|[Aa]uth/.test(stderr))
          return reject(new Error('This post is private or requires login.'));
        if (/[Nn]o video|[Nn]ot found|[Uu]nsupported/.test(stderr))
          return reject(new Error('No downloadable video found at this URL.'));
        return reject(
          new Error('Could not fetch video info. The post may be private or deleted.')
        );
      }

      try {
        const data = JSON.parse(stdout.trim().split('\n')[0]);
        resolve(data);
      } catch (e) {
        reject(new Error('Failed to parse video metadata.'));
      }
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT')
        reject(
          new Error(
            'yt-dlp is not installed. Install it from https://github.com/yt-dlp/yt-dlp'
          )
        );
      else reject(err);
    });
  });
}

/* ─── Stream video to HTTP response ─────────────────────────────────────── */
function streamVideo(url, res, format_id) {
  let formatArg = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
  if (format_id && format_id !== 'best' && format_id !== 'bestvideo' && format_id !== 'unknown') {
    // Attempt the exact format. If it lacks audio, try merging bestaudio. Fallbacks applied.
    formatArg = `${format_id}+bestaudio/bestaudio+${format_id}/${format_id}/bestvideo+bestaudio/best`;
  }

  const tmpFile = path.join(os.tmpdir(), `instadown_${crypto.randomBytes(8).toString('hex')}.mp4`);

  const args = [
    ...BASE_FLAGS,
    '-f', formatArg,
    '--merge-output-format', 'mp4',
    '-o', tmpFile,
    url,
  ];
  logger.info(`[ytdlp] streamVideo → ${url} | format=${formatArg} | tmp=${tmpFile}`);

  const proc = spawn(YTDLP, args, {
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  let stderr = '';
  proc.stderr.on('data', (d) => (stderr += d));

  proc.on('close', (code) => {
    if (code !== 0) {
      logger.error(`[ytdlp] stream exit ${code}: ${stderr.slice(0, 300)}`);
      // Try to clean up if created
      fs.unlink(tmpFile, () => {});
      if (!res.headersSent) res.status(500).json({ error: 'Failed to download video.' });
    } else {
      // File downloaded successfully, stream to client
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename="instagram_video.mp4"');
      }

      const readStream = fs.createReadStream(tmpFile);
      readStream.pipe(res);

      readStream.on('close', () => {
        fs.unlink(tmpFile, (err) => {
          if (err) logger.error(`[ytdlp] failed to delete tmp file: ${err.message}`);
        });
      });

      readStream.on('error', (err) => {
        logger.error(`[ytdlp] read stream error: ${err.message}`);
        fs.unlink(tmpFile, () => {});
        if (!res.headersSent) res.status(500).json({ error: 'Failed to stream temp video.' });
        else res.end();
      });
    }
  });

  proc.on('error', (err) => {
    logger.error(`[ytdlp] proc error: ${err.message}`);
    fs.unlink(tmpFile, () => {});
    if (!res.headersSent) res.status(500).json({ error: err.message });
  });

  res.on('close', () => {
    // If client disconnects early
    proc.kill();
  });
}

module.exports = { fetchMetadata, streamVideo };
