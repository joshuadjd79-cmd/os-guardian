# OS Guardian 2.0 — Local Setup & Verification Guide

This document provides exact, reproducible instructions for running OS Guardian on a local workstation.

---

## 1. System Prerequisites

- **Python:** 3.10, 3.11, 3.12, or 3.13 installed with `pip` on system PATH.
- **Node.js:** v18.0.0 or higher with `npm` on system PATH.
- **Git:** Installed on system PATH.
- **Operating System:** Windows 10/11, macOS, or Ubuntu/Debian Linux.

---

## 2. Quick-Start (Windows)

### Step 1: Clone Repository
```powershell
git clone https://github.com/joshuadjd79-cmd/os-guardian.git
cd os-guardian
```

### Step 2: One-Click Environment Setup
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup_windows.ps1
```
This script:
- Creates a Python virtual environment in `backend/venv/`
- Installs all dependencies from `backend/requirements.txt`
- Runs `npm install` inside `frontend/`

### Step 3: Launch Local Servers
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run_windows.ps1
```
This launches:
- **FastAPI Backend:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Frontend Dashboard:** [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 3. Quick-Start (Linux & macOS)

```bash
git clone https://github.com/joshuadjd79-cmd/os-guardian.git
cd os-guardian
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
chmod +x scripts/run_linux.sh
./scripts/run_linux.sh
```

---

## 4. Running Verification Checks

Execute the automated test suite:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```
Or individually:
```powershell
# Backend pytest suite (22 tests)
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Frontend Vite build check
cd frontend
npm run build
cd ..
```
