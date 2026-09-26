import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { RecommendPanel } from '../features/simulator/RecommendPanel';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    recommend: vi.fn()
  }
}));

beforeEach(() => {
  useSimulatorStore.setState({
    processes: [
      { id: 'P1', arrival_time: 0, burst_time: 2 }
    ],
    algorithm: 'FCFS'
  });
});

test('Requests recommendation and applies it', async () => {
  (api.recommend as any).mockResolvedValueOnce({
    data: {
      algorithm: 'SRTF',
      confidence: 0.85,
      explanation: 'Prediction based on burst variance.',
      objective: 'awt'
    }
  });

  render(<RecommendPanel />);
  
  fireEvent.click(screen.getByText('Get Recommendation'));
  
  await waitFor(() => {
    expect(screen.getByText('Predicted: SRTF')).toBeInTheDocument();
  });
  
  // Apply
  fireEvent.click(screen.getByText('Apply to Simulator'));
  expect(useSimulatorStore.getState().algorithm).toBe('SRTF');
});
