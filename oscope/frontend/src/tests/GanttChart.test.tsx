import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { GanttChart } from '../features/simulator/GanttChart';
import { useSimulatorStore } from '../store/useSimulatorStore';

describe('Phase 8B.3 GanttChart Visualization', () => {
  beforeEach(() => {
    // Reset state before each test
    useSimulatorStore.setState({ result: null, currentTime: 100 });
  });

  it('1, 14. Existing CPU-only Gantt still renders with missing event_type', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          { process_id: 'P1', start_time: 0, end_time: 5 },
          { process_id: 'P2', start_time: 5, end_time: 10 }
        ]
      },
      currentTime: 10
    });
    
    render(<GanttChart />);
    
    expect(screen.getByTestId('gantt-chart-interactive')).toBeInTheDocument();
    
    // CPU Timeline should be present implicitly or explicitly
    expect(screen.getByTestId('gantt-event-CPU-P1')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-event-CPU-P2')).toBeInTheDocument();
    
    // Check titles for exact text
    expect(screen.getByTestId('gantt-event-CPU-P1')).toHaveAttribute('title', 'P1 [CPU]: 0 - 5 (Duration: 5)');
    
    // No IO timeline
    expect(screen.queryByText('I/O Timeline')).not.toBeInTheDocument();
  });

  it('2, 3, 6. CPU and I/O events render correctly and can overlap', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          { process_id: 'P1', start_time: 0, end_time: 5, event_type: 'CPU' },
          { process_id: 'P2', start_time: 2, end_time: 7, event_type: 'IO' }, // Overlaps with P1 and P3
          { process_id: 'P3', start_time: 5, end_time: 10, event_type: 'CPU' }
        ]
      },
      currentTime: 10
    });
    
    render(<GanttChart />);
    
    expect(screen.getByText('CPU Core')).toBeInTheDocument();
    expect(screen.getByText('I/O Device')).toBeInTheDocument();
    
    const p2io = screen.getByTestId('gantt-event-IO-P2');
    
    // Both are present, P2 is an IO event spanning 2-7
    expect(p2io).toBeInTheDocument();
    expect(p2io).toHaveAttribute('title', 'P2 [IO]: 2 - 7 (Duration: 5)');
    
    // Time overlap is correct (visualized by separate tracks handling the overlapping absolute positions correctly without summing widths incorrectly in a single row)
  });

  it('4, 5, 13. CS and IDLE events still render properly', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          { process_id: 'P1', start_time: 0, end_time: 2, event_type: 'CPU' },
          { process_id: 'CS', start_time: 2, end_time: 3, event_type: 'CS' },
          { process_id: 'IDLE', start_time: 3, end_time: 5, event_type: 'IDLE' }
        ]
      },
      currentTime: 5
    });
    
    render(<GanttChart />);
    
    expect(screen.getByTestId('gantt-event-CS-CS')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-event-IDLE-IDLE')).toBeInTheDocument();
  });

  it('7, 8, 9, 10. Start/End times are preserved, processes are correct', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          { process_id: 'P4', start_time: 15, end_time: 25, event_type: 'IO' }
        ]
      },
      currentTime: 25
    });
    
    render(<GanttChart />);
    
    const ioEv = screen.getByTestId('gantt-event-IO-P4');
    expect(ioEv).toHaveAttribute('style', 'left: 60%; width: 40%;');
    expect(ioEv).toHaveAttribute('title', 'P4 [IO]: 15 - 25 (Duration: 10)');
    expect(screen.getByText('P4')).toBeInTheDocument();
  });

  it('11, 12. Queue IDs are preserved (MLQ/MLFQ compatibility)', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          { process_id: 'P1', start_time: 0, end_time: 2, queue_id: 1, event_type: 'CPU' },
          { process_id: 'P2', start_time: 2, end_time: 4, queue_id: 2, event_type: 'CPU' }
        ]
      },
      currentTime: 4
    });
    
    render(<GanttChart />);
    
    expect(screen.getByTestId('gantt-event-CPU-P1')).toHaveAttribute('title', 'P1 (Q1) [CPU]: 0 - 2 (Duration: 2)');
    expect(screen.getByText('P1 (Q1)')).toBeInTheDocument();
    expect(screen.getByText('P2 (Q2)')).toBeInTheDocument();
  });

  it('15. Invalid or unexpected event data does not crash', () => {
    useSimulatorStore.setState({
      result: {
        metrics: {} as any,
        gantt_chart: [
          // Missing start/end times should just render as width=0 or NaN but not crash React completely
          { process_id: 'P_INVALID', start_time: NaN, end_time: NaN, event_type: 'UNKNOWN' } as any
        ]
      },
      currentTime: 10
    });
    
    // Should not throw
    render(<GanttChart />);
    
    expect(screen.getByTestId('gantt-chart-interactive')).toBeInTheDocument();
  });
});
