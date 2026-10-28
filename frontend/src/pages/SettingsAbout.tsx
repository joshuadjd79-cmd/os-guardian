import React, { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { SimulationConfig } from '../types/simulation';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Scale,
  Save,
  Info,
  GraduationCap,
  BookOpen,
  Award
} from 'lucide-react';

export const SettingsAbout: React.FC = () => {
  const { snapshot, updateConfig, reset } = useSimulation();

  const [localConfig, setLocalConfig] = useState<SimulationConfig>(
    snapshot?.config || {
      scheduler_algorithm: 'ROUND_ROBIN',
      time_quantum: 3,
      memory_capacity: 1024,
      context_switch_overhead: 0,
      enable_aging: true,
      aging_threshold: 8,
      aging_step: 1,
      min_priority_bound: 1,
      max_priority_bound: 100,
      auto_recovery: true,
      manual_approval_required: false,
      random_seed: 42,
      speed_ms: 250,
      sustained_cpu_threshold: 85.0,
      sustained_cpu_window: 5,
      memory_pressure_threshold: 80.0,
      excessive_wait_threshold: 20,
      unresponsive_threshold: 12,
      starvation_threshold: 25,
      cooldown_period: 8,
      w_responsiveness: 0.30,
      w_resource_relief: 0.25,
      w_fairness: 0.20,
      w_cost: 0.10,
      w_fairness_harm: 0.05,
      w_risk: 0.10,
      min_utility_threshold: 0.12,
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const vivaPoints = [
    {
      q: "What is Jain's Fairness Index formula?",
      a: "J = (Σ x_i)^2 / (N * Σ x_i^2), where x_i = service_received_i / max(1, burst_i). Scale is [1/N, 1.0]. A score of 1.0 indicates perfect equal proportional allocation across all threads."
    },
    {
      q: "How does OS Guardian differ from a real kernel?",
      a: "OS Guardian is a cycle-accurate discrete-time simulation. All PCBs, memory pools, and state transitions execute in-memory on data models without modifying host hardware or processes."
    },
    {
      q: "Why is Round Robin with dynamic aging preferred for starvation?",
      a: "Round Robin guarantees bounded latency. Combining it with dynamic priority aging increments the priority of starved tasks waiting > threshold ticks, preventing convoy starvation."
    },
    {
      q: "When can self-healing cause regression?",
      a: "In workloads with extremely short bursts, frequent context switches and recovery overhead consume more simulation cycles than the tasks themselves. This trade-off is transparently demonstrated in the Recovery Regression scenario."
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* About Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-mint shadow-neon-purple">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">OS Guardian 2.0</h2>
            <p className="text-xs text-neon-mint font-semibold">Explainable, Self-Healing OS Simulator & Capstone Platform</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>OS Guardian</strong> is an academic, desktop-browser-accessible operating systems course simulator designed to demonstrate autonomous anomaly detection and explainable self-healing recovery algorithms. It addresses the core research question:
        </p>

        <blockquote className="p-3.5 bg-[#140f29] border-l-2 border-neon-mint text-xs italic text-slate-200 rounded-r-xl font-mono">
          "Can an explainable, adaptive recovery policy improve simulated system responsiveness and resource utilization compared with a fixed-policy baseline, without introducing excessive recovery overhead or unfairness?"
        </blockquote>

        <div className="p-4 bg-purple-950/30 border border-purple-900/30 rounded-xl text-xs space-y-1 text-slate-300">
          <div className="flex items-center gap-2 text-white font-semibold mb-1">
            <Info className="w-4 h-4 text-neon-mint" /> Educational Simulation Scope & Safety Statement
          </div>
          <p className="text-slate-400 leading-relaxed">
            All process scheduling, memory pressure, state transitions, and recovery actions are computed strictly in-memory on simulated data models. No actual host operating-system processes are terminated, kernel privileges are not modified, and host memory is never manipulated.
          </p>
        </div>
      </div>

      {/* Technical Viva Defense Cheat Sheet */}
      <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-neon-amber" />
          <h3 className="text-sm font-bold text-white">Technical Viva & Review Cheat Sheet</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vivaPoints.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#140f29] border border-purple-900/30 space-y-1">
              <span className="text-xs font-bold text-neon-mint block">{item.q}</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Config Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Anomaly Detection Thresholds */}
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neon-mint" /> Anomaly Detection Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">
                Sustained CPU Threshold ({localConfig.sustained_cpu_threshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="98"
                value={localConfig.sustained_cpu_threshold}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, sustained_cpu_threshold: Number(e.target.value) })
                }
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Sustained CPU Window ({localConfig.sustained_cpu_window} ticks)
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={localConfig.sustained_cpu_window}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, sustained_cpu_window: Number(e.target.value) })
                }
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Memory Pressure Threshold ({localConfig.memory_pressure_threshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={localConfig.memory_pressure_threshold}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, memory_pressure_threshold: Number(e.target.value) })
                }
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Starvation Risk Threshold ({localConfig.starvation_threshold} ticks waiting)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                value={localConfig.starvation_threshold}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, starvation_threshold: Number(e.target.value) })
                }
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Recovery Scoring Weights */}
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-neon-purple" /> Recovery Policy Scoring Weights (Formula Utility)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-neon-mint mb-1">w1: Responsiveness ({localConfig.w_responsiveness})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_responsiveness}
                onChange={(e) => setLocalConfig({ ...localConfig, w_responsiveness: Number(e.target.value) })}
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-neon-mint mb-1">w2: Resource Relief ({localConfig.w_resource_relief})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_resource_relief}
                onChange={(e) => setLocalConfig({ ...localConfig, w_resource_relief: Number(e.target.value) })}
                className="w-full accent-neon-mint cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-neon-purple mb-1">w3: Fairness Benefit ({localConfig.w_fairness})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_fairness}
                onChange={(e) => setLocalConfig({ ...localConfig, w_fairness: Number(e.target.value) })}
                className="w-full accent-neon-purple cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-neon-amber mb-1">w4: Intervention Cost ({localConfig.w_cost})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_cost}
                onChange={(e) => setLocalConfig({ ...localConfig, w_cost: Number(e.target.value) })}
                className="w-full accent-neon-amber cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-neon-coral mb-1">w5: Fairness Harm ({localConfig.w_fairness_harm})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_fairness_harm}
                onChange={(e) => setLocalConfig({ ...localConfig, w_fairness_harm: Number(e.target.value) })}
                className="w-full accent-neon-coral cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-neon-coral mb-1">w6: Recovery Risk ({localConfig.w_risk})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_risk}
                onChange={(e) => setLocalConfig({ ...localConfig, w_risk: Number(e.target.value) })}
                className="w-full accent-neon-coral cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset Simulator
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-neon-mint font-bold animate-fadeIn">Parameters saved & applied!</span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-neon-mint text-slate-950 font-bold hover:bg-neon-mintGlow text-xs flex items-center gap-1.5 shadow-neon-mint transition-all"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
