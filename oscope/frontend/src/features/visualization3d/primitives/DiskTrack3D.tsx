import React from 'react';
import { Text } from '@react-three/drei';
import { VisualEntity } from '../models/visualizationModel';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

interface DiskTrack3DProps {
  entity: VisualEntity;
  position: [number, number, number];
  radius: number;
}

export const DiskTrack3D: React.FC<DiskTrack3DProps> = ({ entity, position, radius }) => {
  const { showLabels, setHoveredEntity, setSelectedEntity, selectedEntity } = useVisualization3DStore();
  const isSelected = selectedEntity?.id === entity.id;

  return (
    <group position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredEntity(entity);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredEntity(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEntity(entity);
        }}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <ringGeometry args={[radius - 0.2, radius, 64]} />
        <meshStandardMaterial 
          color={isSelected ? '#3b82f6' : (entity.state === 'ALLOCATED' ? '#ef4444' : '#e2e8f0')} 
          side={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {showLabels && entity.state === 'ALLOCATED' && (
        <Text
          position={[0, 0.5, radius]}
          fontSize={0.4}
          color="#334155"
          anchorX="center"
          anchorY="middle"
        >
          {entity.label}
        </Text>
      )}
    </group>
  );
};
