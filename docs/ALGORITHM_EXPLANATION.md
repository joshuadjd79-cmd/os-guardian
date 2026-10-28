# OS Guardian — Algorithmic Specification & Explainability Guide

This document details the mathematical models, decision algorithms, and step-by-step scoring formulas implemented in **OS Guardian**.

---

## 1. Scheduling Algorithms

### 1.1 First-Come, First-Served (FCFS)
- **Classification:** Non-preemptive, FIFO.
- **Selection Rule:** At any scheduling point, dispatch process $p$ minimizing arrival timestamp $T_{\text{arrival}}$:
  $$p^* = \arg\min_{p \in \text{ReadyQueue}} (T_{\text{arrival}}(p), \text{PID}(p))$$
- **Preemption:** None. A running process executes until its remaining work reaches zero or it initiates simulated I/O.

### 1.2 Shortest Job First (SJF Non-Preemptive)
- **Classification:** Non-preemptive, greedy.
- **Selection Rule:**
  $$p^* = \arg\min_{p \in \text{ReadyQueue}} (\text{RemainingWork}(p), T_{\text{arrival}}(p), \text{PID}(p))$$
- **Behavior:** Minimizes average waiting time for static workloads but is vulnerable to starvation if short jobs continuously arrive.

### 1.3 Round Robin (RR)
- **Classification:** Preemptive, time-sliced.
- **Configurable Parameter:** Time quantum $q$ ($1 \le q \le 20$ discrete ticks).
- **Preemption Rule:** After a running process consumes $q$ ticks on the CPU, it is preempted and enqueued at the tail of the Ready Queue:
  $$\text{slice\_used} \ge q \implies \text{Preempt}(p_{\text{running}}) \to \text{Tail}(\text{ReadyQueue})$$
- **Tie-Breaking Convention:** When a newly arrived process arrives at the exact tick a running process is preempted, the new arrival is enqueued first, followed by the preempted process.

### 1.4 Priority Scheduling with Aging
- **Classification:** Preemptive, priority-driven.
- **Priority Convention:** Lower integer = Higher logical priority ($1$ is maximum priority, $100$ is minimum priority).
- **Starvation-Prevention Mechanism (Aging):** Every process residing in the READY queue increments its wait counter $\text{ticks\_in\_ready\_queue}$. When this counter reaches $\text{aging\_threshold}$ (default: 8 ticks), its effective priority improves:
  $$P_{\text{eff}} \leftarrow \max(P_{\text{min\_bound}}, P_{\text{eff}} - \text{aging\_step})$$
  This guarantees that all waiting processes eventually achieve sufficient priority to be scheduled.

### 1.5 Adaptive Recovery-Aware Scheduler
- **Classification:** Dynamic hybrid.
- **Behavior:** Dynamically adapts time quantum size based on ready queue depth and CPU contention:
  - Ready queue length $> 6 \implies q_{\text{dynamic}} \leftarrow \max(2, q_{\text{base}} - 1)$ (improves interactive latency)
  - Ready queue length $\le 2 \implies q_{\text{dynamic}} \leftarrow q_{\text{base}} + 1$ (reduces context switching overhead)
  - Prioritizes starving processes ($\text{ticks\_in\_ready\_queue} \ge \text{threshold}$) ahead of the normal queue order.

---

## 2. Anomaly Detection Rules & Sliding Windows

To prevent false alarms caused by temporary micro-spikes, OS Guardian evaluates metrics across a sliding observation window ($W = 5$ ticks by default).

| Anomaly Identifier | Rule Trigger Condition | Observation Window | Severity |
| :--- | :--- | :---: | :---: |
| `SUSTAINED_HIGH_CPU` | $\frac{1}{W}\sum_{t=0}^{W-1} \text{CPU}(t) \ge \text{threshold}_{\text{CPU}} \ (85\%)$ | $W$ ticks | WARNING / CRITICAL ($\ge 95\%$) |
| `HIGH_MEMORY_PRESSURE` | $\frac{\text{MemoryUsed}}{\text{MemoryCapacity}} \times 100 \ge \text{threshold}_{\text{mem}} \ (80\%)$ | Instantaneous & Window | WARNING / CRITICAL ($\ge 92\%$) |
| `EXCESSIVE_WAITING_TIME` | $\exists p \in \text{ReadyQueue}: \text{WaitingTime}(p) \ge \text{threshold}_{\text{wait}} \ (20\text{t})$ | Single tick | WARNING |
| `UNRESPONSIVE_PROCESS` | $\exists p \in \text{BlockedQueue}: \text{BlockDuration}(p) \ge \text{threshold}_{\text{unresponsive}} \ (12\text{t})$ | Cumulative | WARNING |
| `STARVATION_RISK` | $\exists p \in \text{ReadyQueue}: \text{ticks\_in\_ready\_queue}(p) \ge \text{threshold}_{\text{starve}} \ (25\text{t})$ | Cumulative | CRITICAL |
| `RECOVERY_FAILURE` | Post-action evaluation delta $\le 0$ after observation window | Post-action window (5t) | WARNING |

