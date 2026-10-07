import React from 'react';
import { Text } from '@react-three/drei';

interface Label3DProps {
  text: string;
  position: [number, number, number];
  color?: string;
  fontSize?: number;
}

export const Label3D: React.FC<Label3DProps> = ({ 
  text, 
  position, 
  color = '#334155', 
  fontSize = 0.5 
}) => {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#ffffff"
    >
      {text}
    </Text>
  );
};
