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
  const groupRef = useRef<THREE.Group>(null);
  const { setHoveredEntity, setSelectedEntity, selectedEntity, showLabels } = useVisualization3DStore();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedEntity?.id === entity.id;

  const color = STATE_COLORS[entity.state as keyof typeof STATE_COLORS] || '#94a3b8';
  const isActive = entity.state !== 'AVAILABLE' && entity.state !== 'IDLE';
  
  useFrame((state, _delta) => {
    if (groupRef.current) {
      const targetPos = new THREE.Vector3(...position);
      groupRef.current.position.lerp(targetPos, 0.1);
    }

    if (meshRef.current) {
      const targetScale = isSelected ? 1.1 : (hovered ? 1.05 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Gentle floating if idle
      if (!isActive) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      } else {
        meshRef.current.position.y = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
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
        <boxGeometry args={[2.5, 0.8, 2.5]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.3 : (hovered ? 0.2 : 0.05)}
          roughness={0.2}
          metalness={0.6}
        />
        
        {/* Core Screen inside the resource */}
        <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, 2.3]} />
          <meshBasicMaterial color={isActive ? '#1e293b' : '#334155'} />
        </mesh>
      </mesh>

      {showLabels && (
        <>
          {/* Label floating above */}
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.4}
            color="#1e293b"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#ffffff"
            fontWeight="bold"
          >
            {entity.label}
          </Text>
          
          {/* Status text on the screen */}
          <Text
            position={[0, 0.42, -0.4]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.25}
            color={isActive ? '#10b981' : '#94a3b8'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {entity.state}
          </Text>
          
          {/* Active Process text on the screen */}
          {entity.metadata?.active_process && entity.metadata.active_process !== 'None' && (
            <Text
              position={[0, 0.42, 0.4]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.4}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {entity.metadata.active_process}
            </Text>
          )}
        </>
      )}
    </group>
  );
};
