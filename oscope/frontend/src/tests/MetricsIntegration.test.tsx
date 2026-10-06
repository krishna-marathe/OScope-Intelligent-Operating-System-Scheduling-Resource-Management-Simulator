import { render, screen, act } from '@testing-library/react';
import { expect, test, beforeEach } from 'vitest';
import { SimulationMetricsPanel } from '../features/simulator/SimulationMetricsPanel';
import { ProcessStatusPanel } from '../features/simulator/ProcessStatusPanel';
import { useSimulatorStore } from '../store/useSimulatorStore';

beforeEach(() => {
  useSimulatorStore.setState({
    processes: [],
    result: null,
    currentTime: 0
  });
});

test('CPU-only metrics regression and backward compatibility', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 2 }
      ],
      metrics: {
        average_waiting_time: 1.5,
        average_turnaround_time: 3.5,
        average_response_time: 1.0,
        cpu_utilization: 80,
        throughput: 0.4,
        process_metrics: [
          { process_id: 'P1', completion_time: 2, turnaround_time: 2, waiting_time: 0, response_time: 0 }
        ]
      }
    }
  });

  render(<SimulationMetricsPanel />);
  
  expect(screen.getByTestId('metric-awt')).toHaveTextContent('1.50');
  expect(screen.getByTestId('metric-atat')).toHaveTextContent('3.50');
  expect(screen.getByTestId('metric-art')).toHaveTextContent('1.00');
  expect(screen.getByTestId('metric-util')).toHaveTextContent('80.0');
  expect(screen.getByTestId('metric-throughput')).toHaveTextContent('0.400');
  
  expect(screen.queryByTestId('metric-io-util')).not.toBeInTheDocument();
  expect(screen.queryByTestId('metric-makespan')).not.toBeInTheDocument();
});

test('CPU/IO metrics display correctly', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [],
      metrics: {
        average_waiting_time: 2.0,
        average_turnaround_time: 4.0,
        average_response_time: 1.0,
        cpu_utilization: 90.5,
        throughput: 0.5,
        io_utilization: 45.2,
        total_makespan: 10.0,
        process_metrics: []
      }
    }
  });

  render(<SimulationMetricsPanel />);
  
  expect(screen.getByTestId('metric-io-util')).toHaveTextContent('45.2');
  expect(screen.getByTestId('metric-makespan')).toHaveTextContent('10.0');
});

test('ProcessStatusPanel distinguishes Blocked vs Running and shows metrics', () => {
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 5 } // burst_time is 2 CPU + 3 IO
    ],
    result: {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 2, event_type: 'CPU' },
        { process_id: 'P1', start_time: 2, end_time: 5, event_type: 'IO' }
      ],
      metrics: {
        average_waiting_time: 0,
        average_turnaround_time: 5,
        average_response_time: 0,
        cpu_utilization: 40,
        throughput: 0.2,
        process_metrics: [
          { 
            process_id: 'P1', 
            completion_time: 5, 
            turnaround_time: 5, 
            waiting_time: 0, 
            response_time: 0,
            io_time: 3,
            blocked_time: 3
          }
        ]
      }
    },
    currentTime: 1
  });

  const { rerender } = render(<ProcessStatusPanel />);
  
  // At time 1, P1 is Running on CPU
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Running');
  
  // Metrics displayed
  expect(screen.getByTestId('metric-wait-P1')).toHaveTextContent('0');
  expect(screen.getByTestId('metric-blocked-P1')).toHaveTextContent('3');
  expect(screen.getByTestId('metric-comp-P1')).toHaveTextContent('5');
  
  // Advance to time 3, P1 should be Blocked (I/O)
  act(() => {
    useSimulatorStore.setState({ currentTime: 3 });
  });
  
  rerender(<ProcessStatusPanel />);
  
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Blocked (I/O)');
  
  // Advance to time 5, P1 should be Completed
  act(() => {
    useSimulatorStore.setState({ currentTime: 5 });
  });
  
  rerender(<ProcessStatusPanel />);
  
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Completed');
});
