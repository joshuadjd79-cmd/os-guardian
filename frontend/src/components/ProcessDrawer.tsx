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
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0f172a] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 font-bold">PID {process.pid}</span>
            <StatusBadge type="process" value={process.state} />
          </div>
          <h2 className="text-base font-semibold text-slate-100 mt-1">{process.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Remaining Work
            </span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {process.remaining_time} <span className="text-xs font-normal text-slate-400">/ {process.burst_time} ticks</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div
                className="bg-cyan-500 h-1 rounded-full"
                style={{ width: `${Math.round(((process.burst_time - process.remaining_time) / process.burst_time) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Memory Allocated
            </span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {process.memory} <span className="text-xs font-normal text-slate-400">MB</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Reclaimable: {process.reclaimable_memory} MB
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Priority
            </span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {process.effective_priority}
              <span className="text-xs font-normal text-slate-400 ml-1">(Base: {process.base_priority})</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Aging wait: {process.ticks_in_ready_queue} ticks
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Timing Profile
            </span>
            <div className="text-xs text-slate-300 mt-1 space-y-0.5">
              <div>Wait: <span className="font-mono text-cyan-300">{process.waiting_time}t</span></div>
              <div>Turnaround: <span className="font-mono text-cyan-300">{process.turnaround_time ?? 'N/A'}</span></div>
              <div>Response: <span className="font-mono text-cyan-300">{process.response_time ?? 'N/A'}</span></div>
            </div>
          </div>
        </div>

        {/* I/O Details */}
        {process.io_frequency > 0 && (
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
            <h4 className="font-semibold text-slate-300 mb-1">Simulated I/O Specification</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div>Triggers every: <span className="text-slate-200">{process.io_frequency} CPU ticks</span></div>
              <div>Block duration: <span className="text-slate-200">{process.io_duration} ticks</span></div>
              <div>Remaining I/O: <span className="text-amber-400">{process.current_io_remaining} ticks</span></div>
            </div>
          </div>
        )}

        {/* State Transition History */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            State Transition History
          </h4>
          <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-3">
            {process.state_history.map((record, i) => (
              <div key={i} className="text-xs relative">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-cyan-400">Tick {record.timestamp}</span>
                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    <span className="text-slate-400">{record.from_state}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="text-slate-200">{record.to_state}</span>
                  </div>
                </div>
                {record.reason && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{record.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
