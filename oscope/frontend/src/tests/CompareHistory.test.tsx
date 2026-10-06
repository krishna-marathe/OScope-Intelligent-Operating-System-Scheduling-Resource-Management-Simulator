import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { Compare } from '../pages/Compare';
import { History } from '../pages/History';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    compare: vi.fn(),
    listHistory: vi.fn(),
    getHistory: vi.fn(),
    deleteHistory: vi.fn(),
  }
}));

beforeEach(() => {
  useSimulatorStore.setState({
    processes: [],
    timeQuantum: 2,
    contextSwitchCost: 0,
    mlqConfig: null,
    mlfqConfig: null,
  });
  vi.clearAllMocks();
});

test('Compare UI prevents MLQ/MLFQ for CPU/IO workloads', async () => {
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 5, burst_sequence: [2, 1, 2] }
    ]
  });

  render(<Compare />);
  
  fireEvent.click(screen.getByLabelText('FCFS'));
  fireEvent.click(screen.getByLabelText('MLQ'));
  
  fireEvent.click(screen.getByText('Compare'));
  
  await waitFor(() => {
    expect(screen.getByText('CPU/I/O burst workloads are not supported for MLQ or MLFQ.')).toBeInTheDocument();
  });
  expect(api.compare).not.toHaveBeenCalled();
});

test('Compare UI renders I/O metrics if present', async () => {
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 5, burst_sequence: [2, 1, 2] }
    ]
  });

  (api.compare as any).mockResolvedValueOnce({
    data: {
      'FCFS': {
        gantt_chart: [],
        metrics: {
          average_waiting_time: 0,
          average_turnaround_time: 5,
          average_response_time: 0,
          cpu_utilization: 80,
          throughput: 0.2,
          io_utilization: 20,
          total_makespan: 5,
          process_metrics: []
        }
      }
    }
  });

  render(<Compare />);
  
  fireEvent.click(screen.getByLabelText('FCFS'));
  fireEvent.click(screen.getByLabelText('SJF')); // select 2
  
  fireEvent.click(screen.getByText('Compare'));
  
  await waitFor(() => {
    expect(screen.getByText('I/O Util (%)')).toBeInTheDocument();
  });
});

test('History UI identifies CPU/IO workloads and renders I/O metrics', async () => {
  (api.listHistory as any).mockResolvedValueOnce({
    data: [
      {
        id: 1,
        name: 'Exp 1',
        algorithm: 'FCFS',
        created_at: '2026-10-07T00:00:00.000Z',
        processes: [{ id: 'P1', burst_sequence: [2, 1, 2] }]
      }
    ]
  });

  (api.getHistory as any).mockResolvedValueOnce({
    data: {
      id: 1,
      name: 'Exp 1',
      algorithm: 'FCFS',
      created_at: '2026-10-07T00:00:00.000Z',
      processes: [{ id: 'P1', burst_sequence: [2, 1, 2] }],
      simulation_result: {
        gantt_chart: [{ process_id: 'P1', start_time: 0, end_time: 2, event_type: 'CPU' }],
        metrics: {
          average_waiting_time: 0,
          average_turnaround_time: 5,
          cpu_utilization: 80,
          io_utilization: 20,
          total_makespan: 5,
        }
      }
    }
  });

  render(<History />);
  
  await waitFor(() => {
    expect(screen.getByText(/CPU\/IO Workload/)).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText('Open'));
  
  await waitFor(() => {
    expect(screen.getByText('I/O Util: 20.0%')).toBeInTheDocument();
    expect(screen.getByText('Total Makespan: 5.0')).toBeInTheDocument();
  });
});

test('History UI falls back correctly for legacy records', async () => {
  (api.listHistory as any).mockResolvedValueOnce({
    data: [
      {
        id: 2,
        name: 'Exp 2',
        algorithm: 'RR',
        created_at: '2026-10-07T00:00:00.000Z',
        processes: [{ id: 'P2', burst_time: 5 }] // No burst_sequence
      }
    ]
  });

  (api.getHistory as any).mockResolvedValueOnce({
    data: {
      id: 2,
      name: 'Exp 2',
      algorithm: 'RR',
      processes: [{ id: 'P2', burst_time: 5 }],
      simulation_result: {
        gantt_chart: [{ process_id: 'P2', start_time: 0, end_time: 5 }], // No event_type
        metrics: {
          average_waiting_time: 0,
          average_turnaround_time: 5,
          cpu_utilization: 100,
        } // No io metrics
      }
    }
  });

  render(<History />);
  
  await waitFor(() => {
    expect(screen.getByText('Exp 2')).toBeInTheDocument();
    expect(screen.queryByText(/CPU\/IO Workload/)).not.toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText('Open'));
  
  await waitFor(() => {
    expect(screen.getByText('Avg Wait: 0.00')).toBeInTheDocument();
    expect(screen.queryByText('I/O Util:')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Makespan:')).not.toBeInTheDocument();
  });
});
