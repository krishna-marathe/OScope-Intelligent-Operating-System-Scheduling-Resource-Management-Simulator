import { useState } from 'react';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function WorkloadEditor() {
  const { processes, addProcess, removeProcess, clearProcesses } = useSimulatorStore();
  const [id, setId] = useState('');
  const [arrival, setArrival] = useState(0);
  const [burst, setBurst] = useState(1);
  const [priority, setPriority] = useState(0);

  const handleAdd = () => {
    if (!id || burst <= 0) return;
    addProcess({ id, arrival_time: arrival, burst_time: burst, priority });
    setId('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input placeholder="ID" value={id} onChange={e => setId(e.target.value)} className="border p-2 w-full" data-testid="input-id" />
        <input type="number" placeholder="Arrival" value={arrival} onChange={e => setArrival(Number(e.target.value))} className="border p-2 w-full" data-testid="input-arrival" />
        <input type="number" placeholder="Burst" value={burst} onChange={e => setBurst(Number(e.target.value))} className="border p-2 w-full" data-testid="input-burst" />
        <input type="number" placeholder="Priority" value={priority} onChange={e => setPriority(Number(e.target.value))} className="border p-2 w-full" data-testid="input-priority" />
        <button onClick={handleAdd} className="bg-green-600 text-white px-4 rounded" data-testid="add-btn">Add</button>
      </div>
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
              <td>{p.burst_time}</td>
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
