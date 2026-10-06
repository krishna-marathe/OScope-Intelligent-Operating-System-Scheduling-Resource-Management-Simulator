import { useSimulatorStore } from '../../store/useSimulatorStore';

export function LifecycleTimeline() {
  const { result, currentTime } = useSimulatorStore();

  if (!result || !result.lifecycles || result.lifecycles.length === 0) {
    return null;
  }

  // Group by process_id
  const grouped = result.lifecycles.reduce((acc, ev) => {
    if (!acc[ev.process_id]) acc[ev.process_id] = [];
    acc[ev.process_id].push(ev);
    return acc;
  }, {} as Record<string, typeof result.lifecycles>);

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Process Lifecycle</h3>
      <div className="space-y-4">
        {Object.entries(grouped).map(([pid, events]) => (
          <div key={pid} className="bg-white rounded-lg shadow border border-slate-100 p-4">
            <h4 className="font-bold text-md mb-2">Process {pid}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-2">State</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, idx) => {
                    const isFuture = currentTime < ev.start_time;
                    
                    let stateColor = 'bg-slate-100 text-slate-800';
                    if (ev.state === 'NEW') stateColor = 'bg-purple-100 text-purple-800';
                    if (ev.state === 'READY') stateColor = 'bg-yellow-100 text-yellow-800';
                    if (ev.state === 'RUNNING') stateColor = 'bg-blue-100 text-blue-800';
                    if (ev.state === 'BLOCKED') stateColor = 'bg-orange-100 text-orange-800';
                    if (ev.state === 'TERMINATED') stateColor = 'bg-green-100 text-green-800';

                    let opacity = isFuture ? 'opacity-30' : 'opacity-100';

                    const isCurrentState = (currentTime >= ev.start_time && currentTime < ev.end_time) || 
                                           (ev.duration === 0 && currentTime >= ev.start_time && (idx === events.length - 1 || currentTime < events[idx+1].start_time));
                    
                    return (
                      <tr key={idx} className={`border-b last:border-0 transition-colors ${isCurrentState ? 'bg-blue-50' : ''} ${opacity}`} data-testid={`lifecycle-${pid}-${ev.state}-${idx}`}>
                        <td className="p-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${stateColor}`}>
                            {ev.state}
                          </span>
                        </td>
                        <td className="p-2 font-mono">{ev.start_time}</td>
                        <td className="p-2 font-mono">{ev.end_time}</td>
                        <td className="p-2 font-mono">{ev.duration}</td>
                        <td className="p-2 text-slate-600 truncate max-w-xs" title={ev.transition_reason}>{ev.transition_reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
