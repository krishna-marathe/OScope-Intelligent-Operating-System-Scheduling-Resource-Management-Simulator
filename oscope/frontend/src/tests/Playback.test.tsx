import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { ResultsView } from '../features/simulator/ResultsView';
import { PlaybackControls } from '../features/simulator/PlaybackControls';
import { useSimulatorStore } from '../store/useSimulatorStore';

beforeEach(() => {
  vi.useFakeTimers();
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 2 },
      { id: 'P2', arrival_time: 1, burst_time: 2 }
    ],
    result: {
      gantt_chart: [
        { process_id: 'P1', start_time: 0, end_time: 2 },
        { process_id: 'IDLE', start_time: 2, end_time: 3 },
        { process_id: 'P2', start_time: 3, end_time: 5 }
      ],
      metrics: {
        average_waiting_time: 1.5,
        average_turnaround_time: 3.5,
        average_response_time: 1.0,
        cpu_utilization: 80,
        throughput: 0.4,
        process_metrics: []
      }
    },
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1
  });
});

afterEach(() => {
  vi.useRealTimers();
});

test('Playback Play/Pause toggles state and advances time', () => {
  render(
    <>
      <PlaybackControls />
      <ResultsView />
    </>
  );
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0.0 / 5.0');
  
  // Click Play
  fireEvent.click(screen.getByTestId('btn-play-pause'));
  
  act(() => {
    vi.advanceTimersByTime(2000); // 2 seconds = 2 time units at 1x speed
  });
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2.0 / 5.0');
  
  // Pause
  fireEvent.click(screen.getByTestId('btn-play-pause'));
  
  act(() => {
    vi.advanceTimersByTime(2000); // Time shouldn't advance
  });
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2.0 / 5.0');
});

test('Reset returns time to 0', () => {
  render(
    <>
      <PlaybackControls />
      <ResultsView />
    </>
  );
  useSimulatorStore.setState({ currentTime: 3 });
  
  fireEvent.click(screen.getByTestId('btn-reset'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0.0 / 5.0');
});

test('Step forward and backward moves to event boundaries', () => {
  render(
    <>
      <PlaybackControls />
      <ResultsView />
    </>
  );
  // Boundaries are 0, 2, 3, 5
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2.0 / 5.0');
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 3.0 / 5.0');
  
  fireEvent.click(screen.getByTestId('btn-step-back'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2.0 / 5.0');
});

test('Process status updates correctly based on time', () => {
  render(<ResultsView />);
  
  // At time 0
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Running');
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('2'); // Remaining 2
  
  // Advance to time 1
  act(() => {
    useSimulatorStore.setState({ currentTime: 1 });
  });
  
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Running');
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('1'); // Remaining 1
  expect(screen.getByTestId('status-row-P2')).toHaveTextContent('Ready'); // Arrived at time 1
  
  // Advance to time 2
  act(() => {
    useSimulatorStore.setState({ currentTime: 2 });
  });
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Completed');
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('0'); // Remaining 0
  
  // Advance to time 4
  act(() => {
    useSimulatorStore.setState({ currentTime: 4 });
  });
  expect(screen.getByTestId('status-row-P2')).toHaveTextContent('Running');
  expect(screen.getByTestId('status-row-P2')).toHaveTextContent('1');
});
