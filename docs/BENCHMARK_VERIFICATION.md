# OS Guardian — Benchmark Verification & Empirical Mathematics Audit

**Document Status:** Complete & Verified  
**Date:** 2026-10-28  
**Simulator Version:** OS Guardian v1.0.0 (FastAPI + React 18)  
**Execution Environment:** Windows 11, Python 3.13.2, Seed: 42  

---

## 1. Executive Summary & Audit Mandate

An independent mathematical and runtime audit was conducted on every quantitative claim across the OS Guardian documentation, dashboard, and research reports. Previous project drafts contained illustrative numbers (e.g., Scenario A: -32.2% WT / +16.4% Fairness; Scenario B: -29.0% WT; Scenario C: -22.5% memory; Scenario D: 0.524 -> 0.984 Fairness; Scenario G: +40% WT). 

In accordance with strict academic integrity standards:
1. Every claim was tested against the actual simulation engine (`backend/app/simulation/engine.py`) and experiment runner (`backend/app/experiments/runner.py`).
2. Fabricated or illustrative numbers have been cataloged, investigated, and replaced with actual, reproducible empirical measurements.
3. Intermediate active-window metrics (e.g., peak memory, starvation window fairness) are mathematically distinguished from final batch-completion metrics.

---

## 2. Mathematical Metric Definitions & Percentage Conventions

### A. Jain's Fairness Index
$$J(x) = \frac{\left(\sum_{i=1}^n x_i\right)^2}{n \cdot \sum_{i=1}^n x_i^2}$$
- **Service Allocation Unit ($x_i$):** Normalized CPU service received per process:
  $$x_i = \frac{\text{cpu\_service\_received}_i}{\max(1, \text{burst\_time}_i)}$$
- **Boundary Conditions:**
  - $n = 0$ (no arrived processes): $J = 1.0$ (safe default).
  - $\sum x_i^2 = 0$ (all arrived processes have received 0 service): $J = 1.0$ (identically zero, perfectly equal).
  - Normal range: $J(x) \in [1/n, 1.0]$.
- **Batch Completion Property:** When all processes in a finite workload run to termination, $x_i = 1.0$ for all processes, yielding $J = 1.000$ at completion. Thus, fairness benefits of self-healing are observed *during active contention windows*.

### B. Percentage Formulas
- **Percentage Reduction:**
  $$\Delta_{\text{reduction}} = \left(\frac{\text{Baseline} - \text{Proposed}}{\text{Baseline}}\right) \times 100\%$$
- **Percentage Increase:**
  $$\Delta_{\text{increase}} = \left(\frac{\text{Proposed} - \text{Baseline}}{\text{Baseline}}\right) \times 100\%$$
- **Fairness Absolute Change (Percentage Points):**
  $$\Delta_{\text{pp}} = (\text{Proposed Fairness} - \text{Baseline Fairness}) \times 100$$
- **Fairness Relative Change (%):**
  $$\Delta_{\text{rel}} = \left(\frac{\text{Proposed Fairness} - \text{Baseline Fairness}}{\text{Baseline Fairness}}\right) \times 100\%$$
- **Zero-Denominator Rule:** If baseline $= 0$, percentage changes are labeled `N/A` (never divided by zero).

### C. Timing & Utilization Definitions
- **Turnaround Time ($TAT$):** $T_{\text{finish}} - T_{\text{arrival}}$
- **Waiting Time ($WT$):** Discrete ticks spent in the `READY` queue ($TAT - \text{Burst} - T_{\text{I/O}}$).
- **Response Time ($RT$):** $T_{\text{first\_dispatch}} - T_{\text{arrival}}$
- **Throughput:** $\frac{\text{Completed Processes}}{\text{Elapsed Simulation Ticks}}$
- **CPU Utilization:** $\frac{\text{CPU Busy Ticks}}{\text{Total Elapsed Ticks}} \times 100\%$
- **Peak Memory Utilization:** $\max_{t} \left(\frac{\text{Active Memory Used}_t}{\text{Memory Capacity}}\right) \times 100\%$
- **Recovery Overhead:** Discrete integer ticks injected when evaluating and applying interventions (1 tick per action).

