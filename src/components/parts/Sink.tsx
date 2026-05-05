import React from 'react';

export function Sink({ size = [0.8, 0.9, 0.6], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Cabinet */}
      <mesh position={[0, size[1]/2 - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1] - 0.1, size[2]]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, size[1] - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0] + 0.02, 0.1, size[2] + 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.1} />
      </mesh>
      {/* Sink Bowl */}
      <mesh position={[0, size[1] - 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.1} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, size[1] + 0.1, -0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} />
        <meshStandardMaterial color="#bbb" metalness={0.9} roughness={0.1} />
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
