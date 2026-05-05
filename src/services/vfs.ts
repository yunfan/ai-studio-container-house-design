import localforage from 'localforage';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectDrive {
  meta: ProjectMeta;
  files: Record<string, string>;
}

// Ensure localforage uses IndexedDB
localforage.config({
  name: 'ContainerDesignerDB',
  storeName: 'projects',
});

const METADATA_KEY = 'vfs_metadata';

export const vfs = {
  async getProjects(): Promise<ProjectMeta[]> {
    const meta = await localforage.getItem<ProjectMeta[]>(METADATA_KEY);
    return meta || [];
  },

  async createProject(name: string): Promise<ProjectMeta> {
    const id = uuidv4();
    const meta: ProjectMeta = {
      id,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Default design file
    const initialDesign = {
      version: 1,
      containers: [
        {
          id: uuidv4(),
          position: [0, 1.5, 0],
          rotation: [0, 0, 0],
          size: [6, 3, 3],
          color: '#ffffff',
        }
      ]
    };

    const drive: ProjectDrive = {
      meta,
      files: {
        'design.json': JSON.stringify(initialDesign, null, 2),
      }
    };

    await localforage.setItem(id, drive);
    
    const projects = await this.getProjects();
    projects.push(meta);
    await localforage.setItem(METADATA_KEY, projects);
    
    return meta;
  },

  async loadProject(id: string): Promise<ProjectDrive | null> {
    const drive = await localforage.getItem<ProjectDrive>(id);
    return drive;
  },

  async saveProjectFile(id: string, path: string, content: string) {
    const drive = await localforage.getItem<ProjectDrive>(id);
    if (!drive) return;

    drive.files[path] = content;
    drive.meta.updatedAt = Date.now();
    await localforage.setItem(id, drive);

    // Update meta
    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === id);
    if (idx > -1) {
      projects[idx] = drive.meta;
      await localforage.setItem(METADATA_KEY, projects);
    }
  },

  async deleteProjectFile(id: string, path: string) {
    const drive = await localforage.getItem<ProjectDrive>(id);
    if (!drive) return;

    delete drive.files[path];
    drive.meta.updatedAt = Date.now();
    await localforage.setItem(id, drive);
  },

  async deleteProject(id: string) {
    await localforage.removeItem(id);
    const projects = await this.getProjects();
    const newProjects = projects.filter(p => p.id !== id);
    await localforage.setItem(METADATA_KEY, newProjects);
  },

  async exportToZip(id: string): Promise<Blob | null> {
    const drive = await localforage.getItem<ProjectDrive>(id);
    if (!drive) return null;

    const zip = new JSZip();
    
    // Add meta file for import purposes
    zip.file('project.meta.json', JSON.stringify(drive.meta, null, 2));

    // Add all user files
    for (const [path, content] of Object.entries(drive.files)) {
      zip.file(path, content);
    }

    return await zip.generateAsync({ type: 'blob' });
  },

  async importFromZip(file: File): Promise<ProjectMeta | null> {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    
    let metaFile = loadedZip.file('project.meta.json');
    let meta: ProjectMeta;
    
    const id = uuidv4();
    if (metaFile) {
      const metaContent = await metaFile.async('string');
      meta = JSON.parse(metaContent);
      meta.id = id; // Always re-assign new UUID on import to prevent collision
      meta.updatedAt = Date.now();
    } else {
      meta = {
        id,
        name: file.name.replace(/\.zip$/, ''),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const drive: ProjectDrive = {
      meta,
      files: {}
    };

    for (const [path, zipObj] of Object.entries(loadedZip.files)) {
      if (path === 'project.meta.json' || zipObj.dir) continue;
      const content = await zipObj.async('string');
      drive.files[path] = content;
    }

    // Default if no design.json
    if (!drive.files['design.json']) {
        drive.files['design.json'] = JSON.stringify({ version: 1, containers: [] });
    }

    await localforage.setItem(id, drive);
    
    const projects = await this.getProjects();
    projects.push(meta);
    await localforage.setItem(METADATA_KEY, projects);

    return meta;
  }
};
