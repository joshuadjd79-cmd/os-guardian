import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExperimentResult } from '../types/simulation';
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Table,
  Sparkles,
  Info
} from 'lucide-react';

export const ReportsExportCenter: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<ExperimentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getLatestBenchmarks()
      .then(res => setBenchmarks(res))
      .catch(err => console.error("Could not fetch benchmark summary:", err))
      .finally(() => setLoading(false));
  }, []);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-neon-mint" />
            <span>Research Artifacts & Export Center</span>
          </div>
          <h2 className="text-xl font-bold text-white">System Reports & Data Exports</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Download verified benchmark traces, comparative baseline vs adaptive results, and academic course project submission documentation.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-purple-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neon-mint" />
          <span>RFC-4180 Compliant & Formula-Sanitized</span>
        </div>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Card */}
        <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 hover:border-neon-mint/40 transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neon-mint/10 border border-neon-mint/30 flex items-center justify-center text-neon-mint">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Spreadsheet Dataset (CSV)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete tabular metrics for all 7 workloads across baseline and adaptive recovery policies. Formatted for Excel, R, or Python Pandas.
            </p>
          </div>
          <button
            onClick={() => downloadFile('/api/experiments/export/csv', 'os_guardian_benchmarks.csv')}
            className="w-full py-2.5 px-4 rounded-xl bg-neon-mint text-slate-950 font-bold text-xs hover:bg-neon-mintGlow shadow-neon-mint flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Dataset</span>
          </button>
        </div>

        {/* Markdown Card */}
        <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 hover:border-neon-purple/40 transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Academic Project Report (MD)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete defense document including research questions, mathematical formulas, trade-off analysis, and benchmark result tables.
            </p>
          </div>
          <button
            onClick={() => downloadFile('/api/experiments/export/report', 'OS_GUARDIAN_BENCHMARK_REPORT.md')}
            className="w-full py-2.5 px-4 rounded-xl bg-neon-purple hover:bg-purple-600 text-white font-bold text-xs shadow-neon-purple flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Markdown Report</span>
          </button>
        </div>

        {/* JSON Card */}
        <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 hover:border-neon-amber/40 transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center text-neon-amber">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Raw Telemetry Trace (JSON)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full structured snapshot containing candidate action scores, state transition histories, alert logs, and Jain's index allocations.
            </p>
          </div>
          <button
            onClick={() => downloadFile('/api/experiments/export/json', 'os_guardian_telemetry.json')}
            className="w-full py-2.5 px-4 rounded-xl bg-neon-amber hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-neon-amber flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Trace</span>
          </button>
        </div>
      </div>

      {/* Security & Export Integrity Box */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-neon-mint shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-white">CSV Injection Security Guarantee</div>
          <p className="text-slate-400 leading-relaxed">
            All text fields and process names are sanitized against CSV/Formula Injection (RFC-4180). Any string beginning with dangerous formula characters (<code className="text-neon-amber">=</code>, <code className="text-neon-amber">+</code>, <code className="text-neon-amber">-</code>, <code className="text-neon-amber">@</code>) is safely escaped with a leading single quote.
          </p>
        </div>
      </div>

      {/* Benchmark Summary Table Preview */}
      <div className="p-5 rounded-2xl bg-void-850 border border-purple-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-neon-mint" />
            <span>Live Benchmark Summary Preview</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {benchmarks ? `${benchmarks.comparisons.length} Scenarios Evaluated` : 'Loading...'}
          </span>
        </div>

        {benchmarks && (
          <div className="overflow-x-auto rounded-xl border border-purple-900/30">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#120d26] text-slate-400 uppercase font-mono text-[10px] border-b border-purple-900/30">
                <tr>
                  <th className="p-3">Workload Scenario</th>
                  <th className="p-3">Baseline Wait (t)</th>
                  <th className="p-3">Adaptive Wait (t)</th>
                  <th className="p-3">Wait Relief</th>
                  <th className="p-3">Baseline Jain</th>
                  <th className="p-3">Adaptive Jain</th>
                  <th className="p-3">Interventions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 font-mono">
                {benchmarks.comparisons.map((sc, idx) => {
                  const waitRelief = sc.waiting_time_delta_pct;
                  return (
                    <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                      <td className="p-3 font-semibold text-white font-sans">{sc.scenario_name}</td>
                      <td className="p-3 text-slate-400">{sc.baseline_result.avg_waiting_time.toFixed(1)}t</td>
                      <td className="p-3 text-neon-mint font-semibold">{sc.adaptive_result.avg_waiting_time.toFixed(1)}t</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${waitRelief <= 0 ? 'bg-neon-mint/20 text-neon-mint' : 'bg-rose-500/20 text-rose-300'}`}>
                          {waitRelief > 0 ? `+${waitRelief}%` : `${waitRelief}%`}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{sc.baseline_result.jains_fairness_index.toFixed(3)}</td>
                      <td className="p-3 text-neon-purple font-semibold">{sc.adaptive_result.jains_fairness_index.toFixed(3)}</td>
                      <td className="p-3 text-neon-amber">{sc.adaptive_result.recovery_action_count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
