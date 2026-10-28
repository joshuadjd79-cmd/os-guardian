import {
  SimulationSnapshot,
  SimulationConfig,
  ProcessModel,
  RecoveryDecisionRecord,
  ExperimentResult,
  WorkloadType
} from '../types/simulation';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<{ status: string; service: string; version: string; safety_boundary: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getState(): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/state`);
    if (!res.ok) throw new Error('Failed to fetch simulation state');
    return res.json();
  },

  async start(): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async pause(): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pause simulation');
    return res.json();
  },

  async resume(): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/resume`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to resume simulation');
    return res.json();
  },

  async step(): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/step`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to step simulation');
    return res.json();
  },

  async reset(config?: Partial<SimulationConfig>): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: config ? JSON.stringify(config) : undefined
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async loadWorkload(workloadType: WorkloadType): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/processes/workload/${workloadType}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to load workload: ${workloadType}`);
    return res.json();
  },

  async loadCustomWorkload(processes: any[]): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/processes/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processes)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Custom workload rejected' }));
      throw new Error(err.detail || 'Custom workload failed');
    }
    return res.json();
  },

  async listProcesses(): Promise<ProcessModel[]> {
    const res = await fetch(`${API_BASE}/processes`);
    if (!res.ok) throw new Error('Failed to list processes');
    return res.json();
  },

  async getDecisions(): Promise<RecoveryDecisionRecord[]> {
    const res = await fetch(`${API_BASE}/recovery/decisions`);
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return res.json();
  },

  async approveDecision(decisionId: string, approved: boolean): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/recovery/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision_id: decisionId, approved })
    });
    if (!res.ok) throw new Error('Failed to apply recovery decision');
    return res.json();
  },

  async runBenchmarks(): Promise<ExperimentResult> {
    const res = await fetch(`${API_BASE}/experiments/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run benchmarks');
    return res.json();
  },

  async getLatestBenchmarks(): Promise<ExperimentResult> {
    const res = await fetch(`${API_BASE}/experiments/latest`);
    if (!res.ok) throw new Error('Failed to get latest benchmarks');
    return res.json();
  },

  async updateConfig(config: SimulationConfig): Promise<SimulationSnapshot> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  }
};
