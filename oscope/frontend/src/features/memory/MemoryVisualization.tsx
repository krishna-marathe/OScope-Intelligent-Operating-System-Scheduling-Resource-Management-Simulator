import { useMemoryStore } from '../../store/useMemoryStore';

export function MemoryVisualization() {
  const { result, currentStep } = useMemoryStore();

  if (!result) return null;

  const stepsToRender = result.steps.slice(0, currentStep);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h3 className="text-xl font-bold mb-4">Page Replacement Visualization</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-t">
              <th className="p-3 text-sm font-semibold border-r">Step</th>
              <th className="p-3 text-sm font-semibold border-r">Ref</th>
              <th className="p-3 text-sm font-semibold border-r">Status</th>
              {Array.from({ length: result.frame_count }).map((_, i) => (
                <th key={i} className="p-3 text-sm font-semibold border-r text-center">
                  Frame {i + 1}
                </th>
              ))}
              <th className="p-3 text-sm font-semibold">Evicted</th>
            </tr>
          </thead>
          <tbody>
            {stepsToRender.map((step, idx) => (
              <tr key={idx} className="border-b transition-colors hover:bg-slate-50" data-testid={`mem-step-${idx}`}>
                <td className="p-3 text-slate-500 font-mono text-sm border-r">{idx + 1}</td>
                <td className="p-3 font-mono font-bold text-blue-600 border-r">{step.reference}</td>
                <td className="p-3 border-r">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    step.is_hit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {step.is_hit ? 'HIT' : 'FAULT'}
                  </span>
                </td>
                
                {Array.from({ length: result.frame_count }).map((_, i) => {
                  const val = step.frames[i];
                  return (
                    <td key={i} className="p-3 border-r text-center font-mono">
                      {val !== undefined && val !== null ? val : '-'}
                    </td>
                  );
                })}
                
                <td className="p-3 font-mono text-red-600">
                  {step.replaced_page !== null ? step.replaced_page : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
