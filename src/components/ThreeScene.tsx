import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Edges, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export function Scene() {
  const { designData, selectedContainerId, selectContainer } = useAppStore();

  if (!designData) return null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="city" />
      
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        sectionColor={'#a0aab5'} 
        cellColor={'#e2e8f0'} 
        cellSize={1} 
        sectionSize={5} 
      />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={50} blur={2} far={10} />
      
      {designData.containers.map((container: any) => {
        const isSelected = container.id === selectedContainerId;

        return (
          <mesh 
            key={container.id} 
            position={container.position}
            rotation={container.rotation}
            onClick={(e) => {
              e.stopPropagation();
              selectContainer(container.id);
            }}
            onPointerMissed={(e) => {
              if (e.type === 'click') {
                selectContainer(null);
              }
            }}
            castShadow
            receiveShadow
          >
            <boxGeometry args={container.size} />
            <meshStandardMaterial 
              color={container.color} 
              roughness={0.4}
              metalness={0.1}
            />
            {isSelected && (
              <Edges 
                scale={1.01} 
                threshold={15}
                color="orange" 
              />
            )}
          </mesh>
        );
      })}

      <OrbitControls makeDefault />
    </>
  );
}
