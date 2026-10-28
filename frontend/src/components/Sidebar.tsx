import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  HelpCircle,
  FlaskConical,
  Clock,
  Sliders,
  Settings,
  GraduationCap
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'processes'
  | 'recovery'
  | 'explainability'
  | 'experiments'
  | 'timeline'
  | 'laboratory'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { snapshot } = useSimulation();
  const alertCount = snapshot?.active_alerts?.length || 0;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'processes', label: 'Live Process Monitor', icon: <Activity className="w-4 h-4" /> },
    { id: 'recovery', label: 'Recovery Center', icon: <ShieldAlert className="w-4 h-4" />, badge: alertCount },
    { id: 'explainability', label: 'Decision Explainability', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'experiments', label: 'Experiments & Benchmarks', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'timeline', label: 'Event Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'laboratory', label: 'Algorithm Laboratory', icon: <Sliders className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & About', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Course Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">OS Course Project</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Operating Systems Capstone &bull; Explainable, Self-Healing Simulator
        </p>
      </div>
    </aside>
  );
};
