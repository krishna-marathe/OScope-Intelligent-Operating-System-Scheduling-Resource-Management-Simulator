import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { Lighting } from './Lighting';
import { Environment } from './Environment';
import { GridFloor } from './GridFloor';
import { SceneControls } from './SceneControls';
import { SceneHUD } from '../overlays/SceneHUD';
import { ObjectTooltip } from '../interaction/ObjectTooltip';

interface SceneRootProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const SceneRoot: React.FC<SceneRootProps> = ({ children, title = '3D Laboratory', subtitle }) => {
  return (
    <div id="oscope-3d-container" className="relative w-full h-full min-h-[400px] bg-slate-50 rounded-lg overflow-hidden flex flex-col group">
      <SceneHUD title={title} subtitle={subtitle} />
      
      <div className="flex-1 w-full relative cursor-move">
        <Canvas 
          shadows
          camera={{ position: [0, 10, 20], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f8fafc'); // slate-50
          }}
        >
          <Lighting />
          <Environment />
          <GridFloor />
          <CameraController />
          
          <group position={[0, 0, 0]}>
            {children}
          </group>
        </Canvas>
        
        <ObjectTooltip />
      </div>
      
      <SceneControls />
    </div>
  );
};
