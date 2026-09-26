import { useSimulatorStore } from '../../store/useSimulatorStore';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'
];

export function GanttChart() {
  const { result, currentTime } = useSimulatorStore();

  if (!result || result.gantt_chart.length === 0) return null;

  const maxTime = result.gantt_chart[result.gantt_chart.length - 1].end_time;
  
  // Assign stable colors to processes
  const processColors: Record<string, string> = {};
  let colorIdx = 0;
  result.gantt_chart.forEach(ev => {
    if (ev.process_id !== 'IDLE' && !processColors[ev.process_id]) {
      processColors[ev.process_id] = colors[colorIdx % colors.length];
      colorIdx++;
    }
  });

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Gantt Chart (Interactive)</h3>
      <div className="relative w-full h-16 bg-slate-200 flex rounded overflow-hidden shadow-inner" data-testid="gantt-chart-interactive">
        {result.gantt_chart.map((ev, idx) => {
          const duration = ev.end_time - ev.start_time;
          const widthPct = (duration / maxTime) * 100;
          const isIdle = ev.process_id === 'IDLE';
          const bgColor = isIdle ? 'bg-slate-300' : processColors[ev.process_id];
          
          // Determine how much of this block is visible based on currentTime
          const visibleDuration = Math.max(0, Math.min(duration, currentTime - ev.start_time));
          const visibleWidthPct = (visibleDuration / duration) * 100;

          return (
            <div key={idx} style={{ width: `${widthPct}%` }} className="h-full border-r border-white/50 relative bg-slate-100" title={`${ev.process_id}: ${ev.start_time} - ${ev.end_time}`}>
               {/* Background fill based on playback */}
               <div className={`h-full ${bgColor} transition-all duration-200 ease-linear`} style={{ width: `${visibleWidthPct}%` }} />
               {/* Label */}
               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 mix-blend-hard-light">
                 {ev.process_id}
               </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>0</span>
        <span>{maxTime}</span>
      </div>
    </div>
  );
}
