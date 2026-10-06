import { create } from 'zustand';
import { MemorySimulationResult } from '../types';

interface MemoryStore {
  referenceSequence: string;
  frameCount: number;
  algorithm: string;
  result: MemorySimulationResult | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  
  setReferenceSequence: (seq: string) => void;
  setFrameCount: (count: number) => void;
  setAlgorithm: (algo: string) => void;
  setResult: (res: MemorySimulationResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentStep: (step: number) => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  referenceSequence: '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5',
  frameCount: 3,
  algorithm: 'FIFO',
  result: null,
  loading: false,
  error: null,
  currentStep: 0,

  setReferenceSequence: (seq) => set({ referenceSequence: seq }),
  setFrameCount: (count) => set({ frameCount: count }),
  setAlgorithm: (algo) => set({ algorithm: algo }),
  setResult: (res) => set({ result: res, currentStep: res ? res.steps.length : 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
