import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.2} />
    </>
  );
};
