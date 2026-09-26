import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExperimentSummary, ExperimentDetails } from '../types';

export function History() {
  const [exps, setExps] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<ExperimentDetails | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.listHistory();
      setExps(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpen = async (id: number) => {
    try {
      const res = await api.getHistory(id);
      setSelectedExp(res.data);
    } catch (e: any) {
      alert('Failed to load experiment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this experiment?')) return;
    try {
      await api.deleteHistory(id);
      if (selectedExp?.id === id) setSelectedExp(null);
      fetchHistory();
    } catch (e: any) {
      alert('Failed to delete experiment');
    }
  };

  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Experiment History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">Saved Experiments</h3>
          {exps.length === 0 ? <p className="text-slate-500">No history found.</p> : (
            <ul className="space-y-2">
              {exps.map(exp => (
                <li key={exp.id} className="p-3 border rounded flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <p className="font-bold">{exp.name}</p>
                    <p className="text-xs text-slate-500">{exp.algorithm} | {new Date(exp.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpen(exp.id)} className="text-blue-600 text-sm">Open</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedExp && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="font-bold">Details: {selectedExp.name}</h3>
            <p className="text-sm"><span className="font-semibold">Algorithm:</span> {selectedExp.algorithm}</p>
            <p className="text-sm"><span className="font-semibold">Processes:</span> {selectedExp.processes.length}</p>
            <h4 className="font-semibold mt-4">Metrics</h4>
            <ul className="text-sm space-y-1">
              <li>Avg Wait: {selectedExp.simulation_result.metrics.average_waiting_time.toFixed(2)}</li>
              <li>Avg TAT: {selectedExp.simulation_result.metrics.average_turnaround_time.toFixed(2)}</li>
              <li>Util: {selectedExp.simulation_result.metrics.cpu_utilization.toFixed(1)}%</li>
            </ul>
            <h4 className="font-semibold mt-4">Timeline</h4>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {selectedExp.simulation_result.gantt_chart.map((ev, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[40px]">
                  <div className="w-full py-1 text-center text-white text-[10px] rounded bg-slate-700">
                    {ev.process_id}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-500">
                    {ev.start_time}-{ev.end_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
