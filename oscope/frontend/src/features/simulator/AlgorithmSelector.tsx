import { useSimulatorStore } from '../../store/useSimulatorStore';

export function AlgorithmSelector() {
  const { algorithm, setAlgorithm, timeQuantum, setTimeQuantum } = useSimulatorStore();

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1">Algorithm</label>
        <select 
          value={algorithm} 
          onChange={e => setAlgorithm(e.target.value)}
          className="border p-2 w-full rounded"
          data-testid="algo-select"
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="PRIORITY_NP">Priority (Non-Preemptive)</option>
          <option value="PRIORITY_P">Priority (Preemptive)</option>
        </select>
      </div>
      {algorithm === 'RR' && (
        <div>
          <label className="block mb-1">Time Quantum</label>
          <input 
            type="number" 
            min="1"
            value={timeQuantum} 
            onChange={e => setTimeQuantum(Number(e.target.value))}
            className="border p-2 w-full rounded"
            data-testid="tq-input"
          />
        </div>
      )}
    </div>
  );
}
