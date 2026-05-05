import React from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';

export function Bed({ size = [2, 0.5, 1.5], color = "#ffffff", isSelected = false }: { size?: [number, number, number], color?: string, isSelected?: boolean }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, size[1]/4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1]/2, size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, size[1]/2 + 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0] - 0.1, 0.2, size[2] - 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Pillow */}
      <mesh position={[-size[0]/2 + 0.3, size[1]/2 + 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.1, size[2]/2]} />
        <meshStandardMaterial color="#e2e8f0" />
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
