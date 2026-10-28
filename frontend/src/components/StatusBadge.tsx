import React from 'react';
import { ProcessState, AnomalySeverity, ActionOutcome } from '../types/simulation';

interface StatusBadgeProps {
  type: 'process' | 'severity' | 'outcome';
  value: ProcessState | AnomalySeverity | ActionOutcome | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  let bgClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'process') {
    switch (value) {
      case 'RUNNING':
        bgClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
        break;
      case 'READY':
        bgClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        break;
      case 'BLOCKED':
        bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        break;
      case 'TERMINATED':
        bgClass = 'bg-slate-700/50 text-slate-400 border-slate-600/40';
        break;
      case 'NEW':
        bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        break;
    }
  } else if (type === 'severity') {
    switch (value) {
      case 'CRITICAL':
        bgClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        break;
      case 'WARNING':
        bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        break;
      case 'INFO':
        bgClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        break;
    }
  } else if (type === 'outcome') {
    switch (value) {
      case 'SUCCESS':
        bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        break;
      case 'PARTIAL_IMPROVEMENT':
        bgClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
        break;
      case 'NO_IMPROVEMENT':
        bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        break;
      case 'REGRESSION':
        bgClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        break;
      case 'PENDING':
        bgClass = 'bg-slate-800 text-slate-400 border-slate-700';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${bgClass}`}>
      {value}
    </span>
  );
};
