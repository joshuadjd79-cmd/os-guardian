# OS Guardian — Verification, Testing & Empirical Results

**Verification Date:** 2026-10-28  
**Verification Target:** OS Guardian v1.0.0  
**Test Environment:** Windows 11, Python 3.13.2, Node.js v22.14.0, npm 10.9.2  

---

## 1. Automated Test Execution Summary

The test suite was executed using Pytest on the backend and Vite production compilation on the frontend.

| Test Category | Test File | Tests Count | Status | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **API & Endpoints** | `backend/tests/test_api.py` | 3 | **PASSED** | Health, step/state, benchmark export |
| **Anomaly Detector** | `backend/tests/test_detector.py` | 2 | **PASSED** | Sliding window, duplicate alert suppression |
| **Mathematical Models** | `backend/tests/test_metrics.py` | 3 | **PASSED** | Hand-calculated TAT, WT, RT, Jain's fairness, zero guards |
| **Recovery Engine** | `backend/tests/test_recovery.py` | 2 | **PASSED** | Multi-criteria scoring, regression rollback |
| **Scheduler Algorithms** | `backend/tests/test_schedulers.py` | 4 | **PASSED** | FCFS, SJF, RR quantum preemption, Priority aging |
| **Simulation Core** | `backend/tests/test_simulation_engine.py` | 4 | **PASSED** | Idle intervals, simultaneous arrivals, duplicate PIDs, reset |
| **Frontend Production Build** | `frontend/ (npm run build)` | 1 | **PASSED** | Clean Vite + TypeScript build (0 errors) |
| **Total Automated Tests** | | **18 / 18** | **100% PASSED** | **0 failed, 0 skipped** |

---

## 2. Command Lines Executed for Verification

```powershell
# 1. Run Python Backend Test Suite with Pytest
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests -v

# 2. Run Headless Simulation Verification Script
.\backend\venv\Scripts\python .\scripts\verify_headless.py

# 3. Compile Frontend Production Bundle
cd frontend
npm run build

# 4. End-to-End Verification Wrapper
powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1
```

---

## 3. Verified Empirical Benchmark Measurements (Seed = 42)

All benchmark runs compare a fixed baseline policy against OS Guardian's adaptive self-healing scheduler on the exact same workload and initial seed. Complete mathematical audits and percentage recalculations are detailed in [BENCHMARK_VERIFICATION.md](BENCHMARK_VERIFICATION.md).

```
Scenario A: Balanced Standard Workload (N = 5 processes, mixed CPU/IO bursts)
  Baseline (FCFS):
    - Average Waiting Time: 23.60 ticks
    - Average Turnaround Time: 37.60 ticks
    - Average Response Time: 20.00 ticks
    - Throughput: 0.0625 processes/tick
    - Final Jain's Fairness: 1.000
  Adaptive Self-Healing:
    - Average Waiting Time: 23.20 ticks (-1.7%)
    - Average Turnaround Time: 37.20 ticks (-1.1%)
    - Average Response Time: 10.40 ticks (-48.0% responsiveness improvement)
    - Throughput: 0.0625 processes/tick
    - Final Jain's Fairness: 1.000
    - Recovery Overhead: 10 actions (10 discrete ticks)

Scenario B: Sustained CPU Saturation (N = 4 long compute tasks)
  Baseline (FCFS):
    - Completed: 3/4 tasks (Elapsed: 120t)
    - Average Waiting Time: 36.00 ticks
    - Average Response Time: 36.00 ticks
    - Jain's Fairness Index: 0.9643
  Adaptive Self-Healing:
    - Completed: 2/4 tasks (Elapsed: 120t)
    - Average Response Time: 3.00 ticks (-91.7% latency reduction)
    - Jain's Fairness Index: 0.9900 (+2.67% relative, +2.57 pp)
    - Average Waiting Time: 63.50 ticks (+76.4% due to fair round-robin sharing)
    - Recovery Overhead: 15 actions (15 discrete ticks)

Scenario C: Memory Pressure & Buffer Saturation (N = 4 tasks, 1220 MB requested / 1024 MB cap)
  Baseline:
    - Peak Memory Utilization: 100.0% (Buffer backlog saturates memory)
    - Memory Reclaimed: 0 MB
  Adaptive Self-Healing:
    - Peak Memory Utilization: 78.12% (-21.9% relief, stayed within safety threshold)
    - Total Memory Allocated: Reduced from 1220 MB requested to 800 MB (-34.4%)
    - Process Terminations: 0 (100% non-destructive reclamation)
    - Outcome: SUCCESS

Scenario D: Starvation Vulnerability (Priority-Skewed Workload)
  Baseline (Strict Priority without Aging):
    - Process 305 (Starved low-priority job) Waiting Time: 85 ticks before dispatch
    - Active Contention Fairness (Tick 25): 0.200
  Adaptive Self-Healing:
    - Process 305 dispatched at Tick 21 via Priority Boost + Dynamic Aging
    - Process 305 Waiting Time: 60 ticks (-29.4% delay reduction for starved job)
    - Active Contention Fairness (Tick 25): 0.795 (+0.595 points, +297%)
    - Final Batch Completion Fairness: 1.000 (all jobs eventually completed)
    - Starvation eliminated

Scenario E: Staggered Arrival Timing (N = 4 tasks arriving across 32 ticks)
  Baseline (FCFS):
    - Average Waiting Time: 4.25 ticks
    - Average Turnaround Time: 14.75 ticks
  Adaptive Self-Healing:
    - Average Waiting Time: 3.50 ticks (-17.6%)
    - Average Turnaround Time: 14.00 ticks (-5.1%)
    - Recovery Overhead: 5 actions (5 discrete ticks)

Scenario F: Zero-Workload Idle Boundary Case (N = 0)
    - Verified complete mathematical safety against division-by-zero, NaN, or exceptions.

Scenario G: Regression Test Case (Ultra-short bursts, 3 ticks each)
  Baseline (FCFS):
    - Average Waiting Time: 4.00 ticks
  Adaptive Self-Healing:
    - Average Waiting Time: 4.00 ticks (Delta: 0.0%)
    - Outcome: Reversibility verified; pre-action configuration restored on regression.
```

---

## 4. Known Limitations & Boundaries
1. **Single-Core Architecture:** The current scheduler model executes one running process per tick. Multi-core SMP scheduling is a planned future extension.
2. **Discrete Clock Granularity:** Overhead is quantized to integer ticks (1 tick minimum). Sub-tick microsecond context switches are modeled through integer tick penalties.
3. **In-Memory Volatility:** Simulation snapshots persist during browser sessions and can be exported as CSV/JSON, but full state reloads from persistent disk databases are not currently stored.
