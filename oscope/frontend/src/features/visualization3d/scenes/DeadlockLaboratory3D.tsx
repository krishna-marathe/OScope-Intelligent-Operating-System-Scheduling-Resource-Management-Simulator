import { useMemo } from 'react';
import { useDeadlockStore } from '../../../store/useDeadlockStore';
import { createDeadlockVisualizationModel } from '../adapters/deadlockVisualizationAdapter';
import { SceneRoot } from '../engine/SceneRoot';
import { SceneControls } from '../engine/SceneControls';
import { SceneHUD } from '../overlays/SceneHUD';
import { ProcessNode } from '../primitives/ProcessNode';
import { ResourceNode3D } from '../primitives/ResourceNode3D';
import { ConnectionLine3D } from '../primitives/ConnectionLine3D';

export function DeadlockLaboratory3D() {
  const { result, currentStep, processCount, resourceCount } = useDeadlockStore();

  const model = useMemo(() => {
    return createDeadlockVisualizationModel(result, currentStep, processCount, resourceCount);
  }, [result, currentStep, processCount, resourceCount]);

  const isSafeStr = !result ? 'UNKNOWN' : result.is_safe ? 'SAFE' : 'UNSAFE';
  
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <SceneRoot>
        <group position={[0, 0, 0]}>
          {model.entities.map((entity) => {
            if (entity.type === 'process') {
              const pId = entity.metadata?.process_id as number;
              // Circle layout for processes
              const angle = (pId / Math.max(1, processCount)) * Math.PI * 2;
              const radius = 6;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <ProcessNode 
                  key={entity.id} 
                  entity={entity} 
                  position={[x, 0.5, z]} 
                />
              );
            }
            if (entity.type === 'resource') {
              const rId = entity.metadata?.resource_id as number;
              // Line layout for resources in center
              const x = (rId - (resourceCount - 1) / 2) * 3;
              
              return (
                <ResourceNode3D
                  key={entity.id}
                  entity={entity}
                  position={[x, 1, 0]}
                />
              );
            }
            return null;
          })}

          {model.connections.map((conn) => {
            const startEntity = model.entities.find(e => e.id === conn.sourceId);
            const endEntity = model.entities.find(e => e.id === conn.targetId);
            if (startEntity && endEntity) {
              const getPos = (e: any) => {
                if (e.type === 'process') {
                  const pId = e.metadata?.process_id as number;
                  const angle = (pId / Math.max(1, processCount)) * Math.PI * 2;
                  const radius = 6;
                  return [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius] as [number, number, number];
                } else {
                  const rId = e.metadata?.resource_id as number;
                  const x = (rId - (resourceCount - 1) / 2) * 3;
                  return [x, 1, 0] as [number, number, number];
                }
              };
              
              const start = getPos(startEntity);
              const end = getPos(endEntity);
              
              return (
                <ConnectionLine3D
                  key={conn.id}
                  connection={conn}
                  start={start}
                  end={end}
                />
              );
            }
            return null;
          })}
        </group>
      </SceneRoot>
      
      <SceneHUD 
        title="RESOURCE ALLOCATION LABORATORY" 
        subtitle="Algorithm: BANKER'S ALGORITHM"
        stats={[
          { label: 'Status', value: isSafeStr },
          { label: 'Processes', value: processCount.toString() },
          { label: 'Resources', value: resourceCount.toString() },
          { label: 'Safe Seq', value: result?.safe_sequence?.length ? result.safe_sequence.map(p => `P${p}`).join(' → ') : 'NONE' },
          { label: 'Step', value: `${currentStep} / ${result?.safety_steps.length || 0}` }
        ]}
      />
      <SceneControls />
    </div>
  );
}
