import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useThree } from '@react-three/fiber';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    // Expose reset globally if needed, or handle it via a store/event
    const handleCameraReset = () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);
      }
    };
    
    window.addEventListener('oscope:3d-camera-reset', handleCameraReset);
    return () => window.removeEventListener('oscope:3d-camera-reset', handleCameraReset);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2 + 0.1}
    />
  );
};
