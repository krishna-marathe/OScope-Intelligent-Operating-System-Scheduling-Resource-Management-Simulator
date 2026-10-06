import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { AlgorithmSelector } from '../features/simulator/AlgorithmSelector';
import { Compare } from '../pages/Compare';
import { GanttChart } from '../features/simulator/GanttChart';
import { ResultsView } from '../features/simulator/ResultsView';
import { useSimulatorStore } from '../store/useSimulatorStore';

beforeEach(() => {
  useSimulatorStore.setState({
    algorithm: 'FCFS',
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 2 },
      { id: 'P2', arrival_time: 1, burst_time: 2 }
    ],
    timeQuantum: 2,
    contextSwitchCost: 0,
    mlqConfig: undefined,
    mlfqConfig: undefined,
    result: null
  });
});

test('MLQ and MLFQ selection and configuration panels', () => {
  render(<AlgorithmSelector />);
  
  fireEvent.change(screen.getByTestId('algo-select'), { target: { value: 'MLQ' } });
  expect(screen.getByText('MLQ Configuration')).toBeInTheDocument();
  expect(screen.getByTestId('cs-cost-input')).toBeInTheDocument();

  fireEvent.change(screen.getByTestId('algo-select'), { target: { value: 'MLFQ' } });
  expect(screen.getByText('MLFQ Configuration')).toBeInTheDocument();
});

test('Rendering process, IDLE, and CS Gantt events distinctly with queue labels', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 2, queue_id: 1 },
        { process_id: 'CS', start_time: 2, end_time: 3 },
        { process_id: 'IDLE', start_time: 3, end_time: 4 },
        { process_id: 'P2', start_time: 4, end_time: 6, queue_id: 2 }
      ],
      metrics: {
        average_waiting_time: 0, average_turnaround_time: 0, average_response_time: 0,
        cpu_utilization: 0, throughput: 0, process_metrics: []
      }
    }
  });

  render(<GanttChart />);
  expect(screen.getByText('P1 (Q1)')).toBeInTheDocument();
  expect(screen.getByText('CS')).toBeInTheDocument();
  expect(screen.getByText('IDLE')).toBeInTheDocument();
  expect(screen.getByText('P2 (Q2)')).toBeInTheDocument();
});

test('Playback through CS intervals', () => {
  vi.useFakeTimers();
  useSimulatorStore.setState({
    result: {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 2 },
        { process_id: 'CS', start_time: 2, end_time: 3 },
        { process_id: 'P2', start_time: 3, end_time: 5 }
      ],
      metrics: {
        average_waiting_time: 0, average_turnaround_time: 0, average_response_time: 0,
        cpu_utilization: 0, throughput: 0, process_metrics: []
      }
    },
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1
  });

  render(<ResultsView />);
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0 / 5');

  fireEvent.click(screen.getByTestId('btn-step-forward'));
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 3 / 5'); // Moved through P1 and CS to start of P2

  vi.useRealTimers();
});

test('Compare validation of missing MLQ process assignments', () => {
  useSimulatorStore.setState({
    algorithm: 'MLQ',
    mlqConfig: {
      queues: [{ id: 1, priority: 1, policy: 'FCFS' }],
      process_assignments: {},
      inter_queue_policy: 'FIXED_PRIORITY'
    }
  });

  render(<Compare />);
  
  fireEvent.click(screen.getByLabelText('MLQ'));
  fireEvent.click(screen.getByLabelText('FCFS')); // select a second one
  
  fireEvent.click(screen.getByText('Compare'));
  
  expect(screen.getByText(/MLQ configuration missing queue assignments for processes: P1, P2/i)).toBeInTheDocument();
});
