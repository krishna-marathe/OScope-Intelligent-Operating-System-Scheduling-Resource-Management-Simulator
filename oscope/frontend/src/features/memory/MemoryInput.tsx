import { useMemoryStore } from '../../store/useMemoryStore';
import { api } from '../../services/api';

export function MemoryInput() {
  const {
    referenceSequence, frameCount, algorithm,
    setReferenceSequence, setFrameCount, setAlgorithm,
    setResult, setLoading, setError, loading, error
  } = useMemoryStore();

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sequence = referenceSequence
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
        
      if (sequence.length === 0) {
        throw new Error("Reference sequence cannot be empty or invalid.");
      }
      
      if (sequence.some(n => n < 0)) {
        throw new Error("References must be non-negative.");
      }
      
      if (frameCount <= 0) {
        throw new Error("Frame count must be positive.");
      }

      const res = await api.simulateMemory({
        reference_sequence: sequence,
        frame_count: frameCount,
        algorithm
      });
      
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h2 className="text-xl font-bold mb-4">Memory Configuration</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm" data-testid="memory-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Reference Sequence (comma-separated)</label>
          <input
            type="text"
            value={referenceSequence}
            onChange={e => setReferenceSequence(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 1, 2, 3, 4, 1, 2, 5"
            data-testid="ref-sequence-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Algorithm</label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            data-testid="algo-select"
          >
            <option value="FIFO">FIFO</option>
            <option value="LRU">LRU</option>
            <option value="OPTIMAL">OPTIMAL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Frame Count</label>
          <input
            type="number"
            min="1"
            value={frameCount}
            onChange={e => setFrameCount(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            data-testid="frame-count-input"
          />
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        data-testid="simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Memory'}
      </button>
    </div>
  );
}
