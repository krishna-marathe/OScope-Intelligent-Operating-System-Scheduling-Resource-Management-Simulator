
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

export interface LifecycleEvent {
  process_id: string;
  state: string;
  start_time: number;
  end_time: number;
  duration: number;
  transition_reason: string;
}

export interface SimulationResult {
  gantt_chart: GanttEvent[];
  metrics: SimulationMetrics;
  lifecycles?: LifecycleEvent[];
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
  processes?: Process[];
}

export interface ExperimentDetails extends ExperimentSummary {
  time_quantum?: number;
  context_switch_cost?: number;
  mlq_config?: MLQConfig;
  mlfq_config?: MLFQConfig;
  processes: Process[];
  simulation_result: SimulationResult;
}

export interface MemorySimulationRequest {
  reference_sequence: number[];
  frame_count: number;
  algorithm: string;
}

export interface PageReferenceStep {
  reference: number;
  is_hit: boolean;
  replaced_page: number | null;
  frames: (number | null)[];
}

export interface MemorySimulationResult {
  algorithm: string;
  reference_sequence: number[];
  frame_count: number;
  steps: PageReferenceStep[];
  page_faults: number;
  page_hits: number;
  hit_ratio: number;
  fault_ratio: number;
  total_references: number;
}

export interface DiskSimulationRequest {
  request_queue: number[];
  initial_head_position: number;
  disk_size: number;
  algorithm: string;
  direction?: "LEFT" | "RIGHT";
}

export interface DiskMovementStep {
  start_cylinder: number;
  end_cylinder: number;
  movement: number;
}

export interface DiskSimulationResult {
  algorithm: string;
  initial_head_position: number;
  request_queue: number[];
  service_order: number[];
  movement_steps: DiskMovementStep[];
  total_head_movement: number;
  average_head_movement: number;
}

export interface ResourceRequest {
  process_id: number;
  request: number[];
}

export interface DeadlockSimulationRequest {
  process_count: number;
  resource_count: number;
  available: number[];
  allocation: number[][];
  maximum: number[][];
  resource_request?: ResourceRequest;
}

export interface SafetyStep {
  step_number: number;
  process_id: number;
  work_before: number[];
  need: number[];
  can_execute: boolean;
  work_after: number[];
  finish_status: boolean[];
}

export interface ProcessState {
  process_id: number;
  allocation: number[];
  maximum: number[];
  need: number[];
  finished: boolean;
}

export interface DeadlockSimulationResult {
  is_safe: boolean;
  safe_sequence: number[];
  available_after_simulation: number[];
  need_matrix: number[][];
  process_states: ProcessState[];
  safety_steps: SafetyStep[];
  request_approved?: boolean;
  request_reason?: string;
}
