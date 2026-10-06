import { useState } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';
import { SimulationResult } from '../types';

export function Compare() {
  const { processes, timeQuantum, contextSwitchCost, mlqConfig, mlfqConfig } = useSimulatorStore();
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, SimulationResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAlgo = (alg: string) => {
    setSelectedAlgos(prev => prev.includes(alg) ? prev.filter(a => a !== alg) : [...prev, alg]);
  };

  const handleCompare = async () => {
    if (selectedAlgos.length < 2) {
      setError('Please select at least two algorithms to compare.');
      return;
    }
    if (processes.length === 0) {
      setError('Workload is empty. Go to Simulator to add processes.');
      return;
    }

    const hasIO = processes.some(p => p.burst_sequence && p.burst_sequence.length > 0);

    if (selectedAlgos.includes('MLQ') || selectedAlgos.includes('MLFQ')) {
      if (hasIO) {
        setError('CPU/I/O burst workloads are not supported for MLQ or MLFQ.');
        return;
      }
    }

    if (selectedAlgos.includes('MLQ')) {
      if (!mlqConfig || !mlqConfig.queues || mlqConfig.queues.length === 0) {
        setError('MLQ configuration is missing or incomplete.');
        return;
      }
      const unassignedProcesses = processes.filter(p => mlqConfig.process_assignments[p.id] === undefined);
      if (unassignedProcesses.length > 0) {
        setError(`MLQ configuration missing queue assignments for processes: ${unassignedProcesses.map(p => p.id).join(', ')}`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.compare({
        algorithms: selectedAlgos,
        processes,
        time_quantum: timeQuantum,
        context_switch_cost: contextSwitchCost,
        mlq_config: mlqConfig,
        mlfq_config: mlfqConfig
      });
      setResults(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const algos = ['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY_NP', 'PRIORITY_P', 'MLQ', 'MLFQ'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compare Algorithms</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4">Select Algorithms</h3>
        <div className="flex gap-4 flex-wrap mb-4">
          {algos.map(a => (
            <label key={a} className="flex items-center gap-2">
              <input type="checkbox" checked={selectedAlgos.includes(a)} onChange={() => toggleAlgo(a)} />
              {a}
            </label>
          ))}
        </div>
        <button onClick={handleCompare} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Comparing...' : 'Compare'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {results && (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h3 className="font-bold mb-4">Comparison Results</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3">Algorithm</th>
                <th className="p-3">Avg Wait Time</th>
                <th className="p-3">Avg Turnaround</th>
                <th className="p-3">Avg Response</th>
                <th className="p-3">CPU Util (%)</th>
                <th className="p-3">Throughput</th>
                <th className="p-3">I/O Util (%)</th>
                <th className="p-3">Makespan</th>
                <th className="p-3">CS Count</th>
                <th className="p-3">CS Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([alg, res]) => {
                let csCount = 0;
                let csTime = 0;
                res.gantt_chart.forEach(ev => {
                  if (ev.process_id === 'CS') {
                    csCount++;
                    csTime += (ev.end_time - ev.start_time);
                  }
                });
                return (
                <tr key={alg} className="border-b">
                  <td className="p-3 font-bold">{alg}</td>
                  <td className="p-3">{res.metrics.average_waiting_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.average_turnaround_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.average_response_time.toFixed(2)}</td>
                  <td className="p-3">{res.metrics.cpu_utilization.toFixed(1)}</td>
                  <td className="p-3">{res.metrics.throughput.toFixed(3)}</td>
                  <td className="p-3">{res.metrics.io_utilization !== undefined ? res.metrics.io_utilization.toFixed(1) : '-'}</td>
                  <td className="p-3">{res.metrics.total_makespan !== undefined ? res.metrics.total_makespan.toFixed(1) : '-'}</td>
                  <td className="p-3">{csCount > 0 ? csCount : '-'}</td>
                  <td className="p-3">{csTime > 0 ? csTime : '-'}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
