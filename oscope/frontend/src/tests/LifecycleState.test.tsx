import { expect, test, vi, beforeEach } from 'vitest';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';
import { SimulationResult } from '../types';

vi.mock('../services/api', () => ({
  api: {
    simulate: vi.fn(),
    compare: vi.fn(),
    getHistory: vi.fn()
  }
}));

beforeEach(() => {
  useSimulatorStore.setState({ result: null });
  vi.clearAllMocks();
});

test('Zustand store preserves SimulationResult with lifecycles', () => {
  const mockResult: SimulationResult = {
    gantt_chart: [],
    metrics: {} as any,
    lifecycles: [
      { process_id: 'P1', state: 'NEW', start_time: 0, end_time: 0, duration: 0, transition_reason: '' },
      { process_id: 'P1', state: 'READY', start_time: 0, end_time: 2, duration: 2, transition_reason: '' },
      { process_id: 'P1', state: 'RUNNING', start_time: 2, end_time: 5, duration: 3, transition_reason: '' },
      { process_id: 'P1', state: 'BLOCKED', start_time: 5, end_time: 8, duration: 3, transition_reason: '' }
    ]
  };

  useSimulatorStore.getState().setResult(mockResult);
  
  const savedResult = useSimulatorStore.getState().result;
  expect(savedResult).not.toBeNull();
  expect(savedResult?.lifecycles).toBeDefined();
  expect(savedResult?.lifecycles?.length).toBe(4);
  expect(savedResult?.lifecycles?.[3].state).toBe('BLOCKED');
});

test('Zustand store safely handles SimulationResult without lifecycles (Legacy/CPU-only old saves)', () => {
  const legacyResult: SimulationResult = {
    gantt_chart: [],
    metrics: {} as any
    // Notice missing 'lifecycles'
  };

  useSimulatorStore.getState().setResult(legacyResult);
  
  const savedResult = useSimulatorStore.getState().result;
  expect(savedResult).not.toBeNull();
  expect(savedResult?.lifecycles).toBeUndefined();
});

test('API mock returns lifecycle data and state consumes it without modification', async () => {
  const mockApiResponse = {
    data: {
      gantt_chart: [],
      metrics: {} as any,
      lifecycles: [{ process_id: 'P2', state: 'TERMINATED', start_time: 10, end_time: 10, duration: 0, transition_reason: 'Done' }]
    }
  };

  (api.simulate as any).mockResolvedValueOnce(mockApiResponse);
  
  // Fake the simulator submit action roughly
  const res = await api.simulate({ algorithm: 'FCFS', processes: [] });
  useSimulatorStore.getState().setResult(res.data);
  
  const stateResult = useSimulatorStore.getState().result;
  expect(stateResult?.lifecycles).toHaveLength(1);
  expect(stateResult?.lifecycles?.[0].process_id).toBe('P2');
});
