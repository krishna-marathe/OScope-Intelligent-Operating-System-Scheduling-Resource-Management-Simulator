import { useDiskStore } from '../../store/useDiskStore';
import { api } from '../../services/api';

export function DiskInput() {
  const {
    requestQueue, initialHeadPosition, diskSize, algorithm, direction,
    setRequestQueue, setInitialHeadPosition, setDiskSize, setAlgorithm, setDirection,
    setResult, setLoading, setError, loading, error
  } = useDiskStore();

  const isDirectional = ['SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'].includes(algorithm);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sequence = requestQueue
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
        
      if (sequence.length === 0) {
        throw new Error("Request queue cannot be empty.");
      }
      
      if (sequence.some(n => n < 0)) {
        throw new Error("Cylinders must be non-negative.");
      }
      
      if (initialHeadPosition < 0 || diskSize <= 0) {
        throw new Error("Invalid head position or disk size.");
      }

      const res = await api.simulateDisk({
        request_queue: sequence,
        initial_head_position: initialHeadPosition,
        disk_size: diskSize,
        algorithm,
        direction: isDirectional ? direction : undefined
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
      <h2 className="text-xl font-bold mb-4">Disk Scheduling Configuration</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm" data-testid="disk-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-4">
          <label className="block text-sm font-semibold mb-2">Request Queue (comma-separated cylinders)</label>
          <input
            type="text"
            value={requestQueue}
            onChange={e => setRequestQueue(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
            data-testid="disk-queue-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Algorithm</label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            data-testid="disk-algo-select"
          >
            <option value="FCFS">FCFS</option>
            <option value="SSTF">SSTF</option>
            <option value="SCAN">SCAN</option>
            <option value="C-SCAN">C-SCAN</option>
            <option value="LOOK">LOOK</option>
            <option value="C-LOOK">C-LOOK</option>
          </select>
        </div>

        {isDirectional && (
          <div>
            <label className="block text-sm font-semibold mb-2">Direction</label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as any)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              data-testid="disk-dir-select"
            >
              <option value="LEFT">LEFT (Towards 0)</option>
              <option value="RIGHT">RIGHT (Towards max)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2">Initial Head</label>
          <input
            type="number"
            min="0"
            value={initialHeadPosition}
            onChange={e => setInitialHeadPosition(parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            data-testid="disk-head-input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Disk Size</label>
          <input
            type="number"
            min="1"
            value={diskSize}
            onChange={e => setDiskSize(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            data-testid="disk-size-input"
          />
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        data-testid="disk-simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Disk'}
      </button>
    </div>
  );
}
