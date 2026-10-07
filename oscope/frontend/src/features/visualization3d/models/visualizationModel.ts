export type VisualState = 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED' | 'AVAILABLE' | 'ALLOCATED' | 'FAULT' | 'HIT' | 'IDLE';

export interface VisualEntity {
  id: string;
  type: 'process' | 'resource' | 'queue' | 'memory_block' | 'disk_track';
  label: string;
  state: VisualState;
  metadata?: Record<string, any>;
}

export interface VisualConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  active?: boolean;
}

export interface VisualizationModel {
  entities: VisualEntity[];
  connections: VisualConnection[];
  currentTime: number;
  currentStep: number;
  totalSteps: number;
}
