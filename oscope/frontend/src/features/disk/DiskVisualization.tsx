import { useDiskStore } from '../../store/useDiskStore';

export function DiskVisualization() {
  const { result, currentStep } = useDiskStore();

  if (!result) return null;

  const stepsToRender = result.movement_steps.slice(0, currentStep);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h3 className="text-xl font-bold mb-4">Head Movement Visualization</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-t">
              <th className="p-3 text-sm font-semibold border-r">Step</th>
              <th className="p-3 text-sm font-semibold border-r">From Cylinder</th>
              <th className="p-3 text-sm font-semibold border-r">To Cylinder</th>
              <th className="p-3 text-sm font-semibold border-r">Movement</th>
              <th className="p-3 text-sm font-semibold">Direction</th>
            </tr>
          </thead>
          <tbody>
            {stepsToRender.map((step, idx) => {
              const dir = step.end_cylinder >= step.start_cylinder ? '▶ RIGHT' : '◀ LEFT';
              return (
                <tr key={idx} className="border-b transition-colors hover:bg-slate-50" data-testid={`disk-step-${idx}`}>
                  <td className="p-3 text-slate-500 font-mono text-sm border-r">{idx + 1}</td>
                  <td className="p-3 font-mono border-r">{step.start_cylinder}</td>
                  <td className="p-3 font-mono font-bold text-blue-600 border-r">{step.end_cylinder}</td>
                  <td className="p-3 font-mono text-red-600 border-r">{step.movement}</td>
                  <td className="p-3 text-sm font-bold text-slate-600">{dir}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
