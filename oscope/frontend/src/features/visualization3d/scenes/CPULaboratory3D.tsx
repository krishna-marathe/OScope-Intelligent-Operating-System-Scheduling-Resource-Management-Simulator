import { useMemo } from 'react';
import { useSimulatorStore } from '../../../store/useSimulatorStore';
import { createCpuVisualizationModel } from '../adapters/cpuVisualizationAdapter';
import { SceneRoot } from '../engine/SceneRoot';
import { CameraController } from '../engine/CameraController';
import { Environment } from '../engine/Environment';
import { GridFloor } from '../engine/GridFloor';
import { Lighting } from '../engine/Lighting';
import { SceneControls } from '../engine/SceneControls';
import { SceneHUD } from '../overlays/SceneHUD';
import { ProcessNode } from '../primitives/ProcessNode';
import { ResourceNode3D } from '../primitives/ResourceNode3D';
import { QueueNode3D } from '../primitives/QueueNode3D';

export function CPULaboratory3D() {
  const { processes, result, currentTime, algorithm, mlqConfig, mlfqConfig } = useSimulatorStore();

  const model = useMemo(() => {
    return createCpuVisualizationModel(processes, result, currentTime, algorithm, mlqConfig, mlfqConfig);
  }, [processes, result, currentTime, algorithm, mlqConfig, mlfqConfig]);

  const activeProcess = model.entities.find(e => e.type === 'process' && e.state === 'RUNNING');
  const statusStr = !result ? 'IDLE' : (currentTime >= model.totalSteps && model.totalSteps > 0) ? 'COMPLETED' : 'RUNNING';

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <SceneRoot>
        <group position={[0, 0, 0]}>
          {model.entities.map((entity) => {
            if (entity.type === 'resource') {
              const isCpu = entity.id === 'cpu-core';
              return (
                <ResourceNode3D 
                  key={entity.id} 
                  entity={entity} 
                  position={[isCpu ? 0 : 4, 1, isCpu ? 0 : -3]} 
                />
              );
            }
            if (entity.type === 'queue') {
              const isBlocked = entity.id === 'blocked-queue';
              // distribute queues along z axis
              const qIdx = parseInt(entity.id.split('-').pop() || '0');
              const zPos = isBlocked ? -3 : 3 + qIdx * 1.5;
              const xPos = isBlocked ? 4 : -4;
              return (
                <QueueNode3D 
                  key={entity.id} 
                  entity={entity} 
                  position={[xPos, 0, zPos]} 
                />
              );
            }
            if (entity.type === 'process') {
              // Position process based on its state
              const processIdx = parseInt(entity.id.split('-').pop() || '0');
              let pos: [number, number, number] = [-6, 0.5, 5 + processIdx * 0.5]; // NEW default
              
              if (entity.state === 'RUNNING') {
                const onCpu = model.connections.some(c => c.sourceId === entity.id && c.targetId === 'cpu-core');
                pos = onCpu ? [0, 1.5, 0] : [4, 1.5, -3]; // CPU or IO
              } else if (entity.state === 'READY') {
                const qId = parseInt(entity.metadata?.current_queue?.replace('Q', '') || '1');
                pos = [-4, 0.5, 3 + (qId-1) * 1.5]; // in Ready Queue
              } else if (entity.state === 'BLOCKED') {
                pos = [4, 0.5, -2]; // near IO
              } else if (entity.state === 'TERMINATED') {
                pos = [6, 0.5, 3 + (processIdx % 5) * 0.5]; // Terminated area
              }
              
              return (
                <ProcessNode 
                  key={entity.id} 
                  entity={entity} 
                  position={pos} 
                />
              );
            }
            return null;
          })}

          {model.connections.map((_conn) => {
            // Simplified connection logic - mostly relying on direct movement for CPU
            return null; 
          })}
        </group>
      </SceneRoot>
      
      <SceneHUD 
        title="CPU SCHEDULING LABORATORY" 
        subtitle={`Algorithm: ${algorithm} • Status: ${statusStr}`} 
        stats={[
          { label: 'Time', value: `t = ${currentTime.toFixed(1)}` },
          { label: 'Active Process', value: activeProcess ? activeProcess.label : 'NONE' },
        ]}
      />
      <SceneControls />
    </div>
  );
}
