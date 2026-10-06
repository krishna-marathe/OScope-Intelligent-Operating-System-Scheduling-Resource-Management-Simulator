import { useSimulatorStore } from '../../store/useSimulatorStore';


export function AlgorithmSelector() {
  const { 
    algorithm, setAlgorithm, 
    timeQuantum, setTimeQuantum,
    contextSwitchCost, setContextSwitchCost,
    processes,
    mlqConfig, setMlqConfig,
    mlfqConfig, setMlfqConfig
  } = useSimulatorStore();

  const handleMlqProcessAssignment = (pid: string, qid: number) => {
    if (!mlqConfig) return;
    setMlqConfig({
      ...mlqConfig,
      process_assignments: { ...mlqConfig.process_assignments, [pid]: qid }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1">Algorithm</label>
        <select 
          value={algorithm} 
          onChange={e => {
            const val = e.target.value;
            setAlgorithm(val);
            if (val === 'MLQ' && !mlqConfig) {
              setMlqConfig({
                queues: [
                  { id: 1, priority: 1, policy: 'RR', time_quantum: 2 },
                  { id: 2, priority: 2, policy: 'FCFS' }
                ],
                process_assignments: {},
                inter_queue_policy: 'FIXED_PRIORITY'
              });
            } else if (val === 'MLFQ' && !mlfqConfig) {
              setMlfqConfig({
                queues: [
                  { id: 1, priority: 1, policy: 'RR', time_quantum: 2 },
                  { id: 2, priority: 2, policy: 'RR', time_quantum: 4 },
                  { id: 3, priority: 3, policy: 'FCFS' }
                ]
              });
            }
          }}
          className="border p-2 w-full rounded"
          data-testid="algo-select"
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="PRIORITY_NP">Priority (Non-Preemptive)</option>
          <option value="PRIORITY_P">Priority (Preemptive)</option>
          <option value="MLQ">Multilevel Queue (MLQ)</option>
          <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
        </select>
      </div>

      {(algorithm === 'MLQ' || algorithm === 'MLFQ') && (
        <div>
          <label className="block mb-1">Context Switch Cost</label>
          <input 
            type="number" 
            min="0"
            value={contextSwitchCost || 0} 
            onChange={e => setContextSwitchCost(Number(e.target.value))}
            className="border p-2 w-full rounded"
            data-testid="cs-cost-input"
            title="Time units added when switching processes"
          />
        </div>
      )}

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

      {algorithm === 'MLQ' && mlqConfig && (
        <div className="border p-4 rounded bg-slate-50 space-y-4">
          <h4 className="font-bold">MLQ Configuration</h4>
          <div>
            <h5 className="font-semibold mb-2">Queues</h5>
            {mlqConfig.queues.map((q, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <span className="w-8">Q{q.id}</span>
                <select 
                  value={q.policy}
                  onChange={e => {
                    const newQs = [...mlqConfig.queues];
                    newQs[idx].policy = e.target.value;
                    setMlqConfig({ ...mlqConfig, queues: newQs });
                  }}
                  className="border p-1 rounded"
                >
                  <option value="FCFS">FCFS</option>
                  <option value="RR">RR</option>
                </select>
                {q.policy === 'RR' && (
                  <input 
                    type="number" min="1" placeholder="Quantum"
                    value={q.time_quantum || ''}
                    onChange={e => {
                      const newQs = [...mlqConfig.queues];
                      newQs[idx].time_quantum = Number(e.target.value);
                      setMlqConfig({ ...mlqConfig, queues: newQs });
                    }}
                    className="border p-1 rounded w-20"
                  />
                )}
              </div>
            ))}
          </div>
          <div>
            <h5 className="font-semibold mb-2">Process Assignments</h5>
            {processes.length === 0 ? (
              <p className="text-xs text-slate-500">No processes added yet.</p>
            ) : (
              processes.map(p => (
                <div key={p.id} className="flex gap-2 items-center mb-1 text-sm">
                  <span className="w-16">{p.id}</span>
                  <select
                    value={mlqConfig.process_assignments[p.id] || ''}
                    onChange={e => handleMlqProcessAssignment(p.id, Number(e.target.value))}
                    className="border p-1 rounded"
                  >
                    <option value="" disabled>Select Queue</option>
                    {mlqConfig.queues.map(q => (
                      <option key={q.id} value={q.id}>Q{q.id}</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {algorithm === 'MLFQ' && mlfqConfig && (
        <div className="border p-4 rounded bg-slate-50 space-y-4">
          <h4 className="font-bold">MLFQ Configuration</h4>
          <div>
            <h5 className="font-semibold mb-2">Queues</h5>
            {mlfqConfig.queues.map((q, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <span className="w-8">Q{q.id}</span>
                <select 
                  value={q.policy}
                  onChange={e => {
                    const newQs = [...mlfqConfig.queues];
                    newQs[idx].policy = e.target.value;
                    setMlfqConfig({ ...mlfqConfig, queues: newQs });
                  }}
                  className="border p-1 rounded"
                >
                  <option value="FCFS">FCFS</option>
                  <option value="RR">RR</option>
                </select>
                {q.policy === 'RR' && (
                  <input 
                    type="number" min="1" placeholder="Quantum"
                    value={q.time_quantum || ''}
                    onChange={e => {
                      const newQs = [...mlfqConfig.queues];
                      newQs[idx].time_quantum = Number(e.target.value);
                      setMlfqConfig({ ...mlfqConfig, queues: newQs });
                    }}
                    className="border p-1 rounded w-20"
                  />
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Priority Boost Interval</label>
            <input 
              type="number" min="0" placeholder="Optional"
              value={mlfqConfig.boost_interval || ''}
              onChange={e => setMlfqConfig({ ...mlfqConfig, boost_interval: e.target.value ? Number(e.target.value) : undefined })}
              className="border p-2 w-full rounded"
              title="Time units before all processes are promoted to the highest priority queue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
