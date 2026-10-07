import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { VisualEntity } from '../models/visualizationModel';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

interface MemoryBlock3DProps {
  entity: VisualEntity;
  position: [number, number, number];
}

const STATE_COLORS = {
  ALLOCATED: '#3b82f6',
  AVAILABLE: '#cbd5e1',
  FAULT: '#ef4444',
  HIT: '#10b981'
};

export const MemoryBlock3D: React.FC<MemoryBlock3DProps> = ({ entity, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setHoveredEntity, setSelectedEntity, selectedEntity, showLabels } = useVisualization3DStore();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedEntity?.id === entity.id;

  const color = STATE_COLORS[entity.state as keyof typeof STATE_COLORS] || '#cbd5e1';
  
  useFrame((state, _delta) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.1 : (hovered ? 1.05 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
      
      if (entity.state === 'FAULT') {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.1;
      } else {
        meshRef.current.position.y = position[1];
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredEntity(entity);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          setHoveredEntity(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEntity(entity);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={entity.state === 'AVAILABLE' ? 0.6 : 1}
        />
      </mesh>

      {showLabels && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.3}
          color={entity.state === 'AVAILABLE' ? '#64748b' : '#ffffff'}
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {entity.label}
        </Text>
      )}
    </group>
  );
};
