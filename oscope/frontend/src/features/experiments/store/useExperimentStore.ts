import { create } from 'zustand';
import { Experiment } from '../types/experiment';

interface ExperimentState {
  experiments: Experiment[];
  selectedExperiment: Experiment | null;
  baselineExperiment: Experiment | null;
  loading: boolean;
  error: string | null;
}

export const useExperimentStore = create<ExperimentState>(() => ({
  experiments: [],
  selectedExperiment: null,
  baselineExperiment: null,
  loading: false,
  error: null
}));