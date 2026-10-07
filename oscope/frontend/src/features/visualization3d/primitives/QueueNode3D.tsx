import React from 'react';
import { Text } from '@react-three/drei';
import { VisualEntity } from '../models/visualizationModel';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

interface QueueNode3DProps {
  entity: VisualEntity;
  position: [number, number, number];
  length?: number;
}

export const QueueNode3D: React.FC<QueueNode3DProps> = ({ entity, position, length = 5 }) => {
  const { showLabels } = useVisualization3DStore();

  return (
    <group position={position}>
      <mesh receiveShadow position={[length / 2 - 0.5, -0.6, 0]}>
        <boxGeometry args={[length + 1, 0.2, 2]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} roughness={0.9} />
      </mesh>
      
      {showLabels && (
        <Text
          position={[-1.5, 0, 0]}
          fontSize={0.5}
          color="#475569"
          anchorX="right"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {entity.label}
        </Text>
      )}
    </group>
  );
};
