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
  ArrowRight,
  Zap,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

export const DecisionExplainability: React.FC = () => {
  const { snapshot } = useSimulation();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAction | null>(null);

  if (!snapshot) return null;

  const { recent_recovery_decisions, config } = snapshot;
  const latestDecision = recent_recovery_decisions.length > 0
    ? recent_recovery_decisions[recent_recovery_decisions.length - 1]
    : null;

  const explainabilityTopics = [
    {
      title: "1. Why was a specific process selected by the CPU Scheduler?",
      answer: "Under Round Robin, the process at the head of the circular FIFO queue is dispatched. Under Priority with Aging, the process with the highest effective priority is selected; if tied, arrival time breaks ties. If a process starved in the queue (>10 ticks), aging bumped its effective priority."
    },
    {
      title: "2. Why was a Starvation Risk alert triggered?",
      answer: "The sliding window detector evaluates ticks in the ready queue without receiving CPU burst allocation. If any process waits longer than starvation_threshold_ticks (15 ticks) while higher priority or long tasks run, STARVATION_RISK is raised."
    },
    {
      title: "3. Why did ADJUST_TIME_QUANTUM or APPLY_AGING score highest?",
      answer: "The utility scorer calculates net score: score = w1*ΔR + w2*ΔM + w3*ΔF - w4*C_int - w5*H_F - w6*R_rec. For queue starvation, quantum reduction doubles dispatch interleaving frequency with zero memory intervention cost, producing the highest net positive score."
    },
    {
      title: "4. Why was a recovery action rejected or considered ineligible?",
      answer: "Precondition safety checks prevent invalid actions. For instance, RECLAIM_MEMORY is marked ineligible if no process has reclaimable buffers (reclaimable_memory == 0). Actions scoring below the minimum threshold (0.15) default to NO_INTERVENTION."
    },
    {
      title: "5. Why did recovery overhead degrade performance in the Regression Scenario?",
      answer: "In workloads with extremely short bursts (3 ticks), context switching and recovery overhead consume more cycles than the task itself. The utility function penalizes intervention cost (C_int) and triggers automatic rollback when regression is detected."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mathematical Policy Formulation Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-neon-mint" />
          <h2 className="text-xl font-bold text-white">
            Explainable Decision Framework & Mathematical Utility
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          OS Guardian evaluates every potential self-healing intervention using an objective, multi-criteria mathematical utility function. Candidate actions are evaluated, checked against preconditions, and ranked by projected net utility.
        </p>

        {/* Formula Display */}
        <div className="p-4 bg-[#140f29] rounded-xl border border-purple-900/40 font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
          <div className="text-neon-mint font-bold text-sm">score(action) =</div>
          <div className="pl-4 text-neon-mint">
            + {config.w_responsiveness.toFixed(2)} &times; expected_responsiveness_improvement (ΔR)
          </div>
          <div className="pl-4 text-neon-mint">
            + {config.w_resource_relief.toFixed(2)} &times; expected_resource_relief (ΔM)
          </div>
          <div className="pl-4 text-neon-purple font-semibold">
            + {config.w_fairness.toFixed(2)} &times; fairness_benefit (ΔF)
          </div>
          <div className="pl-4 text-neon-amber">
            - {config.w_cost.toFixed(2)} &times; estimated_intervention_cost (C_int)
          </div>
          <div className="pl-4 text-neon-coral">
            - {config.w_fairness_harm.toFixed(2)} &times; estimated_fairness_harm (H_F)
          </div>
          <div className="pl-4 text-neon-coral font-semibold">
            - {config.w_risk.toFixed(2)} &times; recovery_risk (R_rec)
          </div>
          <div className="text-[11px] text-slate-400 pt-2 font-sans">
            Minimum utility threshold: <span className="font-mono text-neon-amber font-bold">{config.min_utility_threshold.toFixed(2)}</span>. Actions scoring below this threshold default to <span className="font-mono text-white">NO_INTERVENTION</span>.
          </div>
        </div>
      </div>

      {/* Frequently Asked Explainability Questions */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-neon-amber" />
          <span>System Explainability & Viva Defense Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {explainabilityTopics.map((topic, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#140f29] border border-purple-900/30 space-y-1.5">
              <h4 className="text-xs font-bold text-neon-mint">{topic.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{topic.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Evaluated Decision Case */}
      {latestDecision ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Latest Decision Case Evaluation: <span className="text-neon-mint">{latestDecision.decision_id}</span>
            </h3>
            <span className="text-xs font-mono text-neon-amber">Evaluated @ Tick {latestDecision.timestamp}</span>
          </div>

          {/* Triggering Anomaly & Baseline Evidence */}
          <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Triggering Diagnosis:</span>
              <span className="font-mono text-xs font-bold text-neon-amber">{latestDecision.triggering_anomaly_type}</span>
            </div>
            <p className="text-xs text-slate-200">
              <strong className="text-white">Selection Justification: </strong>
              {latestDecision.justification}
            </p>
          </div>

          {/* Candidates Comparison Matrix */}
          <div className="bg-void-850 border border-purple-900/30 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-purple-900/30">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Candidate Actions Comparative Matrix ({latestDecision.candidates_evaluated.length} Actions Evaluated)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#120d26] border-b border-purple-900/30 text-slate-400 uppercase font-mono font-semibold text-[10px]">
                    <th className="py-3 px-4">Candidate Action</th>
                    <th className="py-3 px-4">Precondition Status</th>
                    <th className="py-3 px-4 font-mono">Net Score</th>
                    <th className="py-3 px-4 font-mono">Confidence</th>
                    <th className="py-3 px-4">Selection Verdict</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 font-mono">
                  {latestDecision.candidates_evaluated.map((cand, idx) => {
                    const isChosen = cand.action_type === latestDecision.chosen_action.action_type;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-purple-950/20 transition-colors ${isChosen ? 'bg-neon-mint/10' : ''}`}
                      >
                        <td className="py-3 px-4 font-bold text-white">
                          {cand.action_type}
                        </td>
                        <td className="py-3 px-4">
                          {cand.is_eligible ? (
                            <span className="inline-flex items-center gap-1 text-neon-mint text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-mono" title={cand.rejection_reason || ''}>
                              <XCircle className="w-3.5 h-3.5 text-neon-coral" /> Ineligible
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-neon-amber">
                          {cand.score.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 font-mono text-purple-200">
                          {(cand.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          {isChosen ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neon-mint/20 text-neon-mint border border-neon-mint/40 shadow-neon-mint">
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
                            className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-neon-mint text-[11px] font-semibold border border-neon-mint/30"
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
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-8 text-center text-xs text-slate-500 italic font-mono">
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
