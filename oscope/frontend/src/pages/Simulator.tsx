import { WorkloadEditor } from '../features/simulator/WorkloadEditor';
import { AlgorithmSelector } from '../features/simulator/AlgorithmSelector';
import { ResultsView } from '../features/simulator/ResultsView';
import { RecommendPanel } from '../features/simulator/RecommendPanel';
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
        <div className="flex flex-col gap-6">
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
      </div>
      <RecommendPanel />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Results</h3>
        <ResultsView />
      </div>
    </div>
  );
}
