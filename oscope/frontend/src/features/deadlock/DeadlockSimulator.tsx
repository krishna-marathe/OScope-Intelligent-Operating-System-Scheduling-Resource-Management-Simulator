import { DeadlockInput } from './DeadlockInput';
import { DeadlockVisualization } from './DeadlockVisualization';
import { DeadlockMetrics } from './DeadlockMetrics';
import { DeadlockStepControls } from './DeadlockStepControls';
import { SimulationWorkspace } from '../simulation/SimulationWorkspace';
import { SimulationViewport } from '../simulation/SimulationViewport';
import { useDeadlockStore } from '../../store/useDeadlockStore';

import { ActionButton } from '../../components/ui/ActionButton';

export function DeadlockSimulator() {
  const { 
    result, setResult, setError,
    setProcessCount, setResourceCount, setAvailable, setAllocation, setMaximum, setResourceRequest 
  } = useDeadlockStore();

  const handleReset = () => {
    setProcessCount(5);
    setResourceCount(3);
    setAvailable([3, 3, 2]);
    setAllocation([
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2]
    ]);
    setMaximum([
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3]
    ]);
    setResourceRequest(null);
    setResult(null);
    setError(null);
  };

  const configPanel = (
    <DeadlockInput />
  );

  const visualizationPanel = (
    <>
      <SimulationViewport 
        title="BANKER's ALGORITHM SAFETY EVALUATION" 
        status={result ? 'COMPLETED' : 'IDLE'}
        laboratoryType="DEADLOCK"
        toolbar={<DeadlockStepControls />}
      >
        <DeadlockVisualization />
      </SimulationViewport>
      <div className={result ? 'block' : 'hidden'}>
        <DeadlockMetrics />
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
      title="Deadlock & Resource Laboratory"
      description="Evaluate system safety and simulate resource requests using the Banker's Algorithm."
      actions={actions}
      configPanel={configPanel}
      visualizationPanel={visualizationPanel}
    />
  );
}
