import { MemorySimulationResult } from '../../../types';
import { VisualizationModel, VisualEntity, VisualConnection } from '../models/visualizationModel';

export function createMemoryVisualizationModel(
  result: MemorySimulationResult | null,
  currentStep: number
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

  const safeStepIndex = Math.min(Math.max(currentStep - 1, 0), result.steps.length - 1);
  const isFinished = currentStep >= result.steps.length;
  
  const step = result.steps.length > 0 ? result.steps[safeStepIndex] : null;

  // Add memory frames
  if (step) {
    step.frames.forEach((page, idx) => {
      let state = page === null ? 'AVAILABLE' : 'ALLOCATED';
      let isEvicted = false;

      // Only show activity on the exact current step, not when finished beyond the array
      if (!isFinished) {
        if (step.is_hit && page === step.reference) {
          state = 'HIT';
        } else if (!step.is_hit && page === step.reference) {
          state = 'FAULT';
        }
        
        if (step.replaced_page !== null && page === step.reference) {
          // This frame just replaced the page
          isEvicted = true;
        }
      }

      entities.push({
        id: `frame-${idx}`,
        type: 'memory_block',
        label: page === null ? `F${idx}: FREE` : `F${idx}: P${page}`,
        state: state as any,
        metadata: {
          frame_index: idx,
          current_page: page === null ? 'None' : page,
          status: state,
          evicted: isEvicted ? step.replaced_page : 'None'
        }
      });
    });
  } else {
    // Empty initial state
    for (let i = 0; i < result.frame_count; i++) {
      entities.push({
        id: `frame-${i}`,
        type: 'memory_block',
        label: `F${i}: FREE`,
        state: 'AVAILABLE',
        metadata: {
          frame_index: i,
          current_page: 'None',
          status: 'AVAILABLE'
        }
      });
    }
  }

  return {
    entities,
    connections,
    currentTime: currentStep,
    currentStep,
    totalSteps: result.steps.length,
  };
}
