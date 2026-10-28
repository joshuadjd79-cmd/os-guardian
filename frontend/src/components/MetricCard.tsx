import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progressPercent?: number;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  progressPercent,
  color = 'cyan',
  badge
}) => {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    slate: 'border-slate-700/50 text-slate-400 bg-slate-800/40',
  };

  const barColorMap = {
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <div className={`p-1.5 rounded-lg border ${colorMap[color]}`}>{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-slate-100">{value}</div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${barColorMap[color]}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && <p className="mt-2 text-xs text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
};
