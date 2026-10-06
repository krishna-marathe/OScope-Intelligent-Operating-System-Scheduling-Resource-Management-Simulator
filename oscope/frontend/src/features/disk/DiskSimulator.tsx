import { DiskInput } from './DiskInput';
import { DiskVisualization } from './DiskVisualization';
import { DiskMetrics } from './DiskMetrics';
import { DiskStepControls } from './DiskStepControls';
import { SimulationWorkspace } from '../simulation/SimulationWorkspace';
import { SimulationViewport } from '../simulation/SimulationViewport';
import { useDiskStore } from '../../store/useDiskStore';
import { Panel } from '../../components/ui/Panel';
import { ActionButton } from '../../components/ui/ActionButton';

export function DiskSimulator() {
  const { result, setRequestQueue, setInitialHeadPosition, setResult, setError } = useDiskStore();

  const handleReset = () => {
    setRequestQueue('98, 183, 37, 122, 14, 124, 65, 67');
    setInitialHeadPosition(53);
    setResult(null);
    setError(null);
  };

  const configPanel = (
    <Panel title="DISK CONFIGURATION">
      <DiskInput />
    </Panel>
  );

  const visualizationPanel = (
    <>
      <SimulationViewport 
        title="HEAD MOVEMENT VISUALIZATION" 
        status={result ? 'COMPLETED' : 'IDLE'}
      >
        <DiskStepControls />
        <DiskVisualization />
      </SimulationViewport>
      <div className={result ? 'block' : 'hidden'}>
        <DiskMetrics />
      </div>
    </>
  );

  const actions = (
    <ActionButton variant="ghost" onClick={handleReset}>
      Reset
    </ActionButton>
  );

  return (
    <SimulationWorkspace 
      title="Disk Scheduling Laboratory"
      description="Simulate disk arm scheduling algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) and optimize head movement."
      actions={actions}
      configPanel={configPanel}
      visualizationPanel={visualizationPanel}
    />
  );
}
