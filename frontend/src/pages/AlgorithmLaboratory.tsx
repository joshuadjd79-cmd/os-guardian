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
  Zap
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

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">Algorithm Laboratory & Scheduler Studio</h2>
          </div>
          <p className="text-xs text-slate-400">
            Interactive scheduling policy manipulation, step-by-step queue execution inspection, and dynamic quantum tuning.
          </p>
        </div>

        {/* Step-by-Step Playback Strip */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-medium flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="px-3 py-1.5 rounded bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 text-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Run
            </button>
          )}

          <button
            onClick={step}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
          >
            <StepForward className="w-3.5 h-3.5" /> Step Tick (+1)
          </button>

          <button
            onClick={() => reset()}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scheduler Policy Selector & Quantum Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Active Scheduling Algorithm
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['FCFS', 'SJF', 'ROUND_ROBIN', 'PRIORITY', 'ADAPTIVE'] as SchedulerType[]).map((sched) => {
              const isSelected = config.scheduler_algorithm === sched;
              return (
                <button
                  key={sched}
                  onClick={() => handleSchedulerChange(sched)}
                  className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {sched}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Switching policy dynamically preserves current process remaining bursts and elapsed metrics.
          </p>
        </div>

        {/* Quantum & Aging Controls */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Round Robin Time Quantum:</span>
              <span className="font-mono text-cyan-400 font-bold">{config.time_quantum} ticks</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={config.time_quantum}
              onChange={(e) => handleQuantumChange(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 tick (High responsiveness)</span>
              <span>15 ticks (High throughput)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <div>
              <span className="font-semibold text-slate-300 block">Priority Aging Starvation Prevention</span>
              <span className="text-[11px] text-slate-500">Boosts priority every {config.aging_threshold} ticks in ready queue</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.enable_aging ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
              {config.enable_aging ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
        </div>
      </div>

      {/* Gantt Inspection */}
      <GanttChart intervals={snapshot.gantt_log} currentTime={snapshot.current_time} />

      {/* Dispatch Slot and Ready Queue Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dispatch Slot */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Currently Dispatched CPU Process
          </h3>

          {running_process ? (
            <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400 text-sm">PID {running_process.pid}</span>
                <StatusBadge type="process" value={running_process.state} />
              </div>
              <div className="text-sm font-semibold text-slate-100">{running_process.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800 font-mono">
                <div>Remaining: {running_process.remaining_time}t</div>
                <div>Burst: {running_process.burst_time}t</div>
                <div>Wait: {running_process.waiting_time}t</div>
                <div>Priority: {running_process.effective_priority}</div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              CPU Idle &bull; No active process
            </div>
          )}
        </div>

        {/* Ready Queue Inspector */}
        <div className="md:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ready Queue Ordering ({ready_queue.length} Processes Waiting)
            </h3>
            <span className="text-[11px] text-slate-500">Ordered by active scheduler dispatch rule</span>
          </div>

          {ready_queue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              Ready queue is empty.
            </div>
          ) : (
            <div className="space-y-2">
              {ready_queue.map((p, idx) => (
                <div
                  key={p.pid}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-cyan-400">PID {p.pid}</span>
                    <span className="font-sans text-slate-200">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Remaining: <strong className="text-slate-200">{p.remaining_time}t</strong></span>
                    <span>Waiting: <strong className="text-amber-400">{p.waiting_time}t</strong></span>
                    <span>Priority: <strong className="text-slate-200">{p.effective_priority}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
