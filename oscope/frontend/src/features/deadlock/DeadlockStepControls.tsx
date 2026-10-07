import { useDeadlockStore } from '../../store/useDeadlockStore';
import { SceneControls } from '../visualization3d/engine/SceneControls';

export function DeadlockStepControls() {
  const { result, currentStep, setCurrentStep } = useDeadlockStore();

  if (!result || result.safety_steps.length === 0) return null;

  const totalSteps = result.safety_steps.length;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setCurrentStep(1)}
          disabled={currentStep <= 1}
          className="px-3 py-1.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-md disabled:opacity-50 hover:bg-slate-200 transition-colors"
        >
          ⏮ First
        </button>
        <button 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep <= 1}
          className="px-3 py-1.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-md disabled:opacity-50 hover:bg-slate-200 transition-colors"
        >
          ◀ Prev
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep >= totalSteps}
          className="px-3 py-1.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-md disabled:opacity-50 hover:bg-slate-200 transition-colors"
        >
          Next ▶
        </button>
        <button 
          onClick={() => setCurrentStep(totalSteps)}
          disabled={currentStep >= totalSteps}
          className="px-3 py-1.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-md disabled:opacity-50 hover:bg-slate-200 transition-colors"
        >
          Last ⏭
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="font-mono text-sm font-bold bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
          Step: {currentStep} / {totalSteps}
        </div>
        <SceneControls />
      </div>
    </div>
  );
}
