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
    <div className="bg-slate-50 p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Disk Configuration</h3>
      
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Algorithm</label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
            data-testid="disk-algo-select"
          >
            <option value="FCFS">FCFS (First-Come, First-Served)</option>
            <option value="SSTF">SSTF (Shortest Seek Time First)</option>
            <option value="SCAN">SCAN (Elevator)</option>
            <option value="C-SCAN">C-SCAN (Circular SCAN)</option>
            <option value="LOOK">LOOK</option>
            <option value="C-LOOK">C-LOOK (Circular LOOK)</option>
          </select>
        </div>

        {isDirectional && (
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direction</label>
            <select
              value={direction}
              onChange={e => setDirection(e.target.value as any)}
              className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
              data-testid="disk-dir-select"
            >
              <option value="LEFT">LEFT (Towards 0)</option>
              <option value="RIGHT">RIGHT (Towards max)</option>
            </select>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Head</label>
            <input
              type="number"
              min="0"
              value={initialHeadPosition}
              onChange={e => setInitialHeadPosition(parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
              data-testid="disk-head-input"
            />
          </div>

          <div className="flex-1 flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disk Size</label>
            <input
              type="number"
              min="1"
              value={diskSize}
              onChange={e => setDiskSize(parseInt(e.target.value) || 1)}
              className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
              data-testid="disk-size-input"
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request Queue</label>
          <input
            type="text"
            value={requestQueue}
            onChange={e => setRequestQueue(e.target.value)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
            placeholder="e.g. 98, 183, 37, 122"
            data-testid="disk-queue-input"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 font-medium p-3 rounded-md mb-4 text-sm border border-red-100" data-testid="disk-error">
          {error}
        </div>
      )}

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        data-testid="disk-simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Disk'}
      </button>
    </div>
  );
}
