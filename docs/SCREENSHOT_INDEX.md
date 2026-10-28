# OS Guardian — Captured Screenshot Index

This document catalogues the 15 genuine high-resolution application screenshots captured directly from the running OS Guardian platform (React 18 frontend on `http://127.0.0.1:5173` connected via WebSocket and REST to FastAPI backend on `http://127.0.0.1:8000`).

All screenshots were captured programmatically using Headless Google Chrome (`1600x1000` viewport, device scale factor 1.0) through Puppeteer automation interacting with genuine live simulation states.

---

## Screenshot Inventory Table

| Figure # | Filename | Page / View Component | Captured State & Verified Features | Primary Purpose in Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **Figure 1** | `01_overview_dashboard.png` | **Main Dashboard / Overview** (`/`) | System health banner (Healthy), CPU & Memory live gauges (0.0% CPU, 20.3% RAM), Process Distribution bar (Ready: 6, Running: 0, Blocked: 0, Terminated: 0), Primary KPIs (Fairness: 1.000, Waiting: 0.0t, Turnaround: 0.0t, Throughput: 0.00 p/t, Context Switches: 0), Anomaly surveillance active, Simulation control bar (Round Robin, Quantum: 3, Speed: 250ms). | Demonstrates the executive command center, holistic system observability, and real-time operational telemetry. |
| **Figure 2** | `02_guided_demo_modal.png` | **Guided Live Interactive Demonstration Modal** | Modal overlay featuring 5 pre-configured educational scenarios: *Normal Multi-tasking Workload*, *CPU Saturation & Throttling*, *Memory Pressure & Swapping*, *Process Starvation & Aging*, and *Recovery-Overhead Regression*. Interactive "Inject Scenario & Step" controls. | Documents the built-in presentation engine designed for university viva and academic defense walkthroughs. |
| **Figure 3** | `03_anomaly_surveillance_triggered.png` | **Anomaly Surveillance & Active Alerts** | Active Anomaly Alert banner triggered by Starvation scenario (`STARVATION_RISK`, Severity: High, Affected PIDs: P1, P2, P3). Dynamic CPU utilization curve and real-time state telemetry showing elevated queue delays. | Illustrates the real-time anomaly detection engine detecting sustained process starvation in the ready queue. |
| **Figure 4** | `04_process_explorer.png` | **Process Explorer & Real-Time Monitor** (`/processes`) | Tabular process monitor listing 6 simulated processes (P1–P6) with Process ID, Arrival Time, Total Burst, Remaining Burst, Priority, Memory Allocation (MB), Current State, Waiting Ticks, Turnaround Ticks, and Action buttons ("Inspect PCB", "Terminate", "Block/Unblock"). | Explains Process Control Block (PCB) tracking, lifecycle state management, and real-time process accounting. |
| **Figure 5** | `05_process_pcb_drawer.png` | **Process PCB Deep-Inspection Drawer** | Flyout drawer displaying the raw Process Control Block data structure: Process ID, Priority, Initial & Remaining CPU Burst, Total Execution Ticks, Ready Queue Wait Ticks, State transition history, and assigned Memory footprint. | Gives students the exact data structure details needed to answer operating systems viva questions regarding PCB contents. |
| **Figure 6** | `06_scheduling_laboratory.png` | **CPU Scheduling Laboratory** (`/scheduling`) | Algorithm selection dropdown (Round Robin, FCFS, SJF, Priority, Adaptive), Quantum selector, Priority aging toggles, Ready Queue live chip list, and chronological Gantt Chart visualization with per-process color encoding and context-switch boundaries. | Demonstrates the execution trace of scheduling algorithms, time quantum preemption, and queue state progression. |
| **Figure 7** | `07_recovery_center.png` | **Self-Healing Recovery Center** (`/recovery`) | Autonomous vs Manual recovery toggle, active anomaly card with root-cause diagnostics, ranked candidate remediation actions, and before-and-after metric comparison preview (Fairness improvement, Latency reduction). | Explains the autonomic self-healing pipeline and explainable candidate action evaluation. |
| **Figure 8** | `08_recovery_scoring_breakdown.png` | **Multi-Objective Utility Scoring Modal** | Deep mathematical breakdown of candidate ranking: weights ($w_1=0.30, w_2=0.25, w_3=0.20, w_4=0.10, w_5=0.05, w_6=0.10$), individual sub-utility terms, penalty deductions, and final net score calculation. | Proves the decision engine uses deterministic multi-criteria decision analysis (MCDA) rather than opaque black-box heuristics. |
| **Figure 9** | `09_decision_explainability.png` | **Explainability & Decision Audit Trail** (`/explainability`) | Natural-language explanation of chosen remediation ("Why this action was selected"), trade-off analysis versus rejected candidates, safety rule evaluations, and historical decision ledger. | Addresses viva questions on explainable AI (XAI) and deterministic system self-repair transparency. |
| **Figure 10** | `10_experiment_benchmarks.png` | **Comparative Experiment Workbench** (`/experiments`) | Side-by-side benchmark matrix comparing Baseline (unmanaged) vs OS Guardian (Self-Healing) across 5 standard workloads; bar charts for Average Turnaround Time, Waiting Time, Jain's Fairness Index, and Recovery Overhead penalty. | Provides empirical proof of system efficacy and documents recovery trade-offs (e.g., overhead regression scenario). |
| **Figure 11** | `11_workload_studio.png` | **Deterministic Workload Studio** (`/workload`) | Custom workload builder form (PID, Arrival, Burst, Priority, Memory), preset loader (*Standard Mix*, *CPU Heavy*, *I/O Bound*, *Starvation Stress*), JSON workload editor, and configuration parameter controls. | Demonstrates reproducibility, custom test generation, and deterministic workload injection. |
| **Figure 12** | `12_architecture_inspector.png` | **System Architecture & Health Inspector** (`/architecture`) | Interactive block diagram of the 11 decoupled subsystems: Frontend SPA, REST/WebSocket API Gateway, Simulation Core, Process Manager, CPU Scheduler, Memory Accounting Model, Anomaly Detector, Utility Scorer, Recovery Actuator, Metrics Engine, and Event Logger. | Maps software architecture directly to operating system kernel design principles. |
| **Figure 13** | `13_reports_export_center.png` | **Export, Telemetry & Compliance Center** (`/reports`) | Raw telemetry tables, benchmark summary export buttons (Download JSON, Export CSV, Print Formal Audit Report), and simulation event log filters. | Documents data verification, empirical reproducibility, and academic audit readiness. |
| **Figure 14** | `14_event_timeline.png` | **Audit Event Timeline & Sequence Log** (`/timeline`) | Chronological event stream recording state transitions (`PROCESS_ARRIVED`, `CPU_BURST_COMPLETED`, `ANOMALY_TRIGGERED`, `RECOVERY_EVALUATED`, `RECOVERY_APPLIED`) with precise timestamps and metadata payloads. | Explains deterministic event-driven simulation tracing and post-mortem system debugging. |
| **Figure 15** | `15_settings_viva_guide.png` | **Configuration & Viva Preparation Guide** (`/settings`) | Interactive parameter controls (aging threshold, detection windows, scoring weights) and built-in University Viva Defense Guide with categorized question & answer sets for examiners. | Prepares students directly for examination questions and demonstrates configurable kernel policy behavior. |

---

## Capture Environment & Verification Details

- **Host Machine:** Windows 11 Enterprise (x64)
- **Local Application URLs:**
  - Frontend Interface: `http://127.0.0.1:5173`
  - Backend API Gateway: `http://127.0.0.1:8000`
  - OpenAPI Interactive Docs: `http://127.0.0.1:8000/docs`
- **Automation Driver:** Puppeteer-Core (`puppeteer-core@24.38.0`) controlling native Microsoft Edge / Google Chrome binary (`msedge.exe` / `chrome.exe`).
- **Storage Location:** `docs/screenshots/`
- **Resolution:** 1600 × 1000 pixels (standard 16:10 desktop widescreen), uncompressed 24-bit PNG.
