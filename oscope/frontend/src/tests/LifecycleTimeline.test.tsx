import { render, screen } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { LifecycleTimeline } from '../features/simulator/LifecycleTimeline';
import { useSimulatorStore } from '../store/useSimulatorStore';

beforeEach(() => {
  useSimulatorStore.setState({ result: null, currentTime: 0 });
});

test('Returns null on missing lifecycles', () => {
  useSimulatorStore.setState({ result: { gantt_chart: [], metrics: {} as any } });
  const { container } = render(<LifecycleTimeline />);
  expect(container.firstChild).toBeNull();
});

test('Returns null on empty lifecycles array', () => {
  useSimulatorStore.setState({ result: { gantt_chart: [], metrics: {} as any, lifecycles: [] } });
  const { container } = render(<LifecycleTimeline />);
  expect(container.firstChild).toBeNull();
});

test('Renders lifecycle timeline properly for CPU-only workload', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [],
      metrics: {} as any,
      lifecycles: [
        { process_id: 'P1', state: 'NEW', start_time: 0, end_time: 0, duration: 0, transition_reason: 'Arrived' },
        { process_id: 'P1', state: 'READY', start_time: 0, end_time: 2, duration: 2, transition_reason: 'Wait' },
        { process_id: 'P1', state: 'RUNNING', start_time: 2, end_time: 6, duration: 4, transition_reason: 'Exec' },
        { process_id: 'P1', state: 'TERMINATED', start_time: 6, end_time: 6, duration: 0, transition_reason: 'Done' }
      ]
    },
    currentTime: 0
  });

  render(<LifecycleTimeline />);
  
  expect(screen.getByText('Process P1')).toBeDefined();
  expect(screen.getByText('NEW')).toBeDefined();
  expect(screen.getByText('READY')).toBeDefined();
  expect(screen.getByText('RUNNING')).toBeDefined();
  expect(screen.getByText('TERMINATED')).toBeDefined();
  expect(screen.getByText('Arrived')).toBeDefined();
  expect(screen.getByText('Exec')).toBeDefined();
});

test('Groups multiple processes correctly', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [],
      metrics: {} as any,
      lifecycles: [
        { process_id: 'P1', state: 'RUNNING', start_time: 0, end_time: 5, duration: 5, transition_reason: '' },
        { process_id: 'P2', state: 'READY', start_time: 0, end_time: 5, duration: 5, transition_reason: '' }
      ]
    },
    currentTime: 0
  });

  render(<LifecycleTimeline />);
  expect(screen.getByText('Process P1')).toBeDefined();
  expect(screen.getByText('Process P2')).toBeDefined();
});

test('Highlights active state based on currentTime correctly', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [],
      metrics: {} as any,
      lifecycles: [
        { process_id: 'P1', state: 'RUNNING', start_time: 0, end_time: 5, duration: 5, transition_reason: '' }
      ]
    },
    currentTime: 2
  });

  render(<LifecycleTimeline />);
  // Check opacity-100 logic roughly or just ensure it renders without crashing
  expect(screen.getByTestId('lifecycle-P1-RUNNING-0').className).toContain('bg-blue-50');
});

test('CPU/IO lifecycle shows BLOCKED and maintains chronological rendering', () => {
  useSimulatorStore.setState({
    result: {
      gantt_chart: [],
      metrics: {} as any,
      lifecycles: [
        { process_id: 'P1', state: 'RUNNING', start_time: 0, end_time: 2, duration: 2, transition_reason: '' },
        { process_id: 'P1', state: 'BLOCKED', start_time: 2, end_time: 5, duration: 3, transition_reason: 'IO' },
        { process_id: 'P1', state: 'READY', start_time: 5, end_time: 6, duration: 1, transition_reason: '' },
        { process_id: 'P1', state: 'RUNNING', start_time: 6, end_time: 9, duration: 3, transition_reason: '' }
      ]
    },
    currentTime: 3
  });

  render(<LifecycleTimeline />);
  
  expect(screen.getByText('BLOCKED')).toBeDefined();
  // Time 3 means BLOCKED should be highlighted
  expect(screen.getByTestId('lifecycle-P1-BLOCKED-1').className).toContain('bg-blue-50');
});
