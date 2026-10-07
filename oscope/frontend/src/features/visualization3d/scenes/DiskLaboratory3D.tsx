import { useMemo } from 'react';
import { useDiskStore } from '../../../store/useDiskStore';
import { createDiskVisualizationModel } from '../adapters/diskVisualizationAdapter';
import { SceneRoot } from '../engine/SceneRoot';
import { CameraController } from '../engine/CameraController';
import { Environment } from '../engine/Environment';
import { GridFloor } from '../engine/GridFloor';
import { Lighting } from '../engine/Lighting';
import { SceneControls } from '../engine/SceneControls';
import { SceneHUD } from '../overlays/SceneHUD';
import { DiskTrack3D } from '../primitives/DiskTrack3D';
import { ResourceNode3D } from '../primitives/ResourceNode3D';
import { ConnectionLine3D } from '../primitives/ConnectionLine3D';

export function DiskLaboratory3D() {
  const { result, currentStep, algorithm, diskSize, direction } = useDiskStore();

  const model = useMemo(() => {
    return createDiskVisualizationModel(result, currentStep, diskSize);
  }, [result, currentStep, diskSize]);

  // Normalize radius 2 to 10
  const maxCylinder = Math.max(diskSize, 1);
  const getRadius = (cyl: number) => 2 + (cyl / maxCylinder) * 8;

  const currentHeadPos = model.entities.find(e => e.id === 'disk-head')?.metadata?.position as number || 0;
  const currentDir = model.entities.find(e => e.id === 'disk-head')?.metadata?.direction as string || 'NONE';

  const statusStr = !result ? 'IDLE' : currentStep >= (result.movement_steps.length) ? 'COMPLETED' : 'SEEKING';

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <SceneRoot>
        <group position={[0, 0, 0]}>
          {model.entities.map((entity) => {
            if (entity.type === 'disk_track') {
              const cyl = entity.metadata?.cylinder as number;
              const radius = getRadius(cyl);
              return (
                <DiskTrack3D 
                  key={entity.id} 
                  entity={entity} 
                  position={[0, 0, 0]} 
                  radius={radius}
                />
              );
            }
            if (entity.id === 'disk-head') {
              const cyl = entity.metadata?.position as number;
              const radius = getRadius(cyl);
              return (
                <ResourceNode3D
                  key={entity.id}
                  entity={entity}
                  position={[radius, 0.5, 0]}
                />
              );
            }
            return null;
          })}

          {model.connections.map((conn) => {
            const startEntity = model.entities.find(e => e.id === conn.sourceId);
            const endEntity = model.entities.find(e => e.id === conn.targetId);
            if (startEntity && endEntity) {
              const startR = getRadius(startEntity.metadata?.cylinder as number);
              const endR = getRadius(endEntity.metadata?.cylinder as number);
              return (
                <ConnectionLine3D
                  key={conn.id}
                  connection={conn}
                  start={[startR, 0.5, 0]}
                  end={[endR, 0.5, 0]}
                />
              );
            }
            return null;
          })}
        </group>
      </SceneRoot>
      
      <SceneHUD 
        title="DISK SCHEDULING LABORATORY" 
        subtitle={`Algorithm: ${algorithm} • Direction: ${direction}`}
        stats={[
          { label: 'Status', value: statusStr },
          { label: 'Head Pos', value: currentHeadPos.toString() },
          { label: 'Movement', value: currentDir },
          { label: 'Total Seek', value: result?.total_head_movement?.toString() || '0' },
          { label: 'Completed', value: `${currentStep} / ${result?.request_queue.length || 0}` }
        ]}
      />
      <SceneControls />
    </div>
  );
}
