import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExperimentResult, BenchmarkComparison } from '../types/simulation';
import {
  FlaskConical,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const ExperimentsBenchmarks: React.FC = () => {
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async () => {
    try {
      const data = await api.getLatestBenchmarks();
      setResult(data);
    } catch (err: any) {
      console.warn('Could not fetch latest benchmarks:', err);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleRunBenchmarks = async () => {
    try {
      setRunning(true);
      setError(null);
      const data = await api.runBenchmarks();
      setResult(data);
    } catch (err: any) {
      setError('Failed to run benchmark suite: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Benchmark Header & Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4 text-neon-mint" />
            <span>Empirical Validation Workbench</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Comparative Benchmark Laboratory
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Empirical evaluation comparing Fixed Policy Baselines vs Adaptive Self-Healing across 7 standardized workloads with mathematical proof.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunBenchmarks}
            disabled={running}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-neon-mint ${
              running
                ? 'bg-neon-mint/50 text-slate-900 cursor-not-allowed'
                : 'bg-neon-mint text-slate-950 hover:bg-neon-mintGlow active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{running ? 'Evaluating Workloads...' : 'Execute Full Benchmark Suite'}</span>
          </button>

          {result && (
            <>
              <a
                href="/api/experiments/export/csv"
                download="os_guardian_benchmarks.csv"
                className="px-3.5 py-2.5 rounded-xl bg-[#140f29] hover:bg-[#1b1438] border border-purple-800/40 text-purple-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </a>
              <a
                href="/api/experiments/export/report"
                download="OS_GUARDIAN_BENCHMARK_REPORT.md"
                className="px-3.5 py-2.5 rounded-xl bg-neon-purple hover:bg-purple-600 text-white text-xs font-mono font-bold shadow-neon-purple flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" /> Report (.md)
              </a>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Results Matrix */}
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Batch ID: <strong className="text-neon-mint">{result.id}</strong> | Evaluated at: {new Date(result.created_at).toLocaleTimeString()}
            </span>
            <span className="text-neon-amber">Seed: 42 (Strictly Reproducible Deterministic Runs)</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {result.comparisons.map((c) => {
              const isImproved = c.net_improvement;
              const isRegression = c.workload_type === 'RECOVERY_REGRESSION';

              return (
                <div
                  key={c.scenario_id}
                  className="bg-void-850 border border-purple-900/30 hover:border-purple-600/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-xl ${isImproved ? 'bg-neon-mint/20 text-neon-mint' : 'bg-neon-amber/20 text-neon-amber'}`}>
                        {isImproved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      <h3 className="text-sm font-bold text-white">{c.scenario_name}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                        {c.workload_type}
                      </span>
                      {isRegression && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neon-coral/20 text-neon-coral border border-neon-coral/40 font-bold">
                          HONEST OVERHEAD REGRESSION
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Wait Time Delta:</span>
                        <span className={c.waiting_time_delta_pct <= 0 ? 'text-neon-mint font-bold' : 'text-neon-coral font-bold'}>
                          {c.waiting_time_delta_pct > 0 ? `+${c.waiting_time_delta_pct}%` : `${c.waiting_time_delta_pct}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Fairness Delta:</span>
                        <span className={c.fairness_delta_pct >= 0 ? 'text-neon-purple font-bold' : 'text-neon-coral font-bold'}>
                          {c.fairness_delta_pct > 0 ? `+${c.fairness_delta_pct}%` : `${c.fairness_delta_pct}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side comparison grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Fixed Baseline */}
                    <div className="p-4 bg-[#140f29] rounded-xl border border-purple-900/30 space-y-2">
                      <span className="font-mono font-bold text-slate-400 block text-[11px] uppercase">
                        Baseline Policy: {c.baseline_result.policy_name}
                      </span>
                      <div className="grid grid-cols-2 gap-2 font-mono text-slate-300">
                        <div>Avg Wait: <span className="text-white font-bold">{c.baseline_result.avg_waiting_time}t</span></div>
                        <div>Turnaround: <span className="text-white font-bold">{c.baseline_result.avg_turnaround_time}t</span></div>
                        <div>Throughput: <span className="text-white font-bold">{c.baseline_result.throughput.toFixed(2)}</span></div>
                        <div>Jain's Fairness: <span className="text-white font-bold">{c.baseline_result.jains_fairness_index.toFixed(3)}</span></div>
                      </div>
                    </div>

                    {/* Adaptive Self-Healing */}
                    <div className="p-4 bg-[#140f29] rounded-xl border border-neon-mint/30 shadow-neon-mint space-y-2">
                      <span className="font-mono font-bold text-neon-mint block text-[11px] uppercase">
                        Adaptive Policy: {c.adaptive_result.policy_name}
                      </span>
                      <div className="grid grid-cols-2 gap-2 font-mono text-slate-200">
                        <div>Avg Wait: <span className="text-neon-mint font-bold">{c.adaptive_result.avg_waiting_time}t</span></div>
                        <div>Turnaround: <span className="text-neon-mint font-bold">{c.adaptive_result.avg_turnaround_time}t</span></div>
                        <div>Throughput: <span className="text-neon-mint font-bold">{c.adaptive_result.throughput.toFixed(2)}</span></div>
                        <div>Jain's Fairness: <span className="text-neon-purple font-bold">{c.adaptive_result.jains_fairness_index.toFixed(3)}</span></div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-purple-900/30">
                        Recovery overhead: <strong className="text-neon-amber">{c.adaptive_result.recovery_action_count}</strong> actions (<strong className="text-neon-amber">{c.adaptive_result.recovery_overhead_ticks}</strong> ticks)
                      </div>
                    </div>
                  </div>

                  {/* Findings & Limitations */}
                  <div className="text-xs text-slate-300 space-y-1 pt-1 leading-relaxed">
                    <p><strong className="text-white">Empirical Findings: </strong>{c.findings_summary}</p>
                    <p className="text-slate-400"><strong className="text-neon-amber">Overhead & Trade-offs: </strong>{c.limitations_notes}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-void-850 border border-purple-900/30 rounded-2xl p-10 text-center text-xs text-slate-500 italic font-mono">
          Click "Execute Full Benchmark Suite" to run automated deterministic comparative benchmarks across all workloads.
        </div>
      )}
    </div>
  );
};
