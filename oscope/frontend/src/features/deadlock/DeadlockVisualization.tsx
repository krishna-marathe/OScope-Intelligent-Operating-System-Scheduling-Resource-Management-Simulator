import { useDeadlockStore } from '../../store/useDeadlockStore';
import { VisualCanvas, VisualizationLegendItem } from '../visualization/VisualCanvas';

export function DeadlockVisualization() {
  const { result, currentStep } = useDeadlockStore();

  if (!result || result.safety_steps.length === 0) return null;

  const stepsToRender = result.safety_steps.slice(0, currentStep);
  const currentSafeStep = stepsToRender[stepsToRender.length - 1];

  const legend = (
    <>
      <VisualizationLegendItem color="bg-blue-100 border-blue-400" label="PROCESS" />
      <VisualizationLegendItem color="bg-emerald-500" label="SAFE STATE" />
      <VisualizationLegendItem color="bg-rose-500" label="UNSAFE STATE" />
      <VisualizationLegendItem color="bg-slate-700" label="RESOURCES (WORK)" />
    </>
  );

  const statusStr = currentStep >= result.safety_steps.length 
    ? (result.is_safe ? 'SYSTEM SAFE' : 'SYSTEM UNSAFE')
    : 'ANALYZING SAFETY';

  return (
    <div className="h-[550px]">
      <VisualCanvas 
        title="Banker's Algorithm State Space" 
        subtitle={`Step ${currentStep} of ${result.safety_steps.length} • ${statusStr}`}
        legend={legend}
      >
        <div className="flex flex-col gap-8 h-full">
          {/* Request Result Badge */}
          {result.request_approved !== undefined && result.request_approved !== null && (
            <div className={`p-3 rounded-lg border flex items-center justify-center gap-3 shadow-sm ${
              result.request_approved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${result.request_approved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="font-bold text-sm tracking-wide">
                REQUEST {result.request_approved ? 'APPROVED' : 'REJECTED'}:
              </span>
              <span className="text-sm">{result.request_reason}</span>
            </div>
          )}

          <div className="flex gap-6 overflow-x-auto pb-4 items-start">
            {/* System State Box */}
            <div className="w-48 bg-slate-800 text-white p-4 rounded-xl shadow-lg border border-slate-700 shrink-0 sticky left-0 z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Available Work</h4>
              {currentSafeStep ? (
                <div className="flex flex-wrap gap-2">
                  {currentSafeStep.work_after.map((res, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-[9px] text-slate-400">R{i}</div>
                      <div className="w-8 h-8 rounded bg-slate-700 border border-slate-600 flex items-center justify-center font-mono font-bold">
                        {res}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Initializing...</p>
              )}
            </div>

            {/* Sequence Graph */}
            <div className="flex flex-1 gap-4 items-center">
              {stepsToRender.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4 group transition-all" data-testid={`dl-step-${idx}`}>
                  {/* Transition Arrow */}
                  {idx > 0 && (
                    <div className="w-8 flex justify-center">
                      <svg className="w-6 h-6 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  )}
                  
                  {/* Process Node */}
                  <div className={`relative flex flex-col p-3 rounded-lg border-2 shadow-sm w-40 transition-transform hover:-translate-y-1 ${
                    step.can_execute 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-slate-700">P{step.process_id}</div>
                      <div className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        step.can_execute ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {step.can_execute ? 'SAFE' : 'UNSAFE'}
                      </div>
                    </div>

                    {/* Need vs Work */}
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Need:</span>
                        <span className="font-mono text-slate-700 font-bold">[{step.need.join(',')}]</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Work Before:</span>
                        <span className="font-mono text-slate-700 font-bold">[{step.work_before.join(',')}]</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Outcome Banner */}
          {currentStep === result.safety_steps.length && (
            <div className={`mt-auto p-4 rounded-xl border-2 text-center shadow-lg transition-all transform scale-100 animate-in zoom-in-95 ${
              result.is_safe ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'
            }`}>
              <h2 className={`text-xl font-black uppercase tracking-widest ${result.is_safe ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result.is_safe ? '✓ System is in a Safe State' : '⚠ System is in an Unsafe State'}
              </h2>
              {result.is_safe && result.safe_sequence && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-emerald-800">
                  <span className="text-emerald-600 uppercase tracking-widest text-xs">Safe Sequence:</span>
                  <div className="flex gap-2">
                    {result.safe_sequence.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="bg-white px-2 py-1 rounded shadow-sm border border-emerald-200">P{p}</span>
                        {i < result.safe_sequence!.length - 1 && <span className="text-emerald-300">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </VisualCanvas>
    </div>
  );
}
