# OS Guardian — Project Milestones & Contribution Records

---

## 1. Major Implementation Milestones

| Milestone ID | Description | Target Component | Status |
| :---: | :--- | :--- | :---: |
| **M1** | Environment Scaffolding & Virtual Environment Setup | Python venv, FastAPI, React + Vite, Tailwind CSS | **COMPLETED** |
| **M2** | Deterministic Discrete-Time Simulator Core | `SimulationClock`, `SimulatedProcess`, Lifecycle Invariants | **COMPLETED** |
| **M3** | Scheduling Algorithms Suite | FCFS, SJF, Round Robin, Priority with Aging, Adaptive Scheduler | **COMPLETED** |
| **M4** | Authoritative Mathematical Metrics Calculator | TAT, WT, RT, Throughput, Utilization, Jain's Fairness Index | **COMPLETED** |
| **M5** | Sliding-Window Anomaly Detection Subsystem | 6 Rules, Sliding Averages, Evidence Profiling, Cooldowns | **COMPLETED** |
| **M6** | Explainable Recovery Engine & Multi-Criteria Scoring | 13-Step Decision Flow, Scoring Formula, Confidence Index, Reversibility | **COMPLETED** |
| **M7** | Full-Stack REST API & Real-time WebSockets | FastAPI Endpoints, Async Locks, WebSocket Broadcasting | **COMPLETED** |
| **M8** | Responsive Frontend Dashboard | 8 Functional Sections, Recharts Telemetry, Interactive Gantt Timeline | **COMPLETED** |
| **M9** | Reproducible Benchmarking Suite & Export Engine | 7 Workload Scenarios, CSV/JSON/Markdown Reports | **COMPLETED** |
| **M10**| Automated Verification Suite & Windows Scripts | 18 Pytest unit tests, `verify.ps1`, `setup_windows.ps1`, `run_windows.ps1` | **COMPLETED** |

---

## 2. Module Responsibilities Matrix

| Architectural Module | Primary Responsibilities | File Locations |
| :--- | :--- | :--- |
| **Simulation Core** | Discrete clock, process lifecycle, state invariants, queue dispatch | `backend/app/simulation/` |
| **Schedulers** | CPU scheduling algorithms, quantum expiration, preemption, aging | `backend/app/schedulers/` |
| **Monitoring** | Turnaround/Wait/Response time math, sliding window metrics, Jain's index | `backend/app/monitoring/` |
| **Recovery Engine** | Candidate generation, multi-criteria scoring, action execution, rollback | `backend/app/recovery/` |
| **Experiments** | Benchmark scenario definitions, comparative runs, export formatting | `backend/app/experiments/` |
| **API & Networking** | REST API endpoints, WebSocket streaming, concurrency locking | `backend/app/api/`, `main.py` |
| **Frontend UI** | Real-time charts, Gantt chart, process drawer, algorithm laboratory | `frontend/src/` |
| **Testing** | Hand-calculated metric proofs, scheduler order, anomaly detection tests | `backend/tests/` |

---

## 3. Team Member Contribution Table

*(Fill in your actual student details and specific module responsibilities below)*

| Team Member Name | Student ID / Reg No. | Module Assigned | Specific Contributions | Hours Contributed |
| :--- | :--- | :--- | :--- | :---: |
| [Student 1 Name] | [Reg Number] | Simulation Core & Schedulers | Discrete clock, FCFS/SJF/RR schedulers, queue management | [Hours] |
| [Student 2 Name] | [Reg Number] | Anomaly Detector & Recovery | Sliding-window rules, utility scoring formula, rollback logic | [Hours] |
| [Student 3 Name] | [Reg Number] | Metrics & Benchmarking Suite | Metric calculations, Jain's fairness index, benchmark runner | [Hours] |
| [Student 4 Name] | [Reg Number] | Frontend Dashboard & Telemetry | React components, Recharts telemetry, Gantt chart, UI design | [Hours] |

---

## 4. Individual Task Record Log

| Date | Contributor | Task Performed | Modules Modified | Verified By |
| :---: | :--- | :--- | :--- | :--- |
| YYYY-MM-DD | | | | |
| YYYY-MM-DD | | | | |
| YYYY-MM-DD | | | | |
| YYYY-MM-DD | | | | |
| YYYY-MM-DD | | | | |
