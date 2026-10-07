import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkloadEditor } from '../features/simulator/WorkloadEditor';
import { useSimulatorStore } from '../store/useSimulatorStore';

describe('Phase 8B.2 Workload Editor CPU/IO Burst Sequence', () => {
  beforeEach(() => {
    useSimulatorStore.setState({ processes: [] });
  });

  it('1. Existing CPU-only process creation still works', () => {
    render(<WorkloadEditor />);
    fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P1' } });
    fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('add-btn'));

    const state = useSimulatorStore.getState();
    expect(state.processes.length).toBe(1);
    expect(state.processes[0].id).toBe('P1');
    expect(state.processes[0].burst_time).toBe(5);
    expect(state.processes[0].burst_sequence).toBeUndefined();
  });

  it('2, 3, 4, 5. User can add and edit IO/CPU bursts and remove them', () => {
    render(<WorkloadEditor />);
    
    // Toggle advanced mode
    fireEvent.click(screen.getByTestId('toggle-advanced'));

    fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P2' } });

    // Initial CPU burst is present (index 0). Set to 5.
    fireEvent.change(screen.getByTestId('input-burst-0'), { target: { value: '5' } });

    // Add IO burst
    fireEvent.click(screen.getByTestId('add-burst-btn'));
    fireEvent.change(screen.getByTestId('input-burst-1'), { target: { value: '3' } });

    // Add CPU burst
    fireEvent.click(screen.getByTestId('add-burst-btn'));
    fireEvent.change(screen.getByTestId('input-burst-2'), { target: { value: '4' } });

    // Add one more IO burst just to remove it
    fireEvent.click(screen.getByTestId('add-burst-btn'));
    fireEvent.change(screen.getByTestId('input-burst-3'), { target: { value: '10' } });

    // Remove the last burst
    fireEvent.click(screen.getByTestId('remove-burst-btn'));

    // Submit
    fireEvent.click(screen.getByTestId('add-btn'));

    const state = useSimulatorStore.getState();
    expect(state.processes.length).toBe(1);
    expect(state.processes[0].id).toBe('P2');
    expect(state.processes[0].burst_sequence).toEqual([5, 3, 4]);
    expect(state.processes[0].burst_time).toBe(12);
  });

  it('6, 7, 8. Zero, negative, non-numeric duration is rejected', () => {
    render(<WorkloadEditor />);
    fireEvent.click(screen.getByTestId('toggle-advanced'));
    
    fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P3' } });
    
    // Test negative
    fireEvent.change(screen.getByTestId('input-burst-0'), { target: { value: '-1' } });
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('error-msg').textContent).toBe('All burst durations must be positive numbers');
    
    // Test zero
    fireEvent.change(screen.getByTestId('input-burst-0'), { target: { value: '0' } });
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('error-msg').textContent).toBe('All burst durations must be positive numbers');
    
    // Test non-numeric (NaN)
    fireEvent.change(screen.getByTestId('input-burst-0'), { target: { value: 'abc' } }); // HTML input type="number" may yield empty string or 0
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('error-msg').textContent).toBe('All burst durations must be positive numbers');

    const state = useSimulatorStore.getState();
    expect(state.processes.length).toBe(0);
  });

  it('10. Sequence ending with I/O is rejected', () => {
    render(<WorkloadEditor />);
    fireEvent.click(screen.getByTestId('toggle-advanced'));
    fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P4' } });
    
    // Add IO burst to make length 2
    fireEvent.click(screen.getByTestId('add-burst-btn'));
    
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('error-msg').textContent).toBe('Sequence must end with CPU');

    const state = useSimulatorStore.getState();
    expect(state.processes.length).toBe(0);
  });

  it('15. Existing process fields still work', () => {
    render(<WorkloadEditor />);
    
    fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P5' } });
    fireEvent.change(screen.getByTestId('input-arrival'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '7' } });
    fireEvent.change(screen.getByTestId('input-priority'), { target: { value: '3' } });
    fireEvent.click(screen.getByTestId('add-btn'));

    const state = useSimulatorStore.getState();
    expect(state.processes[0]).toMatchObject({
      id: 'P5',
      arrival_time: 2,
      burst_time: 7,
      priority: 3
    });
  });

  it('16. Burst data is preserved in Zustand state', () => {
    // Already verified by test 2.
    // Also verifying UI displays it correctly in the table:
    useSimulatorStore.setState({ 
      processes: [{
        id: 'P6',
        arrival_time: 1,
        burst_time: 12,
        priority: 0,
        burst_sequence: [5, 3, 4]
      }] 
    });
    render(<WorkloadEditor />);
    
    // Check table output
    const seq = screen.getByTestId('seq-P6');
    expect(seq.textContent).toBe('CPU 5I/O 3CPU 4');
  });
});
