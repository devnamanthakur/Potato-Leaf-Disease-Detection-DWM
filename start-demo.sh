#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [ ! -x "$BACKEND_DIR/.venv/bin/uvicorn" ]; then
  echo "Backend venv missing. Run:"
  echo "  python3.13 -m venv backend/.venv"
  echo "  backend/.venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Frontend dependencies missing. Run: npm --prefix frontend install"
  exit 1
fi

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo
  echo "Stopping servers..."
  if [ -n "$FRONTEND_PID" ]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
  if [ -n "$BACKEND_PID" ]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both."

(cd "$BACKEND_DIR" && exec .venv/bin/uvicorn main:app --port 8000) &
BACKEND_PID=$!

"$FRONTEND_DIR/node_modules/.bin/vite" "$FRONTEND_DIR" &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
