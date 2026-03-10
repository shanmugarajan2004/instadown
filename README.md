# InstaDown — Instagram Video Downloader

A full-stack Instagram video downloader.
**Frontend:** Next.js 14 + TypeScript + Tailwind  
**Backend:** Express + yt-dlp (no Redis, no reCAPTCHA)

---

## Quick Start (2 terminals)

### Prerequisites
You need **Node.js 18+** and **yt-dlp** installed.

```bash
# macOS
brew install yt-dlp ffmpeg

# Ubuntu / Debian
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
sudo apt install ffmpeg -y

# Windows
winget install yt-dlp
# also install ffmpeg and add both to PATH
```

---

### Option A — One command (Mac/Linux)

```bash
chmod +x start.sh
./start.sh
```

### Option B — Two terminals

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm run dev
# ✅ Backend running → http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
# ✅ Frontend running → http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## Verify backend is working

```bash
curl http://localhost:4000/health
# {"status":"ok","uptime":5,"timestamp":"..."}
```

---

## Project Structure

```
instadown/
│
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app entry point
│   │   ├── routes/
│   │   │   ├── health.js          # GET  /health
│   │   │   ├── fetch.js           # POST /api/fetch   → returns metadata JSON
│   │   │   └── download.js        # GET  /api/download → streams video
│   │   ├── services/
│   │   │   └── ytdlp.js           # yt-dlp spawn wrapper
│   │   ├── middleware/
│   │   │   ├── rateLimiter.js     # in-memory rate limit (no Redis)
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── logger.js
│   │       └── urlValidator.js    # validates Instagram URLs
│   ├── .env                       # local config (pre-filled)
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # ← main UI (downloader)
│   │   ├── globals.css
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── dmca/page.tsx
│   ├── .env.local                 # NEXT_PUBLIC_API_URL=http://localhost:4000
│   ├── next.config.js             # CSP allows localhost:4000
│   ├── tailwind.config.js
│   └── package.json
│
├── start.sh                       # one-command startup
└── README.md
```

---

## API Reference

### `GET /health`
```json
{ "status": "ok", "uptime": 12, "timestamp": "2026-01-01T00:00:00.000Z" }
```

### `POST /api/fetch`
```
Content-Type: application/json
Body: { "url": "https://www.instagram.com/reel/ABC123/" }
```
Response:
```json
{
  "id": "ABC123",
  "title": "...",
  "thumbnail": "https://scontent.cdninstagram.com/...",
  "duration": 30,
  "uploader": "someuser",
  "formats": [
    { "quality": "720p", "url": "https://...", "ext": "mp4", "filesize": 5242880 }
  ]
}
```

### `GET /api/download?url=<instagram_url>`
Streams the video as `video/mp4` with `Content-Disposition: attachment`.

---

## What was fixed vs the original broken version

| Bug | Fix |
|-----|-----|
| `ioredis` / `MaxRetriesPerRequestError` crashing backend | Removed Redis + ioredis entirely |
| `rate-limit-redis` crash on startup | Removed — using `express-rate-limit` memory store |
| reCAPTCHA `Invalid site key` / blocking fetch | Removed reCAPTCHA entirely |
| CSP `connect-src` missing `localhost:4000` | Fixed — `connect-src 'self' http://localhost:4000` added |
| `"Failed to fetch"` browser error | Fixed by CSP + better error message |
| `next` version `16.1.6` (doesn't exist) | Pinned to stable `14.2.5` |
| TypeScript errors from `react-google-recaptcha` | Removed that package |
| Helmet CSP on API server blocking responses | `contentSecurityPolicy: false` on API (JSON only) |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Cannot connect to backend at http://localhost:4000" | Run `cd backend && npm run dev` |
| "yt-dlp is not installed" | Install yt-dlp (see Prerequisites) |
| "This post is private or requires login" | Only public content is supported |
| Video downloads as 0 bytes | Update yt-dlp: `yt-dlp -U` |
| CORS error in browser console | Check `backend/.env` has `ALLOWED_ORIGINS=http://localhost:3000` |
