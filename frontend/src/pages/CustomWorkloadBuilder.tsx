import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { WorkloadType } from '../types/simulation';
import {
  Sliders,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ProcessRow {
  pid: number;
  name: string;
  arrival_time: number;
  burst_time: number;
  memory: number;
  priority: number;
  io_frequency: number;
  io_duration: number;
  reclaimable_memory: number;
}

export const CustomWorkloadBuilder: React.FC = () => {
  const { loadCustomWorkload, loadWorkload, reset } = useSimulation();

  const [processes, setProcesses] = useState<ProcessRow[]>([
    { pid: 1, name: "Web_Server", arrival_time: 0, burst_time: 14, memory: 128, priority: 4, io_frequency: 4, io_duration: 2, reclaimable_memory: 32 },
    { pid: 2, name: "Database_Writer", arrival_time: 1, burst_time: 20, memory: 256, priority: 3, io_frequency: 5, io_duration: 3, reclaimable_memory: 64 },
    { pid: 3, name: "Analytics_Batch", arrival_time: 2, burst_time: 30, memory: 180, priority: 8, io_frequency: 0, io_duration: 0, reclaimable_memory: 40 },
    { pid: 4, name: "Cache_Worker", arrival_time: 5, burst_time: 10, memory: 96, priority: 5, io_frequency: 2, io_duration: 1, reclaimable_memory: 24 },
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const presets: Array<{ id: WorkloadType; title: string; desc: string; badge: string }> = [
    { id: 'BALANCED', title: 'Balanced Workload', desc: 'Mix of compute, I/O bursts, and moderate memory demands.', badge: 'Standard' },
    { id: 'CPU_HEAVY', title: 'CPU Saturation Contention', desc: '4 long compute-intensive tasks with high burst times.', badge: 'High Load' },
    { id: 'MEMORY_PRESSURE', title: 'Memory Pressure & Caches', desc: 'Exceeds 80% RAM threshold; exposes reclaimable buffers.', badge: 'OOM Risk' },
    { id: 'STARVATION_RISK', title: 'Starvation & Priority Risk', desc: 'Low-priority batch jobs blocked by high-priority daemons.', badge: 'Fairness' },
    { id: 'MIXED_ARRIVALS', title: 'Staggered Arrivals', desc: 'Tasks arriving sequentially at ticks 0, 12, 18, and 32.', badge: 'Dynamic' },
    { id: 'RECOVERY_REGRESSION', title: 'Recovery Overhead Scenario', desc: 'Short tasks where context-switch and recovery costs exceed benefit.', badge: 'Trade-off' }
  ];

  const handleAddProcess = () => {
    const nextPid = processes.length > 0 ? Math.max(...processes.map(p => p.pid)) + 1 : 1;
    setProcesses([
      ...processes,
      {
        pid: nextPid,
        name: `Task_${nextPid}`,
        arrival_time: 0,
        burst_time: 10,
        memory: 128,
        priority: 5,
        io_frequency: 0,
        io_duration: 0,
        reclaimable_memory: 20
      }
    ]);
  };

  const handleRemoveProcess = (pid: number) => {
    setProcesses(processes.filter(p => p.pid !== pid));
  };

  const handleChange = (index: number, field: keyof ProcessRow, value: any) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const handleDeployCustom = async () => {
    setValidationError(null);
    setSuccessMessage(null);

    if (processes.length === 0) {
      setValidationError("Custom workload must contain at least 1 process.");
      return;
    }

    // Check duplicate PIDs
    const pids = processes.map(p => Number(p.pid));
    if (new Set(pids).size !== pids.length) {
      setValidationError("Duplicate Process IDs detected. Each process must have a unique PID.");
      return;
    }

    // Validate burst and memory
    for (const p of processes) {
      if (p.burst_time <= 0) {
        setValidationError(`Process PID ${p.pid} must have a burst time greater than 0.`);
        return;
      }
      if (p.memory <= 0) {
        setValidationError(`Process PID ${p.pid} must have memory allocation greater than 0.`);
        return;
      }
      if (p.reclaimable_memory > p.memory) {
        setValidationError(`Process PID ${p.pid}: Reclaimable memory cannot exceed total memory.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await loadCustomWorkload(processes);
      setSuccessMessage(`Successfully deployed ${processes.length} custom processes to simulator!`);
    } catch (err: any) {
      setValidationError(err.message || "Failed to deploy custom workload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeployPreset = async (presetId: WorkloadType) => {
    try {
      setIsSubmitting(true);
      await loadWorkload(presetId);
      setSuccessMessage(`Loaded standard preset: ${presetId}`);
    } catch (err: any) {
      setValidationError(err.message || "Failed to load preset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-neon-mint" />
            <span>Workload Studio & Custom Generator</span>
          </div>
          <h2 className="text-xl font-bold text-white">Custom Workload Builder</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Construct custom synthetic process streams with arbitrary burst lengths, memory allocations, I/O cycles, and priorities, or deploy standardized benchmark presets.
          </p>
        </div>

        <button
          onClick={handleDeployCustom}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-neon-mint hover:bg-neon-mintGlow text-slate-950 font-bold text-xs shadow-neon-mint flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Deploy Custom to Simulator</span>
        </button>
      </div>

      {/* Preset Workload Quick Selector */}
      <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-amber" />
          <span>Quick Benchmark Presets</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handleDeployPreset(p.id)}
              className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-900/30 hover:border-neon-purple/50 text-left transition-all group flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white group-hover:text-neon-mint transition-colors">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{p.desc}</p>
              </div>
              <span className="text-[10px] font-mono font-semibold text-neon-mint flex items-center gap-1">
                Load Preset &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Alert Banners */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-neon-coral" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-neon-mint" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Editable Process Table */}
      <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neon-purple" />
            <h3 className="text-sm font-bold text-white">Process Definitions ({processes.length})</h3>
          </div>
          <button
            onClick={handleAddProcess}
            className="px-3 py-1.5 rounded-lg bg-purple-900/40 border border-purple-700/50 hover:bg-purple-800/40 text-xs font-semibold text-purple-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Process</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-purple-900/30">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#120d26] text-slate-400 uppercase font-mono text-[10px] border-b border-purple-900/30">
              <tr>
                <th className="p-3">PID</th>
                <th className="p-3">Process Name</th>
                <th className="p-3">Arrival (t)</th>
                <th className="p-3">Burst (t)</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Memory (MB)</th>
                <th className="p-3">Reclaimable</th>
                <th className="p-3">I/O Freq</th>
                <th className="p-3">I/O Dur</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20 font-mono">
              {processes.map((p, idx) => (
                <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.pid}
                      onChange={(e) => handleChange(idx, 'pid', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleChange(idx, 'name', e.target.value)}
                      className="w-32 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none font-sans"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.arrival_time}
                      min="0"
                      onChange={(e) => handleChange(idx, 'arrival_time', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.burst_time}
                      min="1"
                      onChange={(e) => handleChange(idx, 'burst_time', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none text-neon-mint font-bold"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.priority}
                      min="1"
                      onChange={(e) => handleChange(idx, 'priority', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none text-neon-amber"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.memory}
                      min="1"
                      onChange={(e) => handleChange(idx, 'memory', parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.reclaimable_memory}
                      min="0"
                      onChange={(e) => handleChange(idx, 'reclaimable_memory', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none text-purple-300"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.io_frequency}
                      min="0"
                      onChange={(e) => handleChange(idx, 'io_frequency', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={p.io_duration}
                      min="0"
                      onChange={(e) => handleChange(idx, 'io_duration', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-[#090714] border border-purple-800/50 text-white text-xs focus:border-neon-mint outline-none"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRemoveProcess(p.pid)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Remove Process"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
