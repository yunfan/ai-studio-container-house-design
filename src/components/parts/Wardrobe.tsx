import React from 'react';

export function Wardrobe({ size = [1.2, 2.0, 0.6], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, size[1]/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Doors split */}
      <mesh position={[0, size[1]/2, size[2]/2 + 0.01]}>
        <boxGeometry args={[0.01, size[1] - 0.1, 0.02]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Door handles */}
      <mesh position={[-0.05, size[1]/2, size[2]/2 + 0.02]} castShadow>
        <boxGeometry args={[0.02, 0.15, 0.03]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      <mesh position={[0.05, size[1]/2, size[2]/2 + 0.02]} castShadow>
        <boxGeometry args={[0.02, 0.15, 0.03]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
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
