import React, { useRef } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { VisualConnection } from '../models/visualizationModel';
import * as THREE from 'three';

interface ConnectionLine3DProps {
  connection: VisualConnection;
  start: [number, number, number];
  end: [number, number, number];
}

export const ConnectionLine3D: React.FC<ConnectionLine3DProps> = ({ connection, start, end }) => {
  const materialRef = useRef<THREE.LineDashedMaterial>(null);

  useFrame((_state, delta) => {
    if (materialRef.current && connection.active) {
      (materialRef.current as any).dashOffset -= delta * 2;
    }
  });

  return (
    <Line
      points={[start, end]}
      color={connection.active ? '#3b82f6' : '#94a3b8'}
      lineWidth={connection.active ? 3 : 1}
      dashed={connection.active}
      dashScale={connection.active ? 10 : 1}
      dashSize={connection.active ? 0.5 : 1}
      dashOffset={0}
    >
      {connection.active && (
        <lineDashedMaterial ref={materialRef} attach="material" color="#3b82f6" dashSize={0.5} gapSize={0.5} />
      )}
    </Line>
  );
};
