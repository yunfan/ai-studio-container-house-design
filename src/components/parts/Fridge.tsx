import React from 'react';

export function Fridge({ size = [0.8, 1.8, 0.8], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, size[1]/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Doors split line */}
      <mesh position={[0, size[1]*0.6, size[2]/2 + 0.01]}>
        <boxGeometry args={[size[0], 0.02, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Handles */}
      <mesh position={[-size[0]/3, size[1]*0.7, size[2]/2 + 0.03]}>
        <boxGeometry args={[0.02, 0.3, 0.04]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
      </mesh>
      <mesh position={[-size[0]/3, size[1]*0.3, size[2]/2 + 0.03]}>
        <boxGeometry args={[0.02, 0.4, 0.04]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} />
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
