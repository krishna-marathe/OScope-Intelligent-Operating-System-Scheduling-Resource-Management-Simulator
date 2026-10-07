import { create } from 'zustand';

interface IntelligenceState {
  currentAnalysis: any | null;
  selectedObjectiveWeights: Record<string, number>;
  loading: boolean;
  error: string | null;
}

export const useIntelligenceStore = create<IntelligenceState>((set) => ({
  currentAnalysis: null,
  selectedObjectiveWeights: {
    waitingTime: 0.25,
    turnaroundTime: 0.20,
    responseTime: 0.20,
    throughput: 0.15,
    cpuUtilization: 0.10,
    contextSwitchCost: 0.10
  },
  loading: false,
  error: null
}));
