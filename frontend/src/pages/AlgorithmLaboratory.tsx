import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { GanttChart } from '../components/GanttChart';
import { StatusBadge } from '../components/StatusBadge';
import { SchedulerType } from '../types/simulation';
import {
  Sliders,
  StepForward,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Layers,
  Award,
  Zap,
  HelpCircle,
  Table,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AlgorithmLaboratory: React.FC = () => {
  const { snapshot, start, pause, step, reset, updateConfig } = useSimulation();

  if (!snapshot) return null;

  const { config, ready_queue, running_process } = snapshot;

  const handleSchedulerChange = async (newScheduler: SchedulerType) => {
    await updateConfig({
      ...config,
      scheduler_algorithm: newScheduler,
    });
  };

  const handleQuantumChange = async (newQuantum: number) => {
    await updateConfig({
      ...config,
      time_quantum: newQuantum,
    });
  };

  const isRunning = snapshot.status === 'RUNNING';

  const algorithmsComparison = [
    {
      name: "First-Come, First-Served (FCFS)",
      preemptive: "No",
      complexity: "O(1)",
      starvation: "Immune",
      tradeoffs: "Optimal simplicity and minimal context switches. Suffers severe Convoy Effect when long CPU bursts precede short interactive tasks."
    },
    {
      name: "Shortest Job First (SJF Non-Preemptive)",
      preemptive: "No",
      complexity: "O(log N)",
      starvation: "High Risk",
      tradeoffs: "Mathematically optimal minimum average waiting time. Long tasks suffer indefinite starvation under sustained short job arrivals."
    },
    {
      name: "Round Robin (RR)",
      preemptive: "Yes (Quantum Expiry)",
      complexity: "O(1)",
      starvation: "Immune",
      tradeoffs: "Guarantees bounded response time and fairness. Small quantum causes excessive context switch overhead; large quantum degrades to FCFS."
    },
    {
      name: "Priority Scheduling with Aging",
      preemptive: "Non-Preemptive with Dynamic Aging",
      complexity: "O(log N)",
      starvation: "Prevented via Aging",
      tradeoffs: "Favors critical services. Dynamic priority increment (+1 per threshold wait ticks in ready queue) successfully prevents starvation."
    },
    {
      name: "Adaptive Recovery-Aware Scheduling",
      preemptive: "Dynamic / Multi-Criteria",
      complexity: "O(N log N)",
      starvation: "Actively Surveilled",
      tradeoffs: "Autonomously tunes quantum and priority aging based on sliding-window anomaly surveillance. Yields highest empirical Jain's Fairness Index."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-neon-mint" />
            <span>Algorithm Laboratory & Dispatch Studio</span>
          </div>
          <h2 className="text-xl font-bold text-white">Comparative Scheduling Laboratory</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Analyze CPU dispatch mechanics, configure preemption quantums, examine dynamic starvation aging, and compare theoretical algorithmic trade-offs.
          </p>
        </div>

        {/* Step-by-Step Playback Strip */}
        <div className="flex items-center gap-2 bg-[#140f29] p-1.5 rounded-xl border border-purple-900/40">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-3 py-1.5 rounded-lg bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5 fill-current" /> Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="px-3.5 py-1.5 rounded-lg bg-neon-mint text-slate-950 font-black hover:bg-neon-mintGlow text-xs flex items-center gap-1.5 transition-all shadow-neon-mint"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Run
            </button>
          )}

          <button
            onClick={step}
            className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/40 text-purple-200 border border-purple-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <StepForward className="w-3.5 h-3.5 text-neon-mint" /> Step Tick (+1)
          </button>

          <button
            onClick={() => reset()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scheduler Policy Selector & Quantum Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-3">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Active Scheduling Algorithm
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['FCFS', 'SJF', 'ROUND_ROBIN', 'PRIORITY', 'ADAPTIVE'] as SchedulerType[]).map((sched) => {
              const isSelected = config.scheduler_algorithm === sched;
              return (
                <button
                  key={sched}
                  onClick={() => handleSchedulerChange(sched)}
                  className={`p-2.5 rounded-xl text-xs font-mono font-bold border text-center transition-all ${
                    isSelected
                      ? 'bg-neon-mint/20 border-neon-mint text-neon-mint shadow-neon-mint'
                      : 'bg-[#110d24] border-purple-900/30 text-slate-400 hover:text-white hover:bg-purple-950/30'
                  }`}
                >
                  {sched}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 font-sans italic">
            Dynamic algorithm switching preserves current PCB remaining bursts and cumulative waiting time metrics.
          </p>
        </div>

        {/* Quantum & Aging Controls */}
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Round Robin Time Quantum:</span>
              <span className="font-mono text-neon-mint font-bold">{config.time_quantum} ticks</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={config.time_quantum}
              onChange={(e) => handleQuantumChange(Number(e.target.value))}
              className="w-full accent-neon-mint cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 tick (High responsiveness / higher context overhead)</span>
              <span>15 ticks (Batch throughput)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-purple-900/30">
            <div>
              <span className="font-semibold text-white block">Priority Aging Starvation Prevention</span>
              <span className="text-[11px] text-slate-400">Boosts priority every {config.aging_threshold} ticks in ready queue</span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${config.enable_aging ? 'bg-neon-mint/20 text-neon-mint border-neon-mint/40 shadow-neon-mint' : 'bg-purple-950 text-slate-500 border-purple-900/40'}`}>
              {config.enable_aging ? 'ACTIVE (AGING)' : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>

      {/* Dispatch Slot and Ready Queue Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dispatch Slot */}
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Currently Dispatched CPU Process
          </h3>

          {running_process ? (
            <div className="p-4 bg-[#140f29] rounded-xl border border-neon-mint/40 shadow-neon-mint space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-neon-mint text-sm">PID {running_process.pid}</span>
                <StatusBadge type="process" value={running_process.state} />
              </div>
              <div className="text-sm font-bold text-white">{running_process.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-purple-900/30 font-mono">
                <div>Remaining: <strong className="text-neon-mint">{running_process.remaining_time}t</strong></div>
                <div>Burst: <strong className="text-white">{running_process.burst_time}t</strong></div>
                <div>Waiting: <strong className="text-neon-amber">{running_process.waiting_time}t</strong></div>
                <div>Priority: <strong className="text-neon-purple">{running_process.effective_priority}</strong></div>
              </div>
              <div className="text-[10px] font-mono text-purple-300 pt-1 border-t border-purple-900/30">
                Selected by: {config.scheduler_algorithm} rule
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-[#120d24] rounded-xl border border-dashed border-purple-900/40 font-mono">
              CPU Idle &bull; No active process
            </div>
          )}
        </div>

        {/* Ready Queue Inspector */}
        <div className="md:col-span-2 bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Ready Queue Ordering ({ready_queue.length} Processes Waiting)
            </h3>
            <span className="text-[11px] font-mono text-neon-mint">Sorted by {config.scheduler_algorithm} priority</span>
          </div>

          {ready_queue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-[#120d24] rounded-xl border border-dashed border-purple-900/40 font-mono">
              Ready queue is currently empty.
            </div>
          ) : (
            <div className="space-y-2">
              {ready_queue.map((p, idx) => (
                <div
                  key={p.pid}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#140f29] border border-purple-900/30 hover:border-purple-600/40 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800/40 flex items-center justify-center text-[10px] text-neon-mint font-bold">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white">PID {p.pid}</span>
                    <span className="font-sans text-slate-300">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Burst: <strong className="text-neon-mint">{p.remaining_time}t</strong></span>
                    <span>Wait: <strong className="text-neon-amber">{p.waiting_time}t</strong></span>
                    <span>Priority: <strong className="text-neon-purple">{p.effective_priority}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Algorithm Theoretical Comparison Table */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-neon-amber" />
            <span>Scheduling Algorithms Comparison Matrix</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Academic Operating Systems Reference</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-purple-900/30">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#120d26] text-slate-400 uppercase font-mono text-[10px] border-b border-purple-900/30">
              <tr>
                <th className="p-3">Algorithm</th>
                <th className="p-3">Preemptive</th>
                <th className="p-3">Time Complexity</th>
                <th className="p-3">Starvation Risk</th>
                <th className="p-3">Empirical Trade-off & Viva Defense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20 font-sans">
              {algorithmsComparison.map((a, idx) => (
                <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                  <td className="p-3 font-bold text-white font-mono">{a.name}</td>
                  <td className="p-3 font-mono text-purple-300">{a.preemptive}</td>
                  <td className="p-3 font-mono text-neon-mint font-semibold">{a.complexity}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${a.starvation.includes('Immune') || a.starvation.includes('Prevented') ? 'bg-neon-mint/20 text-neon-mint' : 'bg-neon-coral/20 text-neon-coral'}`}>
                      {a.starvation}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] leading-relaxed max-w-md">{a.tradeoffs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
