import React from 'react';
import { CandidateAction } from '../types/simulation';
import { X, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

interface ScoreBreakdownModalProps {
  candidate: CandidateAction | null;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">
            Recovery Decision Scoring Breakdown
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Transparent multi-criteria utility evaluation for action: <span className="font-mono text-cyan-300 font-semibold">{candidate.action_type}</span>
        </p>

        {/* Eligibility Banner */}
        <div className={`p-3 rounded-lg border text-xs mb-4 flex items-start gap-2 ${
          candidate.is_eligible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {candidate.is_eligible ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
          <div>
            <span className="font-semibold">{candidate.is_eligible ? 'Preconditions Satisfied' : 'Action Ineligible / Rejected'}</span>
            {candidate.rejection_reason && <p className="mt-0.5 text-rose-200">{candidate.rejection_reason}</p>}
          </div>
        </div>

        {/* Terms Breakdown */}
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Scoring Term Contributions</h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">+ Responsiveness (w1 = 0.30)</span>
              <span className="text-emerald-400 font-mono font-semibold">
                +{candidate.expected_responsiveness_improvement.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">+ Resource Relief (w2 = 0.25)</span>
              <span className="text-emerald-400 font-mono font-semibold">
                +{candidate.expected_resource_relief.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">+ Fairness Benefit (w3 = 0.20)</span>
              <span className="text-emerald-400 font-mono font-semibold">
                +{candidate.fairness_benefit.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">- Intervention Cost (w4 = 0.10)</span>
              <span className="text-rose-400 font-mono font-semibold">
                -{candidate.estimated_intervention_cost.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">- Fairness Harm (w5 = 0.05)</span>
              <span className="text-rose-400 font-mono font-semibold">
                -{candidate.estimated_fairness_harm.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">- Recovery Risk (w6 = 0.10)</span>
              <span className="text-rose-400 font-mono font-semibold">
                -{candidate.recovery_risk.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Score & Confidence */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 mb-4">
          <div>
            <span className="text-xs text-slate-400 block">Total Utility Score</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{candidate.score.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Rule Confidence Index</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{(candidate.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Narrative */}
        <div className="text-xs text-slate-300 space-y-1.5 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <div><strong className="text-slate-200">Expected Effect:</strong> {candidate.expected_effects}</div>
          <div><strong className="text-slate-200">Potential Side Effect:</strong> {candidate.potential_side_effects}</div>
          <div><strong className="text-slate-200">Explanation:</strong> {candidate.explanation}</div>
        </div>
      </div>
    </div>
  );
};
