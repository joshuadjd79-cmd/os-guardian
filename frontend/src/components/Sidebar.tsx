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
  GraduationCap,
  Server,
  FileSpreadsheet,
  PlusCircle
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'processes'
  | 'laboratory'
  | 'recovery'
  | 'explainability'
  | 'experiments'
  | 'architecture'
  | 'workload-builder'
  | 'reports'
  | 'timeline'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { snapshot } = useSimulation();
  const alertCount = snapshot?.active_alerts?.length || 0;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number; category?: string }> = [
    { id: 'overview', label: 'Mission Control', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Core Observability' },
    { id: 'processes', label: 'Process Explorer', icon: <Activity className="w-4 h-4" /> },
    { id: 'laboratory', label: 'Scheduling Laboratory', icon: <Sliders className="w-4 h-4" /> },
    { id: 'recovery', label: 'Recovery Center', icon: <ShieldAlert className="w-4 h-4" />, badge: alertCount, category: 'Self-Healing Engine' },
    { id: 'explainability', label: 'Decision Explainability', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'experiments', label: 'Experiment Workbench', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'workload-builder', label: 'Workload Studio', icon: <PlusCircle className="w-4 h-4" />, category: 'Platform & Analysis' },
    { id: 'architecture', label: 'Architecture Inspector', icon: <Server className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Export', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'timeline', label: 'Event Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Viva Guide', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0a0717] border-r border-purple-900/30 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div className="p-3 space-y-1">
        {navItems.map((item, idx) => {
          const isActive = currentTab === item.id;
          return (
            <React.Fragment key={item.id}>
              {item.category && (
                <div className={`text-[10px] font-mono font-bold text-purple-400/60 uppercase tracking-wider px-3 ${idx > 0 ? 'mt-4 mb-1' : 'mb-1'}`}>
                  {item.category}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-neon-mint/15 text-neon-mint border border-neon-mint/40 shadow-neon-mint'
                    : 'text-slate-400 hover:text-white hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-neon-mint' : 'text-purple-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neon-coral/25 text-neon-coral border border-neon-coral/40">
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Course Badge */}
      <div className="p-4 border-t border-purple-900/30 bg-[#0e0a1f] text-[11px] text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-neon-mint" />
          <span className="font-bold text-white">OS Course Capstone</span>
        </div>
        <p className="text-[10px] text-purple-300/60 leading-relaxed font-sans">
          Operating Systems Engineering &bull; Explainable Self-Healing Simulator
        </p>
      </div>
    </aside>
  );
};
