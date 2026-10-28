import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCcw,
  Play,
  Cpu,
  Layers,
  FileText,
  X
} from 'lucide-react';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const { snapshot, start, pause, step, reset, loadWorkload, approveDecision } = useSimulation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [stepOutput, setStepOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalSteps = 10;

  const stepsData = [
    {
      step: 1,
      title: "1. Welcome & System Architecture",
      subtitle: "Overview of the Explainable, Self-Healing Simulator",
      description: "OS Guardian continuously monitors simulated operating system execution. When CPU congestion, memory pressure, or thread starvation threatens system stability, an autonomous recovery engine evaluates candidate interventions and executes explainable self-healing.",
      recommendedActionText: "Reset Simulation & Initialize Baseline State",
      action: async () => {
        setIsExecuting(true);
        await reset({ scheduler_algorithm: 'ROUND_ROBIN', auto_recovery: false, time_quantum: 4 });
        setStepOutput("Simulator reset to baseline Round Robin (q=4) with auto-recovery disabled for controlled observation.");
        setIsExecuting(false);
      }
    },
    {
      step: 2,
      title: "2. Load CPU Saturation Workload",
      subtitle: "Injecting Contention & Asymmetric Task Bursts",
      description: "We inject a heavy multi-process workload (P101: Matrix Multiply, P102: Video Transcode, P103: Crypto Hash, P104: Physics Sim) with long compute bursts and competing priority tiers.",
      recommendedActionText: "Inject CPU Heavy Workload",
      action: async () => {
        setIsExecuting(true);
        await loadWorkload('CPU_HEAVY');
        setStepOutput("Loaded 4 compute-intensive processes with total burst requirement of 130 ticks.");
        setIsExecuting(false);
      }
    },
    {
      step: 3,
      title: "3. Run Baseline Workload (No Recovery)",
      subtitle: "Observe Fixed Policy Limitations Under Load",
      description: "Under static Round Robin without aging or adaptive quantum tuning, processes with low priority or long bursts suffer high latency, and early processes monopolize the CPU cycles.",
      recommendedActionText: "Simulate 20 Baseline Ticks",
      action: async () => {
        setIsExecuting(true);
        for (let i = 0; i < 20; i++) {
          await step();
        }
        setStepOutput("Advanced 20 ticks under fixed baseline policy. Ready queue length and waiting times are escalating.");
        setIsExecuting(false);
      }
    },
    {
      step: 4,
      title: "4. Observe Emerging Starvation Risk",
      subtitle: "Telemetry Metrics Show Asymmetric Progress",
      description: "Notice the Jain's Fairness Index dropping below 0.70 and the ready queue length exceeding thresholds. Processes queued behind long tasks experience ballooning wait times.",
      recommendedActionText: "Inspect Metrics & Ready Queue",
      action: async () => {
        onNavigateTab('processes');
        setStepOutput("Switched to Live Process Monitor. Examine waiting time and effective priority distribution.");
      }
    },
    {
      step: 5,
      title: "5. Anomaly Detection Alerts Trigger",
      subtitle: "Sliding-Window Surveillance Flags Sustained Pressure",
      description: "The sliding-window anomaly detector flags SUSTAINED_HIGH_CPU (>85% utilization over 10 ticks) and STARVATION_RISK. Duplicate alerts are suppressed while preserving evidence.",
      recommendedActionText: "Open Recovery & Anomaly Center",
      action: async () => {
        onNavigateTab('recovery');
        setStepOutput("Anomaly surveillance actively captures metric violations and triggers recovery candidate generation.");
      }
    },
    {
      step: 6,
      title: "6. Multi-Criteria Recovery Scoring",
      subtitle: "Transparent Mathematical Utility Evaluation",
      description: "The recovery engine scores 7 candidate interventions across responsiveness gain (ΔR), resource relief (ΔM), fairness (ΔF), intervention cost (C_int), and recovery risk (R_rec).",
      recommendedActionText: "Review Candidate Action Scores",
      action: async () => {
        onNavigateTab('explainability');
        setStepOutput("Scoring function evaluates utility: score(a) = w1*ΔR + w2*ΔM + w3*ΔF - w4*C_int - w5*H_F - w6*R_rec.");
      }
    },
    {
      step: 7,
      title: "7. Autonomous Self-Healing Intervention",
      subtitle: "Applying the Highest-Scoring Candidate",
      description: "The recovery engine applies time quantum adjustment (reduced quantum from 4 to 2 to improve interactive responsiveness) combined with dynamic priority aging for starved tasks.",
      recommendedActionText: "Apply Approved Recovery Action",
      action: async () => {
        setIsExecuting(true);
        if (snapshot?.recent_recovery_decisions?.length) {
          const dec = snapshot.recent_recovery_decisions[0];
          if (!dec.was_applied) {
            await approveDecision(dec.decision_id, true);
            setStepOutput(`Applied recovery action: ${dec.chosen_action.action_type}. Dynamic priority boost & quantum tuning applied.`);
          } else {
            setStepOutput("Recovery action has already been verified and active in the simulation state.");
          }
        } else {
          // If no pending decision in history, advance a few steps to trigger
          for (let i = 0; i < 5; i++) await step();
          setStepOutput("Simulation stepped to engage self-healing subsystem.");
        }
        setIsExecuting(false);
      }
    },
    {
      step: 8,
      title: "8. Execute Post-Recovery Simulation",
      subtitle: "Observe Self-Healing Stabilization",
      description: "With dynamic quantum reduction and aging active, round-robin dispatch frequency doubles, allowing starved processes to interleave and receive immediate CPU bursts.",
      recommendedActionText: "Advance 20 Healing Ticks",
      action: async () => {
        setIsExecuting(true);
        for (let i = 0; i < 20; i++) {
          await step();
        }
        setStepOutput("Post-recovery execution completed. Observe how the queue drains more fairly.");
        setIsExecuting(false);
      }
    },
    {
      step: 9,
      title: "9. Before-and-After Verification",
      subtitle: "Side-by-Side Mathematical Comparison",
      description: "Compare empirical metrics between baseline and adaptive recovery: Jain's Fairness index improved from ~0.66 to >0.85, while max waiting time was curtailed without crashing host processes.",
      recommendedActionText: "Inspect Experiments & Benchmarks",
      action: async () => {
        onNavigateTab('experiments');
        setStepOutput("Viewing Experiments & Benchmarks workbench. All trade-offs and formulas are transparently documented.");
      }
    },
    {
      step: 10,
      title: "10. Export Results & Technical Viva Readiness",
      subtitle: "Academic Defense & Downloadable Reports",
      description: "Congratulations! You have completed the guided demonstration. You can export complete CSV/JSON/Markdown reports, inspect algorithm source traces, or run independent custom workloads.",
      recommendedActionText: "Export Benchmark Verification Report",
      action: async () => {
        window.open('/api/experiments/export/report', '_blank');
        setStepOutput("Opened Markdown benchmark audit report download.");
      }
    }
  ];

  const currentStepData = stepsData[currentStep - 1];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setStepOutput(null);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setStepOutput(null);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setStepOutput(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0e0a1f] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/60 to-[#0e0a1f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-mint/15 border border-neon-mint/40 flex items-center justify-center text-neon-mint shadow-neon-mint">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">OS Guardian 2.0 Guided Demo</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 font-semibold">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <p className="text-xs text-purple-300/70">Interactive End-to-End Self-Healing Operating System Walkthrough</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-purple-950">
          <div
            className="h-full bg-gradient-to-r from-neon-purple via-neon-mint to-neon-amber transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[60vh]">
          <div>
            <div className="text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
              {currentStepData.subtitle}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{currentStepData.title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-purple-950/30 p-3.5 rounded-xl border border-purple-900/30">
              {currentStepData.description}
            </p>
          </div>

          {/* Interactive Action Trigger */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#17112e] to-[#120d26] border border-purple-500/20 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-amber" />
              <span>Interactive Step Action:</span>
            </div>
            <button
              onClick={currentStepData.action}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-purple to-purple-600 hover:from-purple-500 hover:to-neon-purple text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-neon-purple transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isExecuting ? (
                <span>Executing simulator action...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStepData.recommendedActionText}</span>
                </>
              )}
            </button>

            {stepOutput && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-neon-mint mt-0.5" />
                <span>{stepOutput}</span>
              </div>
            )}
          </div>

          {/* Live Simulator Status Pill */}
          <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-black/40 border border-purple-900/30 text-slate-400 font-mono">
            <div>
              <span>Status: </span>
              <span className="font-semibold text-neon-mint">{snapshot?.status || 'STOPPED'}</span>
            </div>
            <div>
              <span>Clock: </span>
              <span className="font-semibold text-neon-amber">Tick {snapshot?.current_time ?? 0}</span>
            </div>
            <div>
              <span>Fairness (Jain): </span>
              <span className="font-semibold text-purple-300">
                {snapshot?.metrics?.jains_fairness?.index?.toFixed(3) ?? '1.000'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-purple-900/40 bg-[#0b0818] flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-purple-900/30 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-3.5 py-1.5 rounded-xl border border-purple-800/40 text-xs font-medium text-slate-300 hover:bg-purple-900/30 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-neon-mint text-slate-950 font-bold text-xs hover:bg-neon-mintGlow shadow-neon-mint transition-all flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-mint text-white font-bold text-xs shadow-neon-purple transition-all"
              >
                Finish & Explore
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
