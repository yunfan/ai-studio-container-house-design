import React from 'react';

export function Table({ size = [1.5, 0.8, 0.8], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  const topThickness = 0.05;
  const legSize = 0.05;
  const legHeight = size[1] - topThickness;

  return (
    <group>
      {/* Top */}
      <mesh position={[0, size[1] - topThickness/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], topThickness, size[2]]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Legs */}
      {[
        [-size[0]/2 + legSize/2, -size[2]/2 + legSize/2],
        [size[0]/2 - legSize/2, -size[2]/2 + legSize/2],
        [-size[0]/2 + legSize/2, size[2]/2 - legSize/2],
        [size[0]/2 - legSize/2, size[2]/2 - legSize/2]
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], legHeight/2, pos[1]]} castShadow receiveShadow>
          <boxGeometry args={[legSize, legHeight, legSize]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {isSelected && (
        <mesh position={[0, size[1]/2, 0]}>
          <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, size[2] + 0.05]} />
          <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
