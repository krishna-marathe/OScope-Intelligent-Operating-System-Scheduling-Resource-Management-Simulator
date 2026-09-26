import { PlaybackControls } from './PlaybackControls';
import { GanttChart } from './GanttChart';
import { ProcessStatusPanel } from './ProcessStatusPanel';
import { SimulationMetricsPanel } from './SimulationMetricsPanel';
import { useSimulatorStore } from '../../store/useSimulatorStore';

export function ResultsView() {
  const { result } = useSimulatorStore();

  if (!result) return <p className="text-slate-500" data-testid="empty-results">No results yet. Run a simulation.</p>;

  return (
    <div>
      <SimulationMetricsPanel />
      <PlaybackControls />
      <GanttChart />
      <ProcessStatusPanel />
    </div>
  );
}
