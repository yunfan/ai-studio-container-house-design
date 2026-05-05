import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { PartRenderer } from './parts/PartRenderer';

function CameraController() {
  const { camera, controls } = useThree();
  const cameraResetTrigger = useAppStore(state => state.cameraResetTrigger);
  const designData = useAppStore(state => state.designData);
  const selectedContainerId = useAppStore(state => state.selectedContainerId);
  const cameraZoom = useAppStore(state => state.cameraZoom);
  const prevSizeRef = useRef<number[] | null>(null);

  // Apply zoom
  useEffect(() => {
    if (camera) {
      camera.zoom = cameraZoom;
      camera.updateProjectionMatrix();
    }
  }, [cameraZoom, camera]);

  // Jump to isometric angle & fit bounds
  useEffect(() => {
    if (cameraResetTrigger > 0 && controls && designData?.containers.length > 0) {
      const box = new THREE.Box3();
      designData.containers.forEach((c: any) => {
        const cBox = new THREE.Box3();
        cBox.setFromCenterAndSize(
          new THREE.Vector3(...c.position),
          new THREE.Vector3(...c.size)
        );
        box.union(cBox);
      });

      const center = new THREE.Vector3();
      box.getCenter(center);
      
      const size = new THREE.Vector3();
      box.getSize(size);

      const radius = size.length() / 2;
      const fov = 45 * (Math.PI / 180);
      const distance = (radius / Math.sin(fov / 2)) * 1.0;

      const dir = new THREE.Vector3(1, 0.8, 1).normalize();
      
      camera.position.copy(center).add(dir.multiplyScalar(distance));
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      
      const orbitControls = controls as any;
      orbitControls.target.copy(center);
      orbitControls.update();
    }
  }, [cameraResetTrigger, camera, controls, designData?.containers.length]);

  // Adjust camera distance dynamically when size changes to maintain 80% coverage
  useEffect(() => {
    if (!controls || !designData) return;
    const selectedContainer = designData.containers.find((c: any) => c.id === selectedContainerId);
    if (!selectedContainer) return;
    
    const size = selectedContainer.size;
    const prevSize = prevSizeRef.current;
    
    if (prevSize && (size[0] !== prevSize[0] || size[1] !== prevSize[1] || size[2] !== prevSize[2])) {
      const radius = Math.sqrt(size[0]*size[0] + size[1]*size[1] + size[2]*size[2]) / 2;
      const fov = 45 * (Math.PI / 180);
      const newDistance = (radius / Math.sin(fov / 2)) * 1.0;

      const orbitControls = controls as any;
      const currentDir = new THREE.Vector3().subVectors(camera.position, orbitControls.target).normalize();
      
      orbitControls.target.set(...selectedContainer.position);
      camera.position.copy(orbitControls.target).add(currentDir.multiplyScalar(newDistance));
      camera.updateProjectionMatrix();
      orbitControls.update();
    }
    
    prevSizeRef.current = [...size];
  }, [designData, selectedContainerId, controls, camera]);

  return null;
}

export function Scene() {
  const { designData, selectedContainerId, selectContainer, setPanelOpen } = useAppStore();

  if (!designData) return null;

  return (
    <>
      <CameraController />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
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
            scale={container.size}
            onClick={(e) => {
              e.stopPropagation();
              if (e.delta <= 2) {
                selectContainer(container.id);
                setPanelOpen(true);
              }
            }}
            onPointerMissed={(e) => {
              if (e.type === 'click') {
                setPanelOpen(false);
              }
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={container.color} 
              roughness={0.8}
              metalness={0.1}
              side={THREE.BackSide} /* Hides front faces to see interior */
            />
            {isSelected && (
              <Edges 
                scale={1.01} 
                threshold={15}
                color="#4f46e5" 
              />
            )}
          </mesh>
        );
      })}

      <PartRenderer />

      <OrbitControls 
        makeDefault 
        enableDamping={true} 
        dampingFactor={0.05} 
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
    </>
  );
}
