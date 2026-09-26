import os

base_dir = "oscope/frontend"

files = {
    "src/store/useSimulatorStore.ts": """\
import { create } from 'zustand';
import { Process, SimulationResult } from '../types';

interface SimulatorState {
  processes: Process[];
  algorithm: string;
  timeQuantum: number;
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  addProcess: (p: Process) => void;
  removeProcess: (id: string) => void;
  clearProcesses: () => void;
  setAlgorithm: (alg: string) => void;
  setTimeQuantum: (tq: number) => void;
  setResult: (res: SimulationResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  
  setCurrentTime: (time: number) => void;
  setIsPlaying: (play: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetPlayback: () => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [],
  algorithm: 'FCFS',
  timeQuantum: 2,
  result: null,
  loading: false,
  error: null,
  
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  addProcess: (p) => set((state) => ({ processes: [...state.processes, p] })),
  removeProcess: (id) => set((state) => ({ processes: state.processes.filter(p => p.id !== id) })),
  clearProcesses: () => set({ processes: [] }),
  setAlgorithm: (alg) => set({ algorithm: alg }),
  setTimeQuantum: (tq) => set({ timeQuantum: tq }),
  setResult: (res) => set({ result: res, currentTime: 0, isPlaying: false }),
  setLoading: (l) => set({ loading: l }),
  setError: (e) => set({ error: e }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (play) => set({ isPlaying: play }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  resetPlayback: () => set({ currentTime: 0, isPlaying: false }),
}));
""",
    "src/features/simulator/PlaybackControls.tsx": """\
import { useEffect, useRef } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';

export function PlaybackControls() {
  const { result, currentTime, isPlaying, playbackSpeed, setCurrentTime, setIsPlaying, setPlaybackSpeed, resetPlayback } = useSimulatorStore();
  const timerRef = useRef<number | null>(null);

  const maxTime = result?.gantt_chart.length ? result.gantt_chart[result.gantt_chart.length - 1].end_time : 0;
  
  const getEventBoundaries = () => {
    if (!result) return [0];
    const boundaries = new Set([0]);
    result.gantt_chart.forEach(ev => {
      boundaries.add(ev.start_time);
      boundaries.add(ev.end_time);
    });
    return Array.from(boundaries).sort((a, b) => a - b);
  };

  useEffect(() => {
    if (isPlaying && currentTime < maxTime) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(Math.min(maxTime, useSimulatorStore.getState().currentTime + 1));
      }, 1000 / playbackSpeed);
    } else if (currentTime >= maxTime) {
      setIsPlaying(false);
    }
    
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, maxTime, setCurrentTime, setIsPlaying]);

  const handlePlayPause = () => {
    if (currentTime >= maxTime) {
      resetPlayback();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    const boundaries = getEventBoundaries();
    const nextBoundary = boundaries.find(b => b > currentTime);
    if (nextBoundary !== undefined) {
      setCurrentTime(nextBoundary);
    } else {
      setCurrentTime(maxTime);
    }
  };

  const handleStepBackward = () => {
    const boundaries = getEventBoundaries();
    const prevBoundaries = boundaries.filter(b => b < currentTime);
    if (prevBoundaries.length > 0) {
      setCurrentTime(prevBoundaries[prevBoundaries.length - 1]);
    } else {
      setCurrentTime(0);
    }
  };

  if (!result) return null;

  return (
    <div className="flex items-center justify-between bg-slate-100 p-4 rounded-lg shadow-sm my-4">
      <div className="flex gap-2">
        <button data-testid="btn-reset" onClick={resetPlayback} className="p-2 bg-slate-200 rounded hover:bg-slate-300" aria-label="Reset"><RotateCcw size={18} /></button>
        <button data-testid="btn-step-back" onClick={handleStepBackward} className="p-2 bg-slate-200 rounded hover:bg-slate-300" aria-label="Step Backward"><SkipBack size={18} /></button>
        <button data-testid="btn-play-pause" onClick={handlePlayPause} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-12 flex justify-center" aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button data-testid="btn-step-forward" onClick={handleStepForward} className="p-2 bg-slate-200 rounded hover:bg-slate-300" aria-label="Step Forward"><SkipForward size={18} /></button>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-lg font-bold" data-testid="current-time-display">Time: {currentTime} / {maxTime}</span>
        <select 
          data-testid="speed-select"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="border rounded p-1"
          aria-label="Playback Speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
}
""",
    "src/features/simulator/GanttChart.tsx": """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'
];

export function GanttChart() {
  const { result, currentTime } = useSimulatorStore();

  if (!result || result.gantt_chart.length === 0) return null;

  const maxTime = result.gantt_chart[result.gantt_chart.length - 1].end_time;
  
  // Assign stable colors to processes
  const processColors: Record<string, string> = {};
  let colorIdx = 0;
  result.gantt_chart.forEach(ev => {
    if (ev.process_id !== 'IDLE' && !processColors[ev.process_id]) {
      processColors[ev.process_id] = colors[colorIdx % colors.length];
      colorIdx++;
    }
  });

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Gantt Chart (Interactive)</h3>
      <div className="relative w-full h-16 bg-slate-200 flex rounded overflow-hidden shadow-inner" data-testid="gantt-chart-interactive">
        {result.gantt_chart.map((ev, idx) => {
          const duration = ev.end_time - ev.start_time;
          const widthPct = (duration / maxTime) * 100;
          const isIdle = ev.process_id === 'IDLE';
          const bgColor = isIdle ? 'bg-slate-300' : processColors[ev.process_id];
          
          // Determine how much of this block is visible based on currentTime
          const visibleDuration = Math.max(0, Math.min(duration, currentTime - ev.start_time));
          const visibleWidthPct = (visibleDuration / duration) * 100;

          return (
            <div key={idx} style={{ width: `${widthPct}%` }} className="h-full border-r border-white/50 relative bg-slate-100" title={`${ev.process_id}: ${ev.start_time} - ${ev.end_time}`}>
               {/* Background fill based on playback */}
               <div className={`h-full ${bgColor} transition-all duration-200 ease-linear`} style={{ width: `${visibleWidthPct}%` }} />
               {/* Label */}
               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 mix-blend-hard-light">
                 {ev.process_id}
               </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>0</span>
        <span>{maxTime}</span>
      </div>
    </div>
  );
}
""",
    "src/features/simulator/ProcessStatusPanel.tsx": """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ProcessStatusPanel() {
  const { processes, result, currentTime } = useSimulatorStore();

  if (!result || processes.length === 0) return null;

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Process Status</h3>
      <table className="w-full text-left bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3">Process ID</th>
            <th className="p-3">Status</th>
            <th className="p-3">Remaining Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(p => {
            // Calculate status and remaining time based on Gantt Chart up to currentTime
            let remaining = p.burst_time;
            let status = currentTime < p.arrival_time ? 'Pending' : 'Pending';
            
            if (currentTime >= p.arrival_time) {
               // sum execution time up to currentTime
               let executed = 0;
               let isRunning = false;
               result.gantt_chart.forEach(ev => {
                 if (ev.process_id === p.id && ev.start_time < currentTime) {
                   const execInBlock = Math.min(ev.end_time, currentTime) - ev.start_time;
                   executed += execInBlock;
                   if (currentTime > ev.start_time && currentTime < ev.end_time) {
                     isRunning = true;
                   }
                 }
               });
               
               remaining = Math.max(0, p.burst_time - executed);
               if (remaining === 0) status = 'Completed';
               else if (isRunning) status = 'Running';
               else if (executed > 0) status = 'Ready (Preempted)';
               else status = 'Ready';
            }

            return (
              <tr key={p.id} className="border-b last:border-b-0" data-testid={`status-row-${p.id}`}>
                <td className="p-3 font-semibold">{p.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${status === 'Completed' ? 'bg-green-100 text-green-800' : status === 'Running' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {status}
                  </span>
                </td>
                <td className="p-3 font-mono">{remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
""",
    "src/features/simulator/SimulationMetricsPanel.tsx": """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function SimulationMetricsPanel() {
  const { result } = useSimulatorStore();

  if (!result) return null;

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Simulation Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Avg Wait Time" value={result.metrics.average_waiting_time.toFixed(2)} testId="metric-awt" />
        <MetricCard label="Avg Turnaround" value={result.metrics.average_turnaround_time.toFixed(2)} testId="metric-atat" />
        <MetricCard label="Avg Response" value={result.metrics.average_response_time.toFixed(2)} testId="metric-art" />
        <MetricCard label="CPU Util (%)" value={result.metrics.cpu_utilization.toFixed(1)} testId="metric-util" />
        <MetricCard label="Throughput" value={result.metrics.throughput.toFixed(3)} testId="metric-throughput" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, testId }: { label: string, value: string, testId: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 flex flex-col items-center justify-center text-center">
      <span className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-slate-800" data-testid={testId}>{value}</span>
    </div>
  );
}
""",
    "src/features/simulator/ResultsView.tsx": """\
import { PlaybackControls } from './PlaybackControls';
import { GanttChart } from './GanttChart';
import { ProcessStatusPanel } from './ProcessStatusPanel';
import { SimulationMetricsPanel } from './SimulationMetricsPanel';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ResultsView() {
  const { result } = useSimulatorStore();

  if (!result) return <p className="text-slate-500" data-testid="empty-results">No results yet. Run a simulation.</p>;

  return (
    <div>
      <SimulationMetricsPanel />
      <PlaybackControls />
      <GanttChart />
      <ProcessStatusPanel />
    </div>
  );
}
""",
    "src/tests/Playback.test.tsx": """\
import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { ResultsView } from '../features/simulator/ResultsView';
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
  render(<ResultsView />);
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0 / 5');
  
  // Click Play
  fireEvent.click(screen.getByTestId('btn-play-pause'));
  
  act(() => {
    vi.advanceTimersByTime(2000); // 2 seconds = 2 time units at 1x speed
  });
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2 / 5');
  
  // Pause
  fireEvent.click(screen.getByTestId('btn-play-pause'));
  
  act(() => {
    vi.advanceTimersByTime(2000); // Time shouldn't advance
  });
  
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2 / 5');
});

test('Reset returns time to 0', () => {
  render(<ResultsView />);
  useSimulatorStore.setState({ currentTime: 3 });
  
  fireEvent.click(screen.getByTestId('btn-reset'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 0 / 5');
});

test('Step forward and backward moves to event boundaries', () => {
  render(<ResultsView />);
  // Boundaries are 0, 2, 3, 5
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2 / 5');
  
  fireEvent.click(screen.getByTestId('btn-step-forward'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 3 / 5');
  
  fireEvent.click(screen.getByTestId('btn-step-back'));
  expect(screen.getByTestId('current-time-display')).toHaveTextContent('Time: 2 / 5');
});

test('Process status updates correctly based on time', () => {
  render(<ResultsView />);
  
  // At time 0
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Pending');
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('2'); // Remaining 2
  
  // Advance to time 1
  act(() => {
    useSimulatorStore.setState({ currentTime: 1 });
  });
  
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('Running');
  expect(screen.getByTestId('status-row-P1')).toHaveTextContent('1'); // Remaining 1
  expect(screen.getByTestId('status-row-P2')).toHaveTextContent('Pending'); // Not arrived yet
  
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
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
