export interface Process {
  id: string;
  arrival_time: number;
  burst_time: number;
  priority?: number;
}

export interface GanttEvent {
  process_id: string;
  start_time: number;
  end_time: number;
}

export interface ProcessMetrics {
  process_id: string;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  response_time: number;
}

export interface SimulationMetrics {
  process_metrics: ProcessMetrics[];
  average_turnaround_time: number;
  average_waiting_time: number;
  average_response_time: number;
  cpu_utilization: number;
  throughput: number;
}

export interface SimulationResult {
  gantt_chart: GanttEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationRequest {
  algorithm: string;
  processes: Process[];
  time_quantum?: number;
}

export interface ExperimentSummary {
  id: number;
  name: string;
  algorithm: string;
  created_at: string;
}

export interface ExperimentDetails extends ExperimentSummary {
  time_quantum?: number;
  processes: Process[];
  simulation_result: SimulationResult;
}
