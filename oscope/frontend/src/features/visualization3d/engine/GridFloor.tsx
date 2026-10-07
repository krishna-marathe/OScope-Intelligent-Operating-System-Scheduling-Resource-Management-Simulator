import React from 'react';
import { useVisualization3DStore } from '../store/useVisualization3DStore';

export const GridFloor: React.FC = () => {
  const showGrid = useVisualization3DStore((state) => state.showGrid);

  if (!showGrid) return null;

  return (
    <gridHelper 
      args={[100, 100, '#64748b', '#cbd5e1']} 
      position={[0, -0.01, 0]} 
    />
  );
};
