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
  Info
} from 'lucide-react';

export const LiveProcessMonitor: React.FC = () => {
  const { snapshot, setSelectedProcess, loadWorkload, loadCustomWorkload } = useSimulation();

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
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

  // De-duplicate processes by PID just in case
  const uniqueProcesses: ProcessModel[] = [];
  const seenPids = new Set<number>();
  for (const p of allProcesses) {
    if (!seenPids.has(p.pid)) {
      seenPids.add(p.pid);
      uniqueProcesses.push(p);
    }
  }

  // Filter & search
  const filtered = uniqueProcesses.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.pid.toString().includes(search);
    const matchesState = stateFilter === 'ALL' || p.state === stateFilter;
    return matchesSearch && matchesState;
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
    { id: 'BALANCED', name: 'Balanced Standard' },
    { id: 'CPU_HEAVY', name: 'CPU Saturation' },
    { id: 'MEMORY_PRESSURE', name: 'Memory Pressure' },
    { id: 'STARVATION_RISK', name: 'Starvation Risk' },
    { id: 'MIXED_ARRIVALS', name: 'Staggered Arrivals' },
    { id: 'NO_WORKLOAD_IDLE', name: 'Empty / Idle' },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation Safety Boundary Callout */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <strong className="text-cyan-300 font-semibold">Simulated Environment Notice: </strong>
          All process IDs, burst durations, states, and memory allocations displayed below are simulated inside OS Guardian's deterministic discrete clock engine. No host OS processes or actual hardware memory are manipulated.
        </div>
      </div>

      {/* Workload Presets & Actions Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Benchmark Workload Scenarios</h3>
          <p className="text-xs text-slate-400">Load calibrated process sets to evaluate scheduler dynamics and anomaly detection</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sampleWorkloads.map((wl) => (
            <button
              key={wl.id}
              onClick={() => loadWorkload(wl.id)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 text-xs font-medium transition-colors"
            >
              {wl.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Custom Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PID or process name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">State:</span>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-[#0f172a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All States ({uniqueProcesses.length})</option>
            <option value="READY">READY</option>
            <option value="RUNNING">RUNNING</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="TERMINATED">TERMINATED</option>
            <option value="NEW">NEW</option>
          </select>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
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
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    No simulated processes matching current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.pid}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedProcess(p)}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">
                      {p.pid}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-200">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge type="process" value={p.state} />
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      <span className="text-slate-100">{p.remaining_time}</span>
                      <span className="text-slate-500"> / {p.burst_time}t</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-slate-200">{p.memory} MB</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      <span className="text-amber-400 font-bold">{p.effective_priority}</span>
                      <span className="text-slate-500"> ({p.base_priority})</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {p.waiting_time}t
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {p.turnaround_time !== null && p.turnaround_time !== undefined ? `${p.turnaround_time}t` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProcess(p);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Process Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">Add Custom Simulated Process</h3>
            <p className="text-xs text-slate-400 mb-4">Inject custom process parameters into simulation table</p>

            <form onSubmit={handleAddCustom} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Process Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">PID</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPid}
                    onChange={(e) => setNewPid(Number(e.target.value))}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Arrival Time (Tick)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newArrival}
                    onChange={(e) => setNewArrival(Number(e.target.value))}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Burst (Ticks)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBurst}
                    onChange={(e) => setNewBurst(Number(e.target.value))}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Memory (MB)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMemory}
                    onChange={(e) => setNewMemory(Number(e.target.value))}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority (1-100)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newPriority}
                    onChange={(e) => setNewPriority(Number(e.target.value))}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
                >
                  Add Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
