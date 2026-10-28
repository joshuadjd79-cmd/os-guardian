import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progressPercent?: number;
  color?: 'mint' | 'purple' | 'amber' | 'coral' | 'cyan' | 'slate';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  progressPercent,
  color = 'mint',
  badge
}) => {
  const colorMap = {
    mint: 'border-neon-mint/30 text-neon-mint bg-neon-mint/10 shadow-neon-mint',
    purple: 'border-neon-purple/30 text-neon-purple bg-neon-purple/10 shadow-neon-purple',
    amber: 'border-neon-amber/30 text-neon-amber bg-neon-amber/10 shadow-neon-amber',
    coral: 'border-neon-coral/30 text-neon-coral bg-neon-coral/10 shadow-neon-coral',
    cyan: 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10',
    slate: 'border-purple-900/40 text-purple-300 bg-purple-950/30',
  };

  const barColorMap = {
    mint: 'bg-neon-mint',
    purple: 'bg-neon-purple',
    amber: 'bg-neon-amber',
    coral: 'bg-neon-coral',
    cyan: 'bg-cyan-400',
    slate: 'bg-purple-600',
  };

  return (
    <div className="bg-[#110d24] border border-purple-900/30 rounded-2xl p-4 shadow-xl hover:border-purple-600/40 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <div className={`p-2 rounded-xl border ${colorMap[color]}`}>{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold tracking-tight text-white group-hover:scale-105 transition-transform">{value}</div>
        {badge && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1b1438] text-purple-200 border border-purple-700/40">
            {badge}
          </span>
        )}
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-[#1a1436] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${barColorMap[color]}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && <p className="mt-2 text-[11px] text-slate-400 truncate font-mono">{subtitle}</p>}
    </div>
  );
};
