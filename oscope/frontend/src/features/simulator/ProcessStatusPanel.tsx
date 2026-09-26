import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ProcessStatusPanel() {
  const { processes, result, currentTime } = useSimulatorStore();

  if (!result || processes.length === 0) return null;

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Process Status</h3>
      <table className="w-full text-left bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3">Process ID</th>
            <th className="p-3">Status</th>
            <th className="p-3">Remaining Time</th>
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
               result.gantt_chart.forEach(ev => {
                 if (ev.process_id === p.id && ev.start_time <= currentTime) {
                   const execInBlock = Math.min(ev.end_time, currentTime) - ev.start_time;
                   executed += execInBlock;
                   if (currentTime >= ev.start_time && currentTime < ev.end_time) {
                     isRunning = true;
                   }
                 }
               });
               
               remaining = Math.max(0, p.burst_time - executed);
               if (remaining === 0) status = 'Completed';
               else if (isRunning) status = 'Running';
               else if (executed > 0) status = 'Ready (Preempted)';
               else status = 'Ready';
            }

            return (
              <tr key={p.id} className="border-b last:border-b-0" data-testid={`status-row-${p.id}`}>
                <td className="p-3 font-semibold">{p.id}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${status === 'Completed' ? 'bg-green-100 text-green-800' : status === 'Running' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                    {status}
                  </span>
                </td>
                <td className="p-3 font-mono">{remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
