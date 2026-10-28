import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { SimulationSnapshot, SimulationConfig, WorkloadType, ProcessModel } from '../types/simulation';
import { api } from '../services/api';

interface SimulationContextType {
  snapshot: SimulationSnapshot | null;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  selectedProcess: ProcessModel | null;
  setSelectedProcess: (p: ProcessModel | null) => void;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  step: () => Promise<void>;
  reset: (config?: Partial<SimulationConfig>) => Promise<void>;
  loadWorkload: (type: WorkloadType) => Promise<void>;
  loadCustomWorkload: (processes: any[]) => Promise<void>;
  approveDecision: (decisionId: string, approved: boolean) => Promise<void>;
  updateConfig: (config: SimulationConfig) => Promise<void>;
  refresh: () => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<SimulationSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessModel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const state = await api.getState();
      setSnapshot(state);
      setError(null);
    } catch (err: any) {
      console.warn('Initial REST fetch failed:', err);
      setError('Waiting for simulation backend to connect...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();

    // Setup WebSocket connection
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/simulation`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: SimulationSnapshot = JSON.parse(event.data);
          setSnapshot(data);
          // If a process is selected in drawer, update its snapshot
          if (selectedProcess) {
            const updated = data.active_processes.concat(data.completed_processes).find(p => p.pid === selectedProcess.pid);
            if (updated) setSelectedProcess(updated);
          }
        } catch (e) {
          // Ignore keepalive or non-json
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => {
        setWsConnected(false);
        ws.close();
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const start = async () => {
    try {
      const s = await api.start();
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const pause = async () => {
    try {
      const s = await api.pause();
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const step = async () => {
    try {
      const s = await api.step();
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const reset = async (config?: Partial<SimulationConfig>) => {
    try {
      const s = await api.reset(config);
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadWorkload = async (type: WorkloadType) => {
    try {
      const s = await api.loadWorkload(type);
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadCustomWorkload = async (processes: any[]) => {
    try {
      const s = await api.loadCustomWorkload(processes);
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const approveDecision = async (decisionId: string, approved: boolean) => {
    try {
      const s = await api.approveDecision(decisionId, approved);
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateConfig = async (config: SimulationConfig) => {
    try {
      const s = await api.updateConfig(config);
      setSnapshot(s);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refresh = async () => {
    await fetchInitial();
  };

  return (
    <SimulationContext.Provider
      value={{
        snapshot,
        loading,
        error,
        wsConnected,
        selectedProcess,
        setSelectedProcess,
        start,
        pause,
        step,
        reset,
        loadWorkload,
        loadCustomWorkload,
        approveDecision,
        updateConfig,
        refresh
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
