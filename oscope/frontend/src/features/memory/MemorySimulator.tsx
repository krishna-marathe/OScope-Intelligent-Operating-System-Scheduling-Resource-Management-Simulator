import { MemoryInput } from './MemoryInput';
import { MemoryVisualization } from './MemoryVisualization';
import { MemoryMetrics } from './MemoryMetrics';
import { MemoryStepControls } from './MemoryStepControls';

export function MemorySimulator() {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Memory Management Simulator</h1>
      </div>
      <MemoryInput />
      <MemoryStepControls />
      <MemoryVisualization />
      <MemoryMetrics />
    </div>
  );
}
