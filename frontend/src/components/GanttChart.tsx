import React from 'react';
import { GanttInterval } from '../types/simulation';

interface GanttChartProps {
  intervals: GanttInterval[];
  currentTime: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ intervals = [], currentTime }) => {
  // Show the last 45 ticks or all if smaller
  const maxTime = Math.max(currentTime, 1);
  const minTime = Math.max(0, maxTime - 45);
  const visibleIntervals = (intervals || []).filter(
    (item) => item.end_time > minTime && item.start_time <= maxTime
  );

  const getProcessColor = (pid?: number | null, isOverhead?: boolean) => {
    if (isOverhead) return 'bg-neon-amber border-amber-300 text-slate-950 font-bold';
    if (pid === null || pid === undefined) return 'bg-purple-950/40 border-purple-900/40 text-slate-500';

    const colors = [
      'bg-neon-mint border-neon-mintGlow text-slate-950 font-bold',
      'bg-neon-purple border-purple-400 text-white font-bold',
      'bg-neon-coral border-rose-400 text-white font-bold',
      'bg-neon-amber border-amber-300 text-slate-950 font-bold',
      'bg-cyan-400 border-cyan-300 text-slate-950 font-bold',
      'bg-violet-400 border-violet-300 text-slate-950 font-bold',
      'bg-emerald-400 border-emerald-300 text-slate-950 font-bold',
    ];
    return colors[pid % colors.length];
  };

  return (
    <div className="bg-[#110d24] border border-purple-900/30 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-300 uppercase tracking-wider text-[10px]">CPU Execution Timeline</span>
          <span className="text-[10px] font-mono text-neon-mint">Window: [{minTime}t &rarr; {maxTime}t]</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-neon-mint" /> Active Process
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-neon-amber" /> Recovery Overhead
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-purple-950 border border-purple-800" /> Idle
          </div>
        </div>
      </div>

      {visibleIntervals.length === 0 ? (
        <div className="h-16 flex items-center justify-center text-xs text-slate-500 italic bg-[#0e0a1f] rounded-xl border border-dashed border-purple-900/40 font-mono">
          No execution intervals recorded yet. Advance ticks to view scheduling traces.
        </div>
      ) : (
        <div className="space-y-1.5 font-mono">
          {/* Timeline Bar */}
          <div className="relative h-10 w-full bg-[#0a0717] rounded-xl border border-purple-900/40 overflow-hidden flex">
            {visibleIntervals.map((interval, idx) => {
              const startClamped = Math.max(interval.start_time, minTime);
              const endClamped = Math.min(interval.end_time, maxTime);
              const duration = endClamped - startClamped;
              if (duration <= 0) return null;
              const widthPct = (duration / (maxTime - minTime)) * 100;

              return (
                <div
                  key={idx}
                  className={`h-full border-r flex items-center justify-center transition-all ${getProcessColor(
                    interval.pid,
                    interval.is_recovery_overhead
                  )}`}
                  style={{ width: `${widthPct}%` }}
                  title={
                    interval.is_recovery_overhead
                      ? `Tick ${interval.start_time}-${interval.end_time}: Recovery Action Overhead`
                      : interval.pid !== null
                      ? `Tick ${interval.start_time}-${interval.end_time}: PID ${interval.pid} (${interval.process_name})`
                      : `Tick ${interval.start_time}-${interval.end_time}: CPU Idle`
                  }
                >
                  <span className="text-[10px] truncate px-1 font-bold">
                    {interval.is_recovery_overhead
                      ? 'REC'
                      : interval.pid !== null
                      ? `P${interval.pid}`
                      : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time axis marks */}
          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>Tick {minTime}</span>
            <span>Tick {Math.round((minTime + maxTime) / 2)}</span>
            <span className="text-neon-amber font-bold">Tick {maxTime} (Now)</span>
          </div>
        </div>
      )}
    </div>
  );
};
