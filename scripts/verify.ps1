# OS Guardian - Verification Script
# Executes Python test suite, checks invariants, validates production build, and runs benchmark simulations.

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   OS GUARDIAN - AUTOMATED VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"
$PythonExe = Join-Path $BackendDir "venv\Scripts\python.exe"

# 1. Run Pytest backend test suite
Write-Host "`n[1/3] Executing Backend Pytest Suite (Unit, Mathematical, & Invariants)..." -ForegroundColor Yellow
$env:PYTHONPATH = $WorkspaceRoot
& $PythonExe -m pytest "$BackendDir\tests" -v
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend test suite failed!"
    exit 1
}
Write-Host "Backend test suite passed 100%!" -ForegroundColor Green

# 2. Run Headless Simulation Benchmark Verification
Write-Host "`n[2/3] Verifying End-to-End Simulation Benchmarks & Reporting..." -ForegroundColor Yellow
$VerifyScript = Join-Path $WorkspaceRoot "scripts\verify_headless.py"
& $PythonExe $VerifyScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "Headless simulation benchmark verification failed!"
    exit 1
}
Write-Host "Headless simulation verification completed successfully!" -ForegroundColor Green

# 3. Validate Frontend Production Build & TypeScript Checking
Write-Host "`n[3/3] Validating Frontend TypeScript Compilation & Vite Build..." -ForegroundColor Yellow
Push-Location $FrontendDir
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend compilation or build failed!"
        exit 1
    }
}
finally {
    Pop-Location
}
Write-Host "Frontend build validated cleanly!" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ALL OS GUARDIAN VERIFICATION CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
