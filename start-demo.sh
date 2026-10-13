#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

REINSTALL=0
NO_INSTALL=0

usage() {
  cat <<'EOF'
Usage: ./start-demo.sh [options]

Starts the FastAPI backend (http://localhost:8000) and the Vite frontend
(http://localhost:5173), provisioning the Python venv and npm dependencies on
the first run so this is the only command you need.

Options:
  --reinstall   Recreate the backend venv and reinstall all dependencies
  --no-install  Never install anything; fail fast if a dependency is missing
  -h, --help    Show this help
EOF
}

for arg in "$@"; do
  case "$arg" in
    --reinstall) REINSTALL=1 ;;
    --no-install) NO_INSTALL=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; usage; exit 1 ;;
  esac
done

pick_python() {
  local candidate
  for candidate in python3.13 python3.12 python3.11; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

# --- Backend virtualenv -------------------------------------------------------
if [[ "$REINSTALL" == "1" && -d "$VENV_DIR" ]]; then
  echo "Removing existing backend venv (--reinstall)..."
  rm -rf "$VENV_DIR"
fi

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  if ! PYTHON_BIN="$(pick_python)"; then
    echo "Error: need Python 3.13, 3.12, or 3.11 (TensorFlow 2.21 has no wheels for Python 3.14)." >&2
    exit 1
  fi
  echo "Creating backend venv with $PYTHON_BIN..."
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

REQ_FILE="$BACKEND_DIR/requirements.txt"
STAMP="$VENV_DIR/.requirements.sha256"

if command -v shasum >/dev/null 2>&1; then
  REQ_HASH="$(shasum -a 256 "$REQ_FILE" | awk '{print $1}')"
else
  REQ_HASH="$(sha256sum "$REQ_FILE" | awk '{print $1}')"
fi

NEED_INSTALL=0
if [[ "$REINSTALL" == "1" ]]; then
  NEED_INSTALL=1
fi
if [[ ! -x "$VENV_DIR/bin/uvicorn" ]]; then
  NEED_INSTALL=1
fi
if [[ -f "$STAMP" && "$(cat "$STAMP")" != "$REQ_HASH" ]]; then
  NEED_INSTALL=1
fi

if [[ "$NEED_INSTALL" == "1" ]]; then
  if [[ "$NO_INSTALL" == "1" ]]; then
    echo "Error: backend dependencies are missing. Run:" >&2
    echo "  backend/.venv/bin/pip install -r backend/requirements.txt" >&2
    exit 1
  fi
  echo "Installing backend dependencies (first run downloads TensorFlow — this can take a while)..."
  "$VENV_DIR/bin/python" -m pip install --upgrade pip
  "$VENV_DIR/bin/pip" install -r "$REQ_FILE"
  echo "$REQ_HASH" > "$STAMP"
fi

# --- Frontend dependencies ----------------------------------------------------
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  if [[ "$NO_INSTALL" == "1" ]]; then
    echo "Error: frontend dependencies are missing. Run: npm --prefix frontend install" >&2
    exit 1
  fi
  echo "Installing frontend dependencies..."
  npm --prefix "$FRONTEND_DIR" install
fi

# --- Launch both servers ------------------------------------------------------
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo
  echo "Stopping servers..."
  if [[ -n "$FRONTEND_PID" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both."

(cd "$BACKEND_DIR" && exec "$VENV_DIR/bin/uvicorn" main:app --port 8000) &
BACKEND_PID=$!

"$FRONTEND_DIR/node_modules/.bin/vite" "$FRONTEND_DIR" &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
