import { WorkloadEditor } from '../features/simulator/WorkloadEditor';
import { AlgorithmSelector } from '../features/simulator/AlgorithmSelector';
import { ResultsView } from '../features/simulator/ResultsView';
import { RecommendPanel } from '../features/simulator/RecommendPanel';
import { PlaybackControls } from '../features/simulator/PlaybackControls';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { api } from '../services/api';
import { SimulationWorkspace } from '../features/simulation/SimulationWorkspace';
import { SimulationViewport } from '../features/simulation/SimulationViewport';
import { Panel } from '../components/ui/Panel';
import { ActionButton } from '../components/ui/ActionButton';

export function Simulator() {
  const { 
    processes, algorithm, timeQuantum, contextSwitchCost, mlqConfig, mlfqConfig, 
    setResult, setLoading, setError, loading, error, result
  } = useSimulatorStore();

  const handleSimulate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.simulate({
        algorithm,
        processes,
        time_quantum: algorithm === 'RR' ? timeQuantum : undefined,
        context_switch_cost: contextSwitchCost,
        mlq_config: algorithm === 'MLQ' ? mlqConfig : undefined,
        mlfq_config: algorithm === 'MLFQ' ? mlfqConfig : undefined
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const configPanel = (
    <>
      <Panel title="ALGORITHM CONFIGURATION">
        <AlgorithmSelector />
      </Panel>
      
      <Panel title="WORKLOAD DEFINITION">
        <WorkloadEditor />
      </Panel>
      
      <Panel>
        <ActionButton 
          variant="primary"
          testId="simulate-btn"
          onClick={handleSimulate}
          disabled={processes.length === 0 || loading}
          className="w-full py-3 text-base"
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </ActionButton>
        {error && <div className="mt-4 text-sm font-semibold text-rose-600 bg-rose-50 p-3 rounded" data-testid="error-msg">{error}</div>}
      </Panel>
    </>
  );

  const visualizationPanel = (
    <SimulationViewport 
      title="CPU & I/O GANTT CHART" 
      status={result ? 'COMPLETED' : 'IDLE'}
      laboratoryType="CPU"
      toolbar={<PlaybackControls />}
    >
      <ResultsView />
    </SimulationViewport>
  );

  const actions = (
    <ActionButton variant="ghost" onClick={handleReset} disabled={!result && processes.length === 0}>
      Reset
    </ActionButton>
  );

  return (
    <div className="space-y-6">
      <SimulationWorkspace 
        title="CPU Scheduling Laboratory"
        description="Design process workloads, select scheduling policies, and evaluate execution performance."
        actions={actions}
        configPanel={configPanel}
        visualizationPanel={
          <>
            <RecommendPanel />
            {visualizationPanel}
          </>
        }
      />
    </div>
  );
}
