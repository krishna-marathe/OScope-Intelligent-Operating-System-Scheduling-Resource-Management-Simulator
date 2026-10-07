import { DeadlockSimulationResult } from '../../../types';
import { VisualizationModel, VisualEntity, VisualConnection } from '../models/visualizationModel';

export function createDeadlockVisualizationModel(
  result: DeadlockSimulationResult | null,
  currentStep: number,
  processCount: number,
  resourceCount: number
): VisualizationModel {
  if (!result) {
    return {
      entities: [],
      connections: [],
      currentTime: 0,
      currentStep: 0,
      totalSteps: 0,
    };
  }

  const entities: VisualEntity[] = [];
  const connections: VisualConnection[] = [];

  const totalSteps = result.safety_steps.length;
  const safeStep = Math.min(Math.max(currentStep, 0), totalSteps);
  
  // Find current step state
  // Actually, process states might change during steps.
  // The backend returns a full trace in `safety_steps` and final `process_states`.
  // At step `safeStep`, some processes are finished, some are waiting.
  
  // Reconstruct state at safeStep
  const finishedProcesses = new Set<number>();
  let currentProcessIndex = -1;
  let work = [...result.available_after_simulation]; // default
  
  if (safeStep === 0) {
    if (result.safety_steps.length > 0) {
      work = [...result.safety_steps[0].work_before];
    }
  } else {
    for (let i = 0; i < safeStep; i++) {
      const step = result.safety_steps[i];
      if (step.can_execute) {
        finishedProcesses.add(step.process_id);
      }
      if (i === safeStep - 1) {
        work = [...step.work_after];
        currentProcessIndex = step.process_id;
      }
    }
  }

  // Create Resources
  for (let r = 0; r < resourceCount; r++) {
    entities.push({
      id: `resource-${r}`,
      type: 'resource',
      label: `R${r}`,
      state: 'AVAILABLE',
      metadata: {
        resource_id: r,
        available: work[r],
      }
    });
  }

  // Create Processes
  for (let p = 0; p < processCount; p++) {
    const isFinished = finishedProcesses.has(p);
    const isCurrent = p === currentProcessIndex;
    
    // Find initial static state from process_states
    const pState = result.process_states.find(ps => ps.process_id === p);
    
    entities.push({
      id: `process-${p}`,
      type: 'process',
      label: `P${p}`,
      state: isFinished ? 'TERMINATED' : (isCurrent ? 'RUNNING' : 'BLOCKED'),
      metadata: {
        process_id: p,
        finished: isFinished,
        allocation: pState?.allocation.join(',') || '',
        need: pState?.need.join(',') || '',
      }
    });

    // Edges (Allocations and Requests/Needs)
    if (pState) {
      pState.allocation.forEach((alloc, r) => {
        if (alloc > 0 && !isFinished) {
          connections.push({
            id: `alloc-p${p}-r${r}`,
            sourceId: `resource-${r}`, // Resource -> Process
            targetId: `process-${p}`,
            active: isCurrent
          });
        }
      });
      
      pState.need.forEach((need, r) => {
        if (need > 0 && !isFinished) {
          connections.push({
            id: `request-p${p}-r${r}`,
            sourceId: `process-${p}`, // Process -> Resource
            targetId: `resource-${r}`,
            active: isCurrent
          });
        }
      });
    }
  }

  return {
    entities,
    connections,
    currentTime: currentStep,
    currentStep: safeStep,
    totalSteps,
  };
}
