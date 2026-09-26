import { create } from 'zustand';
import { Process, SimulationResult, MLQConfig, MLFQConfig } from '../types';

interface SimulatorState {
  processes: Process[];
  algorithm: string;
  timeQuantum: number;
  contextSwitchCost: number;
  mlqConfig?: MLQConfig;
  mlfqConfig?: MLFQConfig;
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  addProcess: (p: Process) => void;
  removeProcess: (id: string) => void;
  clearProcesses: () => void;
  setAlgorithm: (alg: string) => void;
  setTimeQuantum: (tq: number) => void;
  setContextSwitchCost: (cost: number) => void;
  setMlqConfig: (config: MLQConfig) => void;
  setMlfqConfig: (config: MLFQConfig) => void;
  setResult: (res: SimulationResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (play: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetPlayback: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [],
  algorithm: 'FCFS',
  timeQuantum: 2,
  contextSwitchCost: 0,
  mlqConfig: {
    queues: [
      { id: 1, priority: 1, policy: 'RR', time_quantum: 4 },
      { id: 2, priority: 2, policy: 'FCFS' }
    ],
    process_assignments: {},
    inter_queue_policy: 'FIXED_PRIORITY'
  },
  mlfqConfig: {
    queues: [
      { id: 1, priority: 1, policy: 'RR', time_quantum: 2 },
      { id: 2, priority: 2, policy: 'RR', time_quantum: 4 },
      { id: 3, priority: 3, policy: 'FCFS' }
    ],
    boost_interval: 20
  },
  result: null,
  loading: false,
  error: null,
  
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  addProcess: (p) => set((state) => ({ processes: [...state.processes, p] })),
  removeProcess: (id) => set((state) => ({ processes: state.processes.filter(p => p.id !== id) })),
  clearProcesses: () => set({ processes: [] }),
  setAlgorithm: (alg) => set({ algorithm: alg }),
  setTimeQuantum: (tq) => set({ timeQuantum: tq }),
  setContextSwitchCost: (cost) => set({ contextSwitchCost: cost }),
  setMlqConfig: (config) => set({ mlqConfig: config }),
  setMlfqConfig: (config) => set({ mlfqConfig: config }),
  setResult: (res) => set({ result: res, currentTime: 0, isPlaying: false }),
  setLoading: (l) => set({ loading: l }),
  setError: (e) => set({ error: e }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (play) => set({ isPlaying: play }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  resetPlayback: () => set({ currentTime: 0, isPlaying: false }),
}));
