import { create } from 'zustand';
import { Process, SimulationResult } from '../types';

interface SimulatorState {
  processes: Process[];
  algorithm: string;
  timeQuantum: number;
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  
  addProcess: (p: Process) => void;
  removeProcess: (id: string) => void;
  clearProcesses: () => void;
  setAlgorithm: (alg: string) => void;
  setTimeQuantum: (tq: number) => void;
  setResult: (res: SimulationResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [],
  algorithm: 'FCFS',
  timeQuantum: 2,
  result: null,
  loading: false,
  error: null,
  
  addProcess: (p) => set((state) => ({ processes: [...state.processes, p] })),
  removeProcess: (id) => set((state) => ({ processes: state.processes.filter(p => p.id !== id) })),
  clearProcesses: () => set({ processes: [] }),
  setAlgorithm: (alg) => set({ algorithm: alg }),
  setTimeQuantum: (tq) => set({ timeQuantum: tq }),
  setResult: (res) => set({ result: res }),
  setLoading: (l) => set({ loading: l }),
  setError: (e) => set({ error: e }),
}));
