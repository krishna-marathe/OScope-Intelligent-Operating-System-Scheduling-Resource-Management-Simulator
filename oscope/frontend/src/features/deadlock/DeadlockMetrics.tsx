import { useDeadlockStore } from '../../store/useDeadlockStore';

export function DeadlockMetrics() {
  const { result, processCount, resourceCount } = useDeadlockStore();

  if (!result) return null;

  const finishedCount = result.process_states.filter(s => s.finished).length;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h3 className="text-xl font-bold mb-4">Metrics Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded border">
          <div className="text-sm text-slate-500 mb-1">Process Count</div>
          <div className="text-2xl font-bold font-mono">{processCount}</div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded border">
          <div className="text-sm text-slate-500 mb-1">Resource Types</div>
          <div className="text-2xl font-bold font-mono">{resourceCount}</div>
        </div>
        
        <div className={`p-4 rounded border ${result.is_safe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-sm mb-1 ${result.is_safe ? 'text-green-600' : 'text-red-600'}`}>Safety Status</div>
          <div className={`text-2xl font-bold font-mono ${result.is_safe ? 'text-green-700' : 'text-red-700'}`}>
            {result.is_safe ? 'SAFE' : 'UNSAFE'}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100">
          <div className="text-sm text-blue-600 mb-1">Processes Finished</div>
          <div className="text-2xl font-bold text-blue-700 font-mono">
            {finishedCount} / {processCount}
          </div>
        </div>
      </div>
    </div>
  );
}
