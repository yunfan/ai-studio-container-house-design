import { create } from 'zustand';
import { vfs, ProjectMeta, ProjectDrive } from '../services/vfs';

interface AppState {
  // App view state
  view: 'workspace' | 'editor';
  projects: ProjectMeta[];
  currentDrive: ProjectDrive | null;
  selectedFile: string | null;
  
  // 3D Design State (Parsed from currentDrive.files['design.json'])
  designData: any | null;
  selectedContainerId: string | null;

  // Actions
  loadWorkspace: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  deleteProject: (id: string) => Promise<void>;
  importProject: (file: File) => Promise<void>;

  // File Actions
  selectFile: (path: string) => void;
  saveDesignData: () => Promise<void>;

  // Design Actions
  addContainer: () => void;
  updateContainer: (id: string, updates: any) => void;
  removeContainer: (id: string) => void;
  selectContainer: (id: string | null) => void;
}

import { v4 as uuidv4 } from 'uuid';

export const useAppStore = create<AppState>((set, get) => ({
  view: 'workspace',
  projects: [],
  currentDrive: null,
  selectedFile: null,
  designData: null,
  selectedContainerId: null,

  loadWorkspace: async () => {
    const projects = await vfs.getProjects();
    set({ projects, view: 'workspace', currentDrive: null, selectedFile: null });
  },

  createProject: async (name) => {
    const meta = await vfs.createProject(name);
    await get().loadWorkspace();
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
        selectedContainerId: null
      });
    }
  },

  closeProject: () => {
    set({ currentDrive: null, view: 'workspace', selectedFile: null, designData: null, selectedContainerId: null });
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
    set({ selectedFile: path, selectedContainerId: null });
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

  updateContainer: async (id, updates) => {
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
    // Debounce save in real app, but direct for now
    await get().saveDesignData();
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
    set({ selectedContainerId: id });
  }

}));
