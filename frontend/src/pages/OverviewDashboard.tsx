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
  ArrowRight
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { snapshot, setSelectedProcess } = useSimulation();

  if (!snapshot) {
    return (
      <div className="p-8 text-center text-slate-400">
        Connecting to OS Guardian simulation engine...
      </div>
    );
  }

  const { metrics, config, active_alerts, recent_recovery_decisions, recent_events } = snapshot;

  // Derive system health
  const isHealthy = active_alerts.length === 0;
  const criticalCount = active_alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = active_alerts.filter((a) => a.severity === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Health & Alerts */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isHealthy
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : criticalCount > 0
            ? 'bg-rose-500/10 border-rose-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              isHealthy
                ? 'bg-emerald-500/20 text-emerald-400'
                : criticalCount > 0
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              {isHealthy
                ? 'System Operating Nominally'
                : `${active_alerts.length} Active Anomaly Alert(s) Detected`}
            </h2>
            <p className="text-xs text-slate-400">
              {isHealthy
                ? 'No resource pressure, starvation, or latency threshold violations.'
                : `${criticalCount} critical, ${warningCount} warnings under active surveillance.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Policy: </span>
            <span className="font-semibold text-cyan-300">{config.scheduler_algorithm}</span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Self-Healing: </span>
            <span className={`font-semibold ${config.auto_recovery ? 'text-emerald-400' : 'text-slate-400'}`}>
              {config.auto_recovery ? 'Active' : 'Manual'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Utilization"
          value={`${metrics.cpu_utilization.toFixed(1)}%`}
          subtitle={`Busy: ${metrics.cpu_busy_time}t | Idle: ${metrics.cpu_idle_time}t`}
          icon={<Cpu className="w-4 h-4" />}
          progressPercent={metrics.cpu_utilization}
          color={metrics.cpu_utilization > 85 ? 'rose' : metrics.cpu_utilization > 65 ? 'amber' : 'cyan'}
          badge={`Window: ${metrics.window_cpu_utilization.toFixed(0)}%`}
        />

        <MetricCard
          title="Simulated Memory"
          value={`${metrics.memory_used} MB`}
          subtitle={`Capacity: ${metrics.memory_capacity} MB`}
          icon={<Database className="w-4 h-4" />}
          progressPercent={metrics.memory_utilization}
          color={metrics.memory_utilization > 80 ? 'rose' : 'emerald'}
          badge={`${metrics.memory_utilization.toFixed(0)}%`}
        />

        <MetricCard
          title="Ready Queue Length"
          value={metrics.ready_queue_length}
          subtitle={`Active: ${metrics.active_process_count} | Blocked: ${metrics.blocked_queue_length}`}
          icon={<Layers className="w-4 h-4" />}
          color={metrics.ready_queue_length > 5 ? 'amber' : 'cyan'}
          badge={`Completed: ${metrics.completed_process_count}`}
        />

        <MetricCard
          title="Jain's Fairness Index"
          value={metrics.jains_fairness.index.toFixed(3)}
          subtitle={`Avg WT: ${metrics.avg_waiting_time}t | TAT: ${metrics.avg_turnaround_time}t`}
          icon={<Activity className="w-4 h-4" />}
          progressPercent={metrics.jains_fairness.index * 100}
          color={metrics.jains_fairness.index > 0.8 ? 'emerald' : 'amber'}
          badge={`Throughput: ${metrics.throughput.toFixed(2)}`}
        />
      </div>

      {/* Gantt Timeline */}
      <GanttChart intervals={snapshot.gantt_log} currentTime={snapshot.current_time} />

      {/* Charts & Split Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Resource Saturation History */}
        <div className="lg:col-span-2">
          <ResourceChart
            cpuHistory={[metrics.cpu_utilization]}
            memoryHistory={[metrics.memory_utilization]}
            currentTime={snapshot.current_time}
          />
        </div>

        {/* Right Col: Active Queue & Recent Interventions */}
        <div className="space-y-4">
          {/* Currently Running Process Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              CPU Dispatch Slot
            </h3>
            {snapshot.running_process ? (
              <div
                onClick={() => setSelectedProcess(snapshot.running_process || null)}
                className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">
                    PID {snapshot.running_process.pid}
                  </span>
                  <StatusBadge type="process" value={snapshot.running_process.state} />
                </div>
                <div className="text-sm font-semibold text-slate-100 mt-1">
                  {snapshot.running_process.name}
                </div>
                <div className="text-xs text-slate-400 mt-2 flex justify-between">
                  <span>Remaining: {snapshot.running_process.remaining_time}t</span>
                  <span>Priority: {snapshot.running_process.effective_priority}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
                CPU is currently IDLE (No process scheduled)
              </div>
            )}
          </div>

          {/* Recent Recovery Action Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Latest Self-Healing Action
              </h3>
              <span className="text-[10px] text-slate-500">
                Total: {metrics.recovery_action_count}
              </span>
            </div>
            {recent_recovery_decisions.length > 0 ? (
              (() => {
                const latest = recent_recovery_decisions[recent_recovery_decisions.length - 1];
                return (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-300">
                        {latest.chosen_action.action_type}
                      </span>
                      <StatusBadge type="outcome" value={latest.outcome} />
                    </div>
                    <p className="text-[11px] text-slate-400">{latest.justification}</p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      Applied at Tick {latest.applied_timestamp ?? latest.timestamp}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
                No recovery actions triggered yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Event Log Stream */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Recent Operating System Events
        </h3>
        <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
          {recent_events.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">No events logged yet.</div>
          ) : (
            recent_events.slice(-10).reverse().map((ev, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-cyan-400 font-medium">Tick {ev.timestamp}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                    {ev.type}
                  </span>
                  <span className="text-slate-300">{ev.description}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
