import React from 'react';

export function Toilet({ size = [0.5, 0.8, 0.7], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Tank */}
      <mesh position={[0, size[1]/2 + 0.1, -size[2]/2 + 0.15]} castShadow receiveShadow>
        <boxGeometry args={[size[0], 0.4, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.1} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0.05]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
        <meshStandardMaterial color={color} roughness={0.1} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.45, 0.05]} castShadow receiveShadow>
        <torusGeometry args={[0.2, 0.05, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.1} />
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
