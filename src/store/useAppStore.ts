import { create } from 'zustand';
import { vfs, ProjectMeta, ProjectDrive } from '../services/vfs';
import { v4 as uuidv4 } from 'uuid';

export const PART_DEFAULT_SIZES: Record<string, [number, number, number]> = {
  'Bed': [2, 0.5, 1.5],
  'Sofa': [2, 0.8, 1],
  'Fridge': [0.8, 1.8, 0.8],
  'Toilet': [0.5, 0.8, 0.7],
  'TV': [1.2, 0.8, 0.1],
  'Table': [1.5, 0.8, 0.8],
  'Chair': [0.5, 1, 0.5],
  'Wardrobe': [1.2, 2.0, 0.6],
  'Sink': [0.8, 0.9, 0.6],
  'Shower': [0.9, 2.0, 0.9],
  'Stove': [0.6, 0.9, 0.6]
};

interface Part {
  id: string;
  type: string; // 'Bed', 'Toilet', 'Sofa', 'Fridge', etc.
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: [number, number, number]; // This is effectively the size
}

interface AppState {
  // App view state
  view: 'workspace' | 'editor';
  projects: ProjectMeta[];
  currentDrive: ProjectDrive | null;
  selectedFile: string | null;
  
  // 3D Design State (Parsed from currentDrive.files['design.json'])
  designData: any | null;
  selectedContainerId: string | null;
  selectedPartId: string | null;

  // Actions
  loadWorkspace: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  deleteProject: (id: string) => Promise<void>;
  importProject: (file: File) => Promise<void>;

  // Panel
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  isLibraryOpen: boolean;
  setLibraryOpen: (open: boolean) => void;
  isSceneListOpen: boolean;
  setSceneListOpen: (open: boolean) => void;

  // File Actions
  selectFile: (path: string) => void;
  saveDesignData: () => Promise<void>;

  // Design Actions
  addContainer: () => void;
  updateContainer: (id: string, updates: any) => void;
  removeContainer: (id: string) => void;
  selectContainer: (id: string | null) => void;

  // Part Actions
  addPart: (type: string) => void;
  updatePart: (id: string, updates: Partial<Part>) => void;
  removePart: (id: string) => void;
  selectPart: (id: string | null) => void;
  
  // Camera
  cameraZoom: number;
  setCameraZoom: (zoom: number) => void;
  cameraResetTrigger: number;
  resetCameraToIsometric: () => void;
  
  // Scene Fullscreen
  isFullscreen: boolean;
  setFullscreen: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'workspace',
  projects: [],
  currentDrive: null,
  selectedFile: null,
  designData: null,
  selectedContainerId: null,
  selectedPartId: null,
  isPanelOpen: false,
  isLibraryOpen: false,
  isSceneListOpen: false,

  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setLibraryOpen: (open) => set({ isLibraryOpen: open }),
  setSceneListOpen: (open) => set({ isSceneListOpen: open }),

  loadWorkspace: async () => {
    const projects = await vfs.getProjects();
    set({ projects, view: 'workspace', currentDrive: null, selectedFile: null });
  },

  createProject: async (name) => {
    const meta = await vfs.createProject(name);
    await get().loadWorkspace();
    await get().openProject(meta.id);
  },

  openProject: async (id) => {
    const drive = await vfs.loadProject(id);
    if (drive) {
      let designData = null;
      if (drive.files['design.json']) {
        try {
          designData = JSON.parse(drive.files['design.json']);
        } catch(e) {
          console.error("Failed to parse design.json", e);
        }
      }
      set({ 
        currentDrive: drive, 
        view: 'editor', 
        selectedFile: 'design.json',
        designData,
        selectedContainerId: designData?.containers?.[0]?.id || null,
        selectedPartId: null,
        isPanelOpen: false
      });
    }
  },

  closeProject: () => {
    set({ currentDrive: null, view: 'workspace', selectedFile: null, designData: null, selectedContainerId: null, selectedPartId: null, isPanelOpen: false, isLibraryOpen: false });
    get().loadWorkspace();
  },

  deleteProject: async (id) => {
    await vfs.deleteProject(id);
    await get().loadWorkspace();
  },

  importProject: async (file) => {
    await vfs.importFromZip(file);
    await get().loadWorkspace();
  },

  selectFile: (path) => {
    set({ selectedFile: path, selectedContainerId: null, selectedPartId: null });
  },

