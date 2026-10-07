import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function WorkloadEditor() {
  const { processes, addProcess, removeProcess, clearProcesses } = useSimulatorStore();
  const [id, setId] = useState('');
  const [arrival, setArrival] = useState(0);
  const [priority, setPriority] = useState(0);
  
  // CPU only state
  const [burst, setBurst] = useState(1);
  
  // Advanced state
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [burstSequence, setBurstSequence] = useState<number[]>([1]);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    if (!id) {
        setError("Process ID is required");
        return;
    }
    
    if (processes.some(p => p.id === id)) {
        setError("Duplicate process ID");
        return;
    }

    if (isAdvanced) {
        if (burstSequence.length === 0) {
            setError("Sequence must contain at least one burst");
            return;
        }
        if (burstSequence.length % 2 === 0) {
            setError("Sequence must end with CPU");
            return;
        }
        if (burstSequence.some(b => isNaN(b) || b <= 0 || !isFinite(b))) {
            setError("All burst durations must be positive numbers");
            return;
        }
        const totalBurst = burstSequence.reduce((acc, curr) => acc + curr, 0);
        addProcess({ 
            id, 
            arrival_time: arrival, 
            burst_time: totalBurst, 
            priority,
            burst_sequence: burstSequence 
        });
    } else {
        if (isNaN(burst) || burst <= 0 || !isFinite(burst)) {
            setError("Burst duration must be positive");
            return;
        }
        addProcess({ id, arrival_time: arrival, burst_time: burst, priority });
    }
    setId('');
  };

  const handleAddBurst = () => {
      setBurstSequence([...burstSequence, 1]);
  };

  const handleRemoveBurst = () => {
      if (burstSequence.length > 1) {
          setBurstSequence(burstSequence.slice(0, -1));
      }
  };

  const updateBurstSequence = (index: number, value: number) => {
      const newSeq = [...burstSequence];
      newSeq[index] = value;
      setBurstSequence(newSeq);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">New Process</h4>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input 
                  type="checkbox" 
                  checked={isAdvanced} 
                  onChange={e => setIsAdvanced(e.target.checked)} 
                  data-testid="toggle-advanced"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              CPU/I/O Burst Mode
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Process ID</label>
            <input value={id} onChange={e => setId(e.target.value)} className="w-full border border-slate-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" data-testid="input-id" />
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival</label>
            <input type="number" min="0" value={arrival} onChange={e => setArrival(Number(e.target.value))} className="w-full border border-slate-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" data-testid="input-arrival" />
          </div>
          
          <div className="flex flex-col space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Burst</label>
            {!isAdvanced ? (
                <input type="number" min="1" value={burst} onChange={e => setBurst(Number(e.target.value))} className="w-full border border-slate-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" data-testid="input-burst" />
            ) : (
                <div className="flex flex-col gap-3 border border-slate-300 p-3 rounded-md bg-white shadow-inner" data-testid="burst-sequence-editor">
                    <div className="flex flex-wrap gap-2 items-center">
                        {burstSequence.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {i > 0 && <span className="text-slate-400 font-bold">→</span>}
                                <div className="flex flex-col items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{i % 2 === 0 ? 'CPU' : 'I/O'}</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={b} 
                                        onChange={e => updateBurstSequence(i, Number(e.target.value))} 
                                        className="border border-slate-300 p-1 w-16 text-center rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                        data-testid={`input-burst-${i}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAddBurst} className="text-xs font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded transition-colors" data-testid="add-burst-btn">
                            + Add {burstSequence.length % 2 === 0 ? 'CPU' : 'I/O'} Burst
                        </button>
                        {burstSequence.length > 1 && (
                            <button onClick={handleRemoveBurst} className="text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded transition-colors" data-testid="remove-burst-btn">
                                Remove Last
                            </button>
                        )}
                    </div>
                </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
            <input type="number" min="0" value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full border border-slate-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" data-testid="input-priority" />
          </div>
        </div>

        {error && <div className="text-red-600 text-sm font-medium mb-4 bg-red-50 p-2 rounded border border-red-100" data-testid="error-msg">{error}</div>}
        
        <button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-md transition-colors shadow-sm" data-testid="add-btn">
          Add Process
        </button>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Processes</h4>
          {processes.length > 0 && (
            <button onClick={clearProcesses} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider">Clear All</button>
          )}
        </div>
        
        {processes.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
            <p className="text-sm text-slate-500 font-medium">No processes defined.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 font-semibold border-b border-slate-200">ID</th>
                  <th className="p-3 font-semibold border-b border-slate-200">Arrival</th>
                  <th className="p-3 font-semibold border-b border-slate-200">Burst</th>
                  <th className="p-3 font-semibold border-b border-slate-200">Priority</th>
                  <th className="p-3 font-semibold border-b border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-${p.id}`}>
                    <td className="p-3 font-medium text-slate-800">{p.id}</td>
                    <td className="p-3 text-slate-600">{p.arrival_time}</td>
                    <td className="p-3 text-slate-600">
                      {p.burst_sequence ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]" data-testid={`seq-${p.id}`}>
                          {p.burst_sequence.map((b, i) => (
                            <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${i % 2 === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {i % 2 === 0 ? 'CPU' : 'I/O'} {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        p.burst_time
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{p.priority}</td>
                    <td className="p-3">
                      <button onClick={() => removeProcess(p.id)} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
