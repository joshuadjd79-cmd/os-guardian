#!/usr/bin/env bash
# OS Guardian — Linux & GitHub Codespaces Runner

echo "=========================================================="
echo " Starting OS Guardian Simulator (Codespaces / Linux)     "
echo "=========================================================="

export PYTHONPATH=.

# Start FastAPI backend in background
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Frontend in background
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:5173 (PID: $FRONTEND_PID)"

echo "Press Ctrl+C to terminate both servers."
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
