import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Radio,
  Sparkles,
  Gauge
} from 'lucide-react';

interface HeaderProps {
  onOpenGuidedDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuidedDemo }) => {
  const { snapshot, wsConnected, start, pause, step, reset, updateConfig } = useSimulation();

  const isRunning = snapshot?.status === 'RUNNING';
  const hasAlerts = (snapshot?.active_alerts?.length || 0) > 0;
  const currentSpeed = snapshot?.config?.speed_ms ?? 500;

  const handleSpeedChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!snapshot) return;
    const speed = parseInt(e.target.value);
    await updateConfig({
      ...snapshot.config,
      speed_ms: speed
    });
  };

  return (
    <header className="h-16 bg-[#0c091a] border-b border-purple-900/30 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xl backdrop-blur-md">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neon-purple/15 border border-neon-purple/40 flex items-center justify-center text-neon-mint shadow-neon-purple">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-wide bg-gradient-to-r from-neon-mint via-white to-neon-purple bg-clip-text text-transparent">
              OS GUARDIAN
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-purple/25 text-neon-mint border border-neon-mint/30 font-bold shadow-sm">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-purple-300/70 font-medium">Explainable, Self-Healing OS Simulator</p>
        </div>
      </div>

      {/* Center Controls & Indicators */}
      <div className="flex items-center gap-3">
        {/* Guided Demo Launch Button */}
        <button
          onClick={onOpenGuidedDemo}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-mint hover:from-purple-500 hover:to-neon-mintGlow text-slate-950 font-bold text-xs shadow-neon-purple transition-all flex items-center gap-1.5 active:scale-95"
          title="Launch 10-Step Guided Reviewer Tour"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Start Guided Demo</span>
        </button>

        {/* State Badge */}
        <div className="flex items-center gap-2 bg-[#140f29] px-3 py-1.5 rounded-xl border border-purple-900/40 text-xs">
          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-neon-mint animate-neon-pulse shadow-neon-mint' : 'bg-slate-600'}`} />
          <span className="font-mono text-slate-200 font-semibold">{snapshot?.status || 'STOPPED'}</span>
          <span className="text-purple-900">|</span>
          <span className="font-mono text-neon-amber font-bold">Tick {snapshot?.current_time ?? 0}</span>
        </div>

        {/* Simulation Speed Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#140f29] px-2.5 py-1 rounded-xl border border-purple-900/40 text-xs text-slate-300">
          <Gauge className="w-3.5 h-3.5 text-neon-amber" />
          <select
            value={currentSpeed}
            onChange={handleSpeedChange}
            className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer font-mono font-medium"
          >
            <option value="1000" className="bg-[#140f29] text-white">0.5x (1000ms)</option>
            <option value="500" className="bg-[#140f29] text-white">1x (500ms)</option>
            <option value="250" className="bg-[#140f29] text-white">2x (250ms)</option>
            <option value="100" className="bg-[#140f29] text-white">5x (100ms)</option>
            <option value="30" className="bg-[#140f29] text-white">10x (30ms)</option>
          </select>
        </div>

        {/* Playback Actions */}
        <div className="flex items-center gap-1 bg-[#140f29] p-1 rounded-xl border border-purple-900/40">
          {isRunning ? (
            <button
              onClick={pause}
              className="px-3 py-1 rounded-lg bg-neon-amber/20 text-neon-amber hover:bg-neon-amber/30 border border-neon-amber/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Pause Simulation"
            >
              <Pause className="w-3.5 h-3.5 fill-current" /> Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="px-3.5 py-1 rounded-lg bg-neon-mint text-slate-950 hover:bg-neon-mintGlow text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-neon-mint"
              title="Run Simulation Continuously"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Run
            </button>
          )}

          <button
            onClick={step}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors"
            title="Advance 1 Step (Tick)"
          >
            <StepForward className="w-4 h-4 text-neon-mint" />
          </button>

          <button
            onClick={() => reset()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Active Scheduler Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#140f29] px-3 py-1.5 rounded-xl border border-purple-900/40 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-neon-purple" />
          <span className="font-mono text-neon-mint font-semibold">{snapshot?.config.scheduler_algorithm || 'ROUND_ROBIN'}</span>
          {snapshot?.config.scheduler_algorithm === 'ROUND_ROBIN' && (
            <span className="text-slate-400 font-mono">(q={snapshot.config.time_quantum})</span>
          )}
        </div>
      </div>

      {/* Right WebSocket status & alerts summary */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
            wsConnected
              ? 'bg-neon-mint/10 text-neon-mint border-neon-mint/30 shadow-sm'
              : 'bg-neon-amber/10 text-neon-amber border-neon-amber/30'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span className="font-mono font-medium">{wsConnected ? 'Telemetry 60Hz' : 'Connecting'}</span>
        </div>

        {hasAlerts && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-neon-coral/20 text-neon-coral border border-neon-coral/40 font-bold shadow-neon-coral animate-neon-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{snapshot?.active_alerts.length} Alert(s)</span>
          </div>
        )}
      </div>
    </header>
  );
};
