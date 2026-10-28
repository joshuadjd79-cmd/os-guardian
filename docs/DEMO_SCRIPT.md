# OS Guardian — Live Demonstration Script (5–7 Minutes)

**Target Audience:** OS Course Professor, Reviewer, or Examiner  
**Format:** 12-Step Live Demonstration Walkthrough  
**Total Duration:** 5 to 7 Minutes  
**Simulator Version:** OS Guardian v1.0.0 (FastAPI + React 18)  

---

## Pre-Demo Setup Checklist

1. Open a PowerShell terminal in the project root: `c:\Users\Steven\OneDrive\Desktop\os guardian`.
2. Ensure Python virtual environment and frontend node packages are installed.
3. Check that ports 8000 and 5173 are free.
4. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\run_windows.ps1
   ```
5. Open your web browser to `http://127.0.0.1:5173`.
6. Confirm backend is healthy at `http://127.0.0.1:8000/api/health`.

---

## 12-Step Demonstration Sequence

### Step 1: Launch & Architectural Scope (Minute 0:00 – 0:45)
- **What to show:** Open `http://127.0.0.1:5173`. Show the 8 navigation pages in the sidebar and the Safety Boundary callout in the top bar.
- **What to click:** Point to the top bar status badge: `"SIMULATOR READY (PORT 8000)"`.
- **What to explain:**
  > *"OS Guardian is an explainable, self-healing operating system simulator built for studying autonomous kernel-level decision-making. Important safety notice: All scheduling, memory, and recovery operations occur purely in-memory in discrete simulation time. Real operating system processes and host hardware configurations are completely untouched."*

### Step 2: Baseline Execution (Minute 0:45 – 1:30)
- **What to show:** Navigate to **Algorithm Laboratory**.
- **What to click:** 
  1. Select scheduler algorithm: **FCFS**.
  2. Set Auto-Recovery toggle to **OFF** (in Settings or top bar).
  3. Load the **Balanced Mixed Workload** preset.
  4. Click **Run** or advance with **Step** (+1 tick).
- **What to explain:**
  > *"Here we execute a standard batch under a fixed, non-preemptive FCFS policy. Notice in the Gantt timeline how long tasks monopolize the CPU, causing arriving interactive tasks to queue and wait. Under baseline FCFS, average waiting time reaches 23.60 ticks and response latency is 20.00 ticks."*

### Step 3: Trigger a Problem (Minute 1:30 – 2:00)
- **What to show:** Navigate to **Live Process Monitor**.
- **What to click:** Click the workload preset button: **"Starvation Risk"**.
- **What to explain:**
  > *"To test autonomous self-healing, we load a priority-skewed workload. High-priority system daemons (P301–P304 with priority 2–3) run repeatedly, while Process 305 (Starving_Batch_Job, priority 18) sits in the ready queue. Under strict priority without intervention, P305 is starved indefinitely."*

### Step 4: Autonomous Detection (Minute 2:00 – 2:30)
- **What to show:** Click **Run** and let simulation clock advance past Tick 20.
- **What to click:** Watch the header alert badge light up with `"1 Alert(s)"`.
- **What to explain:**
  > *"At Tick 20, the anomaly detector's sliding window rule triggers an alert: `STARVATION_RISK`. The exact threshold rule is: any arrived process remaining in the READY queue for $\ge 20$ ticks without CPU dispatch triggers an active starvation alert."*

### Step 5: Diagnosis (Minute 2:30 – 3:00)
- **What to show:** Navigate to **Recovery Center**.
- **What to click:** Inspect the active alert card for PID 305.
- **What to explain:**
  > *"The simulator classifies this anomaly as a queue scheduling pathology, not a hardware fault. In a real OS, thread starvation can lock user interfaces. In our simulator, the detector identifies that the scheduler is stuck in head-of-line priority blocking, requiring policy adaptation rather than process termination."*

