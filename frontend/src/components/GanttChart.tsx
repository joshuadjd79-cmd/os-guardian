import React from 'react';
import { GanttInterval } from '../types/simulation';

interface GanttChartProps {
  intervals: GanttInterval[];
  currentTime: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ intervals, currentTime }) => {
  // Show the last 40 ticks or all if smaller
  const maxTime = Math.max(currentTime, 1);
  const minTime = Math.max(0, maxTime - 45);
  const visibleIntervals = intervals.filter(
    (item) => item.end_time > minTime && item.start_time <= maxTime
  );

  const getProcessColor = (pid?: number | null, isOverhead?: boolean) => {
    if (isOverhead) return 'bg-amber-500/80 border-amber-400 text-amber-950 font-bold';
    if (pid === null || pid === undefined) return 'bg-slate-800/80 border-slate-700 text-slate-500';

    const colors = [
      'bg-cyan-500 border-cyan-400 text-slate-950',
      'bg-blue-500 border-blue-400 text-slate-950',
      'bg-emerald-500 border-emerald-400 text-slate-950',
      'bg-violet-500 border-violet-400 text-slate-950',
      'bg-rose-500 border-rose-400 text-slate-950',
      'bg-amber-400 border-amber-300 text-slate-950',
      'bg-teal-500 border-teal-400 text-slate-950',
    ];
    return colors[pid % colors.length];
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">CPU Execution Gantt Timeline</h3>
          <p className="text-xs text-slate-400">Discrete time execution slice logging with IDLE intervals</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-500 inline-block"></span> Process
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block"></span> IDLE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span> Recovery Overhead
          </span>
        </div>
      </div>

      {visibleIntervals.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-lg">
          No execution ticks recorded yet. Start simulation or step forward.
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[600px]">
            {/* Timeline Bar */}
            <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900/80">
              {visibleIntervals.map((interval, idx) => {
                const start = Math.max(interval.start_time, minTime);
                const end = Math.min(interval.end_time, maxTime);
                const duration = Math.max(1, end - start);
                const totalVisibleTicks = Math.max(1, maxTime - minTime);
                const widthPercent = (duration / totalVisibleTicks) * 100;

                const isIdle = interval.pid === null || interval.process_name === 'IDLE';

                return (
                  <div
                    key={`${interval.start_time}-${interval.end_time}-${idx}`}
                    className={`h-full border-r border-slate-900/30 flex flex-col items-center justify-center text-xs px-1 select-none transition-all ${getProcessColor(
                      interval.pid,
                      interval.is_recovery_overhead
                    )}`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${interval.process_name || 'IDLE'} (${interval.start_time} -> ${interval.end_time}) [${duration} ticks]`}
                  >
                    <span className="font-semibold truncate">
                      {isIdle ? 'IDLE' : interval.process_name || `P${interval.pid}`}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {duration}t
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Ticks Axis */}
            <div className="flex justify-between mt-2 text-[11px] font-mono text-slate-500 px-1">
              <span>Tick {minTime}</span>
              <span>Tick {Math.floor((minTime + maxTime) / 2)}</span>
              <span className="text-cyan-400 font-semibold">Tick {currentTime} (Current)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
