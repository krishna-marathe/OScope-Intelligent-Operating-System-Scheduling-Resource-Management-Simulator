import { useMemo } from 'react';
import { useMemoryStore } from '../../../store/useMemoryStore';
import { createMemoryVisualizationModel } from '../adapters/memoryVisualizationAdapter';
import { SceneRoot } from '../engine/SceneRoot';
import { SceneControls } from '../engine/SceneControls';
import { SceneHUD } from '../overlays/SceneHUD';
import { MemoryBlock3D } from '../primitives/MemoryBlock3D';

export function MemoryLaboratory3D() {
  const { result, currentStep, algorithm } = useMemoryStore();

  const model = useMemo(() => {
    return createMemoryVisualizationModel(result, currentStep);
  }, [result, currentStep]);

  const step = result && result.steps.length > 0 ? result.steps[Math.min(currentStep, result.steps.length - 1)] : null;
  const status = !step ? 'IDLE' : step.is_hit ? 'PAGE HIT' : 'PAGE FAULT';

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <SceneRoot>
        <group position={[0, 0, 0]}>
          {model.entities.map((entity, idx) => {
            if (entity.type === 'memory_block') {
              const col = idx % 4;
              const row = Math.floor(idx / 4);
              return (
                <MemoryBlock3D 
                  key={entity.id} 
                  entity={entity} 
                  position={[(col - 1.5) * 2.5, 0.5, (row - 1) * 2.5]} 
                />
              );
            }
            return null;
          })}
        </group>
      </SceneRoot>
      
      <SceneHUD 
        title="MEMORY MANAGEMENT LABORATORY" 
        subtitle={`Algorithm: ${algorithm} • Step ${currentStep} of ${result?.steps.length || 0}`} 
        stats={[
          { label: 'Reference', value: step ? step.reference.toString() : '-' },
          { label: 'Status', value: status },
          { label: 'Faults', value: result?.page_faults.toString() || '0' },
          { label: 'Hits', value: result?.page_hits.toString() || '0' }
        ]}
      />
      <SceneControls />
    </div>
  );
}
