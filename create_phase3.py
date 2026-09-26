import os
import json

base_dir = "oscope/frontend"

files = {
    "package.json": """{
  "name": "oscope-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "lucide-react": "^0.300.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  }
}""",
    "vite.config.ts": """\
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
})
""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}""",
    "tsconfig.node.json": """{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}""",
    "tailwind.config.js": """\
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
""",
    "postcss.config.js": """\
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""",
    "index.html": """\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OScope</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""",
    "src/main.tsx": """\
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""",
    "src/styles/index.css": """\
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    @apply bg-slate-50 text-slate-900;
}
""",
    "src/app/App.tsx": """\
import { BrowserRouter } from 'react-router-dom';
import { Router } from './router';
import { Layout } from '../components/layout/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Router />
      </Layout>
    </BrowserRouter>
  );
}
""",
    "src/app/router.tsx": """\
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Simulator } from '../pages/Simulator';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/compare" element={<div>Comparison Placeholder</div>} />
      <Route path="/history" element={<div>History Placeholder</div>} />
      <Route path="/about" element={<div>About OScope Placeholder</div>} />
    </Routes>
  );
}
""",
    "src/components/layout/Layout.tsx": """\
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b flex items-center px-6">
          <h1 className="text-xl font-bold">OScope</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
""",
    "src/components/layout/Sidebar.tsx": """\
import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">OScope</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/" className="block py-2 px-4 rounded hover:bg-slate-800">Dashboard</Link>
        <Link to="/simulator" className="block py-2 px-4 rounded hover:bg-slate-800">Simulator</Link>
        <Link to="/compare" className="block py-2 px-4 rounded hover:bg-slate-800">Compare</Link>
        <Link to="/history" className="block py-2 px-4 rounded hover:bg-slate-800">History</Link>
        <Link to="/about" className="block py-2 px-4 rounded hover:bg-slate-800">About</Link>
      </nav>
    </div>
  );
}
""",
    "src/pages/Dashboard.tsx": """\
export function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>Welcome to OScope.</p>
    </div>
  );
}
""",
    "src/pages/Simulator.tsx": """\
import { WorkloadEditor } from '../features/simulator/WorkloadEditor';
import { AlgorithmSelector } from '../features/simulator/AlgorithmSelector';
import { ResultsView } from '../features/simulator/ResultsView';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';

export function Simulator() {
  const { 
    processes, algorithm, timeQuantum, 
    setResult, setLoading, setError, loading, error 
  } = useSimulatorStore();

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.simulate({
        algorithm,
        processes,
        time_quantum: algorithm === 'RR' ? timeQuantum : undefined
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Workload</h3>
          <WorkloadEditor />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Configuration</h3>
          <AlgorithmSelector />
          <button 
            data-testid="simulate-btn"
            onClick={handleSimulate}
            disabled={processes.length === 0 || loading}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Simulating...' : 'Simulate'}
          </button>
          {error && <div className="mt-4 text-red-600" data-testid="error-msg">{error}</div>}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Results</h3>
        <ResultsView />
      </div>
    </div>
  );
}
""",
    "src/features/simulator/WorkloadEditor.tsx": """\
import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function WorkloadEditor() {
  const { processes, addProcess, removeProcess, clearProcesses } = useSimulatorStore();
  const [id, setId] = useState('');
  const [arrival, setArrival] = useState(0);
  const [burst, setBurst] = useState(1);
  const [priority, setPriority] = useState(0);

  const handleAdd = () => {
    if (!id || burst <= 0) return;
    addProcess({ id, arrival_time: arrival, burst_time: burst, priority });
    setId('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="ID" value={id} onChange={e => setId(e.target.value)} className="border p-2 w-full" data-testid="input-id" />
        <input type="number" placeholder="Arrival" value={arrival} onChange={e => setArrival(Number(e.target.value))} className="border p-2 w-full" data-testid="input-arrival" />
        <input type="number" placeholder="Burst" value={burst} onChange={e => setBurst(Number(e.target.value))} className="border p-2 w-full" data-testid="input-burst" />
        <input type="number" placeholder="Priority" value={priority} onChange={e => setPriority(Number(e.target.value))} className="border p-2 w-full" data-testid="input-priority" />
        <button onClick={handleAdd} className="bg-green-600 text-white px-4 rounded" data-testid="add-btn">Add</button>
      </div>
      <button onClick={clearProcesses} className="text-red-600 mb-4 text-sm">Clear All</button>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-2">ID</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Priority</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(p => (
            <tr key={p.id} className="border-b" data-testid={`row-${p.id}`}>
              <td className="p-2">{p.id}</td>
              <td>{p.arrival_time}</td>
              <td>{p.burst_time}</td>
              <td>{p.priority}</td>
              <td>
                <button onClick={() => removeProcess(p.id)} className="text-red-600">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
""",
    "src/features/simulator/AlgorithmSelector.tsx": """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function AlgorithmSelector() {
  const { algorithm, setAlgorithm, timeQuantum, setTimeQuantum } = useSimulatorStore();

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1">Algorithm</label>
        <select 
          value={algorithm} 
          onChange={e => setAlgorithm(e.target.value)}
          className="border p-2 w-full rounded"
          data-testid="algo-select"
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="PRIORITY_NP">Priority (Non-Preemptive)</option>
          <option value="PRIORITY_P">Priority (Preemptive)</option>
        </select>
      </div>
      {algorithm === 'RR' && (
        <div>
          <label className="block mb-1">Time Quantum</label>
          <input 
            type="number" 
            min="1"
            value={timeQuantum} 
            onChange={e => setTimeQuantum(Number(e.target.value))}
            className="border p-2 w-full rounded"
            data-testid="tq-input"
          />
        </div>
      )}
    </div>
  );
}
""",
    "src/features/simulator/ResultsView.tsx": """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ResultsView() {
  const { result } = useSimulatorStore();

  if (!result) return <p className="text-slate-500">No results yet. Run a simulation.</p>;

  return (
    <div>
      <div className="mb-6">
        <h4 className="font-bold mb-2">Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded border" data-testid="metric-awt">
            Avg Wait: {result.metrics.average_waiting_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border" data-testid="metric-atat">
            Avg TAT: {result.metrics.average_turnaround_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            Avg RT: {result.metrics.average_response_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            Util: {result.metrics.cpu_utilization.toFixed(1)}%
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-2">Timeline</h4>
        <div className="flex gap-1 overflow-x-auto pb-2" data-testid="gantt-chart">
          {result.gantt_chart.map((event, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[60px]">
              <div className={`w-full py-2 text-center text-white text-xs rounded ${event.process_id === 'IDLE' ? 'bg-slate-400' : 'bg-blue-600'}`}>
                {event.process_id}
              </div>
              <div className="text-xs mt-1 text-slate-500">
                {event.start_time}-{event.end_time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
""",
    "src/types/index.ts": """\
export interface Process {
  id: string;
  arrival_time: number;
  burst_time: number;
  priority?: number;
}

export interface GanttEvent {
  process_id: string;
  start_time: number;
  end_time: number;
}

export interface ProcessMetrics {
  process_id: string;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  response_time: number;
}

export interface SimulationMetrics {
  process_metrics: ProcessMetrics[];
  average_turnaround_time: number;
  average_waiting_time: number;
  average_response_time: number;
  cpu_utilization: number;
  throughput: number;
}

export interface SimulationResult {
  gantt_chart: GanttEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationRequest {
  algorithm: string;
  processes: Process[];
  time_quantum?: number;
}
""",
    "src/services/api.ts": """\
import axios from 'axios';
import { SimulationRequest, SimulationResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`
});

export const api = {
  health: () => client.get('/health'),
  simulate: (req: SimulationRequest) => client.post<SimulationResult>('/simulate', req),
  compare: (req: any) => client.post('/compare', req)
};
""",
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
  
  addProcess: (p: Process) => void;
  removeProcess: (id: string) => void;
  clearProcesses: () => void;
  setAlgorithm: (alg: string) => void;
  setTimeQuantum: (tq: number) => void;
  setResult: (res: SimulationResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  processes: [],
  algorithm: 'FCFS',
  timeQuantum: 2,
  result: null,
  loading: false,
  error: null,
  
  addProcess: (p) => set((state) => ({ processes: [...state.processes, p] })),
  removeProcess: (id) => set((state) => ({ processes: state.processes.filter(p => p.id !== id) })),
  clearProcesses: () => set({ processes: [] }),
  setAlgorithm: (alg) => set({ algorithm: alg }),
  setTimeQuantum: (tq) => set({ timeQuantum: tq }),
  setResult: (res) => set({ result: res }),
  setLoading: (l) => set({ loading: l }),
  setError: (e) => set({ error: e }),
}));
""",
    "src/tests/setup.ts": """\
import '@testing-library/jest-dom';
""",
    "src/tests/App.test.tsx": """\
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../app/App';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    simulate: vi.fn()
  }
}));

test('renders dashboard initially', () => {
  render(<App />);
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});

test('can navigate to simulator and add process', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Simulator'));
  expect(screen.getByText('Workload')).toBeInTheDocument();
  
  fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P1' } });
  fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '5' } });
  fireEvent.click(screen.getByTestId('add-btn'));
  
  expect(screen.getByTestId('row-P1')).toBeInTheDocument();
});

test('can select RR and see time quantum', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Simulator'));
  
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
  fireEvent.click(screen.getByText('Simulator'));
  
  fireEvent.change(screen.getByTestId('input-id'), { target: { value: 'P1' } });
  fireEvent.change(screen.getByTestId('input-burst'), { target: { value: '5' } });
  fireEvent.click(screen.getByTestId('add-btn'));
  
  fireEvent.click(screen.getByTestId('simulate-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('metric-awt')).toHaveTextContent('Avg Wait: 0.00');
    expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
  });
});
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
