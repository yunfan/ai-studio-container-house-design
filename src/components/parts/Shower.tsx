import React from 'react';

export function Shower({ size = [0.9, 2.0, 0.9], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], 0.1, size[2]]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Glass Walls */}
      <mesh position={[0, size[1]/2, size[2]/2]}>
        <boxGeometry args={[size[0], size[1], 0.02]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.3} metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[-size[0]/2, size[1]/2, 0]}>
        <boxGeometry args={[0.02, size[1], size[2]]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.3} metalness={0.5} roughness={0.1} />
      </mesh>
      {/* Shower Head */}
      <mesh position={[0, size[1] - 0.1, -size[2]/2 + 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, size[1]/2, -size[2]/2]} receiveShadow>
        <boxGeometry args={[size[0], size[1], 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size[0]/2, size[1]/2, 0]} receiveShadow>
        <boxGeometry args={[0.05, size[1], size[2]]} />
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
