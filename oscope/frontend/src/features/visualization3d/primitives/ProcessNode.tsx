import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { VisualEntity } from '../models/visualizationModel';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

interface ProcessNodeProps {
  entity: VisualEntity;
  position: [number, number, number];
}

const STATE_COLORS = {
  NEW: '#94a3b8',
  READY: '#3b82f6',
  RUNNING: '#10b981',
  BLOCKED: '#f59e0b',
  TERMINATED: '#ef4444',
  AVAILABLE: '#10b981',
  ALLOCATED: '#f59e0b',
  FAULT: '#ef4444',
  HIT: '#10b981',
  IDLE: '#cbd5e1'
};

export const ProcessNode: React.FC<ProcessNodeProps> = ({ entity, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setHoveredEntity, setSelectedEntity, selectedEntity, showLabels } = useVisualization3DStore();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedEntity?.id === entity.id;

  const color = STATE_COLORS[entity.state as keyof typeof STATE_COLORS] || '#3b82f6';
  
  // Reduced motion support check could be added here (e.g., const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)'))
  
  useFrame((_state, delta) => {
    if (meshRef.current && entity.state === 'RUNNING') {
      meshRef.current.rotation.y += delta * 1.5;
    }
    
    if (meshRef.current) {
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
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : (hovered ? 0.2 : 0)}
          roughness={0.2}
          metalness={0.1}
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
