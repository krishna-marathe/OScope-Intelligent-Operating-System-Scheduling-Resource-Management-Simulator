import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi, beforeEach } from 'vitest';
import { DiskSimulator } from '../features/disk/DiskSimulator';
import { useDiskStore } from '../store/useDiskStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    simulateDisk: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useDiskStore.setState({
    requestQueue: '1, 2, 3',
    initialHeadPosition: 0,
    diskSize: 100,
    algorithm: 'FCFS',
    direction: 'RIGHT',
    result: null,
    loading: false,
    error: null,
    currentStep: 0,
  });
});

test('Renders empty state properly', () => {
  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  expect(screen.getByText('Disk Scheduling Laboratory')).toBeDefined();
  expect(screen.getByText('DISK CONFIGURATION')).toBeDefined();
  expect(screen.queryByText('Metrics Summary')).toBeNull();
  expect(screen.queryByText('Disk Head Scheduling Map')).toBeNull();
});

test('Validation: Empty sequence', async () => {
  useDiskStore.setState({ requestQueue: '' });
  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  
  fireEvent.click(screen.getByTestId('disk-simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('disk-error').textContent).toContain('cannot be empty');
  });
});

test('Validation: Negative frames', async () => {
  useDiskStore.setState({ requestQueue: '-1, 2' });
  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  
  fireEvent.click(screen.getByTestId('disk-simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('disk-error').textContent).toContain('non-negative');
  });
});

test('Successful simulation sets result and renders metrics', async () => {
  const mockResult = {
    algorithm: 'FCFS',
    initial_head_position: 0,
    request_queue: [1, 2, 3],
    service_order: [1, 2, 3],
    movement_steps: [
      { start_cylinder: 0, end_cylinder: 1, movement: 1 },
      { start_cylinder: 1, end_cylinder: 2, movement: 1 },
      { start_cylinder: 2, end_cylinder: 3, movement: 1 },
    ],
    total_head_movement: 3,
    average_head_movement: 1
  };

  vi.mocked(api.simulateDisk).mockResolvedValueOnce({ data: mockResult } as any);

  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  
  fireEvent.click(screen.getByTestId('disk-simulate-btn'));
  
  expect(screen.getByTestId('disk-simulate-btn').textContent).toBe('Simulating...');
  
  await waitFor(() => {
    expect(screen.getByText('Metrics Summary')).toBeDefined();
    expect(screen.getByText('Disk Head Scheduling Map')).toBeDefined();
  });
  
  // Check metrics rendering
  expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  
  // Check visualization rendering
  const svg = screen.getByText('Disk Head Scheduling Map');
  expect(svg).toBeDefined();
  
  // Step controls
  expect(screen.getByText('Step: 3 / 3')).toBeDefined();
});

test('Algorithm selections update state', () => {
  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  const select = screen.getByTestId('disk-algo-select');
  
  fireEvent.change(select, { target: { value: 'SSTF' } });
  expect(useDiskStore.getState().algorithm).toBe('SSTF');
  
  fireEvent.change(select, { target: { value: 'SCAN' } });
  expect(useDiskStore.getState().algorithm).toBe('SCAN');
  
  const dirSelect = screen.getByTestId('disk-dir-select');
  fireEvent.change(dirSelect, { target: { value: 'LEFT' } });
  expect(useDiskStore.getState().direction).toBe('LEFT');
});

test('API error sets error state', async () => {
  vi.mocked(api.simulateDisk).mockRejectedValueOnce({
    response: { data: { detail: 'Backend failed' } }
  });

  render(<MemoryRouter><DiskSimulator /></MemoryRouter>);
  fireEvent.click(screen.getByTestId('disk-simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('disk-error').textContent).toBe('Backend failed');
  });
});
