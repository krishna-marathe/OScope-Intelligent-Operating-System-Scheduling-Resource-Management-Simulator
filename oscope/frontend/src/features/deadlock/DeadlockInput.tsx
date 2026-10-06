import { useState } from 'react';
import { useDeadlockStore } from '../../store/useDeadlockStore';
import { api } from '../../services/api';

export function DeadlockInput() {
  const {
    processCount, resourceCount, available, allocation, maximum,
    setProcessCount, setResourceCount, setAvailable, setAllocation, setMaximum,
    setResult, setLoading, setError, loading, error
  } = useDeadlockStore();

  const [requestEnabled, setRequestEnabled] = useState(false);
  const [reqProcessId, setReqProcessId] = useState(0);
  const [reqVector, setReqVector] = useState<number[]>(Array(resourceCount).fill(0));

  const handleProcessCountChange = (val: number) => {
    if (val < 1) return;
    
    const newAlloc = [...allocation];
    const newMax = [...maximum];
    
    if (val > processCount) {
      for (let i = processCount; i < val; i++) {
        newAlloc.push(Array(resourceCount).fill(0));
        newMax.push(Array(resourceCount).fill(0));
      }
    } else {
      newAlloc.length = val;
      newMax.length = val;
    }
    
    setProcessCount(val);
    setAllocation(newAlloc);
    setMaximum(newMax);
    if (reqProcessId >= val) setReqProcessId(0);
  };

  const handleResourceCountChange = (val: number) => {
    if (val < 1) return;
    
    const newAvail = [...available];
    if (val > resourceCount) {
      for (let i = resourceCount; i < val; i++) {
        newAvail.push(0);
      }
    } else {
      newAvail.length = val;
    }
    setAvailable(newAvail);
    
    const newAlloc = allocation.map(row => {
      const r = [...row];
      if (val > resourceCount) {
        for (let i = resourceCount; i < val; i++) r.push(0);
      } else {
        r.length = val;
      }
      return r;
    });
    setAllocation(newAlloc);
    
    const newMax = maximum.map(row => {
      const r = [...row];
      if (val > resourceCount) {
        for (let i = resourceCount; i < val; i++) r.push(0);
      } else {
        r.length = val;
      }
      return r;
    });
    setMaximum(newMax);
    
    const newReq = [...reqVector];
    if (val > resourceCount) {
      for (let i = resourceCount; i < val; i++) newReq.push(0);
    } else {
      newReq.length = val;
    }
    setReqVector(newReq);
    
    setResourceCount(val);
  };

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.simulateDeadlock({
        process_count: processCount,
        resource_count: resourceCount,
        available,
        allocation,
        maximum,
        resource_request: requestEnabled ? {
          process_id: reqProcessId,
          request: reqVector
        } : undefined
      });
      
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const updateMatrix = (matrixType: 'allocation' | 'maximum', r: number, c: number, val: number) => {
    if (isNaN(val) || val < 0) val = 0;
    if (matrixType === 'allocation') {
      const newM = [...allocation];
      newM[r][c] = val;
      setAllocation(newM);
    } else {
      const newM = [...maximum];
      newM[r][c] = val;
      setMaximum(newM);
    }
  };

  const updateArray = (arrType: 'available' | 'request', c: number, val: number) => {
    if (isNaN(val) || val < 0) val = 0;
    if (arrType === 'available') {
      const newA = [...available];
      newA[c] = val;
      setAvailable(newA);
    } else {
      const newR = [...reqVector];
      newR[c] = val;
      setReqVector(newR);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h2 className="text-xl font-bold mb-4">Deadlock Configuration</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm" data-testid="deadlock-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Process Count</label>
          <input
            type="number" min="1" max="20"
            value={processCount}
            onChange={e => handleProcessCountChange(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded"
            data-testid="process-count"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Resource Count</label>
          <input
            type="number" min="1" max="10"
            value={resourceCount}
            onChange={e => handleResourceCountChange(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded"
            data-testid="resource-count"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Available Resources</label>
        <div className="flex gap-2">
          {available.map((val, j) => (
            <input key={`avail-${j}`}
              type="number" min="0" value={val}
              onChange={e => updateArray('available', j, parseInt(e.target.value))}
              className="w-16 p-2 border rounded text-center"
              data-testid={`avail-${j}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Allocation Matrix</label>
          <div className="flex flex-col gap-1">
            {allocation.map((row, i) => (
              <div key={`alloc-row-${i}`} className="flex gap-2 items-center">
                <span className="w-8 text-sm text-slate-500 font-mono">P{i}</span>
                {row.map((val, j) => (
                  <input key={`alloc-${i}-${j}`}
                    type="number" min="0" value={val}
                    onChange={e => updateMatrix('allocation', i, j, parseInt(e.target.value))}
                    className="w-12 p-1 border rounded text-center text-sm"
                    data-testid={`alloc-${i}-${j}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Maximum Matrix</label>
          <div className="flex flex-col gap-1">
            {maximum.map((row, i) => (
              <div key={`max-row-${i}`} className="flex gap-2 items-center">
                <span className="w-8 text-sm text-slate-500 font-mono">P{i}</span>
                {row.map((val, j) => (
                  <input key={`max-${i}-${j}`}
                    type="number" min="0" value={val}
                    onChange={e => updateMatrix('maximum', i, j, parseInt(e.target.value))}
                    className="w-12 p-1 border rounded text-center text-sm"
                    data-testid={`max-${i}-${j}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 border-t pt-4">
        <div className="flex items-center gap-2 mb-4">
          <input 
            type="checkbox" 
            id="reqToggle"
            checked={requestEnabled}
            onChange={e => setRequestEnabled(e.target.checked)}
            data-testid="req-toggle"
          />
          <label htmlFor="reqToggle" className="font-semibold text-sm">Simulate Resource Request</label>
        </div>
        
        {requestEnabled && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded">
            <div>
              <label className="block text-xs font-semibold mb-1">Process</label>
              <select 
                value={reqProcessId}
                onChange={e => setReqProcessId(parseInt(e.target.value))}
                className="p-2 border rounded bg-white text-sm"
                data-testid="req-process"
              >
                {Array.from({length: processCount}).map((_, i) => (
                  <option key={i} value={i}>P{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Request Vector</label>
              <div className="flex gap-2">
                {reqVector.map((val, j) => (
                  <input key={`req-${j}`}
                    type="number" min="0" value={val}
                    onChange={e => updateArray('request', j, parseInt(e.target.value))}
                    className="w-16 p-2 border rounded text-center text-sm"
                    data-testid={`req-val-${j}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        data-testid="deadlock-simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Safety'}
      </button>
    </div>
  );
}
