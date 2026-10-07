export type ExperimentStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  domain: 'CPU' | 'Memory' | 'Disk' | 'Deadlock';
  createdAt: string;
  updatedAt: string;
  scenario: any;
  algorithms: string[];
  simulationResults: any[];
  intelligenceResults: any;
  tags: string[];
  notes: string;
  status: ExperimentStatus;
  hypothesis?: string;
}