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
  Layers,
  Zap,
  RotateCcw
} from 'lucide-react';

export const RecoveryCenter: React.FC = () => {
  const { snapshot, approveDecision } = useSimulation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAction | null>(null);

  if (!snapshot) return null;

  const { active_alerts, recent_recovery_decisions } = snapshot;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-neon-mint" />
            <span>Autonomous Self-Healing Subsystem</span>
          </div>
          <h2 className="text-xl font-bold text-white">Intelligent Recovery Center</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time surveillance of active OS anomalies, candidate utility evaluation, autonomous policy intervention, and empirical post-recovery outcome verification.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-purple-300 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-neon-mint" />
          <span>Automatic Rollback Protection Active</span>
        </div>
      </div>

      {/* Active Anomaly Alerts Section */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          Active Anomaly Alerts ({active_alerts.length})
        </h3>

        {active_alerts.length === 0 ? (
          <div className="bg-[#110d24] border border-neon-mint/30 rounded-2xl p-6 text-center text-xs text-slate-300 space-y-2 shadow-xl">
            <ShieldCheck className="w-10 h-10 mx-auto text-neon-mint" />
            <strong className="block text-sm font-bold text-white">No Active Anomalies Detected</strong>
            <p className="text-slate-400 max-w-md mx-auto">
              CPU utilization, memory buffers, queue depths, and starvation times are operating strictly within safety boundaries.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active_alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-void-850 border border-neon-coral/30 hover:border-neon-coral rounded-2xl p-5 shadow-xl space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={alert.severity} />
                    <span className="font-mono text-xs font-bold text-white">{alert.anomaly_type}</span>
                  </div>
                  <span className="text-[11px] font-mono text-neon-amber">Tick {alert.first_detected_time}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                {/* Numerical Evidence Box */}
                <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30 text-[11px] font-mono space-y-1">
                  <span className="text-neon-mint block font-sans text-[10px] uppercase font-bold tracking-wider">
                    Evidence Profile:
                  </span>
                  {Object.entries(alert.evidence).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-neon-amber font-semibold">{typeof v === 'number' ? v.toFixed(1) : String(v)}</span>
                    </div>
                  ))}
                </div>

                {alert.affected_pids.length > 0 && (
                  <div className="text-xs text-slate-400 font-mono">
                    Affected PIDs: <span className="text-neon-coral font-bold">{alert.affected_pids.join(', ')}</span>
                  </div>
                )}

                {alert.recommended_action && (
                  <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Heuristic Recommendation:</span>
                    <span className="font-mono font-bold text-neon-mint">{alert.recommended_action}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Recovery History Audit Trail */}
      <div>
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
          Self-Healing Recovery Audit History ({recent_recovery_decisions.length})
        </h3>

        {recent_recovery_decisions.length === 0 ? (
          <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-8 text-center text-xs text-slate-500 italic font-mono">
            No recovery actions have been triggered yet.
          </div>
        ) : (
          <div className="space-y-4">
            {recent_recovery_decisions.slice().reverse().map((rec) => (
              <div
                key={rec.decision_id}
                className="bg-void-850 border border-purple-900/30 hover:border-purple-600/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
              >
                {/* Decision Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-neon-mint">{rec.decision_id}</span>
                    <span className="text-xs font-bold text-white font-mono">{rec.chosen_action.action_type}</span>
                    <StatusBadge type="outcome" value={rec.outcome} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Trigger:</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-950 text-neon-amber border border-neon-amber/30 text-[10px] font-bold">
                      {rec.triggering_anomaly_type}
                    </span>
                    <span className="text-slate-400">@ Tick {rec.timestamp}</span>
                  </div>
                </div>

                {/* Justification & Narrative */}
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  <p><strong className="text-white">Justification: </strong>{rec.justification}</p>
                  {rec.outcome_narrative && (
                    <p className="text-slate-400">
                      <strong className="text-neon-mint">Measured Empirical Outcome: </strong>
                      {rec.outcome_narrative}
                    </p>
                  )}
                </div>

                {/* Baseline vs Post-Action Metrics Delta */}
                {rec.post_action_metrics && (
                  <div className="bg-[#140f29] p-3.5 rounded-xl border border-purple-900/40">
                    <span className="text-[10px] font-mono font-bold text-neon-mint uppercase tracking-wider block mb-2">
                      Before vs After Telemetry Delta (Observation Window = 5 ticks)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">CPU Util:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.cpu_utilization?.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-neon-mint font-bold">{rec.post_action_metrics.cpu_utilization?.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Memory:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.memory_utilization?.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-purple-300 font-bold">{rec.post_action_metrics.memory_utilization?.toFixed(1)}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Ready Queue:</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.ready_queue_length}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-neon-amber font-bold">{rec.post_action_metrics.ready_queue_length}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block">Fairness (Jain):</span>
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-slate-400">{rec.baseline_metrics.jains_fairness_index?.toFixed(3)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-neon-mint font-bold">{rec.post_action_metrics.jains_fairness_index?.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions: Score Details & Manual Approval if pending */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => setSelectedCandidate(rec.chosen_action)}
                    className="text-neon-mint hover:underline flex items-center gap-1 font-semibold transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> View Scoring Breakdown & Formula
                  </button>

                  {!rec.was_applied && rec.is_manual_approval_required && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveDecision(rec.decision_id, false)}
                        className="px-3 py-1 rounded-lg bg-purple-950 text-slate-300 hover:bg-purple-900 border border-purple-800 text-xs font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveDecision(rec.decision_id, true)}
                        className="px-3 py-1 rounded-lg bg-neon-mint text-slate-950 hover:bg-neon-mintGlow text-xs font-bold shadow-neon-mint"
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
