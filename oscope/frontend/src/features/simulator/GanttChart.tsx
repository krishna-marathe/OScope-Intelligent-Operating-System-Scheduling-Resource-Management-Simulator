import { useSimulatorStore } from '../../store/useSimulatorStore';
import { GanttEvent } from '../../types';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'
];

export function GanttChart() {
  const { result, currentTime } = useSimulatorStore();

  if (!result || result.gantt_chart.length === 0) return null;

  const maxTime = Math.max(...result.gantt_chart.map(e => e.end_time));
  
  // Assign stable colors to processes
  const processColors: Record<string, string> = {};
  let colorIdx = 0;
  result.gantt_chart.forEach(ev => {
    const type = ev.event_type || (ev.process_id === 'IDLE' ? 'IDLE' : ev.process_id === 'CS' ? 'CS' : 'CPU');
    if (type !== 'IDLE' && type !== 'CS' && !processColors[ev.process_id]) {
      processColors[ev.process_id] = colors[colorIdx % colors.length];
      colorIdx++;
    }
  });

  const hasIO = result.gantt_chart.some(ev => ev.event_type === 'IO');

  const cpuEvents = result.gantt_chart.filter(ev => {
    const type = ev.event_type || (ev.process_id === 'IDLE' ? 'IDLE' : ev.process_id === 'CS' ? 'CS' : 'CPU');
    return type !== 'IO';
  });

  const ioEvents = result.gantt_chart.filter(ev => {
    const type = ev.event_type || (ev.process_id === 'IDLE' ? 'IDLE' : ev.process_id === 'CS' ? 'CS' : 'CPU');
    return type === 'IO';
  });

  const renderTrack = (events: GanttEvent[], title?: string) => (
    <div className={title ? 'mb-4' : ''}>
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-1">{title}</h4>}
      <div className="relative w-full h-16 bg-slate-200 rounded overflow-hidden shadow-inner border border-slate-300">
        {events.map((ev, idx) => {
          const duration = ev.end_time - ev.start_time;
          const leftPct = maxTime > 0 ? (ev.start_time / maxTime) * 100 : 0;
          const widthPct = maxTime > 0 ? (duration / maxTime) * 100 : 0;
          
          const type = ev.event_type || (ev.process_id === 'IDLE' ? 'IDLE' : ev.process_id === 'CS' ? 'CS' : 'CPU');
          const isIdle = type === 'IDLE';
          const isCS = type === 'CS';
          
          let bgColor = processColors[ev.process_id] || 'bg-gray-500';
          if (isIdle) bgColor = 'bg-slate-300';
          if (isCS) bgColor = 'bg-red-500';

          const visibleDuration = Math.max(0, Math.min(duration, currentTime - ev.start_time));
          const visibleWidthPct = duration > 0 ? (visibleDuration / duration) * 100 : 0;

          return (
            <div 
              key={idx} 
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }} 
              className="absolute top-0 bottom-0 border-r border-white/50 bg-slate-100" 
              title={`${ev.process_id}${ev.queue_id ? ` (Q${ev.queue_id})` : ''} [${type}]: ${ev.start_time} - ${ev.end_time} (Duration: ${duration})`}
              data-testid={`gantt-event-${type}-${ev.process_id}`}
            >
               <div className={`h-full ${bgColor} transition-all duration-200 ease-linear`} style={{ width: `${visibleWidthPct}%` }} />
               <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800 mix-blend-hard-light overflow-hidden">
                 <span className="truncate px-1">{ev.process_id}{ev.queue_id ? ` (Q${ev.queue_id})` : ''}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="my-6">
      <h3 className="font-bold text-lg mb-2">Gantt Chart (Interactive)</h3>
      <div data-testid="gantt-chart-interactive">
        {hasIO ? (
          <>
            {renderTrack(cpuEvents, 'CPU Timeline')}
            {renderTrack(ioEvents, 'I/O Timeline')}
          </>
        ) : (
          renderTrack(cpuEvents)
        )}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>0</span>
        <span>{maxTime}</span>
      </div>
    </div>
  );
}
