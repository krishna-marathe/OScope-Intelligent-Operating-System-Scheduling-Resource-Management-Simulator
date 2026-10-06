import { useDeadlockStore } from '../../store/useDeadlockStore';

export function DeadlockStepControls() {
  const { result, currentStep, setCurrentStep } = useDeadlockStore();

  if (!result || result.safety_steps.length === 0) return null;

  const totalSteps = result.safety_steps.length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setCurrentStep(1)}
          disabled={currentStep <= 1}
          className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 hover:bg-slate-200"
        >
          ⏮ First
        </button>
        <button 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep <= 1}
          className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 hover:bg-slate-200"
        >
          ◀ Prev
        </button>
        <button 
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep >= totalSteps}
          className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 hover:bg-slate-200"
        >
          Next ▶
        </button>
        <button 
          onClick={() => setCurrentStep(totalSteps)}
          disabled={currentStep >= totalSteps}
          className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50 hover:bg-slate-200"
        >
          Last ⏭
        </button>
      </div>
      <div className="text-sm font-semibold">
        Step: {currentStep} / {totalSteps}
      </div>
    </div>
  );
}
