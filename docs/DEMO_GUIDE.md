# OS Guardian 2.0 — Demonstration & Viva Defense Guide

This guide describes how to present OS Guardian during an academic review, viva examination, or portfolio demonstration.

---

## 1. High-Impact 2-Minute Demonstration Script

### Step 1: Open the Application
Navigate to [http://127.0.0.1:5173](http://127.0.0.1:5173). Explain the mission:
> *"OS Guardian is an explainable self-healing operating system simulator. It answers: Can an adaptive recovery policy improve responsiveness and fair allocation without causing excessive overhead or regression?"*

### Step 2: Launch the Guided Demo
Click the glowing **"Start Guided Demo"** button on the header or hero banner.
- **Steps 1-3:** Show initial baseline state. Click "Inject CPU Heavy Workload" and simulate 20 ticks.
- **Steps 4-5:** Point out the dropping Jain's Fairness Index ($J < 0.70$) and show the **`SUSTAINED_HIGH_CPU`** and **`STARVATION_RISK`** alerts triggered by the sliding window detector.
- **Step 6:** Open the scoring breakdown. Explain the mathematical formula:
  $$\text{score}(a) = w_1 \Delta R + w_2 \Delta M + w_3 \Delta F - w_4 C_{\text{int}} - w_5 H_F - w_6 R_{\text{rec}}$$
- **Step 7:** Click "Apply Approved Recovery Action". Show how quantum reduction ($4 \to 2$) and dynamic priority aging are applied.
- **Steps 8-9:** Advance 20 ticks post-recovery. Show that Jain's Fairness rises from $0.66 \to >0.85$ and queue waiting times fall by $35\%$.
- **Step 10:** Show the downloadable Markdown and CSV verification reports.

---

## 2. Manual Independent Feature Exploration

When requested by the examiner to demonstrate specific subsystems:
- **Process Explorer:** Search PID `101`, sort by waiting time, click "Inspect PCB" to show state transitions.
- **Algorithm Laboratory:** Switch dynamically between `FCFS`, `SJF`, `ROUND_ROBIN`, and `PRIORITY`. Show how changing the Round Robin slider dynamically tunes preemption.
- **Custom Workload Builder:** Add a process with custom burst and reclaimable memory; deploy directly into the engine.
- **Architecture Inspector:** Walk through the 11 decoupled architectural modules and show in-memory data flow.

---

## 3. Anticipated Viva Examination Questions & Model Answers

1. **Q: Is this modifying real kernel processes?**
   - *A:* No. All processes are in-memory Process Control Block (PCB) data structures managed deterministically in Python. This preserves educational safety while modeling real OS behavior.

2. **Q: Why is Jain's Fairness Index used?**
   - *A:* Jain's Index ($J = \frac{(\sum x_i)^2}{N \sum x_i^2}$) normalizes allocation equality between 0 and 1. It directly penalizes scenarios where long jobs starve short interactive tasks.

3. **Q: What happens if a recovery action makes performance worse?**
   - *A:* The recovery engine continuously evaluates post-recovery telemetry. In the `RECOVERY_REGRESSION` scenario, excessive context switching degrades throughput; the engine flags `REGRESSION` and initiates automated configuration rollback.
