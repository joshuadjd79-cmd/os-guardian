# OS Guardian 2.0 — Known Limitations & Scope Boundaries

To maintain academic rigor and transparent scientific integrity, this document explicitly records the documented limitations, simplifications, and scope boundaries of OS Guardian.

---

## 1. Academic Simulation Scope

1. **Discrete Clock vs Continuous Time:**
   - The simulator advances in discrete integer clock units (ticks). Real operating systems operate on continuous nanosecond hardware clock interrupts and cycle counters.
2. **Simplified Memory Hierarchy:**
   - Memory is modeled as working-set sizes and reclaimable buffers (caches). It does not implement multi-level page tables, TLB shootdowns, or NUMA memory node latency.
3. **Single Core CPU Model:**
   - The simulation engine models a uniprocessor system with preemption. Multicore SMP scheduling and cache affinity are not currently simulated.
4. **I/O Subsystem Simplification:**
   - I/O operations are modeled as deterministic blocking intervals. Disk seek times, rotational latency, and asynchronous DMA transfers are abstracted away.
5. **No Real Process Modification:**
   - All processes are in-memory python objects. The simulator cannot alter running applications on the host Windows/Linux machine.

---

## 2. Empirical Benchmark Trade-Off Disclosures

1. **Round Robin Quantum Trade-Off:**
   - Lowering time quantum ($q = 4 \to 2$) improves interactive responsiveness and Jain's Fairness Index by $28\%$, but increases theoretical context switch count from $8 \to 16$.
2. **Recovery Overhead in Short-Task Workloads:**
   - In the `RECOVERY_REGRESSION` scenario with tasks having burst length of only 3 ticks, recovery evaluation introduces 1 tick of overhead, increasing average waiting time by $+33.3\%$. OS Guardian does not hide this: it is explicitly benchmarked and verified.
