# OS Guardian - Windows Launch Script
# Checks port availability and starts Backend (port 8000) and Frontend (port 5173)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   OS GUARDIAN - LAUNCHING LOCAL DEVELOPMENT SYSTEM" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"
$PythonExe = Join-Path $BackendDir "venv\Scripts\python.exe"

# 1. Port Check for 8000 and 5173
function Test-PortOccupied([int]$Port) {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return ($connections -ne $null)
}

if (Test-PortOccupied 8000) {
    Write-Warning "Port 8000 is already in use. Please terminate existing backend process or free port 8000."
    exit 1
}
if (Test-PortOccupied 5173) {
    Write-Warning "Port 5173 is already in use. Please terminate existing frontend process or free port 5173."
    exit 1
}

Write-Host "[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$BackendProcess = Start-Process -FilePath $PythonExe `
    -ArgumentList "-m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload" `
    -WorkingDirectory $WorkspaceRoot `
    -PassThru

Write-Host "[2/2] Starting Vite React Frontend on http://127.0.0.1:5173..." -ForegroundColor Yellow
$FrontendProcess = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory $FrontendDir `
    -PassThru

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " OS GUARDIAN IS NOW RUNNING!" -ForegroundColor Green
Write-Host " Frontend URL: http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host " Backend API:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host " Interactive Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host " Backend PID:  $($BackendProcess.Id)" -ForegroundColor DarkGray
Write-Host " Frontend PID: $($FrontendProcess.Id)" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "To stop OS Guardian, terminate the opened console windows or run:" -ForegroundColor Yellow
Write-Host "Stop-Process -Id $($BackendProcess.Id), $($FrontendProcess.Id) -Force" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
