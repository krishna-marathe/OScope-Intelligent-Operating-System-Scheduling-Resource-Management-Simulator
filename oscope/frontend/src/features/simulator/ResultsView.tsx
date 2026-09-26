import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ResultsView() {
  const { result } = useSimulatorStore();

  if (!result) return <p className="text-slate-500">No results yet. Run a simulation.</p>;

  return (
    <div>
      <div className="mb-6">
        <h4 className="font-bold mb-2">Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded border" data-testid="metric-awt">
            Avg Wait: {result.metrics.average_waiting_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border" data-testid="metric-atat">
            Avg TAT: {result.metrics.average_turnaround_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            Avg RT: {result.metrics.average_response_time.toFixed(2)}
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            Util: {result.metrics.cpu_utilization.toFixed(1)}%
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-2">Timeline</h4>
        <div className="flex gap-1 overflow-x-auto pb-2" data-testid="gantt-chart">
          {result.gantt_chart.map((event, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[60px]">
              <div className={`w-full py-2 text-center text-white text-xs rounded ${event.process_id === 'IDLE' ? 'bg-slate-400' : 'bg-blue-600'}`}>
                {event.process_id}
              </div>
              <div className="text-xs mt-1 text-slate-500">
                {event.start_time}-{event.end_time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
