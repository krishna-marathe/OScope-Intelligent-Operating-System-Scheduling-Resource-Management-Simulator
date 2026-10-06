import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../app/App';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    simulate: vi.fn(),
    listHistory: vi.fn().mockResolvedValue({ data: [] })
  }
}));

test('renders dashboard initially', () => {
  render(<App />);
  expect(screen.getAllByText('Command Center')[0]).toBeInTheDocument();
});

test('can navigate to simulator and add process', () => {
  render(<App />);
  fireEvent.click(screen.getAllByText('CPU & I/O')[0]);
  expect(screen.getByText('WORKLOAD DEFINITION')).toBeInTheDocument();
  
  fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P1' } });
  fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '5' } });
  fireEvent.click(screen.getByTestId('add-btn'));
  
  expect(screen.getByTestId('row-P1')).toBeInTheDocument();
});

test('can select RR and see time quantum', () => {
  render(<App />);
  fireEvent.click(screen.getAllByText('CPU & I/O')[0]);
  
  expect(screen.queryByTestId('tq-input')).not.toBeInTheDocument();
  
  fireEvent.change(screen.getByTestId('algo-select'), { target: { value: 'RR' } });
  expect(screen.getByTestId('tq-input')).toBeInTheDocument();
});

test('simulates and renders result', async () => {
  const mockResult = {
    data: {
      gantt_chart: [{ process_id: 'P1', start_time: 0, end_time: 5 }],
      metrics: {
        average_waiting_time: 0,
        average_turnaround_time: 5,
        average_response_time: 0,
        cpu_utilization: 100,
        throughput: 0.2,
        process_metrics: []
      }
    }
  };
  
  (api.simulate as any).mockResolvedValueOnce(mockResult);
  
  render(<App />);
  fireEvent.click(screen.getAllByText('CPU & I/O')[0]);
  
  fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P1' } });
  fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '5' } });
  fireEvent.click(screen.getByTestId('add-btn'));
  
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('metric-awt')).toHaveTextContent('0.00');
    expect(screen.getByTestId('gantt-chart-interactive')).toBeInTheDocument();
  });
});
