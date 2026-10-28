export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';

export type SchedulerType = 'FCFS' | 'SJF' | 'ROUND_ROBIN' | 'PRIORITY' | 'ADAPTIVE';

export type SimulationStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export type AnomalyType =
  | 'SUSTAINED_HIGH_CPU'
  | 'HIGH_MEMORY_PRESSURE'
  | 'EXCESSIVE_WAITING_TIME'
  | 'UNRESPONSIVE_PROCESS'
  | 'STARVATION_RISK'
  | 'RECOVERY_FAILURE';

export type AnomalySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AnomalyStatus = 'ACTIVE' | 'INVESTIGATING' | 'RECOVERED' | 'DISMISSED' | 'COOLDOWN';

export type RecoveryActionType =
  | 'ADJUST_PRIORITY'
  | 'APPLY_AGING'
  | 'SWITCH_SCHEDULER'
  | 'ADJUST_TIME_QUANTUM'
  | 'RECLAIM_MEMORY'
  | 'THROTTLE_ADMISSION'
  | 'NO_INTERVENTION';

export type ActionOutcome = 'PENDING' | 'SUCCESS' | 'PARTIAL_IMPROVEMENT' | 'NO_IMPROVEMENT' | 'REGRESSION';

export interface StateTransitionRecord {
  timestamp: number;
  from_state: ProcessState;
  to_state: ProcessState;
  reason: string;
}

export interface ProcessModel {
  pid: number;
  name: string;
  arrival_time: number;
  burst_time: number;
  remaining_time: number;
  memory: number;
  reclaimable_memory: number;
  base_priority: number;
  effective_priority: number;
  state: ProcessState;
  first_response_time?: number | null;
  start_time?: number | null;
  finish_time?: number | null;
  waiting_time: number;
  turnaround_time?: number | null;
  response_time?: number | null;
  cpu_service_received: number;
  io_frequency: number;
  io_duration: number;
  current_io_remaining: number;
  ticks_since_last_io: number;
  ticks_in_ready_queue: number;
  penalized_count: number;
  state_history: StateTransitionRecord[];
}

export interface JainFairnessDetails {
  index: number;
  population_size: number;
  definition: string;
  allocations: Record<string, number>;
}

export interface SystemMetrics {
  simulation_time: number;
  elapsed_time: number;
  cpu_busy_time: number;
  cpu_idle_time: number;
  cpu_utilization: number;
  memory_capacity: number;
  memory_used: number;
  memory_utilization: number;
  ready_queue_length: number;
  blocked_queue_length: number;
  active_process_count: number;
  completed_process_count: number;
  throughput: number;
  avg_waiting_time: number;
  avg_turnaround_time: number;
  avg_response_time: number;
  jains_fairness: JainFairnessDetails;
  recovery_action_count: number;
  recovery_overhead_ticks: number;
  window_cpu_utilization: number;
  window_memory_utilization: number;
}

export interface AnomalyAlert {
  id: string;
  timestamp: number;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  evidence: Record<string, any>;
  affected_pids: number[];
  status: AnomalyStatus;
  first_detected_time: number;
  last_detected_time: number;
  resolution_time?: number | null;
  resolution_details?: string | null;
  recommended_action?: string | null;
}

export interface CandidateAction {
  action_type: RecoveryActionType;
  target_pids: number[];
  parameters: Record<string, any>;
  is_eligible: boolean;
  rejection_reason?: string | null;
  expected_responsiveness_improvement: number;
  expected_resource_relief: number;
  fairness_benefit: number;
  estimated_intervention_cost: number;
  estimated_fairness_harm: number;
  recovery_risk: number;
  score: number;
  confidence: number;
  expected_effects: string;
  potential_side_effects: string;
  explanation: string;
}

export interface RecoveryDecisionRecord {
  decision_id: string;
  timestamp: number;
  triggering_anomaly_id: string;
  triggering_anomaly_type: string;
  affected_pids: number[];
  baseline_metrics: Record<string, any>;
  candidates_evaluated: CandidateAction[];
  chosen_action: CandidateAction;
  was_applied: boolean;
  is_manual_approval_required: boolean;
  approved: boolean;
  applied_timestamp?: number | null;
  post_action_metrics?: Record<string, any> | null;
  evaluation_timestamp?: number | null;
  outcome: ActionOutcome;
  outcome_narrative?: string | null;
  justification: string;
}

export interface GanttInterval {
  start_time: number;
  end_time: number;
  pid?: number | null;
  process_name?: string | null;
  is_recovery_overhead: boolean;
}

export interface SimulationConfig {
  scheduler_algorithm: SchedulerType;
  time_quantum: number;
  memory_capacity: number;
  context_switch_overhead: number;
  enable_aging: boolean;
  aging_threshold: number;
  aging_step: number;
  min_priority_bound: number;
  max_priority_bound: number;
  auto_recovery: boolean;
  manual_approval_required: boolean;
  random_seed: number;
  speed_ms: number;
  sustained_cpu_threshold: number;
  sustained_cpu_window: number;
  memory_pressure_threshold: number;
  excessive_wait_threshold: number;
  unresponsive_threshold: number;
  starvation_threshold: number;
  cooldown_period: number;
  w_responsiveness: number;
  w_resource_relief: number;
  w_fairness: number;
  w_cost: number;
  w_fairness_harm: number;
  w_risk: number;
  min_utility_threshold: number;
}

export interface SimulationSnapshot {
  status: SimulationStatus;
  current_time: number;
  config: SimulationConfig;
  running_process?: ProcessModel | null;
  ready_queue: ProcessModel[];
  blocked_queue: ProcessModel[];
  active_processes: ProcessModel[];
  completed_processes: ProcessModel[];
  metrics: SystemMetrics;
  gantt_log: GanttInterval[];
  active_alerts: AnomalyAlert[];
  recent_recovery_decisions: RecoveryDecisionRecord[];
  recent_events: Array<{
    timestamp: number;
    type: string;
    description: string;
    data: Record<string, any>;
  }>;
}

export type WorkloadType =
  | 'BALANCED'
  | 'CPU_HEAVY'
  | 'MEMORY_PRESSURE'
  | 'STARVATION_RISK'
  | 'MIXED_ARRIVALS'
  | 'NO_WORKLOAD_IDLE'
  | 'RECOVERY_REGRESSION'
  | 'CUSTOM';

export interface PolicyRunResult {
  policy_name: string;
  scheduler_type: SchedulerType;
  auto_recovery: boolean;
  total_ticks_elapsed: number;
  completed_processes: number;
  total_processes: number;
  throughput: number;
  cpu_utilization: number;
  memory_utilization: number;
  avg_waiting_time: number;
  avg_turnaround_time: number;
  avg_response_time: number;
  jains_fairness_index: number;
  recovery_action_count: number;
  recovery_overhead_ticks: number;
  anomalies_detected: number;
  anomalies_resolved: number;
}

export interface BenchmarkComparison {
  scenario_id: string;
  scenario_name: string;
  workload_type: WorkloadType;
  timestamp: string;
  random_seed: number;
  runs_count: number;
  baseline_result: PolicyRunResult;
  adaptive_result: PolicyRunResult;
  throughput_delta_pct: number;
  waiting_time_delta_pct: number;
  turnaround_delta_pct: number;
  fairness_delta_pct: number;
  memory_delta_pct?: number;
  net_improvement: boolean;
  findings_summary: string;
  limitations_notes: string;
}

export interface ExperimentResult {
  id: string;
  created_at: string;
  comparisons: BenchmarkComparison[];
}