  saveDesignData: async () => {
    const { currentDrive, designData } = get();
    if (currentDrive && designData) {
      const content = JSON.stringify(designData, null, 2);
      await vfs.saveProjectFile(currentDrive.meta.id, 'design.json', content);
      
      // Update in-memory drive state
      set((state) => {
        if (state.currentDrive) {
          return {
            currentDrive: {
              ...state.currentDrive,
              files: {
                ...state.currentDrive.files,
                'design.json': content
              }
            }
          };
        }
        return state;
      });
    }
  },

  addContainer: async () => {
    const { designData, saveDesignData } = get();
    if (!designData) return;
    
    // Find a good position
    const count = designData.containers.length;
    const offset = count * 6.5;

    const newContainer = {
      id: uuidv4(),
      position: [0 + offset, 1.5, 0], // Default 3x6x3, so center y is 1.5
      rotation: [0, 0, 0],
      size: [6, 3, 3], // Width, Height, Depth
      color: '#ffffff'
    };

    set((state) => ({
      designData: {
        ...state.designData!,
        containers: [...state.designData!.containers, newContainer]
      },
      selectedContainerId: newContainer.id
    }));
    
    await saveDesignData();
  },

  updateContainer: (id, updates) => {
    set((state) => {
      if (!state.designData) return state;
      return {
        designData: {
          ...state.designData,
          containers: state.designData.containers.map((c: any) => 
            c.id === id ? { ...c, ...updates } : c
          )
        }
      }
    });
    
    // Debounce save to prevent massive IndexedDB lag which freezes the Canvas
    const w = window as any;
    clearTimeout(w.dbSaveTimeout);
    w.dbSaveTimeout = setTimeout(() => {
      get().saveDesignData();
    }, 300);
  },

  removeContainer: async (id) => {
    set((state) => {
      if (!state.designData) return state;
      return {
        designData: {
          ...state.designData,
          containers: state.designData.containers.filter((c: any) => c.id !== id)
        },
        selectedContainerId: state.selectedContainerId === id ? null : state.selectedContainerId
      }
    });
    await get().saveDesignData();
  },

  selectContainer: (id) => {
    set({ selectedContainerId: id, selectedPartId: null });
  },

  addPart: async (type) => {
    const { designData, saveDesignData, selectedContainerId } = get();
    if (!designData) return;
    
    // Always attach to the selected container, or default to world if none (we'll assume selected container)
    // If no container, don't allow? Or just world coordinates.
    // Let's use world coordinates but check floor Y.
    // If we have a selected container, let's place it inside it.
    let y = 0;
    let x = 0;
    let z = 0;

    const selectedContainer = designData.containers.find((c: any) => c.id === selectedContainerId);
    if (selectedContainer) {
      y = selectedContainer.position[1] - selectedContainer.size[1] / 2;
      x = selectedContainer.position[0];
      z = selectedContainer.position[2];
    } else if (designData.containers.length > 0) {
      const c = designData.containers[0];
      y = c.position[1] - c.size[1] / 2;
      x = c.position[0];
      z = c.position[2];
    }

    const newPart: Part = {
      id: uuidv4(),
      type,
      position: [x, y, z],
      rotation: [0, 0, 0],
      scale: PART_DEFAULT_SIZES[type] || [1, 1, 1],
      color: '#ffffff'
    };

    set((state) => ({
      designData: {
        ...state.designData!,
        parts: [...(state.designData!.parts || []), newPart]
      },
      selectedPartId: newPart.id,
      selectedContainerId: null // Deselect container to focus on part
    }));
    
    await saveDesignData();
  },

  updatePart: (id, updates) => {
    set((state) => {
      if (!state.designData) return state;
      return {
        designData: {
          ...state.designData,
          parts: (state.designData.parts || []).map((p: Part) => 
            p.id === id ? { ...p, ...updates } : p
          )
        }
      }
    });
    
    const w = window as any;
    clearTimeout(w.dbSaveTimeout);
    w.dbSaveTimeout = setTimeout(() => {
      get().saveDesignData();
    }, 300);
  },

  removePart: async (id) => {
    set((state) => {
      if (!state.designData) return state;
      return {
        designData: {
          ...state.designData,
          parts: (state.designData.parts || []).filter((p: Part) => p.id !== id)
        },
        selectedPartId: state.selectedPartId === id ? null : state.selectedPartId
      }
    });
    await get().saveDesignData();
  },

  selectPart: (id) => {
    set({ selectedPartId: id, selectedContainerId: null });
  },

  cameraResetTrigger: 0,
  cameraZoom: 1,
  setCameraZoom: (zoom) => set({ cameraZoom: zoom }),
  resetCameraToIsometric: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),
  
  isFullscreen: false,
  setFullscreen: (val) => set({ isFullscreen: val })

}));
