import { create } from 'zustand';
import { DeadlockSimulationResult, ResourceRequest } from '../types';

interface DeadlockStore {
  processCount: number;
  resourceCount: number;
  available: number[];
  allocation: number[][];
  maximum: number[][];
  resourceRequest: ResourceRequest | null;
  result: DeadlockSimulationResult | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  
  setProcessCount: (count: number) => void;
  setResourceCount: (count: number) => void;
  setAvailable: (available: number[]) => void;
  setAllocation: (alloc: number[][]) => void;
  setMaximum: (max: number[][]) => void;
  setResourceRequest: (req: ResourceRequest | null) => void;
  setResult: (res: DeadlockSimulationResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentStep: (step: number) => void;
}

export const useDeadlockStore = create<DeadlockStore>((set) => ({
  processCount: 5,
  resourceCount: 3,
  available: [3, 3, 2],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
  ],
  maximum: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
  ],
  resourceRequest: null,
  result: null,
  loading: false,
  error: null,
  currentStep: 0,

  setProcessCount: (count) => set({ processCount: count }),
  setResourceCount: (count) => set({ resourceCount: count }),
  setAvailable: (available) => set({ available }),
  setAllocation: (allocation) => set({ allocation }),
  setMaximum: (maximum) => set({ maximum }),
  setResourceRequest: (req) => set({ resourceRequest: req }),
  setResult: (res) => set({ result: res, currentStep: res ? res.safety_steps.length : 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
