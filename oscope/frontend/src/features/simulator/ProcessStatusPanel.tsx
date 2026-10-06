import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ProcessStatusPanel() {
  const { processes, result, currentTime } = useSimulatorStore();

  if (!result || processes.length === 0) return null;

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Process Status & Metrics</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg shadow overflow-hidden whitespace-nowrap">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Process ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Remaining Time</th>
              <th className="p-3">Wait Time</th>
              <th className="p-3">Blocked (I/O)</th>
              <th className="p-3">Response Time</th>
              <th className="p-3">Turnaround Time</th>
              <th className="p-3">Completion Time</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(p => {
              // Calculate status and remaining time based on Gantt Chart up to currentTime
              let remaining = p.burst_time;
              let status = currentTime < p.arrival_time ? 'Pending' : 'Pending';
              
              if (currentTime >= p.arrival_time) {
                 // sum execution time up to currentTime
                 let executed = 0;
                 let isRunning = false;
                 let isBlocked = false;
                 result.gantt_chart.forEach(ev => {
                   if (ev.process_id === p.id && ev.start_time <= currentTime) {
                     const execInBlock = Math.min(ev.end_time, currentTime) - ev.start_time;
                     executed += execInBlock;
                     if (currentTime >= ev.start_time && currentTime < ev.end_time) {
                       if (ev.event_type === 'IO') {
                         isBlocked = true;
                       } else {
                         isRunning = true;
                       }
                     }
                   }
                 });
                 
                 remaining = Math.max(0, p.burst_time - executed);
                 if (remaining === 0) status = 'Completed';
                 else if (isRunning) status = 'Running';
                 else if (isBlocked) status = 'Blocked (I/O)';
                 else if (executed > 0) status = 'Ready (Preempted)';
                 else status = 'Ready';
              }

              const pm = result.metrics.process_metrics.find(m => m.process_id === p.id);

              return (
                <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50" data-testid={`status-row-${p.id}`}>
                  <td className="p-3 font-semibold">{p.id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      status === 'Running' ? 'bg-blue-100 text-blue-800' : 
                      status === 'Blocked (I/O)' ? 'bg-orange-100 text-orange-800' : 
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{remaining}</td>
                  <td className="p-3 font-mono" data-testid={`metric-wait-${p.id}`}>{pm?.waiting_time ?? '-'}</td>
                  <td className="p-3 font-mono" data-testid={`metric-blocked-${p.id}`}>{pm?.blocked_time ?? (pm?.io_time ?? '-')}</td>
                  <td className="p-3 font-mono" data-testid={`metric-response-${p.id}`}>{pm?.response_time ?? '-'}</td>
                  <td className="p-3 font-mono" data-testid={`metric-tat-${p.id}`}>{pm?.turnaround_time ?? '-'}</td>
                  <td className="p-3 font-mono" data-testid={`metric-comp-${p.id}`}>{pm?.completion_time ?? '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
