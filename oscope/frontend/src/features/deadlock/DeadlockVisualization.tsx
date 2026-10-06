import { useDeadlockStore } from '../../store/useDeadlockStore';

export function DeadlockVisualization() {
  const { result, currentStep } = useDeadlockStore();

  if (!result) return null;

  const stepsToRender = result.safety_steps.slice(0, currentStep);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h3 className="text-xl font-bold mb-4">Banker's Safety Execution</h3>
      
      {result.request_approved !== undefined && result.request_approved !== null && (
        <div className={`mb-6 p-4 rounded border ${result.request_approved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h4 className="font-bold text-sm mb-1 text-slate-800">Resource Request Result: {result.request_approved ? 'APPROVED' : 'REJECTED'}</h4>
          <p className="text-sm text-slate-700">{result.request_reason}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-t">
              <th className="p-3 text-sm font-semibold border-r">Step</th>
              <th className="p-3 text-sm font-semibold border-r">Process</th>
              <th className="p-3 text-sm font-semibold border-r">Need</th>
              <th className="p-3 text-sm font-semibold border-r">Work (Before)</th>
              <th className="p-3 text-sm font-semibold border-r">Executable?</th>
              <th className="p-3 text-sm font-semibold">Work (After)</th>
            </tr>
          </thead>
          <tbody>
            {stepsToRender.map((step, idx) => (
              <tr key={idx} className="border-b transition-colors hover:bg-slate-50" data-testid={`dl-step-${idx}`}>
                <td className="p-3 text-slate-500 font-mono text-sm border-r">{step.step_number}</td>
                <td className="p-3 font-mono font-bold text-blue-600 border-r">P{step.process_id}</td>
                <td className="p-3 font-mono text-sm border-r">[{step.need.join(', ')}]</td>
                <td className="p-3 font-mono text-sm border-r">[{step.work_before.join(', ')}]</td>
                <td className="p-3 border-r">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    step.can_execute ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {step.can_execute ? 'YES' : 'NO'}
                  </span>
                </td>
                <td className="p-3 font-mono text-sm font-bold text-slate-700">
                  [{step.work_after.join(', ')}]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {currentStep === result.safety_steps.length && (
        <div className={`mt-6 p-4 rounded border text-center font-bold text-lg ${result.is_safe ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
          {result.is_safe ? 'SYSTEM IS SAFE' : 'SYSTEM IS UNSAFE'}
          {result.is_safe && result.safe_sequence && result.safe_sequence.length > 0 && (
            <div className="mt-2 text-sm font-normal text-slate-700">
              Safe Sequence: <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">
                {result.safe_sequence.map(p => `P${p}`).join(' → ')}
              </span>
            </div>
          )}
          {!result.is_safe && (
            <div className="mt-2 text-sm font-normal text-slate-700">
              No complete safe sequence could be found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
