# OS Guardian — Live Demonstration Troubleshooting & Fallback Guide

**Purpose:** Comprehensive troubleshooting, recovery procedures, and examiner fallback options for live demonstrations on Windows environments.  
**Version:** OS Guardian v1.0.0  

---

## 1. Quick Diagnostic Triage

If anything unexpected occurs during a live demonstration, run this immediate health check:

```powershell
# In PowerShell:
$backend = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -ErrorAction SilentlyContinue
if ($backend.status -eq "healthy") {
    Write-Host "Backend is OPERATIONAL" -ForegroundColor Green
} else {
    Write-Host "Backend is NOT responding" -ForegroundColor Red
}
```

---

## 2. Common Demo Issues & Rapid Solutions

### Issue 1: Port Collision on 8000 (Backend) or 5173 (Frontend)
- **Symptom:** `run_windows.ps1` warns: `Port 8000 is already in use` or Vite starts on `5174` instead of `5173`.
- **Root Cause:** A previous terminal session or background server is still occupying the port.
- **Fix:**
  ```powershell
  # Check which process holds port 8000:
  Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object OwningProcess

  # Force kill processes occupying either port:
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force -ErrorAction SilentlyContinue
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force -ErrorAction SilentlyContinue
  ```

### Issue 2: PowerShell Execution Policy Blocks Scripts
- **Symptom:** `File ... cannot be loaded because running scripts is disabled on this system.`
- **Fix:** Always invoke scripts with `-ExecutionPolicy Bypass`:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\run_windows.ps1
  powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
  ```

### Issue 3: Python Environment Missing Dependencies
- **Symptom:** `ModuleNotFoundError: No module named 'fastapi'` or `ModuleNotFoundError: No module named 'backend'`.
- **Fix:**
  ```powershell
  $env:PYTHONPATH="."
  .\backend\venv\Scripts\python -m pip install -r backend\requirements.txt
  ```

### Issue 4: Frontend Shows Disconnected or Blank Screen
- **Symptom:** Browser loads `http://127.0.0.1:5173`, but shows red "Backend Disconnected" badge or components fail to render.
- **Checks:**
  1. Open browser DevTools (`F12`) -> Console: verify WebSocket connection to `ws://127.0.0.1:8000/ws/simulation`.
  2. Confirm backend is running at `http://127.0.0.1:8000/docs`.
  3. If Vite built files are stale, trigger a hard refresh in Chrome/Edge: `Ctrl + Shift + R`.

### Issue 5: Benchmark Export Fails or Doesn't Trigger Download
- **Symptom:** Clicking "CSV" or "Report (.md)" on the Experiments page doesn't save a file.
- **Fix / Direct Download:**
  Navigate directly in your browser address bar to:
  - CSV Export: `http://127.0.0.1:8000/api/experiments/export/csv`
  - Markdown Report: `http://127.0.0.1:8000/api/experiments/export/report`
  The browser will directly download the stream from the FastAPI backend.

---

## 3. Fallback Plan (Headless Demonstration Mode)

If the graphical browser cannot be displayed (e.g., projector issues, browser incompatibility, or video conference bandwidth constraints), switch to **Headless Console Demonstration**:

```powershell
# 1. Run the headless end-to-end verification script
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

The script will:
1. Run all 22 backend automated unit tests and report `100% PASSED`.
2. Execute the 7 deterministic benchmark scenarios in headless mode and output the comparative markdown table directly to the console.
3. Validate the frontend production TypeScript bundle.

Examiners can inspect:
- `docs/BENCHMARK_VERIFICATION.md` — for mathematical proofs and percentage recalculations.
- `docs/VIVA_PREPARATION.md` — for 38 comprehensive oral defense questions and answers.
- `docs/PROJECT_REPORT.md` — for complete system architecture and empirical discussion.
