@echo off
SETLOCAL EnableDelayedExpansion

REM Get root directory
SET "ROOT_DIR=%cd%"
SET "LOGS_DIR=%ROOT_DIR%\logs"

IF NOT EXIST "%LOGS_DIR%" MKDIR "%LOGS_DIR%"

echo ==========================================
echo   EduScore AI - Windows Startup Script
echo ==========================================

REM --- 1. Python Environment Setup ---
IF NOT EXIST "backend\.venv" (
    echo Creating virtual environment in backend\.venv...
    python -m venv backend\.venv
)

echo Activating virtual environment...
CALL backend\.venv\Scripts\activate.bat

echo Installing backend dependencies...
pip install --upgrade pip > "%LOGS_DIR%\pip_upgrade.log" 2>&1
pip install "git+https://github.com/pydantic/pydantic.git" > "%LOGS_DIR%\pydantic_install.log" 2>&1
pip install -r backend\requirements.txt > "%LOGS_DIR%\install.log" 2>&1
pip install celery > NUL 2>&1

REM --- 2. Environment Variables ---
SET MONGODB_URL=mongodb://localhost:27018
SET REDIS_URL=redis://localhost:6379/0
SET MINIO_ENDPOINT=localhost:9000
SET MINIO_ACCESS_KEY=minioadmin
SET MINIO_SECRET_KEY=minioadmin
SET MINIO_SECURE=false

REM --- 3. Start Infrastructure (Assumes tools are in PATH or local) ---
echo.
echo [NOTE] This script assumes you have MongoDB, Redis, and MinIO installed or running via Docker.
echo If you want to run EVERYTHING via Docker, use 'docker-compose up' instead.
echo.

REM --- 4. Start Application ---
echo Starting Backend (FastAPI)...
start "EduScore Backend" /D "backend" cmd /c "%ROOT_DIR%\backend\.venv\Scripts\uvicorn app.main:app --reload --port 8000"

echo Starting Celery Worker...
start "EduScore Worker" /D "backend" cmd /c "%ROOT_DIR%\backend\.venv\Scripts\celery -A app.workers.celery_app:celery_app worker --loglevel=info --pool=solo"

echo Starting Frontend...
start "EduScore Frontend" /D "frontend" cmd /c "npm run dev"

echo.
echo Services passed to background windows.
echo Check the new terminal windows for logs.
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000/docs
echo.
pause
