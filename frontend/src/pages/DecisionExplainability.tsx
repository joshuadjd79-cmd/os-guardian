import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import { CandidateAction } from '../types/simulation';
import {
  HelpCircle,
  Scale,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  Award,
  ArrowRight
} from 'lucide-react';

export const DecisionExplainability: React.FC = () => {
  const { snapshot } = useSimulation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAction | null>(null);

  if (!snapshot) return null;

  const { recent_recovery_decisions, config } = snapshot;
  const latestDecision = recent_recovery_decisions.length > 0
    ? recent_recovery_decisions[recent_recovery_decisions.length - 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Mathematical Policy Formulation Box */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Explainable Recovery Decision Framework
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          OS Guardian evaluates every potential intervention using an objective, multi-criteria utility function. Rather than selecting actions heuristically or randomly, candidate interventions are evaluated, checked against preconditions, and ranked by projected net utility.
        </p>

        {/* Formula Display */}
        <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
          <div className="text-cyan-400 font-bold">score(action) =</div>
          <div className="pl-4 text-emerald-400">
            + {config.w_responsiveness.toFixed(2)} &times; expected_responsiveness_improvement
          </div>
          <div className="pl-4 text-emerald-400">
            + {config.w_resource_relief.toFixed(2)} &times; expected_resource_relief
          </div>
          <div className="pl-4 text-emerald-400">
            + {config.w_fairness.toFixed(2)} &times; fairness_benefit
          </div>
          <div className="pl-4 text-rose-400">
            - {config.w_cost.toFixed(2)} &times; estimated_intervention_cost
          </div>
          <div className="pl-4 text-rose-400">
            - {config.w_fairness_harm.toFixed(2)} &times; estimated_fairness_harm
          </div>
          <div className="pl-4 text-rose-400">
            - {config.w_risk.toFixed(2)} &times; recovery_risk
          </div>
          <div className="text-[11px] text-slate-500 pt-2 font-sans">
            Minimum utility threshold for intervention: <span className="font-mono text-amber-300">{config.min_utility_threshold.toFixed(2)}</span>. Actions scoring below this threshold default to <span className="font-mono text-slate-300">NO_INTERVENTION</span>.
          </div>
        </div>
      </div>

      {/* Latest Evaluated Decision Case */}
      {latestDecision ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Latest Decision Case Evaluation: <span className="font-mono text-cyan-400">{latestDecision.decision_id}</span>
            </h3>
            <span className="text-xs text-slate-500">Evaluated @ Tick {latestDecision.timestamp}</span>
          </div>

          {/* Triggering Anomaly & Baseline Evidence */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Triggering Diagnosis:</span>
              <span className="font-mono text-xs font-bold text-amber-400">{latestDecision.triggering_anomaly_type}</span>
            </div>
            <p className="text-xs text-slate-200">
              <strong className="text-slate-100">Selection Justification: </strong>
              {latestDecision.justification}
            </p>
          </div>

          {/* Candidates Comparison Matrix */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Candidate Actions Comparative Matrix ({latestDecision.candidates_evaluated.length} Actions Evaluated)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Candidate Action</th>
                    <th className="py-2.5 px-4">Precondition Status</th>
                    <th className="py-2.5 px-4 font-mono">Net Score</th>
                    <th className="py-2.5 px-4 font-mono">Confidence</th>
                    <th className="py-2.5 px-4">Selection Verdict</th>
                    <th className="py-2.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {latestDecision.candidates_evaluated.map((cand, idx) => {
                    const isChosen = cand.action_type === latestDecision.chosen_action.action_type;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/30 transition-colors ${isChosen ? 'bg-cyan-500/10' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {cand.action_type}
                        </td>
                        <td className="py-3 px-4">
                          {cand.is_eligible ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                              <CheckCircle className="w-3.5 h-3.5" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-xs" title={cand.rejection_reason || ''}>
                              <XCircle className="w-3.5 h-3.5 text-rose-500" /> Ineligible
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                          {cand.score.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {(cand.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          {isChosen ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              CHOSEN & APPLIED
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">
                              {cand.is_eligible ? 'Sub-optimal' : 'Rejected'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                          >
                            Breakdown
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 italic">
          No recovery decisions have been evaluated yet. Run or step simulation to observe autonomous evaluation.
        </div>
      )}

      {/* Score Modal */}
      <ScoreBreakdownModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
