import { useMemoryStore } from '../../store/useMemoryStore';
import { VisualCanvas, VisualizationLegendItem } from '../visualization/VisualCanvas';

export function MemoryVisualization() {
  const { result, currentStep, algorithm } = useMemoryStore();

  if (!result || result.steps.length === 0) return null;

  const stepsToRender = result.steps.slice(0, currentStep);

  const legend = (
    <>
      <VisualizationLegendItem color="bg-emerald-500" label="PAGE HIT" />
      <VisualizationLegendItem color="bg-rose-500" label="PAGE FAULT" />
      <VisualizationLegendItem color="bg-amber-500" label="EVICTION" />
      <VisualizationLegendItem color="bg-slate-200" label="FREE FRAME" />
    </>
  );

  return (
    <div className="h-[450px]">
      <VisualCanvas 
        title="Memory Reference Timeline" 
        subtitle={`${algorithm} • Step ${currentStep} of ${result.steps.length}`}
        legend={legend}
      >
        <div className="flex flex-row items-start pt-4 pb-8 min-w-max gap-3">
          {stepsToRender.map((step, stepIdx) => (
            <div 
              key={stepIdx} 
              className="flex flex-col items-center gap-2 group transition-all duration-300"
              data-testid={`mem-step-${stepIdx}`}
            >
              {/* Reference Request */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  t={stepIdx + 1}
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow-sm z-10 transition-colors ${
                  step.is_hit ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' : 'bg-rose-100 text-rose-700 border-2 border-rose-500'
                }`}>
                  <span className="sr-only">{step.is_hit ? 'HIT' : 'FAULT'}</span>
                  {step.reference}
                </div>
              </div>

              {/* Connecting Line */}
              <div className={`w-0.5 h-6 ${step.is_hit ? 'bg-emerald-200' : 'bg-rose-200'}`} />

              {/* Memory Frames */}
              <div className="flex flex-col gap-1.5 p-1.5 bg-slate-200/50 rounded-lg border border-slate-300 relative">
                {Array.from({ length: result.frame_count }).map((_, frameIdx) => {
                  const page = step.frames[frameIdx];
                  const isFree = page === undefined || page === null;
                  const isHitTarget = step.is_hit && page === step.reference;
                  const isReplaced = !step.is_hit && page === step.reference; // recently inserted fault

                  return (
                    <div 
                      key={frameIdx} 
                      className={`w-12 h-10 rounded shadow-sm border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isFree ? 'bg-white border-slate-200 text-slate-300 border-dashed' :
                        isHitTarget ? 'bg-emerald-500 border-emerald-600 text-white' :
                        isReplaced ? 'bg-rose-500 border-rose-600 text-white' :
                        'bg-slate-700 border-slate-800 text-slate-100'
                      }`}
                    >
                      {isFree ? '-' : page}
                    </div>
                  );
                })}

                {/* Eviction Indicator */}
                {step.replaced_page !== null && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-amber-400" />
                    <div className="text-[10px] bg-amber-100 text-amber-800 border border-amber-400 font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {step.replaced_page}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Empty state filler for remaining steps if we want a fixed grid width */}
          {Array.from({ length: result.steps.length - currentStep }).map((_, i) => (
            <div key={`empty-${i}`} className="w-12 opacity-10 flex flex-col items-center gap-2">
              <div className="h-[76px]" />
              <div className="flex flex-col gap-1.5 p-1.5 rounded-lg border border-slate-300 border-dashed">
                {Array.from({ length: result.frame_count }).map((_, j) => (
                  <div key={j} className="w-12 h-10 border border-slate-300 border-dashed rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </VisualCanvas>
    </div>
  );
}
