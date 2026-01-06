@echo off
REM EduScore AI - Development Startup Script for Windows

echo.
echo ================================================
echo    EduScore AI - Development Environment
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ and add it to PATH
    pause
    exit /b 1
)

REM Check if Node.js/npm is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and add it to PATH
    pause
    exit /b 1
)

echo [INFO] Python version:
python --version

echo [INFO] Node version:
node --version

echo.
echo Starting EduScore AI development environment...
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1

REM Start backend in a new window
echo [INFO] Starting FastAPI backend server...
start cmd /k "cd server && uvicorn main:app --reload --host 0.0.0.0 --port 8000 2>&1 | findstr /v 'INFO WARNING'"

timeout /t 2 /nobreak

REM Install frontend dependencies if needed
cd frontend
if not exist "node_modules" (
    echo [INFO] Installing Node dependencies...
    npm install >nul 2>&1
)

REM Start frontend in a new window
echo [INFO] Starting Vite development server...
start cmd /k "npm run dev"

timeout /t 2 /nobreak

cd ..

echo.
echo ================================================
echo    Development servers are starting...
echo ================================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C in each window to stop the servers
echo.
