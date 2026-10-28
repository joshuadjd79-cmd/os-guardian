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
  GraduationCap
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* About Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">OS Guardian</h2>
            <p className="text-xs text-cyan-400 font-medium">Explainable, Self-Healing OS Simulator</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>OS Guardian</strong> is an academic, desktop-browser-accessible operating systems course simulator designed to demonstrate autonomous anomaly detection and explainable self-healing recovery algorithms. It investigates the research question:
        </p>

        <blockquote className="p-3 bg-slate-900 border-l-2 border-cyan-500 text-xs italic text-slate-200">
          "Can an explainable, adaptive recovery policy improve simulated system responsiveness and resource utilization compared with a fixed-policy baseline, without introducing excessive recovery overhead or unfairness?"
        </blockquote>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-1 text-slate-400">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
            <Info className="w-4 h-4 text-cyan-400" /> Educational Simulation Scope & Safety Statement
          </div>
          <p>
            This application is an educational simulation, not a replacement operating system. All process scheduling, memory pressure, state transitions, and recovery actions are computed strictly in-memory on simulated data models. No actual host operating-system processes are terminated, kernel privileges are not modified, and host memory is never manipulated.
          </p>
        </div>
      </div>

      {/* Config Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Anomaly Detection Thresholds */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Anomaly Detection Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
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
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
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
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
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
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
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
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Excessive Waiting Threshold ({localConfig.excessive_wait_threshold} ticks)
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={localConfig.excessive_wait_threshold}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, excessive_wait_threshold: Number(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Action Cooldown Period ({localConfig.cooldown_period} ticks)
              </label>
              <input
                type="range"
                min="3"
                max="30"
                value={localConfig.cooldown_period}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, cooldown_period: Number(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Recovery Scoring Weights */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" /> Recovery Policy Scoring Weights (Formula Terms)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">w1: Responsiveness ({localConfig.w_responsiveness})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_responsiveness}
                onChange={(e) => setLocalConfig({ ...localConfig, w_responsiveness: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">w2: Resource Relief ({localConfig.w_resource_relief})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_resource_relief}
                onChange={(e) => setLocalConfig({ ...localConfig, w_resource_relief: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">w3: Fairness Benefit ({localConfig.w_fairness})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_fairness}
                onChange={(e) => setLocalConfig({ ...localConfig, w_fairness: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">w4: Intervention Cost ({localConfig.w_cost})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_cost}
                onChange={(e) => setLocalConfig({ ...localConfig, w_cost: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">w5: Fairness Harm ({localConfig.w_fairness_harm})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_fairness_harm}
                onChange={(e) => setLocalConfig({ ...localConfig, w_fairness_harm: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">w6: Recovery Risk ({localConfig.w_risk})</label>
              <input
                type="range"
                step="0.05"
                min="0"
                max="1"
                value={localConfig.w_risk}
                onChange={(e) => setLocalConfig({ ...localConfig, w_risk: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset Simulation State
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-medium">Parameters updated successfully!</span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        OS Guardian &bull; Operating Systems Course Project &bull; Explainable, Self-Healing Simulator
      </footer>
    </div>
  );
};
