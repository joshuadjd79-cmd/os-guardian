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
  FileText
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
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Comparative Benchmark Laboratory
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Empirical evaluation comparing Fixed Policy Baselines vs Adaptive Self-Healing across 7 standardized workloads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunBenchmarks}
            disabled={running}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
              running
                ? 'bg-cyan-500/50 text-slate-900 cursor-not-allowed'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {running ? 'Running Benchmarks...' : 'Execute Benchmark Suite'}
          </button>

          {result && (
            <>
              <a
                href="/api/experiments/export/csv"
                download="os_guardian_benchmarks.csv"
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </a>
              <a
                href="/api/experiments/export/report"
                download="OS_GUARDIAN_BENCHMARK_REPORT.md"
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Report (.md)
              </a>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Results Matrix */}
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Batch ID: <strong className="font-mono text-cyan-300">{result.id}</strong> | Evaluated at: {new Date(result.created_at).toLocaleTimeString()}
            </span>
            <span>Seed: 42 (Reproducible Deterministic Runs)</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {result.comparisons.map((c) => {
              const isImproved = c.net_improvement;
              return (
                <div
                  key={c.scenario_id}
                  className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md ${isImproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isImproved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-100">{c.scenario_name}</h3>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {c.workload_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">WT Delta:</span>
                        <span className={c.waiting_time_delta_pct <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {c.waiting_time_delta_pct > 0 ? `+${c.waiting_time_delta_pct}%` : `${c.waiting_time_delta_pct}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Fairness Delta:</span>
                        <span className={c.fairness_delta_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {c.fairness_delta_pct > 0 ? `+${c.fairness_delta_pct}%` : `${c.fairness_delta_pct}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side comparison grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Fixed Baseline */}
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-slate-400 block text-[11px] uppercase">
                        Baseline Policy: {c.baseline_result.policy_name}
                      </span>
                      <div className="grid grid-cols-2 gap-2 font-mono text-slate-300">
                        <div>Avg Wait: <span className="text-slate-100">{c.baseline_result.avg_waiting_time}t</span></div>
                        <div>Turnaround: <span className="text-slate-100">{c.baseline_result.avg_turnaround_time}t</span></div>
                        <div>Throughput: <span className="text-slate-100">{c.baseline_result.throughput.toFixed(2)}</span></div>
                        <div>Jain's Fairness: <span className="text-slate-100">{c.baseline_result.jains_fairness_index.toFixed(3)}</span></div>
                      </div>
                    </div>

                    {/* Adaptive Self-Healing */}
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-500/30 space-y-1.5">
                      <span className="font-semibold text-cyan-300 block text-[11px] uppercase">
                        Adaptive Policy: {c.adaptive_result.policy_name}
                      </span>
                      <div className="grid grid-cols-2 gap-2 font-mono text-slate-200">
                        <div>Avg Wait: <span className="text-cyan-300 font-bold">{c.adaptive_result.avg_waiting_time}t</span></div>
                        <div>Turnaround: <span className="text-cyan-300 font-bold">{c.adaptive_result.avg_turnaround_time}t</span></div>
                        <div>Throughput: <span className="text-cyan-300 font-bold">{c.adaptive_result.throughput.toFixed(2)}</span></div>
                        <div>Jain's Fairness: <span className="text-cyan-300 font-bold">{c.adaptive_result.jains_fairness_index.toFixed(3)}</span></div>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        Recovery overhead: {c.adaptive_result.recovery_action_count} actions ({c.adaptive_result.recovery_overhead_ticks} ticks)
                      </div>
                    </div>
                  </div>

                  {/* Findings & Limitations */}
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <p><strong className="text-slate-200">Empirical Findings: </strong>{c.findings_summary}</p>
                    <p className="text-slate-400"><strong className="text-slate-300">Overhead & Trade-offs: </strong>{c.limitations_notes}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center text-xs text-slate-500 italic">
          Click "Execute Benchmark Suite" to run automated deterministic comparative benchmarks across all workloads.
        </div>
      )}
    </div>
  );
};
