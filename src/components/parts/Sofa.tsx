import React from 'react';

export function Sofa({ size = [2, 0.8, 1], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, size[1]/4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1]/2, size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, size[1]/2 + size[1]/4, -size[2]/2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1]/2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-size[0]/2 + 0.1, size[1]/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, size[1]/2, size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size[0]/2 - 0.1, size[1]/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, size[1]/2, size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, size[1]/2, 0]}>
          <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, size[2] + 0.05]} />
          <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.5} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