**Duplicate Alert Suppression:**
When an anomaly persists, the engine updates `last_detected_time` on the existing alert record without generating duplicate active alerts. Once resolved, a cooldown period (default: 8 ticks) prevents flapping.

---

## 3. Explainable Recovery Scoring Formula

For any candidate action $a \in \mathcal{A}$, the multi-criteria utility score is computed as:

$$\text{score}(a) = w_1 \Delta R(a) + w_2 \Delta M(a) + w_3 \Delta F(a) - w_4 C_{\text{int}}(a) - w_5 H_F(a) - w_6 R_{\text{rec}}(a)$$

Where:
- $w_1 = 0.30$: Weight for expected responsiveness improvement ($\Delta R \in [0, 1]$)
- $w_2 = 0.25$: Weight for expected resource relief ($\Delta M \in [0, 1]$)
- $w_3 = 0.20$: Weight for fairness benefit ($\Delta F \in [0, 1]$)
- $w_4 = 0.10$: Weight for intervention cost ($C_{\text{int}} \in [0, 1]$)
- $w_5 = 0.05$: Weight for fairness harm to other tasks ($H_F \in [0, 1]$)
- $w_6 = 0.10$: Weight for recovery risk ($R_{\text{rec}} \in [0, 1]$)

**Normalization & Directionality:**
All benefit terms ($\Delta R, \Delta M, \Delta F$) and cost/risk terms ($C_{\text{int}}, H_F, R_{\text{rec}}$) are normalized to $[0.0, 1.0]$. Higher benefits increase the score; higher costs and risks decrease the score.

**Decision Threshold & Tie-Breaking:**
- Action $a$ is selected only if $\text{score}(a) \ge \text{min\_utility\_threshold} \ (0.12)$ and all preconditions are satisfied.
- If multiple candidates tie in score, the tie is broken by:
  1. Lowest recovery risk $R_{\text{rec}}$
  2. Lowest intervention cost $C_{\text{int}}$
  3. Stable alphabetical action identifier

---

## 4. Confidence Indicator Definition

The **Rule Confidence Index** $C \in [0.0, 1.0]$ reflects the strength and clarity of empirical evidence supporting the diagnosis:

$$C = \min\left(1.0, \frac{\text{ObservedMetricValue}}{\text{ThresholdValue}} \times \text{PreconditionCompletenessFactor}\right)$$

It is not an uncalibrated Bayesian probability, but rather a deterministic metric reflecting how decisively the system state breached normal operating bounds.

---

## 5. Fully Worked Decision Example

### Step 1: Observed Problem
- At **Tick 26**, the anomaly detector flags `STARVATION_RISK`.
- Evidence: PID 305 has waited in the Ready Queue for $28\text{ ticks}$ (threshold: $25\text{ ticks}$).
- Baseline Metrics: Average Waiting Time $= 34.2\text{t}$, Jain's Fairness Index $= 0.542$.

### Step 2: Candidate Generation & Scoring

1. **Candidate 1: `ADJUST_PRIORITY` (Boost PID 305)**
   - Preconditions: PID 305 exists and is in READY state ($\text{Eligible} = \text{True}$).
   - $\Delta R = 0.65$, $\Delta M = 0.10$, $\Delta F = 0.85$
   - $C_{\text{int}} = 0.08$, $H_F = 0.05$, $R_{\text{rec}} = 0.10$
   - Score Calculation:
     $$\text{score} = (0.30 \times 0.65) + (0.25 \times 0.10) + (0.20 \times 0.85) - (0.10 \times 0.08) - (0.05 \times 0.05) - (0.10 \times 0.10)$$
     $$\text{score} = 0.195 + 0.025 + 0.170 - 0.008 - 0.0025 - 0.010 = \mathbf{0.3695}$$
   - Confidence: $0.88$

2. **Candidate 2: `APPLY_AGING`**
   - $\text{Score} = 0.3150$, Confidence $= 0.85$

3. **Candidate 3: `NO_INTERVENTION`**
   - $\text{Score} = 0.0000$, Confidence $= 1.00$

### Step 3: Selection & Execution
- **Selected Action:** `ADJUST_PRIORITY` (Score: $0.3695 > 0.12$).
- Action applied: PID 305 effective priority boosted from $18 \to 15$.
- Recovery overhead: $1\text{ tick}$ logged.

### Step 4: Measured Outcome (Tick 31)
- Post-action observation window: 5 ticks.
- PID 305 was dispatched to CPU at Tick 27 and completed burst.
- Post-action Metrics: Jain's Fairness Index increased from $0.542 \to 0.982$ ($+0.440$ improvement).
- **Outcome Verdict:** `SUCCESS` ("Fairness index improved by +0.440 and waiting delays stabilized").
