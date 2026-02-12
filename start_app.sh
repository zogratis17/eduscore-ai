#!/bin/bash
ROOT_DIR=$(pwd)
LOGS_DIR="$ROOT_DIR/logs"
mkdir -p "$LOGS_DIR"

# --- 1. Python Environment Setup ---
# Source Rust environment for wheel building
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

if [ ! -d "backend/.venv" ]; then
    echo "Creating virtual environment in backend/.venv..."
    python3 -m venv backend/.venv
fi

echo "Activating virtual environment..."
source backend/.venv/bin/activate

echo "Installing backend dependencies..."
pip install --upgrade pip > "$LOGS_DIR/pip_upgrade.log" 2>&1
# Attempt to install bleeding edge pydantic for Python 3.14 support
pip install "git+https://github.com/pydantic/pydantic.git" > "$LOGS_DIR/pydantic_install.log" 2>&1

pip install -r backend/requirements.txt > "$LOGS_DIR/install.log" 2>&1
# Install missing celery if not in requirements (it was in the file I saw, but just in case)
pip install celery > /dev/null 2>&1 

# --- 2. Environment Variables ---
export MONGODB_URL="mongodb://localhost:27018"
export REDIS_URL="redis://localhost:6379/0"
export MINIO_ENDPOINT="localhost:9000"
export MINIO_ACCESS_KEY="minioadmin"
export MINIO_SECRET_KEY="minioadmin"
export MINIO_SECURE="false"

# --- 3. Start Infrastructure ---
echo "Starting MongoDB (Port 27018)..."
nohup mongod --port 27018 --dbpath ./data/db --logpath "$LOGS_DIR/mongo.log" --fork > /dev/null 2>&1

echo "Starting Redis..."
nohup redis-server --daemonize yes > /dev/null 2>&1

echo "Starting MinIO..."
nohup ./minio server ./data/minio --address ":9000" --console-address ":9001" > "$LOGS_DIR/minio.log" 2>&1 &

# --- 4. Start Application ---
echo "Starting Backend (FastAPI)..."
# Use absolute paths via $ROOT_DIR
(cd backend && nohup "$ROOT_DIR/backend/.venv/bin/uvicorn" app.main:app --reload --port 8000 > "$LOGS_DIR/backend.log" 2>&1 &)

echo "Starting Celery Worker..."
(cd backend && nohup "$ROOT_DIR/backend/.venv/bin/celery" -A app.workers.celery_app:celery_app worker --loglevel=info > "$LOGS_DIR/celery.log" 2>&1 &)

echo "Starting Frontend..."
(cd frontend && nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &)

echo "Services launching. Logs at $LOGS_DIR"
