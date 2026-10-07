import React from 'react';
import { Environment as DreiEnvironment } from '@react-three/drei';

export const Environment: React.FC = () => {
  return (
    <DreiEnvironment preset="city" />
  );
};
