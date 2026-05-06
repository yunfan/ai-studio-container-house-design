import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Bed } from './Bed';
import { Sofa } from './Sofa';
import { Fridge } from './Fridge';
import { Toilet } from './Toilet';
import { TV } from './TV';
import { Table } from './Table';
import { Chair } from './Chair';
import { Wardrobe } from './Wardrobe';
import { Sink } from './Sink';
import { Shower } from './Shower';
import { Stove } from './Stove';

const PartComponents: Record<string, React.FC<any>> = {
  'Bed': Bed,
  'Sofa': Sofa,
  'Fridge': Fridge,
  'Toilet': Toilet,
  'TV': TV,
  'Table': Table,
  'Chair': Chair,
  'Wardrobe': Wardrobe,
  'Sink': Sink,
  'Shower': Shower,
  'Stove': Stove,
};

export function PartRenderer() {
  const parts = useAppStore(state => state.designData?.parts);
  const safeParts = parts || [];
  const selectedPartId = useAppStore(state => state.selectedPartId);
  const selectPart = useAppStore(state => state.selectPart);
  const updatePart = useAppStore(state => state.updatePart);
  const addPart = useAppStore(state => state.addPart);
  const setPanelOpen = useAppStore(state => state.setPanelOpen);

  // Keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPartId) return;
      const part = useAppStore.getState().designData?.parts?.find((p: any) => p.id === selectedPartId);
      if (!part) return;

      const step = 0.1;
      let newPos = [...part.position] as [number, number, number];
      let newRot = [...part.rotation] as [number, number, number];

      switch(e.key) {
        case 'ArrowUp': newPos[2] -= step; break;
        case 'ArrowDown': newPos[2] += step; break;
        case 'ArrowLeft': newPos[0] -= step; break;
        case 'ArrowRight': newPos[0] += step; break;
        case 'q': newRot[1] += Math.PI / 4; break; // Rotate
        case 'e': newRot[1] -= Math.PI / 4; break;
        default: return;
      }
      
      const designData = useAppStore.getState().designData;
      const allParts = designData?.parts || [];
      const containers = designData?.containers || [];
      
      const getRadius = (p: any) => Math.max(p.scale[0], p.scale[2]) / 2;
      const myRadius = getRadius(part) * 0.9; // slight tolerance

      let isInsideContainer = false;
      let targetFloorY = 0;

      // 1. Check against container bounds (must remain inside) and get floor Y
      if (containers.length > 0) {
        for (const c of containers) {
          const cMinX = c.position[0] - c.size[0] / 2;
          const cMaxX = c.position[0] + c.size[0] / 2;
          const cMinZ = c.position[2] - c.size[2] / 2;
          const cMaxZ = c.position[2] + c.size[2] / 2;

          if (
            newPos[0] - myRadius >= cMinX &&
            newPos[0] + myRadius <= cMaxX &&
            newPos[2] - myRadius >= cMinZ &&
            newPos[2] + myRadius <= cMaxZ
          ) {
            isInsideContainer = true;
            targetFloorY = c.position[1] - c.size[1] / 2;
            break;
          }
        }
      }

      // Allow movement only if inside bounds
      if (isInsideContainer || containers.length === 0) {
        // 2. Gravity and Stacking logic
        let highestY = targetFloorY;

        for (const p of allParts) {
          if (p.id === part.id) continue;
          const pRadius = getRadius(p) * 0.9;
          const distSq = Math.pow(newPos[0] - p.position[0], 2) + Math.pow(newPos[2] - p.position[2], 2);
          
          if (distSq < Math.pow(myRadius + pRadius, 2)) {
            // It's overlapping on X/Z plane. Stack it on top!
            const pTop = p.position[1] + (p.scale[1] / 2);
            if (pTop > highestY) {
              highestY = pTop;
            }
          }
        }

        newPos[1] = highestY + (part.scale[1] / 2);

        updatePart(selectedPartId, { position: newPos, rotation: newRot });
      }
      
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPartId]);

  return (
    <>
      {safeParts.map((p: any) => {
        const Component = PartComponents[p.type];
        if (!Component) return null;

        const isSelected = selectedPartId === p.id;
        
        return (
          <group 
            key={p.id} 
            position={p.position} 
            rotation={p.rotation}
            onClick={(e) => {
              e.stopPropagation();
              if (e.delta <= 2) {
                selectPart(p.id);
                setPanelOpen(true);
              }
            }}
          >
            <Component size={p.scale} color={p.color} isSelected={isSelected} />
          </group>
        );
      })}
    </>
  );
}
