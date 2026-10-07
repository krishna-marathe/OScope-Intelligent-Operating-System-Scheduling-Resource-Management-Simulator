import React, { useMemo } from 'react';
import { 
  SceneRoot, 
  ProcessNode, 
  ResourceNode3D, 
  QueueNode3D, 
  MemoryBlock3D, 
  ConnectionLine3D,
  VisualEntity,
  VisualConnection
} from '../index';

export const GenericLaboratory3D: React.FC = () => {
  // Generate some generic domain-independent entities just to show the engine works.
  const entities = useMemo<VisualEntity[]>(() => [
    { id: 'p1', type: 'process', label: 'P1', state: 'RUNNING' },
    { id: 'p2', type: 'process', label: 'P2', state: 'READY' },
    { id: 'p3', type: 'process', label: 'P3', state: 'BLOCKED' },
    
    { id: 'r1', type: 'resource', label: 'R1', state: 'ALLOCATED' },
    { id: 'r2', type: 'resource', label: 'R2', state: 'AVAILABLE' },
    
    { id: 'q1', type: 'queue', label: 'Ready Queue', state: 'AVAILABLE' },
    
    { id: 'm1', type: 'memory_block', label: 'Frame 0', state: 'ALLOCATED' },
    { id: 'm2', type: 'memory_block', label: 'Frame 1', state: 'AVAILABLE' },
  ], []);

  const connections = useMemo<VisualConnection[]>(() => [
    { id: 'c1', sourceId: 'p1', targetId: 'r1', active: true },
    { id: 'c2', sourceId: 'p3', targetId: 'r1', active: false },
  ], []);

  return (
    <SceneRoot title="OS Laboratory" subtitle="Generic 3D Overview (Foundation)">
      {/* Queues */}
      <QueueNode3D entity={entities.find(e => e.id === 'q1')!} position={[-5, 0, -3]} length={6} />
      
      {/* Processes */}
      <ProcessNode entity={entities.find(e => e.id === 'p1')!} position={[0, 0.5, 2]} />
      <ProcessNode entity={entities.find(e => e.id === 'p2')!} position={[-4, 0.5, -3]} />
      <ProcessNode entity={entities.find(e => e.id === 'p3')!} position={[4, 0.5, 2]} />
      
      {/* Resources */}
      <ResourceNode3D entity={entities.find(e => e.id === 'r1')!} position={[2, 0.5, -2]} />
      <ResourceNode3D entity={entities.find(e => e.id === 'r2')!} position={[6, 0.5, -2]} />
      
      {/* Memory */}
      <MemoryBlock3D entity={entities.find(e => e.id === 'm1')!} position={[-8, 0, 2]} />
      <MemoryBlock3D entity={entities.find(e => e.id === 'm2')!} position={[-8, 0, 5]} />
      
      {/* Connections */}
      <ConnectionLine3D connection={connections[0]} start={[0, 0.5, 2]} end={[2, 0.5, -2]} />
      <ConnectionLine3D connection={connections[1]} start={[4, 0.5, 2]} end={[2, 0.5, -2]} />
    </SceneRoot>
  );
};
