#!/bin/bash

# EduScore AI - Development Startup Script for Linux/macOS

echo ""
echo "================================================"
echo "    EduScore AI - Development Environment"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH"
    echo "Please install Python 3.9+ and add it to PATH"
    exit 1
fi

# Check if Node.js/npm is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ and add it to PATH"
    exit 1
fi

echo "[INFO] Python version:"
python3 --version

echo "[INFO] Node version:"
node --version

echo ""
echo "Starting EduScore AI development environment..."
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "[INFO] Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Start backend in background
echo "[INFO] Starting FastAPI backend server..."
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2

# Install frontend dependencies if needed
cd frontend
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing Node dependencies..."
    npm install > /dev/null 2>&1
fi

# Start frontend in background
echo "[INFO] Starting Vite development server..."
npm run dev &
FRONTEND_PID=$!

sleep 2

cd ..

echo ""
echo "================================================"
echo "    Development servers are starting..."
echo "================================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for both processes
wait
