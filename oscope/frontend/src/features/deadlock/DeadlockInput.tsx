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
    <div className="bg-slate-50 p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Deadlock Configuration</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 font-medium p-3 rounded-md mb-4 text-sm border border-red-100" data-testid="deadlock-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Process Count</label>
          <input
            type="number" min="1" max="20"
            value={processCount}
            onChange={e => handleProcessCountChange(parseInt(e.target.value) || 1)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
            data-testid="process-count"
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resource Count</label>
          <input
            type="number" min="1" max="10"
            value={resourceCount}
            onChange={e => handleResourceCountChange(parseInt(e.target.value) || 1)}
            className="w-full border border-slate-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
            data-testid="resource-count"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Available Resources</label>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2">
            {available.map((val, j) => (
              <div key={`avail-${j}`} className="flex flex-col items-center min-w-[3.5rem]">
                <span className="text-[10px] font-bold text-slate-400 mb-1">R{j}</span>
                <input
                  type="number" min="0" value={val}
                  onChange={e => updateArray('available', j, parseInt(e.target.value))}
                  className="w-14 border border-slate-300 p-2 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  data-testid={`avail-${j}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-6 mb-6">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Allocation Matrix</label>
          <div className="overflow-x-auto pb-2">
            <div className="flex flex-col gap-2 min-w-max">
              {allocation.map((row, i) => (
                <div key={`alloc-row-${i}`} className="flex gap-2 items-center">
                  <span className="w-6 text-xs font-bold text-slate-400">P{i}</span>
                  {row.map((val, j) => (
                    <input key={`alloc-${i}-${j}`}
                      type="number" min="0" value={val}
                      onChange={e => updateMatrix('allocation', i, j, parseInt(e.target.value))}
                      className="w-12 border border-slate-300 p-1.5 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                      title={`P${i} R${j}`}
                      data-testid={`alloc-${i}-${j}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Maximum Matrix</label>
          <div className="overflow-x-auto pb-2">
            <div className="flex flex-col gap-2 min-w-max">
              {maximum.map((row, i) => (
                <div key={`max-row-${i}`} className="flex gap-2 items-center">
                  <span className="w-6 text-xs font-bold text-slate-400">P{i}</span>
                  {row.map((val, j) => (
                    <input key={`max-${i}-${j}`}
                      type="number" min="0" value={val}
                      onChange={e => updateMatrix('maximum', i, j, parseInt(e.target.value))}
                      className="w-12 border border-slate-300 p-1.5 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                      title={`P${i} R${j}`}
                      data-testid={`max-${i}-${j}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-slate-200 pt-5">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input 
            type="checkbox" 
            id="reqToggle"
            checked={requestEnabled}
            onChange={e => setRequestEnabled(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            data-testid="req-toggle"
          />
          <span className="text-sm font-semibold text-slate-700">Simulate Resource Request</span>
        </label>
        
        {requestEnabled && (
          <div className="flex flex-col space-y-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-blue-700/70 uppercase tracking-wider">Target Process</label>
              <select 
                value={reqProcessId}
                onChange={e => setReqProcessId(parseInt(e.target.value))}
                className="w-full border border-blue-200 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-sm outline-none"
                data-testid="req-process"
              >
                {Array.from({length: processCount}).map((_, i) => (
                  <option key={i} value={i}>Process P{i}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-blue-700/70 uppercase tracking-wider">Request Vector</label>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2">
                  {reqVector.map((val, j) => (
                    <div key={`req-${j}`} className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-[10px] font-bold text-blue-500/70 mb-1">R{j}</span>
                      <input
                        type="number" min="0" value={val}
                        onChange={e => updateArray('request', j, parseInt(e.target.value))}
                        className="w-12 border border-blue-200 p-2 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        data-testid={`req-val-${j}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        data-testid="deadlock-simulate-btn"
      >
        {loading ? 'Simulating...' : 'Simulate Safety Algorithm'}
      </button>
    </div>
  );
}
