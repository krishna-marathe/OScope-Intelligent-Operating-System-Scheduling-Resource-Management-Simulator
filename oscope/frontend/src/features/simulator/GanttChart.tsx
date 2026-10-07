import { useSimulatorStore } from '../../store/useSimulatorStore';
import { GanttEvent } from '../../types';
import { VisualCanvas, VisualizationLegendItem } from '../visualization/VisualCanvas';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'
];

export function GanttChart() {
  const { result, currentTime, algorithm } = useSimulatorStore();

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

  const renderTrack = (events: GanttEvent[], title: string, icon: React.ReactNode) => (
    <div className="mb-6 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm border border-slate-200">
          {icon}
        </div>
        <h4 className="text-sm font-bold text-slate-700 tracking-wide">{title}</h4>
      </div>
      
      <div className="relative w-full h-14 bg-slate-200/50 rounded-lg overflow-hidden shadow-inner border border-slate-300">
        {/* Background Grid inside track */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '10% 100%' }}
        />
        
        {events.map((ev, idx) => {
          const duration = ev.end_time - ev.start_time;
          const leftPct = maxTime > 0 ? (ev.start_time / maxTime) * 100 : 0;
          const widthPct = maxTime > 0 ? (duration / maxTime) * 100 : 0;
          
          const type = ev.event_type || (ev.process_id === 'IDLE' ? 'IDLE' : ev.process_id === 'CS' ? 'CS' : 'CPU');
          const isIdle = type === 'IDLE';
          const isCS = type === 'CS';
          
          let bgColor = processColors[ev.process_id] || 'bg-slate-500';
          if (isIdle) bgColor = 'bg-slate-300/50';
          if (isCS) bgColor = 'bg-rose-500';

          const visibleDuration = Math.max(0, Math.min(duration, currentTime - ev.start_time));
          const visibleWidthPct = duration > 0 ? (visibleDuration / duration) * 100 : 0;

          return (
            <div 
              key={idx} 
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }} 
              className={`absolute top-0 bottom-0 border-r border-white/30 group ${isIdle ? '' : 'shadow-sm'}`} 
              title={`${ev.process_id}${ev.queue_id ? ` (Q${ev.queue_id})` : ''} [${type}]: ${ev.start_time} - ${ev.end_time} (Duration: ${duration})`}
              data-testid={`gantt-event-${type}-${ev.process_id}`}
            >
               <div className={`h-full ${bgColor} transition-all duration-300 ease-linear rounded-sm overflow-hidden`} style={{ width: `${visibleWidthPct}%` }}>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white mix-blend-overlay opacity-90 drop-shadow-md">
                   <span className="truncate px-1 tracking-wider">{ev.process_id}{ev.queue_id ? ` (Q${ev.queue_id})` : ''}</span>
                 </div>
               </div>
               
               {/* Hover Tooltip */}
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
                 {ev.process_id} • {type} • {ev.start_time}ms to {ev.end_time}ms
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const legend = (
    <>
      <VisualizationLegendItem color="bg-blue-500" label="PROCESS RUNNING" />
      <VisualizationLegendItem color="bg-rose-500" label="CONTEXT SWITCH" />
      <VisualizationLegendItem color="bg-slate-300" label="IDLE" />
      {hasIO && <VisualizationLegendItem color="bg-amber-500" label="I/O DEVICE" />}
    </>
  );

  const statusStr = currentTime >= maxTime ? 'COMPLETED' : currentTime === 0 ? 'READY' : 'RUNNING';

  return (
    <div data-testid="gantt-chart-interactive" className="h-[450px]">
      <VisualCanvas 
        title="CPU Execution Visualization" 
        subtitle={`${algorithm} • t = ${currentTime.toFixed(1)} / ${maxTime.toFixed(1)} • ${statusStr}`}
        legend={legend}
      >
        <div className="pt-4 pb-8 min-w-[600px]">
          {renderTrack(cpuEvents, 'CPU Core', (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          ))}
          {hasIO && renderTrack(ioEvents, 'I/O Device', (
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          ))}
          
          {/* Global Timeline Ruler */}
          <div className="relative w-full h-6 mt-4 border-t border-slate-300">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <div key={pct} className="absolute top-0 text-[10px] font-mono text-slate-400 font-bold -translate-x-1/2 pt-1" style={{ left: `${pct * 100}%` }}>
                {(maxTime * pct).toFixed(1)}ms
              </div>
            ))}
            
            {/* Playback Indicator */}
            {maxTime > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-30 transition-all duration-100"
                style={{ left: `${(currentTime / maxTime) * 100}%`, height: '200px', transform: 'translateY(-200px)' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  t = {currentTime.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </div>
      </VisualCanvas>
    </div>
  );
}
