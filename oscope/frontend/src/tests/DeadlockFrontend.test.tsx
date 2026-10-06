import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { DeadlockSimulator } from '../features/deadlock/DeadlockSimulator';
import { useDeadlockStore } from '../store/useDeadlockStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    simulateDeadlock: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useDeadlockStore.setState({
    processCount: 3,
    resourceCount: 2,
    available: [1, 1],
    allocation: [[0,0], [0,0], [0,0]],
    maximum: [[1,1], [1,1], [1,1]],
    resourceRequest: null,
    result: null,
    loading: false,
    error: null,
    currentStep: 0,
  });
});

test('Renders empty state properly', () => {
  render(<MemoryRouter><DeadlockSimulator /></MemoryRouter>);
  expect(screen.getByText('Deadlock & Resource Laboratory')).toBeDefined();
  expect(screen.getByText('DEADLOCK CONFIGURATION')).toBeDefined();
  expect(screen.queryByText('Metrics Summary')).toBeNull();
  expect(screen.queryByText("Banker's Safety Execution")).toBeNull();
});

test('Process count change updates matrices', () => {
  render(<MemoryRouter><DeadlockSimulator /></MemoryRouter>);
  
  const input = screen.getByTestId('process-count');
  fireEvent.change(input, { target: { value: '4' } });
  
  expect(useDeadlockStore.getState().processCount).toBe(4);
  expect(useDeadlockStore.getState().allocation.length).toBe(4);
});

test('Successful simulation sets result and renders visualization', async () => {
  const mockResult = {
    is_safe: true,
    safe_sequence: [0, 1, 2],
    available_after_simulation: [3, 3],
    need_matrix: [[1, 1], [1, 1], [1, 1]],
    process_states: [
      { process_id: 0, allocation: [0, 0], maximum: [1, 1], need: [1, 1], finished: true },
      { process_id: 1, allocation: [0, 0], maximum: [1, 1], need: [1, 1], finished: true },
      { process_id: 2, allocation: [0, 0], maximum: [1, 1], need: [1, 1], finished: true }
    ],
    safety_steps: [
      { step_number: 1, process_id: 0, work_before: [1, 1], need: [1, 1], can_execute: true, work_after: [1, 1], finish_status: [true, false, false] },
      { step_number: 2, process_id: 1, work_before: [1, 1], need: [1, 1], can_execute: true, work_after: [1, 1], finish_status: [true, true, false] },
      { step_number: 3, process_id: 2, work_before: [1, 1], need: [1, 1], can_execute: true, work_after: [1, 1], finish_status: [true, true, true] }
    ],
  };

  vi.mocked(api.simulateDeadlock).mockResolvedValueOnce({ data: mockResult } as any);

  render(<MemoryRouter><DeadlockSimulator /></MemoryRouter>);
  
  fireEvent.click(screen.getByTestId('deadlock-simulate-btn'));
  
  expect(screen.getByTestId('deadlock-simulate-btn').textContent).toBe('Simulating...');
  
  await waitFor(() => {
    expect(screen.getByText('Metrics Summary')).toBeDefined();
    expect(screen.getByText("Banker's Safety Execution")).toBeDefined();
    expect(screen.getByText('SYSTEM IS SAFE')).toBeDefined();
  });
  
  // Step controls
  expect(screen.getByText('Step: 3 / 3')).toBeDefined();
});

test('Resource Request enabled shows inputs and approves', async () => {
  const mockResult = {
    is_safe: true,
    safe_sequence: [0, 1, 2],
    available_after_simulation: [3, 3],
    need_matrix: [],
    process_states: [],
    safety_steps: [],
    request_approved: true,
    request_reason: "Request granted. System remains in a SAFE state."
  };

  vi.mocked(api.simulateDeadlock).mockResolvedValueOnce({ data: mockResult } as any);

  render(<MemoryRouter><DeadlockSimulator /></MemoryRouter>);
  
  const toggle = screen.getByTestId('req-toggle');
  fireEvent.click(toggle);
  
  expect(screen.getByTestId('req-process')).toBeDefined();
  
  fireEvent.click(screen.getByTestId('deadlock-simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByText(/APPROVED/)).toBeDefined();
  });
});

test('API error sets error state', async () => {
  vi.mocked(api.simulateDeadlock).mockRejectedValueOnce({
    response: { data: { detail: 'Backend failed' } }
  });

  render(<MemoryRouter><DeadlockSimulator /></MemoryRouter>);
  fireEvent.click(screen.getByTestId('deadlock-simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('deadlock-error').textContent).toBe('Backend failed');
  });
});