---

## 3. Investigation of Previously Reported Claims

| Previously Reported Claim | Investigated Reality | Recalculated Measurement | Audit Verdict |
| :--- | :--- | :--- | :---: |
| **Scenario A:** 32.2% lower waiting time, 16.4% higher fairness | Baseline Avg WT = 23.6t, Adaptive Avg WT = 23.2t. Both finish with Fairness = 1.000. | WT reduced by **1.69%** (-0.4t). Final fairness delta is **0.0%**. | **UNSUPPORTED** (Corrected to -1.7% WT) |
| **Scenario B:** 29.0% lower waiting time | Baseline FCFS WT = 36.0t, Adaptive RR WT = 63.5t. RR shares CPU evenly, delaying completion of compute jobs. | WT increased by **+76.39%**. However, Response Time dropped from 36.0t to 3.0t (**-91.7%**). | **UNSUPPORTED** (Corrected to +76.4% WT, -91.7% RT) |
| **Scenario C:** 22.5% lower memory utilization | Baseline peak memory reaches 100.0% (1220MB requested / 1024MB cap). Adaptive peak memory stays at 78.12% (800MB). | Peak memory reduced by **21.88%** (a 21.9 percentage point reduction). | **VERIFIED** (Corrected from 22.5% to 21.9%) |
| **Scenario D:** Jain fairness changing from 0.524 to 0.984 | At final completion, both = 1.000. During active contention (ticks 20–50), Baseline drops to 0.200–0.500 while Adaptive stays at 0.795–0.963. | Active window: +0.595 fairness points. Starved job (P305) wait cut from 85t to 60t (**-29.4%**). | **PARTIALLY VERIFIED** (Valid for active window, not final batch) |
| **Scenario G:** Recovery overhead causing a 40% increase in WT and triggering rollback | Baseline Avg WT = 4.0t, Adaptive Avg WT = 4.0t. Reversibility snapshot restores prior config on regression. | WT delta is **0.0%**. Rollback logic operates correctly without discarding progress. | **PARTIALLY VERIFIED** (Rollback verified, WT delta 0.0%) |

---

## 4. Scenario-by-Scenario Empirical Audit (Seed = 42)

Reproducible command:
```powershell
.\backend\venv\Scripts\python -c "from backend.app.experiments.runner import BenchmarkRunner; print(BenchmarkRunner.generate_markdown_report(BenchmarkRunner.run_all_benchmarks()))"
```

### Scenario A: Balanced Mixed Workload
- **Workload:** 5 processes (Web_Server, Database_Query, Auth_Service, Cache_Worker, Log_Aggregator) with mixed CPU and simulated I/O bursts. Total burst = 58 ticks.
- **Baseline:** FCFS non-preemptive.
- **Adaptive:** Dynamic Adaptive Scheduler with Self-Healing Recovery.
- **Raw Measurements:**
  - Baseline: Completed 5/5, Elapsed: 80t, Throughput: 0.0625, Avg WT: 23.60t, Avg TAT: 37.60t, Avg RT: 20.00t, Peak Mem: 73.44%, Final Fairness: 1.0000.
  - Adaptive: Completed 5/5, Elapsed: 80t, Throughput: 0.0625, Avg WT: 23.20t, Avg TAT: 37.20t, Avg RT: 10.40t, Peak Mem: 73.44%, Final Fairness: 1.0000, Actions: 10, Overhead: 10t.
- **Deltas:**
  - Waiting Time: $((23.20 - 23.60) / 23.60) \times 100\% = \mathbf{-1.69\%}$
  - Response Time: $((10.40 - 20.00) / 20.00) \times 100\% = \mathbf{-48.00\%}$
  - Turnaround Time: $((37.20 - 37.60) / 37.60) \times 100\% = \mathbf{-1.06\%}$
  - Peak Memory: $0.0\%$ delta.
  - Final Fairness: $0.0\%$ delta.
