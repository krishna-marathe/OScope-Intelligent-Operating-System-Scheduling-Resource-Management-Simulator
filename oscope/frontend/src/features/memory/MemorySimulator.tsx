import { MemoryInput } from './MemoryInput';
import { MemoryVisualization } from './MemoryVisualization';
import { MemoryMetrics } from './MemoryMetrics';
import { MemoryStepControls } from './MemoryStepControls';
import { SimulationWorkspace } from '../simulation/SimulationWorkspace';
import { SimulationViewport } from '../simulation/SimulationViewport';
import { useMemoryStore } from '../../store/useMemoryStore';
import { Panel } from '../../components/ui/Panel';
import { ActionButton } from '../../components/ui/ActionButton';

export function MemorySimulator() {
  const { result, setReferenceSequence, setFrameCount, setResult, setError } = useMemoryStore();

  const handleReset = () => {
    setReferenceSequence('7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1');
    setFrameCount(3);
    setResult(null);
    setError(null);
  };

  const configPanel = (
    <Panel title="MEMORY CONFIGURATION">
      <MemoryInput />
    </Panel>
  );

  const visualizationPanel = (
    <>
      <SimulationViewport 
        title="PAGE REPLACEMENT TIMELINE" 
        status={result ? 'COMPLETED' : 'IDLE'}
      >
        <MemoryStepControls />
        <MemoryVisualization />
      </SimulationViewport>
      <div className={result ? 'block' : 'hidden'}>
        <MemoryMetrics />
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
      title="Memory Management Laboratory"
      description="Simulate page replacement algorithms (FIFO, LRU, OPTIMAL) to observe page faults and physical memory frames over time."
      actions={actions}
      configPanel={configPanel}
      visualizationPanel={visualizationPanel}
    />
  );
}
