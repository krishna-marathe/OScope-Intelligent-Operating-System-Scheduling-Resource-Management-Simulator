import { DeadlockInput } from './DeadlockInput';
import { DeadlockVisualization } from './DeadlockVisualization';
import { DeadlockMetrics } from './DeadlockMetrics';
import { DeadlockStepControls } from './DeadlockStepControls';

export function DeadlockSimulator() {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deadlock & Resource Allocation</h1>
      </div>
      <DeadlockInput />
      <DeadlockStepControls />
      <DeadlockVisualization />
      <DeadlockMetrics />
    </div>
  );
}
