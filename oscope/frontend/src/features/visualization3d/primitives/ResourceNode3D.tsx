import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { VisualEntity } from '../models/visualizationModel';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

interface ResourceNode3DProps {
  entity: VisualEntity;
  position: [number, number, number];
}

const STATE_COLORS = {
  AVAILABLE: '#10b981',
  ALLOCATED: '#f59e0b',
  IDLE: '#94a3b8'
};

export const ResourceNode3D: React.FC<ResourceNode3DProps> = ({ entity, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setHoveredEntity, setSelectedEntity, selectedEntity, showLabels } = useVisualization3DStore();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedEntity?.id === entity.id;

  const color = STATE_COLORS[entity.state as keyof typeof STATE_COLORS] || '#94a3b8';
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (entity.state === 'AVAILABLE') {
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.position.y = position[1];
      }
      
      const targetScale = isSelected ? 1.2 : (hovered ? 1.1 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
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
        <octahedronGeometry args={[0.7]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : (hovered ? 0.3 : 0.1)}
          roughness={0.1}
          metalness={0.8}
          wireframe={entity.state !== 'AVAILABLE'}
        />
      </mesh>

      {showLabels && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color="#334155"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {entity.label}
        </Text>
      )}
    </group>
  );
};
