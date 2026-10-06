import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { MemorySimulator } from '../features/memory/MemorySimulator';
import { useMemoryStore } from '../store/useMemoryStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    simulateMemory: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useMemoryStore.setState({
    referenceSequence: '1, 2, 3',
    frameCount: 3,
    algorithm: 'FIFO',
    result: null,
    loading: false,
    error: null,
    currentStep: 0,
  });
});

test('Renders empty state properly', () => {
  render(<MemorySimulator />);
  expect(screen.getByText('Memory Management Simulator')).toBeDefined();
  expect(screen.getByText('Memory Configuration')).toBeDefined();
  expect(screen.queryByText('Metrics Summary')).toBeNull();
  expect(screen.queryByText('Page Replacement Visualization')).toBeNull();
});

test('Validation: Empty sequence', async () => {
  useMemoryStore.setState({ referenceSequence: '' });
  render(<MemorySimulator />);
  
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('memory-error').textContent).toContain('cannot be empty');
  });
});

test('Validation: Negative frames', async () => {
  useMemoryStore.setState({ frameCount: -1 });
  render(<MemorySimulator />);
  
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('memory-error').textContent).toContain('Frame count must be positive');
  });
});

test('Successful simulation sets result and renders metrics', async () => {
  const mockResult = {
    algorithm: 'FIFO',
    reference_sequence: [1, 2, 3],
    frame_count: 3,
    steps: [
      { reference: 1, is_hit: false, replaced_page: null, frames: [1] },
      { reference: 2, is_hit: false, replaced_page: null, frames: [1, 2] },
      { reference: 3, is_hit: false, replaced_page: null, frames: [1, 2, 3] },
    ],
    page_faults: 3,
    page_hits: 0,
    hit_ratio: 0,
    fault_ratio: 1,
    total_references: 3,
  };

  vi.mocked(api.simulateMemory).mockResolvedValueOnce({ data: mockResult } as any);

  render(<MemorySimulator />);
  
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  expect(screen.getByTestId('simulate-btn').textContent).toBe('Simulating...');
  
  await waitFor(() => {
    expect(screen.getByText('Metrics Summary')).toBeDefined();
    expect(screen.getByText('Page Replacement Visualization')).toBeDefined();
  });
  
  // Check metrics rendering
  expect(screen.getAllByText('3').length).toBeGreaterThan(0); // faults
  
  // Check visualization rendering
  const step0 = screen.getByTestId('mem-step-0');
  expect(step0.textContent).toContain('FAULT');
  expect(step0.textContent).toContain('1');
  
  // Step controls
  expect(screen.getByText('Step: 3 / 3')).toBeDefined();
});

test('Algorithm selections update state', () => {
  render(<MemorySimulator />);
  const select = screen.getByTestId('algo-select');
  
  fireEvent.change(select, { target: { value: 'LRU' } });
  expect(useMemoryStore.getState().algorithm).toBe('LRU');
  
  fireEvent.change(select, { target: { value: 'OPTIMAL' } });
  expect(useMemoryStore.getState().algorithm).toBe('OPTIMAL');
});

test('API error sets error state', async () => {
  vi.mocked(api.simulateMemory).mockRejectedValueOnce({
    response: { data: { detail: 'Backend failed' } }
  });

  render(<MemorySimulator />);
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('memory-error').textContent).toBe('Backend failed');
  });
});
