import { describe, it, expect } from 'vitest';
import { Process, SimulationRequest, SimulationResult, ExperimentDetails } from '../types';

describe('Phase 8B.1 Contract Integrations', () => {
  it('1. Existing CPU-only process type remains valid', () => {
    const p: Process = {
      id: 'P1',
      arrival_time: 0,
      burst_time: 5,
      priority: 1
    };
    expect(p.burst_time).toBe(5);
    expect(p.burst_sequence).toBeUndefined();
  });

  it('2. CPU/I/O burst sequence can be represented by the TypeScript model', () => {
    const p: Process = {
      id: 'P2',
      arrival_time: 0,
      burst_time: 12, // Sum of bursts
      burst_sequence: [5, 3, 4] // CPU 5 -> IO 3 -> CPU 4
    };
    expect(p.burst_sequence).toEqual([5, 3, 4]);
  });

  it('3. Simulation request can represent burst_sequence', () => {
    const req: SimulationRequest = {
      algorithm: 'FCFS',
      processes: [
        {
          id: 'P1',
          arrival_time: 0,
          burst_time: 12,
          burst_sequence: [5, 3, 4]
        }
      ]
    };
    expect(req.processes[0].burst_sequence).toEqual([5, 3, 4]);
  });

  it('4. Simulation response can represent CPU and I/O events', () => {
    const res: SimulationResult = {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 5, event_type: 'CPU' },
        { process_id: 'P1', start_time: 5, end_time: 8, event_type: 'IO' },
        { process_id: 'P1', start_time: 8, end_time: 12, event_type: 'CPU' }
      ],
      metrics: {
        process_metrics: [],
        average_turnaround_time: 0,
        average_waiting_time: 0,
        average_response_time: 0,
        cpu_utilization: 100,
        throughput: 1,
        io_utilization: 30,
        total_makespan: 12
      }
    };
    expect(res.gantt_chart[1].event_type).toBe('IO');
    expect(res.metrics.io_utilization).toBe(30);
  });

  it('5. Metrics can represent I/O metrics', () => {
    const res: SimulationResult = {
      gantt_chart: [],
      metrics: {
        process_metrics: [
          {
            process_id: 'P1',
            completion_time: 12,
            turnaround_time: 12,
            waiting_time: 0,
            response_time: 0,
            io_time: 3,
            blocked_time: 3
          }
        ],
        average_turnaround_time: 12,
        average_waiting_time: 0,
        average_response_time: 0,
        cpu_utilization: 75,
        throughput: 0.08,
        io_utilization: 25,
        total_makespan: 12
      }
    };
    expect(res.metrics.process_metrics[0].io_time).toBe(3);
  });

  it('6 & 8. History type can represent both old CPU-only and new CPU/I/O records', () => {
    const oldRecord: ExperimentDetails = {
      id: 1,
      name: 'Old CPU Only',
      algorithm: 'FCFS',
      created_at: '2026-10-06T00:00:00Z',
      processes: [{ id: 'P1', arrival_time: 0, burst_time: 5 }],
      simulation_result: {
        gantt_chart: [{ process_id: 'P1', start_time: 0, end_time: 5 }],
        metrics: {
          process_metrics: [{
            process_id: 'P1', completion_time: 5, turnaround_time: 5, waiting_time: 0, response_time: 0
          }],
          average_turnaround_time: 5, average_waiting_time: 0, average_response_time: 0,
          cpu_utilization: 100, throughput: 0.2
        }
      }
    };

    const newRecord: ExperimentDetails = {
      id: 2,
      name: 'New CPU/IO',
      algorithm: 'FCFS',
      created_at: '2026-10-07T00:00:00Z',
      processes: [{ id: 'P1', arrival_time: 0, burst_time: 12, burst_sequence: [5, 3, 4] }],
      simulation_result: {
        gantt_chart: [{ process_id: 'P1', start_time: 0, end_time: 5, event_type: 'CPU' }],
        metrics: {
          process_metrics: [{
            process_id: 'P1', completion_time: 12, turnaround_time: 12, waiting_time: 0, response_time: 0, io_time: 3, blocked_time: 3
          }],
          average_turnaround_time: 12, average_waiting_time: 0, average_response_time: 0,
          cpu_utilization: 75, throughput: 0.08, io_utilization: 25, total_makespan: 12
        }
      }
    };

    expect(oldRecord.processes[0].burst_sequence).toBeUndefined();
    expect(newRecord.processes[0].burst_sequence).toEqual([5, 3, 4]);
  });
});
