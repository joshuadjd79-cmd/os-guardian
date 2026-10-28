import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Play, Pause, StepForward, RotateCcw, ShieldCheck, ShieldAlert, Cpu, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const { snapshot, wsConnected, start, pause, step, reset } = useSimulation();

  const isRunning = snapshot?.status === 'RUNNING';
  const hasAlerts = (snapshot?.active_alerts?.length || 0) > 0;

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">OS GUARDIAN</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">Explainable, Self-Healing OS Simulator</p>
        </div>
      </div>

      {/* Center Controls & Indicators */}
      <div className="flex items-center gap-4">
        {/* State Badge */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-mono text-slate-300 font-semibold">{snapshot?.status || 'STOPPED'}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-400">Tick {snapshot?.current_time ?? 0}</span>
        </div>

        {/* Playback Actions */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Pause Simulation"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="px-3 py-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Run Simulation Continuously"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Run
            </button>
          )}

          <button
            onClick={step}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Advance 1 Step (Tick)"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => reset()}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Active Scheduler Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-slate-200">{snapshot?.config.scheduler_algorithm || 'ROUND_ROBIN'}</span>
          {snapshot?.config.scheduler_algorithm === 'ROUND_ROBIN' && (
            <span className="text-slate-500">(q={snapshot.config.time_quantum})</span>
          )}
        </div>
      </div>

      {/* Right WebSocket status & alerts summary */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
            wsConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>{wsConnected ? 'Live WS' : 'Connecting'}</span>
        </div>

        {hasAlerts && (
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{snapshot?.active_alerts.length} Alert(s)</span>
          </div>
        )}
      </div>
    </header>
  );
};
