#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# InstaDown — start backend + frontend with one command
# Usage:  chmod +x start.sh && ./start.sh
# ─────────────────────────────────────────────────────────────────
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Colour helpers
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()    { echo -e "${GREEN}[info]${NC} $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
err()     { echo -e "${RED}[error]${NC} $*"; exit 1; }

# ── Check yt-dlp ────────────────────────────────────────────────
if ! command -v yt-dlp &>/dev/null; then
  echo ""
  err "yt-dlp not found. Install it first:
  macOS  : brew install yt-dlp ffmpeg
  Linux  : sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \\
             -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
  Windows: winget install yt-dlp  (or: pip install yt-dlp)"
fi
info "yt-dlp $(yt-dlp --version)"

# ── Backend ─────────────────────────────────────────────────────
info "Installing backend dependencies…"
cd "$ROOT/backend"
npm install --prefer-offline --silent

info "Starting backend on port 4000…"
npm run dev &
BACKEND_PID=$!

# Wait for it to be ready
for i in {1..20}; do
  if curl -sf http://localhost:4000/health >/dev/null 2>&1; then
    info "Backend ready ✓"; break
  fi
  sleep 1
  if [ $i -eq 20 ]; then warn "Backend health check timed out — check logs above"; fi
done

# ── Frontend ────────────────────────────────────────────────────
info "Installing frontend dependencies…"
cd "$ROOT/frontend"
npm install --prefer-offline --silent

info "Starting frontend on port 3000…"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  InstaDown is running!${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "  Frontend  →  http://localhost:3000"
echo -e "  Backend   →  http://localhost:4000"
echo -e "  Health    →  http://localhost:4000/health"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop both services."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT TERM
wait