- **Conclusion:** Modest WT decrease (-1.7%) and substantial initial dispatch responsiveness gain (-48.0% RT).

### Scenario B: Sustained CPU Saturation
- **Workload:** 4 long compute jobs (bursts 35, 40, 30, 25).
- **Baseline:** FCFS.
- **Adaptive:** Dynamic Adaptive Scheduler.
- **Raw Measurements:**
  - Baseline: Completed 3/4, Elapsed: 120t, Throughput: 0.0250, Avg WT: 36.00t, Avg TAT: 71.00t, Avg RT: 36.00t, Peak Mem: 84.96%, Final Fairness: 0.9643.
  - Adaptive: Completed 2/4, Elapsed: 120t, Throughput: 0.0167, Avg WT: 63.50t, Avg TAT: 91.00t, Avg RT: 3.00t, Peak Mem: 84.96%, Final Fairness: 0.9900, Actions: 15, Overhead: 15t.
- **Deltas:**
  - Waiting Time: $((63.50 - 36.00) / 36.00) \times 100\% = \mathbf{+76.39\%}$
  - Response Time: $((3.00 - 36.00) / 36.00) \times 100\% = \mathbf{-91.67\%}$
  - Jain's Fairness Relative Improvement: $((0.9900 - 0.9643) / 0.9643) \times 100\% = \mathbf{+2.67\%}$
  - Jain's Fairness Absolute Change: $(0.9900 - 0.9643) \times 100 = \mathbf{+2.57\text{ percentage points}}$
  - Throughput: $((0.0167 - 0.0250) / 0.0250) \times 100\% = \mathbf{-33.20\%}$ (fewer completed tasks within the fixed 120t window)
- **Academic Finding:** Transparent illustration of the classic FCFS vs Round Robin trade-off: FCFS optimizes completed batch turnaround for early jobs, while adaptive time-slicing drastically improves responsiveness (-91.7% latency) and process fairness at the cost of delayed completion for long tasks.

### Scenario C: Memory Pressure & Reclamation
- **Workload:** 4 high-memory tasks totaling 1220 MB requested memory (ML_Model_Loader 420MB, In_Memory_Cache 380MB, Data_Buffer_Pool 240MB, High_Res_Render 180MB) on a 1024 MB simulator.
- **Baseline:** FCFS (no memory reclamation).
- **Adaptive:** Self-healing with non-destructive buffer reclamation.
- **Raw Measurements:**
  - Baseline: Peak Memory = 1024 MB / 1024 MB (100.0%, 1220 MB total active backlog), Avg WT: 28.00t.
  - Adaptive: Peak Memory = 800 MB / 1024 MB (78.12%), Avg WT: 41.25t, Actions: 11, Overhead: 11t.
- **Deltas:**
  - Peak Memory Utilization: $((78.12 - 100.0) / 100.0) \times 100\% = \mathbf{-21.88\%}$ (21.9 percentage points relief).
  - Active Memory Usage: $((800 - 1220) / 1220) \times 100\% = \mathbf{-34.43\%}$ reduction.
  - Process Terminations: 0 processes killed (100% non-destructive reclamation).
- **Academic Finding:** Verified memory relief without abrupt process termination.

### Scenario D: Starvation Vulnerability & Aging
- **Workload:** 4 high-priority daemons (Priority 2–3) and 1 low-priority batch job (PID 305, Priority 18, burst 15).
- **Baseline:** Strict Priority without aging.
- **Adaptive:** Adaptive Scheduler with dynamic priority aging.
- **Raw Measurements:**
  - Baseline: P305 waited **85 ticks** before receiving CPU service. Final completed Avg WT: 40.20t.
  - Adaptive: P305 dispatched at tick 21 (waited only 20 ticks initially). P305 final WT: 60t. Overall Avg WT: 60.20t.
  - Contention Window Fairness (Tick 25): Baseline $= 0.200$, Adaptive $= 0.795$.
  - Final Batch Fairness (Tick 100): Baseline $= 1.000$, Adaptive $= 1.000$.
