import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, scene } = useThree();

  useEffect(() => {
    const handleCameraReset = () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);
      }
    };
    
    const handleCameraFit = () => {
      if (controlsRef.current) {
        const box = new THREE.Box3().setFromObject(scene);
        if (box.isEmpty()) return;
        
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.5; // zoom out a little extra
        
        camera.position.set(center.x, center.y + maxDim / 2, center.z + cameraZ);
        controlsRef.current.target.set(center.x, center.y, center.z);
        controlsRef.current.update();
      }
    };

    window.addEventListener('oscope:3d-camera-reset', handleCameraReset);
    window.addEventListener('oscope:3d-camera-fit', handleCameraFit);
    
    // Auto fit on mount after a short delay to allow rendering
    const timer = setTimeout(handleCameraFit, 500);
    
    return () => {
      window.removeEventListener('oscope:3d-camera-reset', handleCameraReset);
      window.removeEventListener('oscope:3d-camera-fit', handleCameraFit);
      clearTimeout(timer);
    };
  }, [camera, scene]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={200}
      maxPolarAngle={Math.PI / 2 + 0.1}
    />
  );
};
