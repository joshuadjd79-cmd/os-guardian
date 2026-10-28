import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Clock, Download, Filter, Search, Tag } from 'lucide-react';

export const EventTimeline: React.FC = () => {
  const { snapshot } = useSimulation();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  if (!snapshot) return null;

  const events = snapshot.recent_events || [];

  const types = Array.from(new Set(events.map((e) => e.type)));

  const filtered = events.filter((e) => {
    const matchesType = filterType === 'ALL' || e.type === filterType;
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(e.data).toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportJsonLog = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `os_guardian_event_log_tick_${snapshot.current_time}.json`;
    a.click();
  };

  const getEventBadgeColor = (type: string) => {
    if (type.includes('RECOVERY')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (type.includes('ANOMALY') || type.includes('ALERT')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (type.includes('TERMINATED')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (type.includes('IO')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">Discrete Event Stream & Timeline</h2>
          </div>
          <p className="text-xs text-slate-400">
            Chronological audit log of state transitions, dispatches, preemption, anomaly flags, and recovery actions.
          </p>
        </div>

        <button
          onClick={exportJsonLog}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 self-start md:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Log JSON
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event descriptions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Event Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#0f172a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Types ({events.length})</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            No events logged matching the selected filter criteria.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-5">
            {filtered.slice().reverse().map((ev, i) => (
              <div key={i} className="relative group">
                {/* Dot on line */}
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-500 group-hover:scale-125 transition-transform" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">Tick {ev.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${getEventBadgeColor(ev.type)}`}>
                      {ev.type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200">{ev.description}</p>

                {/* Metadata payload */}
                {ev.data && Object.keys(ev.data).length > 0 && (
                  <div className="mt-1 text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {JSON.stringify(ev.data)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
