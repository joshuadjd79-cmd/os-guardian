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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#110d24] border border-purple-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-neon-mint" />
          <h3 className="text-base font-bold text-white">
            Recovery Decision Scoring Breakdown
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Transparent multi-criteria utility evaluation for action: <span className="font-mono text-neon-mint font-bold">{candidate.action_type}</span>
        </p>

        {/* Eligibility Banner */}
        <div className={`p-3.5 rounded-xl border text-xs mb-4 flex items-start gap-2 ${
          candidate.is_eligible ? 'bg-neon-mint/10 border-neon-mint/30 text-neon-mint' : 'bg-neon-coral/10 border-neon-coral/30 text-neon-coral'
        }`}>
          {candidate.is_eligible ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
          <div>
            <span className="font-bold">{candidate.is_eligible ? 'Preconditions Satisfied' : 'Action Ineligible / Rejected'}</span>
            {candidate.rejection_reason && <p className="mt-0.5 text-rose-300 font-mono">{candidate.rejection_reason}</p>}
          </div>
        </div>

        {/* Terms Breakdown */}
        <div className="space-y-3 mb-4">
          <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Scoring Term Contributions</h4>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">+ Responsiveness (w1 = 0.30)</span>
              <span className="text-neon-mint font-bold text-sm">
                +{candidate.expected_responsiveness_improvement.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">+ Resource Relief (w2 = 0.25)</span>
              <span className="text-neon-mint font-bold text-sm">
                +{candidate.expected_resource_relief.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">+ Fairness Benefit (w3 = 0.20)</span>
              <span className="text-neon-purple font-bold text-sm">
                +{candidate.fairness_benefit.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">- Intervention Cost (w4 = 0.10)</span>
              <span className="text-neon-amber font-bold text-sm">
                -{candidate.estimated_intervention_cost.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">- Fairness Harm (w5 = 0.05)</span>
              <span className="text-neon-coral font-bold text-sm">
                -{candidate.estimated_fairness_harm.toFixed(2)}
              </span>
            </div>

            <div className="bg-[#140f29] p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px]">- Recovery Risk (w6 = 0.10)</span>
              <span className="text-neon-coral font-bold text-sm">
                -{candidate.recovery_risk.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Score & Confidence */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#140f29] border border-purple-900/40 mb-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block">Total Utility Score</span>
            <span className="text-xl font-extrabold font-mono text-neon-mint">{candidate.score.toFixed(4)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Rule Confidence Index</span>
            <span className="text-xl font-extrabold font-mono text-neon-purple">{(candidate.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Narrative */}
        <div className="text-xs text-slate-300 space-y-1.5 bg-[#0e0a1f] p-3 rounded-xl border border-purple-900/30 leading-relaxed">
          <div><strong className="text-white">Expected Effect:</strong> {candidate.expected_effects}</div>
          <div><strong className="text-white">Potential Side Effect:</strong> {candidate.potential_side_effects}</div>
          <div><strong className="text-white">Explanation:</strong> {candidate.explanation}</div>
        </div>
      </div>
    </div>
  );
};
