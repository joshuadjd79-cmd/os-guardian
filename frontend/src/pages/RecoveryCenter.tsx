import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import { CandidateAction, RecoveryDecisionRecord } from '../types/simulation';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  Database,
  Layers
} from 'lucide-react';

export const RecoveryCenter: React.FC = () => {
  const { snapshot, approveDecision } = useSimulation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAction | null>(null);

  if (!snapshot) return null;

  const { active_alerts, recent_recovery_decisions } = snapshot;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">Recovery Center & Audit Dashboard</h2>
        </div>
        <p className="text-xs text-slate-400">
          Surveillance of active anomalies, evaluation of candidate self-healing actions, and post-action outcome verification.
        </p>
      </div>

      {/* Active Anomaly Alerts Section */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Active Anomaly Alerts ({active_alerts.length})
        </h3>

        {active_alerts.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center text-xs text-emerald-300">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-80" />
            <strong className="block text-sm font-semibold mb-1">No Active Anomalies Detected</strong>
            CPU, memory, waiting times, and starvation metrics are operating well within normal thresholds.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active_alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={alert.severity} />
                    <span className="font-mono text-xs font-semibold text-slate-300">{alert.anomaly_type}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">Detected @ Tick {alert.first_detected_time}</span>
                </div>

                <p className="text-xs text-slate-200">{alert.description}</p>

                {/* Numerical Evidence Box */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                  <span className="text-slate-400 block font-sans text-[10px] uppercase font-semibold">Evidence Profile:</span>
                  {Object.entries(alert.evidence).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{k}:</span>
                      <span className="text-cyan-400">{typeof v === 'number' ? v.toFixed(1) : String(v)}</span>
                    </div>
                  ))}
                </div>

                {alert.affected_pids.length > 0 && (
                  <div className="text-xs text-slate-400">
                    Affected PIDs: <span className="font-mono text-amber-300">{alert.affected_pids.join(', ')}</span>
                  </div>
                )}

                {alert.recommended_action && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Heuristic Recommendation:</span>
                    <span className="font-semibold text-cyan-300">{alert.recommended_action}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Recovery History Audit Trail */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Self-Healing Recovery Audit History ({recent_recovery_decisions.length})
        </h3>

        {recent_recovery_decisions.length === 0 ? (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 italic">
            No recovery actions have been triggered yet.
          </div>
        ) : (
          <div className="space-y-4">
            {recent_recovery_decisions.slice().reverse().map((rec) => (
              <div
                key={rec.decision_id}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3"
              >
                {/* Decision Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{rec.decision_id}</span>
                    <span className="text-xs font-semibold text-slate-200">{rec.chosen_action.action_type}</span>
                    <StatusBadge type="outcome" value={rec.outcome} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Triggered by:</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                      {rec.triggering_anomaly_type}
                    </span>
                    <span className="text-slate-500">@ Tick {rec.timestamp}</span>
                  </div>
                </div>

                {/* Justification & Narrative */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p><strong className="text-slate-200">Justification: </strong>{rec.justification}</p>
                  {rec.outcome_narrative && (
                    <p className="mt-1 text-slate-400">
                      <strong className="text-slate-300">Measured Outcome: </strong>
                      {rec.outcome_narrative}
                    </p>
                  )}
                </div>

                {/* Baseline vs Post-Action Metrics Delta */}
                {rec.post_action_metrics && (
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Before vs After Telemetry Delta (Observation Window = 5 ticks)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px] block">CPU Util:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.cpu_utilization?.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-cyan-300 font-bold">{rec.post_action_metrics.cpu_utilization?.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Memory:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.memory_utilization?.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-cyan-300 font-bold">{rec.post_action_metrics.memory_utilization?.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Ready Queue:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.ready_queue_length}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-cyan-300 font-bold">{rec.post_action_metrics.ready_queue_length}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Fairness Index:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.jains_fairness_index?.toFixed(3)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-cyan-300 font-bold">{rec.post_action_metrics.jains_fairness_index?.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions: Score Details & Manual Approval if pending */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => setSelectedCandidate(rec.chosen_action)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> View Scoring Breakdown
                  </button>

                  {!rec.was_applied && rec.is_manual_approval_required && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveDecision(rec.decision_id, false)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveDecision(rec.decision_id, true)}
                        className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold"
                      >
                        Approve & Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scoring Breakdown Modal */}
      <ScoreBreakdownModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
