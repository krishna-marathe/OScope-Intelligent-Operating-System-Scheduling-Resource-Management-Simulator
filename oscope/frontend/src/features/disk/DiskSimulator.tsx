import { DiskInput } from './DiskInput';
import { DiskVisualization } from './DiskVisualization';
import { DiskMetrics } from './DiskMetrics';
import { DiskStepControls } from './DiskStepControls';

export function DiskSimulator() {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Disk Scheduling Simulator</h1>
      </div>
      <DiskInput />
      <DiskStepControls />
      <DiskVisualization />
      <DiskMetrics />
    </div>
  );
}
