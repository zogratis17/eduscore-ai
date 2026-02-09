# Start the Document Evaluation Engine

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting Document Evaluation Engine..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $null = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction Stop
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Cannot connect to MongoDB on localhost:27017" -ForegroundColor Yellow
    Write-Host "  Please ensure MongoDB is running before uploading documents." -ForegroundColor Gray
}

Write-Host "`nStarting FastAPI server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
