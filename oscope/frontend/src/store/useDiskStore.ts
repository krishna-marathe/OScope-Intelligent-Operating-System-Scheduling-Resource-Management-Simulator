import { create } from 'zustand';
import { DiskSimulationResult } from '../types';

interface DiskStore {
  requestQueue: string;
  initialHeadPosition: number;
  diskSize: number;
  algorithm: string;
  direction: "LEFT" | "RIGHT";
  result: DiskSimulationResult | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  
  setRequestQueue: (seq: string) => void;
  setInitialHeadPosition: (pos: number) => void;
  setDiskSize: (size: number) => void;
  setAlgorithm: (algo: string) => void;
  setDirection: (dir: "LEFT" | "RIGHT") => void;
  setResult: (res: DiskSimulationResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentStep: (step: number) => void;
}

export const useDiskStore = create<DiskStore>((set) => ({
  requestQueue: '98, 183, 37, 122, 14, 124, 65, 67',
  initialHeadPosition: 53,
  diskSize: 200,
  algorithm: 'FCFS',
  direction: 'RIGHT',
  result: null,
  loading: false,
  error: null,
  currentStep: 0,

  setRequestQueue: (seq) => set({ requestQueue: seq }),
  setInitialHeadPosition: (pos) => set({ initialHeadPosition: pos }),
  setDiskSize: (size) => set({ diskSize: size }),
  setAlgorithm: (algo) => set({ algorithm: algo }),
  setDirection: (dir) => set({ direction: dir }),
  setResult: (res) => set({ result: res, currentStep: res ? res.movement_steps.length : 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
