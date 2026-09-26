import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { api } from '../../services/api';

export function RecommendPanel() {
  const { processes, setAlgorithm } = useSimulatorStore();
  const [objective, setObjective] = useState('awt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleRecommend = async () => {
    if (processes.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.recommend({ processes, objective });
      setRecommendation(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = () => {
    if (recommendation) {
      setAlgorithm(recommendation.algorithm);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 border-l-4 border-purple-500">
      <h3 className="text-lg font-bold mb-2">AI Algorithm Recommendation</h3>
      <p className="text-sm text-slate-600 mb-4">
        Our ML model predicts the most optimal scheduling algorithm based on synthetic workload simulations.
      </p>
      
      <div className="flex items-center gap-4 mb-4">
        <select value={objective} onChange={e => setObjective(e.target.value)} className="border p-2 rounded">
          <option value="awt">Minimize Wait Time</option>
          <option value="atat">Minimize Turnaround</option>
        </select>
        <button onClick={handleRecommend} disabled={loading || processes.length === 0} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Get Recommendation'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {recommendation && (
        <div className="bg-purple-50 p-4 rounded mt-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-lg text-purple-900">Predicted: {recommendation.algorithm}</p>
              <p className="text-sm text-purple-700">Confidence: {(recommendation.confidence * 100).toFixed(1)}%</p>
            </div>
            <button onClick={applyRecommendation} className="bg-purple-600 text-white px-3 py-1 text-sm rounded">
              Apply to Simulator
            </button>
          </div>
          <p className="text-sm text-purple-800 italic mt-2">{recommendation.explanation}</p>
        </div>
      )}
    </div>
  );
}
