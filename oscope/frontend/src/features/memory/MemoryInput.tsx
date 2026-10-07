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
    <div className="bg-slate-50 p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Memory Configuration</h3>
      
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference Sequence</label>
          <input
            type="text"
            value={referenceSequence}
            onChange={e => setReferenceSequence(e.target.value)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
            placeholder="e.g. 1, 2, 3, 4, 1, 2, 5"
            data-testid="ref-sequence-input"
          />
        </div>
        
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Algorithm</label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
            data-testid="algo-select"
          >
            <option value="FIFO">FIFO (First-In, First-Out)</option>
            <option value="LRU">LRU (Least Recently Used)</option>
            <option value="OPTIMAL">Optimal</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frame Count</label>
          <input
            type="number"
            min="1"
            value={frameCount}
            onChange={e => setFrameCount(parseInt(e.target.value) || 0)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
            data-testid="frame-count-input"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 font-medium p-3 rounded-md mb-4 text-sm border border-red-100" data-testid="memory-error">
          {error}
        </div>
      )}

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        data-testid="simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Memory'}
      </button>
    </div>
  );
}
