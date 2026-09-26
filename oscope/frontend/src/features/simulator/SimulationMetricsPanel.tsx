import { useSimulatorStore } from '../../store/useSimulatorStore';

export function SimulationMetricsPanel() {
  const { result } = useSimulatorStore();

  if (!result) return null;

  let csCount = 0;
  let csTime = 0;
  result.gantt_chart.forEach(ev => {
    if (ev.process_id === 'CS') {
      csCount++;
      csTime += (ev.end_time - ev.start_time);
    }
  });

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Simulation Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Avg Wait Time" value={result.metrics.average_waiting_time.toFixed(2)} testId="metric-awt" />
        <MetricCard label="Avg Turnaround" value={result.metrics.average_turnaround_time.toFixed(2)} testId="metric-atat" />
        <MetricCard label="Avg Response" value={result.metrics.average_response_time.toFixed(2)} testId="metric-art" />
        <MetricCard label="CPU Util (%)" value={result.metrics.cpu_utilization.toFixed(1)} testId="metric-util" />
        <MetricCard label="Throughput" value={result.metrics.throughput.toFixed(3)} testId="metric-throughput" />
        {(csCount > 0) && <MetricCard label="CS Count" value={csCount.toString()} testId="metric-cscount" />}
        {(csTime > 0) && <MetricCard label="CS Time" value={csTime.toString()} testId="metric-cstime" />}
      </div>
    </div>
  );
}

function MetricCard({ label, value, testId }: { label: string, value: string, testId: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 flex flex-col items-center justify-center text-center">
      <span className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-slate-800" data-testid={testId}>{value}</span>
    </div>
  );
}
