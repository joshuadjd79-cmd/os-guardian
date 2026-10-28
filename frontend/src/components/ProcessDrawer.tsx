import React from 'react';
import { ProcessModel } from '../types/simulation';
import { StatusBadge } from './StatusBadge';
import { X, Clock, Cpu, Database, Award, ArrowRight } from 'lucide-react';

interface ProcessDrawerProps {
  process: ProcessModel | null;
  onClose: () => void;
}

export const ProcessDrawer: React.FC<ProcessDrawerProps> = ({ process, onClose }) => {
  if (!process) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0e0a1f] border-l border-purple-900/40 shadow-2xl z-50 flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="p-5 border-b border-purple-900/40 flex items-center justify-between bg-[#140f29]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-neon-mint font-extrabold text-sm">PID {process.pid}</span>
            <StatusBadge type="process" value={process.state} />
          </div>
          <h2 className="text-base font-bold text-white mt-1">{process.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/30">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Cpu className="w-3.5 h-3.5 text-neon-mint" /> Remaining
            </span>
            <div className="text-base font-extrabold text-white mt-1 font-mono">
              {process.remaining_time} <span className="text-xs font-normal text-slate-400">/ {process.burst_time}t</span>
            </div>
            <div className="w-full bg-[#0a0717] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-neon-mint h-1.5 rounded-full"
                style={{ width: `${Math.round(((process.burst_time - process.remaining_time) / process.burst_time) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/30">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Database className="w-3.5 h-3.5 text-purple-400" /> Memory
            </span>
            <div className="text-base font-extrabold text-white mt-1 font-mono">
              {process.memory} <span className="text-xs font-normal text-slate-400">MB</span>
            </div>
            <span className="text-[10px] font-mono text-neon-amber block mt-1">
              Reclaimable: {process.reclaimable_memory} MB
            </span>
          </div>

          <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/30">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Award className="w-3.5 h-3.5 text-neon-amber" /> Priority
            </span>
            <div className="text-base font-extrabold text-white mt-1 font-mono">
              {process.effective_priority}
              <span className="text-xs font-normal text-slate-400 ml-1">(Base: {process.base_priority})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              Aging Wait: {process.ticks_in_ready_queue}t
            </span>
          </div>

          <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/30">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Clock className="w-3.5 h-3.5 text-neon-mint" /> Latency
            </span>
            <div className="text-xs text-slate-300 mt-1 space-y-0.5 font-mono">
              <div>Wait: <span className="text-neon-amber font-bold">{process.waiting_time}t</span></div>
              <div>Turn: <span className="text-neon-mint">{process.turnaround_time ?? '-'}t</span></div>
              <div>Resp: <span className="text-purple-300">{process.response_time ?? '-'}t</span></div>
            </div>
          </div>
        </div>

        {/* I/O Details */}
        {process.io_frequency > 0 && (
          <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/30 text-xs">
            <h4 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <span>Simulated I/O Specification</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
              <div>Triggers every: <span className="text-white">{process.io_frequency} CPU ticks</span></div>
              <div>Block duration: <span className="text-white">{process.io_duration} ticks</span></div>
              <div>Remaining I/O: <span className="text-neon-amber font-bold">{process.current_io_remaining} ticks</span></div>
            </div>
          </div>
        )}

        {/* State Transition History */}
        <div>
          <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            PCB State Transition Audit Trail
          </h4>
          <div className="space-y-3 border-l-2 border-purple-900/40 ml-2 pl-4">
            {process.state_history.map((record, i) => (
              <div key={i} className="text-xs relative">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neon-mint font-bold">Tick {record.timestamp}</span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <span className="text-slate-400">{record.from_state}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-white">{record.to_state}</span>
                  </div>
                </div>
                {record.reason && (
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">{record.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
