import React from 'react';

export function Chair({ size = [0.5, 1, 0.5], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  const seatHeight = size[1] * 0.45;
  const thickness = 0.05;

  return (
    <group>
      {/* Seat */}
      <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], thickness, size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, (size[1] + seatHeight)/2, -size[2]/2 + thickness/2]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1] - seatHeight, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Legs */}
      {[
        [-size[0]/2 + thickness/2, -size[2]/2 + thickness/2],
        [size[0]/2 - thickness/2, -size[2]/2 + thickness/2],
        [-size[0]/2 + thickness/2, size[2]/2 - thickness/2],
        [size[0]/2 - thickness/2, size[2]/2 - thickness/2]
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], seatHeight/2, pos[1]]} castShadow receiveShadow>
          <boxGeometry args={[thickness, seatHeight, thickness]} />
          <meshStandardMaterial color="#666" metalness={0.2} roughness={0.8} />
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
