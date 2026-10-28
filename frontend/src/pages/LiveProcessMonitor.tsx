import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { StatusBadge } from '../components/StatusBadge';
import { ProcessModel, WorkloadType, ProcessState } from '../types/simulation';
import {
  Search,
  Filter,
  Plus,
  PlayCircle,
  Database,
  Cpu,
  Clock,
  Layers,
  Info,
  Sliders,
  ArrowUpDown
} from 'lucide-react';

export const LiveProcessMonitor: React.FC = () => {
  const { snapshot, setSelectedProcess, loadWorkload, loadCustomWorkload } = useSimulation();

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'pid' | 'waiting' | 'burst' | 'priority'>('pid');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for custom process creation
  const [newPid, setNewPid] = useState(10);
  const [newName, setNewName] = useState('Custom_Task');
  const [newBurst, setNewBurst] = useState(10);
  const [newMemory, setNewMemory] = useState(128);
  const [newPriority, setNewPriority] = useState(5);
  const [newArrival, setNewArrival] = useState(0);

  if (!snapshot) return null;

  const allProcesses = [
    ...(snapshot.running_process ? [snapshot.running_process] : []),
    ...snapshot.ready_queue,
    ...snapshot.blocked_queue,
    ...snapshot.completed_processes,
    ...snapshot.active_processes.filter(
      (p) =>
        p.pid !== snapshot.running_process?.pid &&
        !snapshot.ready_queue.some((r) => r.pid === p.pid) &&
        !snapshot.blocked_queue.some((b) => b.pid === p.pid) &&
        !snapshot.completed_processes.some((c) => c.pid === p.pid)
    ),
  ];

  // De-duplicate processes by PID
  const uniqueProcesses: ProcessModel[] = [];
  const seenPids = new Set<number>();
  for (const p of allProcesses) {
    if (!seenPids.has(p.pid)) {
      seenPids.add(p.pid);
      uniqueProcesses.push(p);
    }
  }

  // Filter & search & sort
  const filtered = uniqueProcesses.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pid.toString().includes(search);
    const matchesState = stateFilter === 'ALL' || p.state === stateFilter;
    return matchesSearch && matchesState;
  }).sort((a, b) => {
    if (sortBy === 'waiting') return b.waiting_time - a.waiting_time;
    if (sortBy === 'burst') return b.remaining_time - a.remaining_time;
    if (sortBy === 'priority') return a.effective_priority - b.effective_priority;
    return a.pid - b.pid;
  });

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentList = uniqueProcesses.map((p) => ({
        pid: p.pid,
        name: p.name,
        arrival_time: p.arrival_time,
        burst_time: p.burst_time,
        memory: p.memory,
        priority: p.base_priority,
        reclaimable_memory: p.reclaimable_memory,
        io_frequency: p.io_frequency,
        io_duration: p.io_duration
      }));

      currentList.push({
        pid: Number(newPid),
        name: newName,
        arrival_time: Number(newArrival),
        burst_time: Number(newBurst),
        memory: Number(newMemory),
        priority: Number(newPriority),
        reclaimable_memory: 20,
        io_frequency: 0,
        io_duration: 0
      });

      await loadCustomWorkload(currentList);
      setShowAddModal(false);
      setNewPid(newPid + 1);
    } catch (err) {
      alert('Failed to add process: ' + err);
    }
  };

  const sampleWorkloads: Array<{ id: WorkloadType; name: string }> = [
    { id: 'BALANCED', name: 'Balanced' },
    { id: 'CPU_HEAVY', name: 'CPU Heavy' },
    { id: 'MEMORY_PRESSURE', name: 'Mem Pressure' },
    { id: 'STARVATION_RISK', name: 'Starvation' },
    { id: 'MIXED_ARRIVALS', name: 'Staggered' },
    { id: 'RECOVERY_REGRESSION', name: 'Overhead Scenario' },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Safety Boundary Callout */}
      <div className="bg-[#120d26] border border-purple-900/30 rounded-xl p-3.5 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-neon-mint shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-white font-semibold">Simulated Process Control Block (PCB): </strong>
          All Process Control Block states (`NEW`, `READY`, `RUNNING`, `BLOCKED`, `TERMINATED`), remaining bursts, and memory limits are simulated strictly in-memory.
        </div>
      </div>

      {/* Workload Presets & Actions Bar */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Standard Workload Injector</h3>
          <p className="text-xs text-slate-400">Deploy calibrated process benchmarks or create ad-hoc tasks</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sampleWorkloads.map((wl) => (
            <button
              key={wl.id}
              onClick={() => loadWorkload(wl.id)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-900/40 border border-purple-800/40 text-xs font-mono font-medium transition-colors"
            >
              {wl.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-neon-mint text-slate-950 hover:bg-neon-mintGlow text-xs font-bold flex items-center gap-1 transition-all shadow-neon-mint"
          >
            <Plus className="w-3.5 h-3.5" /> Quick Task
          </button>
        </div>
      </div>

      {/* Filter, Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by PID or process name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-void-850 border border-purple-900/40 text-xs text-white focus:outline-none focus:border-neon-mint placeholder-purple-400/60 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-void-850 border border-purple-900/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-mint font-mono"
            >
              <option value="ALL">All States ({uniqueProcesses.length})</option>
              <option value="READY">READY</option>
              <option value="RUNNING">RUNNING</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="TERMINATED">TERMINATED</option>
              <option value="NEW">NEW</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-void-850 border border-purple-900/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-mint font-mono"
            >
              <option value="pid">Sort by PID</option>
              <option value="waiting">Sort by Wait Time</option>
              <option value="burst">Sort by Remaining Burst</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#120d26] border-b border-purple-900/30 text-slate-400 uppercase font-mono font-semibold text-[10px]">
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4">Process Name</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Remaining / Burst</th>
                <th className="py-3 px-4">Memory</th>
                <th className="py-3 px-4">Priority (Eff/Base)</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Turnaround</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic font-mono">
                    No simulated processes matching current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isStarving = p.waiting_time > 15 && p.state === 'READY';
                  return (
                    <tr
                      key={p.pid}
                      className={`hover:bg-purple-950/20 transition-colors ${
                        isStarving ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white">PID {p.pid}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                        {p.name}
                        {isStarving && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-neon-amber/20 text-neon-amber border border-neon-amber/40 font-mono font-bold">
                            STARVATION RISK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="process" value={p.state} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-neon-mint font-bold">{p.remaining_time}t</span>
                        <span className="text-slate-500"> / {p.burst_time}t</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white">{p.memory} MB</span>
                        {p.reclaimable_memory > 0 && (
                          <span className="text-[10px] text-purple-300 ml-1">
                            ({p.reclaimable_memory}MB rec)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-neon-purple font-bold">{p.effective_priority}</span>
                        <span className="text-slate-500"> / {p.base_priority}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={p.waiting_time > 15 ? 'text-neon-coral font-bold' : 'text-slate-300'}>
                          {p.waiting_time}t
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {p.turnaround_time !== null && p.turnaround_time !== undefined
                          ? `${p.turnaround_time}t`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedProcess(p)}
                          className="px-2.5 py-1 rounded-lg bg-purple-950 text-neon-mint hover:bg-neon-mint/20 border border-neon-mint/30 text-[11px] font-semibold transition-colors"
                        >
                          Inspect PCB &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Add Custom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#110d24] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Custom Simulated Process</h3>
            <form onSubmit={handleAddCustom} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Process Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">PID</label>
                  <input
                    type="number"
                    value={newPid}
                    onChange={(e) => setNewPid(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Arrival Time (Tick)</label>
                  <input
                    type="number"
                    value={newArrival}
                    onChange={(e) => setNewArrival(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Burst (Ticks)</label>
                  <input
                    type="number"
                    min="1"
                    value={newBurst}
                    onChange={(e) => setNewBurst(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Memory (MB)</label>
                  <input
                    type="number"
                    min="16"
                    value={newMemory}
                    onChange={(e) => setNewMemory(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <input
                    type="number"
                    min="1"
                    value={newPriority}
                    onChange={(e) => setNewPriority(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#090714] border border-purple-800 text-white outline-none focus:border-neon-mint font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-neon-mint text-slate-950 font-bold hover:bg-neon-mintGlow shadow-neon-mint"
                >
                  Insert Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
