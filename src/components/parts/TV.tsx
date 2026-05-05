import React from 'react';

export function TV({ size = [1.2, 0.8, 0.1], color = "#111111", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  const standHeight = 0.1;
  const screenHeight = size[1] - standHeight;
  
  return (
    <group>
      {/* Screen */}
      <mesh position={[0, standHeight + screenHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], screenHeight, size[2]]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Display area */}
      <mesh position={[0, standHeight + screenHeight/2, size[2]/2 + 0.005]}>
        <planeGeometry args={[size[0] - 0.05, screenHeight - 0.05]} />
        <meshStandardMaterial color="#000" roughness={0.1} metalness={0.9} emissive="#050510" />
      </mesh>
      {/* Stand Neck */}
      <mesh position={[0, standHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, standHeight, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Stand Base */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.02, 0.2]} />
        <meshStandardMaterial color="#333" />
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
