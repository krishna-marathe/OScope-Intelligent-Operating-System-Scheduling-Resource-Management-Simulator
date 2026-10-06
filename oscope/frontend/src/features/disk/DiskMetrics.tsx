import { useDiskStore } from '../../store/useDiskStore';

export function DiskMetrics() {
  const { result } = useDiskStore();

  if (!result) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
      <h3 className="text-xl font-bold mb-4">Metrics Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded border">
          <div className="text-sm text-slate-500 mb-1">Total Requests</div>
          <div className="text-2xl font-bold font-mono">{result.request_queue.length}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded border border-red-100">
          <div className="text-sm text-red-600 mb-1">Total Head Movement</div>
          <div className="text-2xl font-bold text-red-700 font-mono">{result.total_head_movement}</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-100">
          <div className="text-sm text-blue-600 mb-1">Avg Movement</div>
          <div className="text-2xl font-bold text-blue-700 font-mono">
            {result.average_head_movement.toFixed(1)}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded border border-green-100">
          <div className="text-sm text-green-600 mb-1">Final Head Position</div>
          <div className="text-2xl font-bold text-green-700 font-mono">
            {result.movement_steps.length > 0 
              ? result.movement_steps[result.movement_steps.length - 1].end_cylinder 
              : result.initial_head_position}
          </div>
        </div>
      </div>
    </div>
  );
}
