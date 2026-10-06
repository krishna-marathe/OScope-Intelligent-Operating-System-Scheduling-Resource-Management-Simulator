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
    <div>
      <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm font-medium">
              <input 
                  type="checkbox" 
                  checked={isAdvanced} 
                  onChange={e => setIsAdvanced(e.target.checked)} 
                  data-testid="toggle-advanced"
              />
              CPU/I/O Burst Mode
          </label>
      </div>

      <div className="flex gap-2 mb-4 items-start">
        <input placeholder="ID" value={id} onChange={e => setId(e.target.value)} className="border p-2 w-24" data-testid="input-id" />
        <input type="number" placeholder="Arrival" value={arrival} onChange={e => setArrival(Number(e.target.value))} className="border p-2 w-24" data-testid="input-arrival" />
        
        {!isAdvanced ? (
            <input type="number" placeholder="Burst" value={burst} onChange={e => setBurst(Number(e.target.value))} className="border p-2 w-24" data-testid="input-burst" />
        ) : (
            <div className="flex flex-col gap-2 border p-2 rounded bg-gray-50" data-testid="burst-sequence-editor">
                <div className="flex flex-wrap gap-2 items-center">
                    {burstSequence.map((b, i) => (
                        <div key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-gray-400">→</span>}
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500 font-bold">{i % 2 === 0 ? 'CPU' : 'I/O'}</span>
                                <input 
                                    type="number" 
                                    value={b} 
                                    onChange={e => updateBurstSequence(i, Number(e.target.value))} 
                                    className="border p-1 w-16 text-center"
                                    data-testid={`input-burst-${i}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={handleAddBurst} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" data-testid="add-burst-btn">
                        Add {burstSequence.length % 2 === 0 ? 'CPU' : 'I/O'} Burst
                    </button>
                    {burstSequence.length > 1 && (
                        <button onClick={handleRemoveBurst} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded" data-testid="remove-burst-btn">
                            Remove Last
                        </button>
                    )}
                </div>
            </div>
        )}

        <input type="number" placeholder="Priority" value={priority} onChange={e => setPriority(Number(e.target.value))} className="border p-2 w-24" data-testid="input-priority" />
        <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded" data-testid="add-btn">Add</button>
      </div>
      
      {error && <div className="text-red-600 text-sm mb-4" data-testid="error-msg">{error}</div>}
      
      <button onClick={clearProcesses} className="text-red-600 mb-4 text-sm">Clear All</button>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-2">ID</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Priority</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(p => (
            <tr key={p.id} className="border-b" data-testid={`row-${p.id}`}>
              <td className="p-2">{p.id}</td>
              <td>{p.arrival_time}</td>
              <td>
                {p.burst_sequence ? (
                  <span data-testid={`seq-${p.id}`}>
                    {p.burst_sequence.map((b, i) => `${i % 2 === 0 ? 'CPU' : 'IO'} [${b}]`).join(' → ')}
                  </span>
                ) : (
                  p.burst_time
                )}
              </td>
              <td>{p.priority}</td>
              <td>
                <button onClick={() => removeProcess(p.id)} className="text-red-600">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
