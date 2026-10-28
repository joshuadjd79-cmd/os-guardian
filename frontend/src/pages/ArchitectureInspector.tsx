import React from 'react';
import { useSimulation } from '../hooks/useSimulation';
import {
  Layers,
  Cpu,
  Database,
  Activity,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sliders,
  Server,
  Zap,
  Radio,
  FileCode2,
  HardDrive
} from 'lucide-react';

export const ArchitectureInspector: React.FC = () => {
  const { snapshot, wsConnected } = useSimulation();

  const modules = [
    {
      id: "workload",
      name: "1. Workload Generator",
      file: "backend/app/experiments/workloads.py",
      role: "Synthesizes deterministic, reproducible process streams (Balanced, CPU Heavy, Memory Pressure, Starvation Risk, Mixed Arrivals).",
      status: "Active / Seeded",
      icon: <Layers className="w-5 h-5 text-neon-mint" />
    },
    {
      id: "process_mgr",
      name: "2. Process Manager & PCB",
      file: "backend/app/core/process.py",
      role: "Maintains Process Control Block state machine (NEW -> READY -> RUNNING -> BLOCKED -> TERMINATED) with burst, memory, and priority accounting.",
      status: `${snapshot?.active_processes?.length || 0} active, ${snapshot?.completed_processes?.length || 0} completed`,
      icon: <FileCode2 className="w-5 h-5 text-neon-purple" />
    },
    {
      id: "ready_queue",
      name: "3. Ready Queue & Dispatcher",
      file: "backend/app/scheduling/ready_queue.py",
      role: "Organizes processes according to current scheduling discipline (FCFS, SJF, RR, Priority, Adaptive) with starvation aging tracking.",
      status: `Queue Depth: ${snapshot?.ready_queue?.length || 0}`,
      icon: <Sliders className="w-5 h-5 text-neon-amber" />
    },
    {
      id: "cpu_sim",
      name: "4. Discrete-Time CPU Simulator",
      file: "backend/app/core/engine.py",
      role: "Advances cycle-accurate simulation ticks, decrements CPU burst, triggers preemption at quantum boundaries, and handles I/O interrupts.",
      status: `Clock: Tick ${snapshot?.current_time ?? 0}`,
      icon: <Cpu className="w-5 h-5 text-neon-mint" />
    },
    {
      id: "memory_model",
      name: "5. Simulated Memory Manager",
      file: "backend/app/core/engine.py",
      role: "Tracks working sets, page allocations, and explicitly reclaimable buffers (caches, buffers) without terminating host processes.",
      status: `${snapshot?.metrics?.memory_used || 0} MB / ${snapshot?.metrics?.memory_capacity || 1024} MB`,
      icon: <HardDrive className="w-5 h-5 text-neon-coral" />
    },
    {
      id: "anomaly_detector",
      name: "6. Sliding-Window Anomaly Detector",
      file: "backend/app/monitoring/detector.py",
      role: "Surveils sliding windows for sustained CPU saturation (>85%), memory pressure (>80%), queue congestion, and starvation risks.",
      status: `${snapshot?.active_alerts?.length || 0} active alerts`,
      icon: <Activity className="w-5 h-5 text-neon-coral" />
    },
    {
      id: "recovery_evaluator",
      name: "7. Multi-Criteria Recovery Scorer",
      file: "backend/app/recovery/evaluator.py",
      role: "Scores 7 candidate actions using a weighted utility function penalizing intervention cost, fairness harm, and recovery risk.",
      status: "Utility function active",
      icon: <Zap className="w-5 h-5 text-neon-purple" />
    },
    {
      id: "recovery_actions",
      name: "8. Recovery Action Manager",
      file: "backend/app/recovery/actions.py",
      role: "Applies verified interventions (quantum tuning, priority aging, memory reclamation, admission throttling) with automatic rollback support.",
      status: `${snapshot?.metrics?.recovery_action_count || 0} interventions executed`,
      icon: <ShieldCheck className="w-5 h-5 text-neon-mint" />
    },
    {
      id: "metrics_engine",
      name: "9. Real-time Metrics Engine",
      file: "backend/app/monitoring/metrics.py",
      role: "Computes turnaround time, waiting time, response time, throughput, and Jain's Fairness Index at every clock tick.",
      status: `Fairness: ${snapshot?.metrics?.jains_fairness?.index?.toFixed(3) || '1.000'}`,
      icon: <Clock className="w-5 h-5 text-neon-amber" />
    },
    {
      id: "event_recorder",
      name: "10. Simulation Event Recorder",
      file: "backend/app/core/engine.py",
      role: "Logs state transitions, anomalies, recovery actions, and scheduling events chronologically for transparent playback and auditing.",
      status: `${snapshot?.recent_events?.length || 0} recorded events`,
      icon: <FileCode2 className="w-5 h-5 text-purple-300" />
    },
    {
      id: "api_layer",
      name: "11. REST API & WebSocket Server",
      file: "backend/app/main.py",
      role: "Serves FastAPI endpoints and streams real-time WebSocket state snapshots to the React dashboard at 60 FPS tick intervals.",
      status: wsConnected ? "Live WebSocket Connected (60Hz)" : "Polling Fallback Active",
      icon: <Radio className="w-5 h-5 text-neon-mint" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-void-850 via-[#181233] to-void-850 border border-purple-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-neon-mint uppercase tracking-wider mb-1">
            <Server className="w-4 h-4 text-neon-mint" />
            <span>Architecture & Performance Inspector</span>
          </div>
          <h2 className="text-xl font-bold text-white">System Component Subsystems</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Real-time inspection of OS Guardian's 11 decoupled architectural modules. All process state machines, scheduling queues, memory pools, and self-healing interventions operate deterministically in-memory.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-purple-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neon-mint" />
          <span>Safety Boundary: In-Memory Simulated OS</span>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="p-6 rounded-2xl bg-void-850 border border-purple-900/30 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-amber" />
          <span>Discrete-Time Execution & Feedback Data Flow</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 space-y-1">
            <span className="font-bold text-neon-mint">1. Workload Injection</span>
            <p className="text-[11px] text-slate-400">Processes arrive at clock tick T, initialized into NEW state and placed into READY queue.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 space-y-1">
            <span className="font-bold text-neon-purple">2. Scheduler Dispatch</span>
            <p className="text-[11px] text-slate-400">Algorithm dispatches process to CPU; clock advances cycle-accurately decrementing burst time.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 space-y-1">
            <span className="font-bold text-neon-amber">3. Anomaly Surveillance</span>
            <p className="text-[11px] text-slate-400">Sliding window calculates utilization and waiting times; flags CPU saturation or starvation.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-slate-300 space-y-1">
            <span className="font-bold text-neon-coral">4. Self-Healing Action</span>
            <p className="text-[11px] text-slate-400">Recovery engine evaluates 7 candidates, executes optimal action, and tracks regression risk.</p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="p-5 rounded-2xl bg-void-850 border border-purple-900/25 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40">
                  {mod.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-neon-mint border border-neon-mint/30">
                  Active
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{mod.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{mod.role}</p>
            </div>

            <div className="pt-3 border-t border-purple-900/30 space-y-1 text-[11px] font-mono">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Source:</span>
                <span className="text-purple-300 truncate max-w-[180px]">{mod.file}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Telemetry:</span>
                <span className="text-neon-amber font-semibold">{mod.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
