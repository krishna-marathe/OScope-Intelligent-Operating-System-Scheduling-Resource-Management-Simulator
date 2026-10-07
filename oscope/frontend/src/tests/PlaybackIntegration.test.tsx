import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { PlaybackControls } from '../features/simulator/PlaybackControls';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { GanttChart } from '../features/simulator/GanttChart';

beforeEach(() => {
  vi.useFakeTimers();
  useSimulatorStore.setState({
    result: null,
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1
  });
});

afterEach(() => {
  vi.useRealTimers();
});

test('Playback Play/Pause maxTime logic works with overlapping IO/CPU events', () => {
  useSimulatorStore.setState({
    result: {
      metrics: {} as any,
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 5, event_type: 'CPU' },
        { process_id: 'P2', start_time: 2, end_time: 8, event_type: 'IO' }, // P2 finishes later
        { process_id: 'P3', start_time: 5, end_time: 7, event_type: 'CPU' } // P3 finishes earlier but is last in array
      ]
    },
    currentTime: 0
  });

  render(<PlaybackControls />);
  
  // maxTime should be 8, not 7!
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0.0 / 8.0');
});

test('Playback steps correctly over complex CPU/IO boundaries', () => {
  useSimulatorStore.setState({
    result: {
      metrics: {} as any,
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 4, event_type: 'CPU' },
        { process_id: 'P2', start_time: 1, end_time: 5, event_type: 'IO' }
      ]
    },
    currentTime: 0
  });

  render(<PlaybackControls />);
  
  // Boundaries are: 0, 1, 4, 5
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 1.0 / 5.0');
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 4.0 / 5.0');
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 5.0 / 5.0');

  fireEvent.click(screen.getByTestId('btn-step-back'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 4.0 / 5.0');
});

test('GanttChart width updates dynamically for overlapping CPU/IO events', () => {
  useSimulatorStore.setState({
    result: {
      metrics: {} as any,
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 10, event_type: 'CPU' },
        { process_id: 'P2', start_time: 2, end_time: 8, event_type: 'IO' }
      ]
    },
    currentTime: 0
  });

  render(<GanttChart />);
  
  // At time 0, widths of the colored inner fill div should be 0%
  const cpuFill = screen.getByTestId('gantt-event-CPU-P1').firstChild as HTMLElement;
  const ioFill = screen.getByTestId('gantt-event-IO-P2').firstChild as HTMLElement;
  
  expect(cpuFill).toHaveAttribute('style', 'width: 0%;');
  // P2 IO event hasn't started yet, so visibleDuration is Math.max(0, 0 - 2) = 0
  expect(ioFill).toHaveAttribute('style', 'width: 0%;');

  act(() => {
    useSimulatorStore.setState({ currentTime: 5 });
  });

  // At time 5:
  // CPU P1: starts at 0, ends at 10. duration=10. visibleDuration=5. width=50%
  expect(cpuFill).toHaveAttribute('style', 'width: 50%;');
  // IO P2: starts at 2, ends at 8. duration=6. visibleDuration=3. width=50%
  expect(ioFill).toHaveAttribute('style', 'width: 50%;');
});
