import React from 'react';
import { ProcessState, AnomalySeverity, ActionOutcome } from '../types/simulation';

interface StatusBadgeProps {
  type: 'process' | 'severity' | 'outcome';
  value: ProcessState | AnomalySeverity | ActionOutcome | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  let bgClass = 'bg-[#1b1438] text-slate-300 border-purple-800/40';

  if (type === 'process') {
    switch (value) {
      case 'RUNNING':
        bgClass = 'bg-neon-mint/20 text-neon-mint border-neon-mint/50 animate-pulse font-bold shadow-neon-mint';
        break;
      case 'READY':
        bgClass = 'bg-neon-purple/20 text-neon-purple border-neon-purple/40 font-semibold';
        break;
      case 'BLOCKED':
        bgClass = 'bg-neon-amber/20 text-neon-amber border-neon-amber/40 font-semibold';
        break;
      case 'TERMINATED':
        bgClass = 'bg-purple-950/40 text-slate-400 border-purple-900/30';
        break;
      case 'NEW':
        bgClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
        break;
      case 'UNRESPONSIVE':
        bgClass = 'bg-neon-coral/25 text-neon-coral border-neon-coral/50 font-bold animate-pulse';
        break;
    }
  } else if (type === 'severity') {
    switch (value) {
      case 'CRITICAL':
        bgClass = 'bg-neon-coral/25 text-neon-coral border-neon-coral/50 font-bold shadow-neon-coral';
        break;
      case 'WARNING':
        bgClass = 'bg-neon-amber/20 text-neon-amber border-neon-amber/40 font-semibold shadow-neon-amber';
        break;
      case 'INFO':
        bgClass = 'bg-neon-mint/15 text-neon-mint border-neon-mint/30';
        break;
    }
  } else if (type === 'outcome') {
    switch (value) {
      case 'SUCCESS':
        bgClass = 'bg-neon-mint/20 text-neon-mint border-neon-mint/40 font-bold shadow-neon-mint';
        break;
      case 'PARTIAL_IMPROVEMENT':
        bgClass = 'bg-neon-purple/20 text-purple-200 border-neon-purple/40 font-semibold';
        break;
      case 'NO_IMPROVEMENT':
        bgClass = 'bg-neon-amber/20 text-neon-amber border-neon-amber/40';
        break;
      case 'REGRESSION':
        bgClass = 'bg-neon-coral/25 text-neon-coral border-neon-coral/50 font-bold';
        break;
      case 'PENDING':
        bgClass = 'bg-purple-950/50 text-slate-400 border-purple-900/30';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${bgClass}`}>
      {value}
    </span>
  );
};
