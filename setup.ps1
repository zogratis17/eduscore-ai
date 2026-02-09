# Document Evaluation Engine - Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Document Evaluation Engine - Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Python installation
Write-Host "[1/5] Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "`n[2/5] Checking MongoDB connection..." -ForegroundColor Yellow
$mongoCheck = mongo --eval "db.version()" --quiet 2>&1
if ($?) {
    Write-Host "✓ MongoDB is accessible" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB not accessible. Please ensure MongoDB is running on localhost:27017" -ForegroundColor Yellow
    Write-Host "  You can start MongoDB with: mongod" -ForegroundColor Gray
}

# Install dependencies
Write-Host "`n[3/5] Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Download NLTK data
Write-Host "`n[4/5] Downloading NLTK data..." -ForegroundColor Yellow
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"
Write-Host "✓ NLTK data downloaded" -ForegroundColor Green

# Check .env file
Write-Host "`n[5/5] Checking configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✓ Configuration file found" -ForegroundColor Green
} else {
    Write-Host "⚠ No .env file found. Creating from example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ .env file created. Please review and update if needed." -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "To start the application, run:" -ForegroundColor White
Write-Host "  uvicorn app.main:app --reload`n" -ForegroundColor Cyan

Write-Host "Then open your browser to:" -ForegroundColor White
Write-Host "  http://localhost:8000`n" -ForegroundColor Cyan

Write-Host "API Documentation available at:" -ForegroundColor White
Write-Host "  http://localhost:8000/docs`n" -ForegroundColor Cyan
