import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { MetricCard } from '../components/MetricCard';
import { GanttChart } from '../components/GanttChart';
import { ResourceChart } from '../charts/ResourceChart';
import { StatusBadge } from '../components/StatusBadge';
import {
  Cpu,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Info,
  Server
} from 'lucide-react';

interface OverviewDashboardProps {
  onOpenDemo?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onOpenDemo, onNavigateTab }) => {
  const { snapshot, start, pause, step, reset, loadWorkload, setSelectedProcess } = useSimulation();

  if (!snapshot) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        <div className="w-12 h-12 rounded-2xl bg-neon-purple/20 border border-neon-purple/40 text-neon-mint flex items-center justify-center mx-auto mb-4 animate-spin">
          <Activity className="w-6 h-6" />
        </div>
        <span>Establishing real-time telemetry stream with OS Guardian simulator...</span>
      </div>
    );
  }

  const { metrics, config, active_alerts, recent_recovery_decisions, recent_events } = snapshot;
  const isRunning = snapshot.status === 'RUNNING';

  const isHealthy = active_alerts.length === 0;
  const criticalCount = active_alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = active_alerts.filter((a) => a.severity === 'WARNING').length;

  const latestDecision = recent_recovery_decisions.length > 0 ? recent_recovery_decisions[0] : null;

  return (
    <div className="space-y-6">
      {/* High-Impact Hero Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-[#170f30] via-[#110d24] to-[#0c0919] border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-neon-mint/15 text-neon-mint border border-neon-mint/30 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3" />
                OS Guardian 2.0 Autonomous Observability
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                Discrete-Time Engine
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Explainable, Self-Healing Operating System Simulator
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Continuous multi-criteria surveillance of CPU bursts, memory contention, and thread starvation. When system anomalies are detected, an explainable utility scorer evaluates candidate interventions to heal queue latency and optimize Jain's Fairness Index.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenDemo && (
              <button
                onClick={onOpenDemo}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-mint hover:from-purple-500 hover:to-neon-mintGlow text-slate-950 font-black text-xs shadow-neon-purple transition-all flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Start Guided Demo</span>
              </button>
            )}

            {isRunning ? (
              <button
                onClick={pause}
                className="px-4 py-3 rounded-xl bg-neon-amber/20 hover:bg-neon-amber/30 text-neon-amber border border-neon-amber/40 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={start}
                className="px-5 py-3 rounded-xl bg-neon-mint text-slate-950 hover:bg-neon-mintGlow font-black text-xs shadow-neon-mint flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Simulator</span>
              </button>
            )}

            <button
              onClick={() => loadWorkload('STARVATION_RISK')}
              className="px-4 py-3 rounded-xl bg-[#1b1438] hover:bg-[#251b4c] text-purple-200 border border-purple-700/40 font-semibold text-xs flex items-center gap-2 transition-colors"
              title="Load Predefined Starvation Scenario"
            >
              <Zap className="w-4 h-4 text-neon-amber" />
              <span>Inject Starvation</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow Graphic */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-[#120d26] border border-purple-900/30 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-neon-mint shrink-0" />
        <span className="leading-snug">
          <strong className="text-white">Safety Boundary: </strong>
          All scheduling, memory allocations, and recovery actions execute strictly on in-memory simulated process models. No host OS hardware or real OS processes are altered.
        </span>
      </div>

      {/* Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Utilization"
          value={`${metrics.cpu_utilization.toFixed(1)}%`}
          subtitle={`Busy: ${metrics.cpu_busy_time}t | Idle: ${metrics.cpu_idle_time}t`}
          icon={<Cpu className="w-4 h-4" />}
          progressPercent={metrics.cpu_utilization}
          color={metrics.cpu_utilization > 85 ? 'coral' : metrics.cpu_utilization > 60 ? 'amber' : 'mint'}
          badge={metrics.window_cpu_utilization > 85 ? 'WINDOW PEAK' : 'STABLE'}
        />

        <MetricCard
          title="Memory Pressure"
          value={`${metrics.memory_utilization.toFixed(1)}%`}
          subtitle={`${metrics.memory_used} MB / ${metrics.memory_capacity} MB`}
          icon={<Database className="w-4 h-4" />}
          progressPercent={metrics.memory_utilization}
          color={metrics.memory_utilization > 80 ? 'coral' : metrics.memory_utilization > 60 ? 'amber' : 'purple'}
          badge="IN-MEMORY"
        />

        <MetricCard
          title="Jain's Fairness Index"
          value={metrics.jains_fairness?.index ? metrics.jains_fairness.index.toFixed(3) : '1.000'}
          subtitle={`Scale: 0.0 (Worst) to 1.0 (Optimal)`}
          icon={<Activity className="w-4 h-4" />}
          progressPercent={(metrics.jains_fairness?.index || 1) * 100}
          color={metrics.jains_fairness?.index < 0.7 ? 'coral' : metrics.jains_fairness?.index < 0.85 ? 'amber' : 'mint'}
          badge={metrics.jains_fairness?.index >= 0.85 ? 'EQUITABLE' : 'UNFAIR'}
        />

        <MetricCard
          title="Average Waiting Time"
          value={`${metrics.avg_waiting_time.toFixed(1)}t`}
          subtitle={`Turnaround: ${metrics.avg_turnaround_time.toFixed(1)}t | Resp: ${metrics.avg_response_time.toFixed(1)}t`}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          badge={`Q-LEN: ${metrics.ready_queue_length}`}
        />
      </div>

      {/* Surveillance Alerts & Self-Healing Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts Panel */}
        <div className="bg-[#110d24] border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neon-coral" />
              <h3 className="text-sm font-bold text-white">Sliding-Window Anomaly Alerts</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-slate-300 border border-purple-800/40">
              {active_alerts.length} Detected
            </span>
          </div>

          {active_alerts.length === 0 ? (
            <div className="p-6 rounded-xl bg-purple-950/20 border border-purple-900/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-neon-mint mx-auto" />
              <p className="text-xs font-semibold text-white">System Operating Nominally</p>
              <p className="text-[11px] text-slate-400">No CPU contention, thread starvation, or memory threshold violations active.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {active_alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-[#171130] border border-neon-coral/30 hover:border-neon-coral transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{alert.anomaly_type}</span>
                    <StatusBadge type="severity" value={alert.severity} />
                  </div>
                  <p className="text-xs text-slate-300">{alert.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-purple-900/30">
                    <span>Detected: Tick {alert.timestamp}</span>
                    <span className="text-neon-amber font-semibold">{alert.recommended_action || 'EVALUATING ACTION'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Autonomous Decision Panel */}
        <div className="bg-[#110d24] border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-mint" />
              <h3 className="text-sm font-bold text-white">Most Recent Self-Healing Decision</h3>
            </div>
            {latestDecision && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-mint/15 text-neon-mint border border-neon-mint/30 font-bold">
                {latestDecision.was_applied ? 'VERIFIED & APPLIED' : 'PENDING'}
              </span>
            )}
          </div>

          {latestDecision ? (
            <div className="p-4 rounded-xl bg-[#171130] border border-purple-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-neon-mint uppercase tracking-wider">Intervention</div>
                  <div className="text-sm font-bold text-white font-mono">{latestDecision.chosen_action.action_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Utility Score</div>
                  <div className="text-base font-extrabold text-neon-amber font-mono">
                    {latestDecision.chosen_action.score.toFixed(2)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#0e0a1f] p-2.5 rounded-lg border border-purple-900/30">
                {latestDecision.chosen_action.explanation}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-2 border-t border-purple-900/30 text-center">
                <div className="p-1.5 rounded bg-purple-950/40">
                  <span className="text-slate-400 block">&Delta; Responsiveness</span>
                  <span className="text-neon-mint font-bold">+{latestDecision.chosen_action.expected_responsiveness_improvement.toFixed(1)}</span>
                </div>
                <div className="p-1.5 rounded bg-purple-950/40">
                  <span className="text-slate-400 block">&Delta; Fairness</span>
                  <span className="text-neon-purple font-bold">+{latestDecision.chosen_action.fairness_benefit.toFixed(1)}</span>
                </div>
                <div className="p-1.5 rounded bg-purple-950/40">
                  <span className="text-slate-400 block">Risk Overhead</span>
                  <span className="text-neon-amber font-bold">-{latestDecision.chosen_action.recovery_risk.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-purple-950/20 border border-purple-900/20 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs font-semibold text-white">No Interventions Triggered</p>
              <p className="text-[11px] text-slate-400">Autonomous recovery is armed. Interventions execute when metric thresholds violate safety criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Gantt Execution Timeline */}
      <div className="bg-[#110d24] border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-mint" />
            <h3 className="text-sm font-bold text-white">Discrete-Time CPU Gantt Chart</h3>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('processes')}
              className="text-xs font-mono text-neon-mint hover:underline flex items-center gap-1"
            >
              <span>Inspect All Processes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <GanttChart
          intervals={snapshot.gantt_log || []}
          currentTime={snapshot.current_time}
        />
      </div>
    </div>
  );
};