### Step 6: Recovery Decision Logic (Minute 3:00 – 3:45)
- **What to show:** Navigate to **Decision Explainability**.
- **What to click:** Open the **Candidate Actions Matrix** and click the **Formula Breakdown** button.
- **What to explain:**
  > *"OS Guardian evaluates seven candidate actions using our multi-criteria utility formula:*
  > $$\text{Score} = w_1 \Delta R + w_2 \Delta M + w_3 \Delta F - w_4 C_{\text{int}} - w_5 H_F - w_6 R_{\text{rec}}$$
  > *Where weights evaluate responsiveness ($w_1=0.30$), resource relief ($w_2=0.25$), fairness ($w_3=0.20$), intervention cost ($w_4=0.10$), fairness harm ($w_5=0.05$), and risk ($w_6=0.10$).*
  > *`ADJUST_PRIORITY` and `APPLY_AGING` scored highest because their projected fairness benefit ($\Delta F = 0.85$) outweighed the discrete intervention cost ($0.08$)."*

### Step 7: Recovery Application (Minute 3:45 – 4:15)
- **What to show:** Point to the **Audit Trail** in the Recovery Center.
- **What to explain:**
  > *"The recovery engine applies `ADJUST_PRIORITY`, boosting PID 305's effective priority to 15, and dynamically enables accelerated aging. On the very next tick (Tick 21), the scheduler preempts and dispatches Process 305 to the CPU. Notice the clock records 1 tick of discrete recovery overhead."*

### Step 8: Measured Outcome & Comparison (Minute 4:15 – 4:45)
- **What to show:** The before/after metric cards in Recovery Center.
- **What to explain:**
  > *"Under baseline strict priority, Process 305 waited 85 ticks before its first CPU dispatch. With OS Guardian's self-healing active, Process 305 was dispatched at Tick 21, reducing its waiting delay to 60 ticks—a 29.4% waiting time improvement for the starving job. During active contention, Jain's fairness index rose from 0.200 to 0.795 (+0.595 points)."*

### Step 9: Decision Explainability & Event Timeline (Minute 4:45 – 5:15)
- **What to show:** Navigate to **Event Timeline**.
- **What to click:** Filter by event type: `"RECOVERY_APPLIED"` or search `"PID 305"`.
- **What to explain:**
  > *"Every state change, priority adjustment, and recovery evaluation is permanently timestamped in the audit log. Examiners and operators can trace exactly why an action was chosen, which alternatives were rejected, and what trade-offs were accepted."*

### Step 10: Safety Case & Regression Rollback (Minute 5:15 – 5:45)
- **What to show:** Navigate to **Experiments & Benchmarks** and highlight **Scenario G (Regression Test Case)**.
- **What to explain:**
  > *"A critical self-healing requirement is safety: what happens if an action makes things worse? Under Scenario G (ultra-short tasks of 3 ticks), intervention overhead exceeds the benefit. OS Guardian's outcome evaluator detects the regression, flags `ActionOutcome.REGRESSION`, and executes `revert_action()` to restore the pre-action snapshot without discarding completed process execution."*

### Step 11: Export Benchmark Reports (Minute 5:45 – 6:15)
- **What to show:** In **Experiments & Benchmarks**, click **"Execute Benchmark Suite"**.
- **What to click:**
  1. Click **CSV** button: downloads `os_guardian_benchmarks.csv`.
  2. Click **Report (.md)** button: downloads `OS_GUARDIAN_BENCHMARK_REPORT.md`.
- **What to explain:**
  > *"All 7 standardized benchmark scenarios execute deterministically under Seed 42. Exports are protected against formula injection and agree identically with our audited benchmark reports."*

### Step 12: Clean Shutdown (Minute 6:15 – 6:30)
- **What to show:** Return to PowerShell.
- **What to run:** Terminate the processes cleanly or press `Ctrl+C` in the launch consoles:
  ```powershell
  Stop-Process -Name "uvicorn", "node" -Force -ErrorAction SilentlyContinue
  ```
- **What to explain:**
  > *"The simulator shuts down cleanly with zero lingering background processes or persistent state locks."*
