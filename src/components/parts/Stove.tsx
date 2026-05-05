import React from 'react';

export function Stove({ size = [0.6, 0.9, 0.6], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, size[1]/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1] - 0.05, size[2]]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Cooktop */}
      <mesh position={[0, size[1] - 0.025, 0]}>
        <boxGeometry args={[size[0], 0.05, size[2]]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Burners */}
      <mesh position={[-0.15, size[1], -0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, size[1], -0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.15, size[1], 0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, size[1], 0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Oven Door */}
      <mesh position={[0, size[1]*0.4, size[2]/2 + 0.01]}>
        <boxGeometry args={[size[0] - 0.1, size[1]*0.5, 0.02]} />
        <meshStandardMaterial color="#111" metalness={0.8} transparent opacity={0.8} />
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
