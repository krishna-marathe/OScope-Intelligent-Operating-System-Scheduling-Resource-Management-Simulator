
export interface QueueConfig {
  id: number;
  priority: number;
  policy: string;
  time_quantum?: number;
  context_switch_cost?: number;
  mlq_config?: MLQConfig;
  mlfq_config?: MLFQConfig;
}

export interface MLQConfig {
  queues: QueueConfig[];
  process_assignments: Record<string, number>;
  inter_queue_policy: string;
}

export interface MLFQConfig {
  queues: QueueConfig[];
  boost_interval?: number;
}

export interface Process {
  id: string;
  arrival_time: number;
  burst_time: number;
  priority?: number;
  burst_sequence?: number[];
}

export interface GanttEvent {
  queue_id?: number;
  process_id: string;
  start_time: number;
  end_time: number;
  event_type?: string;
}

export interface ProcessMetrics {
  process_id: string;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  response_time: number;
  io_time?: number;
  blocked_time?: number;
}

export interface SimulationMetrics {
  process_metrics: ProcessMetrics[];
  average_turnaround_time: number;
  average_waiting_time: number;
  average_response_time: number;
  cpu_utilization: number;
  throughput: number;
  io_utilization?: number;
  total_makespan?: number;
}

export interface SimulationResult {
  gantt_chart: GanttEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationRequest {
  algorithm: string;
  processes: Process[];
  time_quantum?: number;
  context_switch_cost?: number;
  mlq_config?: MLQConfig;
  mlfq_config?: MLFQConfig;
}

export interface ExperimentSummary {
  id: number;
  name: string;
  algorithm: string;
  created_at: string;
}

export interface ExperimentDetails extends ExperimentSummary {
  time_quantum?: number;
  context_switch_cost?: number;
  mlq_config?: MLQConfig;
  mlfq_config?: MLFQConfig;
  processes: Process[];
  simulation_result: SimulationResult;
}
