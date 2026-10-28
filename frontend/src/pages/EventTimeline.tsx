import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Clock, Download, Filter, Search, Tag, Sparkles } from 'lucide-react';

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
    if (type.includes('RECOVERY')) return 'bg-neon-mint/20 text-neon-mint border-neon-mint/40 shadow-neon-mint';
    if (type.includes('ANOMALY') || type.includes('ALERT')) return 'bg-neon-coral/20 text-neon-coral border-neon-coral/40';
    if (type.includes('TERMINATED')) return 'bg-purple-950 text-slate-300 border-purple-800/40';
    if (type.includes('DISPATCH') || type.includes('START')) return 'bg-neon-purple/20 text-neon-purple border-neon-purple/40';
    if (type.includes('IO')) return 'bg-neon-amber/20 text-neon-amber border-neon-amber/40';
    return 'bg-purple-950/40 text-slate-300 border-purple-900/40';
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-neon-mint" />
            <span>Chronological Audit Recorder</span>
          </div>
          <h2 className="text-xl font-bold text-white">Event Timeline & Replay Stream</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Continuous cycle-accurate trace of process arrivals, CPU preemption, quantum expirations, anomaly triggers, and self-healing actions.
          </p>
        </div>

        <button
          onClick={exportJsonLog}
          className="px-4 py-2.5 rounded-xl bg-neon-mint text-slate-950 font-bold text-xs hover:bg-neon-mintGlow shadow-neon-mint flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" /> Export Log JSON
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by text or process ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-void-850 border border-purple-900/40 text-xs text-white focus:outline-none focus:border-neon-mint placeholder-purple-400/60 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Event Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-void-850 border border-purple-900/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neon-mint font-mono"
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

      {/* Event Stream List */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic font-mono">
            No events match the current filter or search criteria.
          </div>
        ) : (
          <div className="relative border-l border-purple-900/40 ml-4 pl-5 space-y-4">
            {filtered.slice().reverse().map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-neon-mint border-2 border-void-950 group-hover:scale-125 transition-transform" />

                <div className="p-3.5 rounded-xl bg-[#140f29] border border-purple-900/30 hover:border-purple-600/40 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getEventBadgeColor(evt.type)}`}>
                      {evt.type}
                    </span>
                    <span className="text-[11px] font-mono text-neon-amber font-bold">Tick {evt.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-200 font-sans">{evt.description}</p>

                  {evt.data && Object.keys(evt.data).length > 0 && (
                    <div className="pt-1.5 mt-1 border-t border-purple-900/30 text-[10px] font-mono text-slate-400">
                      {JSON.stringify(evt.data)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