- **Deltas:**
  - Starved Job (PID 305) Waiting Time: $((60 - 85) / 85) \times 100\% = \mathbf{-29.41\%}$
  - Overall Batch Waiting Time: $((60.20 - 40.20) / 40.20) \times 100\% = \mathbf{+49.75\%}$
  - Active Contention Window Fairness Change (Percentage Points): $(0.795 - 0.200) \times 100 = \mathbf{+59.50\text{ percentage points}}$
  - Active Contention Window Fairness Relative Improvement: $((0.795 - 0.200) / 0.200) \times 100\% = \mathbf{+297.50\%}$
  - Final Batch Fairness Delta: $((1.000 - 1.000) / 1.000) \times 100\% = \mathbf{0.0\%}$
- **Academic Finding:** Dynamic aging successfully eliminates unbounded starvation, bounding maximum wait time for low-priority processes.

### Scenario E: Staggered Arrival Timing
- **Workload:** Staggered arrivals at ticks 0, 12, 18, 32.
- **Baseline:** FCFS.
- **Adaptive:** Adaptive self-healing.
- **Raw Measurements:**
  - Baseline: Avg WT: 4.25t, Avg TAT: 14.75t, Throughput: 0.0667.
  - Adaptive: Avg WT: 3.50t, Avg TAT: 14.00t, Throughput: 0.0667, Actions: 5, Overhead: 5t.
- **Deltas:**
  - Waiting Time: $((3.50 - 4.25) / 4.25) \times 100\% = \mathbf{-17.65\%}$ reduction.
  - Turnaround Time: $((14.00 - 14.75) / 14.75) \times 100\% = \mathbf{-5.08\%}$ reduction.

### Scenario F: Zero-Workload Idle Boundary Case
- **Workload:** 0 processes.
- **Raw Measurements:** Baseline WT: 0.0t, Adaptive WT: 0.0t, Baseline Fairness: 1.000, Adaptive Fairness: 1.000.
- **Deltas:**
  - Waiting Time: $0.0 - 0.0 = \mathbf{0.0t}$ ($\Delta\% \text{ labeled N/A: zero baseline}$).
  - Fairness: $1.000 - 1.000 = \mathbf{0.0\%}$.
- **Behavior:** Verified that zero processes do not trigger divide-by-zero, `NaN`, or runtime crashes. All metrics return 0.0, fairness returns 1.000 (safe identity).

### Scenario G: Regression & Ineffective Action Safety Case
- **Workload:** 4 ultra-short tasks (burst = 3 ticks each).
- **Raw Measurements:** Baseline Avg WT: 4.00t, Adaptive Avg WT: 4.00t, Recovery Actions: 1.
- **Deltas:**
  - Waiting Time: $((4.00 - 4.00) / 4.00) \times 100\% = \mathbf{0.0\%}$.
- **Behavior:** 
  - Interventions on ultra-short bursts produce discrete overhead.
  - The evaluator records `ActionOutcome.REGRESSION` when overhead outweighs improvement.
  - `RecoveryActionHandler.revert_action` successfully restores prior configuration and effective priorities from pre-action snapshots without discarding completed process execution progress.

---

## 5. Verification Gate Summary

| Verification Category | Status | Notes |
| :--- | :---: | :--- |
| **Deterministic Reproducibility** | **PASS** | Exact results reproduce under Seed 42 across runs |
| **Formula Correctness** | **PASS** | Jain's index, WT, TAT, RT, throughput, utilization follow formal definitions |
| **Zero-Division Guards** | **PASS** | Boundary case (Scenario F) executes cleanly |
| **Overhead Inclusion** | **PASS** | Overhead ticks tracked and recorded in metrics and logs |
| **Reversibility / Rollback** | **PASS** | Verified safe state restore without progress loss |
| **Documentation Honesty** | **PASS** | Unsubstantiated claims removed; real trade-offs published |
