import os

frontend_dir = r"c:\Users\marat\Downloads\3 rd Year\OS_LAB\Operating_system_CP\oscope\frontend"

# 1. Update types/index.ts
types_file = os.path.join(frontend_dir, "src/types/index.ts")
with open(types_file, "r") as f:
    types_content = f.read()

new_types = """
export interface QueueConfig {
  id: number;
  priority: number;
  policy: string;
  time_quantum?: number;
}

export interface MLQConfig {
  queues: QueueConfig[];
  process_assignments: Record<string, number>;
  inter_queue_policy: string;
}

export interface MLFQConfig {
  queues: QueueConfig[];
  boost_interval?: number;
}
"""

if "QueueConfig" not in types_content:
    types_content = new_types + "\n" + types_content

types_content = types_content.replace(
    "export interface GanttEvent {",
    "export interface GanttEvent {\n  queue_id?: number;"
)

types_content = types_content.replace(
    "time_quantum?: number;",
    "time_quantum?: number;\n  context_switch_cost?: number;\n  mlq_config?: MLQConfig;\n  mlfq_config?: MLFQConfig;"
)

with open(types_file, "w") as f:
    f.write(types_content)

# 2. Update store/useSimulatorStore.ts
store_file = os.path.join(frontend_dir, "src/store/useSimulatorStore.ts")
with open(store_file, "r") as f:
    store_content = f.read()

store_content = store_content.replace(
    "import { Process, SimulationResult } from '../types';",
    "import { Process, SimulationResult, MLQConfig, MLFQConfig } from '../types';"
)

store_content = store_content.replace(
    "timeQuantum: number;",
    "timeQuantum: number;\n  contextSwitchCost: number;\n  mlqConfig?: MLQConfig;\n  mlfqConfig?: MLFQConfig;"
)

store_content = store_content.replace(
    "setTimeQuantum: (tq: number) => void;",
    "setTimeQuantum: (tq: number) => void;\n  setContextSwitchCost: (cost: number) => void;\n  setMlqConfig: (config: MLQConfig) => void;\n  setMlfqConfig: (config: MLFQConfig) => void;"
)

store_content = store_content.replace(
    "timeQuantum: 2,",
    "timeQuantum: 2,\n  contextSwitchCost: 0,\n  mlqConfig: undefined,\n  mlfqConfig: undefined,"
)

store_content = store_content.replace(
    "setTimeQuantum: (tq) => set({ timeQuantum: tq }),",
    "setTimeQuantum: (tq) => set({ timeQuantum: tq }),\n  setContextSwitchCost: (cost) => set({ contextSwitchCost: cost }),\n  setMlqConfig: (config) => set({ mlqConfig: config }),\n  setMlfqConfig: (config) => set({ mlfqConfig: config }),"
)

with open(store_file, "w") as f:
    f.write(store_content)

# 3. Update AlgorithmSelector.tsx
selector_file = os.path.join(frontend_dir, "src/features/simulator/AlgorithmSelector.tsx")

new_selector_code = """\
import React from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function AlgorithmSelector() {
  const { 
    algorithm, setAlgorithm, 
    timeQuantum, setTimeQuantum,
    contextSwitchCost, setContextSwitchCost,
    processes
  } = useSimulatorStore();

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
          <option value="MLQ">Multilevel Queue (MLQ)</option>
          <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
        </select>
      </div>

      {(algorithm === 'MLQ' || algorithm === 'MLFQ') && (
        <div>
          <label className="block mb-1">Context Switch Cost</label>
          <input 
            type="number" 
            min="0"
            value={contextSwitchCost || 0} 
            onChange={e => setContextSwitchCost(Number(e.target.value))}
            className="border p-2 w-full rounded"
            data-testid="cs-cost-input"
            title="Time units added when switching processes"
          />
        </div>
      )}

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
"""

with open(selector_file, "w") as f:
    f.write(new_selector_code)

# 4. Update GanttChart.tsx
gantt_file = os.path.join(frontend_dir, "src/features/simulator/GanttChart.tsx")
with open(gantt_file, "r") as f:
    gantt_content = f.read()

gantt_content = gantt_content.replace(
    "const isIdle = ev.process_id === 'IDLE';",
    "const isIdle = ev.process_id === 'IDLE';\n          const isCS = ev.process_id === 'CS';"
)

gantt_content = gantt_content.replace(
    "const bgColor = isIdle ? 'bg-slate-300' : processColors[ev.process_id];",
    "const bgColor = isIdle ? 'bg-slate-300' : isCS ? 'bg-red-500' : processColors[ev.process_id];"
)

gantt_content = gantt_content.replace(
    "{ev.process_id}",
    "{ev.process_id}{ev.queue_id ? ` (Q${ev.queue_id})` : ''}"
)

with open(gantt_file, "w") as f:
    f.write(gantt_content)

# 5. Update SimulationMetricsPanel.tsx
metrics_file = os.path.join(frontend_dir, "src/features/simulator/SimulationMetricsPanel.tsx")
new_metrics_code = """\
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function SimulationMetricsPanel() {
  const { result } = useSimulatorStore();

  if (!result) return null;

  let csCount = 0;
  let csTime = 0;
  result.gantt_chart.forEach(ev => {
    if (ev.process_id === 'CS') {
      csCount++;
      csTime += (ev.end_time - ev.start_time);
    }
  });

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Simulation Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Avg Wait Time" value={result.metrics.average_waiting_time.toFixed(2)} testId="metric-awt" />
        <MetricCard label="Avg Turnaround" value={result.metrics.average_turnaround_time.toFixed(2)} testId="metric-atat" />
        <MetricCard label="Avg Response" value={result.metrics.average_response_time.toFixed(2)} testId="metric-art" />
        <MetricCard label="CPU Util (%)" value={result.metrics.cpu_utilization.toFixed(1)} testId="metric-util" />
        <MetricCard label="Throughput" value={result.metrics.throughput.toFixed(3)} testId="metric-throughput" />
        {(csCount > 0) && <MetricCard label="CS Count" value={csCount.toString()} testId="metric-cscount" />}
        {(csTime > 0) && <MetricCard label="CS Time" value={csTime.toString()} testId="metric-cstime" />}
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
"""

with open(metrics_file, "w") as f:
    f.write(new_metrics_code)
