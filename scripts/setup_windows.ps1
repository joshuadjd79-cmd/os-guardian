# OS Guardian - Windows Setup Script
# Initializes Python virtual environment and installs backend and frontend dependencies

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   OS GUARDIAN - WINDOWS DEPENDENCY SETUP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName

# 1. Setup Backend Python Virtual Environment
Write-Host "`n[1/3] Setting up Python virtual environment in backend/venv..." -ForegroundColor Yellow
$BackendDir = Join-Path $WorkspaceRoot "backend"
$VenvDir = Join-Path $BackendDir "venv"

if (-not (Test-Path $VenvDir)) {
    python -m venv $VenvDir
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create Python virtual environment. Ensure Python 3.10+ is installed and on PATH."
        exit 1
    }
}

$PipPath = Join-Path $VenvDir "Scripts\pip.exe"
Write-Host "Installing Python backend dependencies from requirements.txt..." -ForegroundColor Yellow
$ReqFile = Join-Path $BackendDir "requirements.txt"
& $PipPath install -r $ReqFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend pip installation failed."
    exit 1
}
Write-Host "Backend dependencies successfully installed!" -ForegroundColor Green

# 2. Setup Frontend Node Dependencies
Write-Host "`n[2/3] Installing frontend dependencies..." -ForegroundColor Yellow
$FrontendDir = Join-Path $WorkspaceRoot "frontend"
Push-Location $FrontendDir
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend npm install failed. Ensure Node.js v18+ is installed."
        exit 1
    }
}
finally {
    Pop-Location
}
Write-Host "Frontend dependencies successfully installed!" -ForegroundColor Green

# 3. Verification of build
Write-Host "`n[3/3] Validating frontend build..." -ForegroundColor Yellow
Push-Location $FrontendDir
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build validation failed."
        exit 1
    }
}
finally {
    Pop-Location
}
Write-Host "Frontend production bundle built successfully!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "OS Guardian setup complete! Run scripts/run_windows.ps1 to start." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
