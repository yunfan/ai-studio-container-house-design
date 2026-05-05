import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { vfs } from '../services/vfs';
import { ChevronLeft, Download, FileJson, FolderTree, Plus, Box as BoxIcon, Settings, Trash2 } from 'lucide-react';
import { Scene } from './ThreeScene';
import { Canvas } from '@react-three/fiber';

export default function Editor() {
  const { 
    currentDrive, 
    closeProject,
    selectedFile,
    selectFile,
    designData,
    selectedContainerId,
    addContainer,
    updateContainer,
    removeContainer 
  } = useAppStore();

  const handleExport = async () => {
    if (!currentDrive) return;
    const blob = await vfs.exportToZip(currentDrive.meta.id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDrive.meta.name}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedContainer = useMemo(() => {
    if (!designData) return null;
    return designData.containers.find((c: any) => c.id === selectedContainerId);
  }, [designData, selectedContainerId]);

  if (!currentDrive) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={closeProject}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            title="返回工作区"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-semibold text-sm">
            {currentDrive.meta.name}
          </div>
        </div>
        <div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出工程</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - File Explorer */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>工程文件</span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            {Object.keys(currentDrive.files).map(path => (
              <button
                key={path}
                onClick={() => selectFile(path)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedFile === path ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileJson className="w-4 h-4" />
                <span>{path}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center - 3D View or Code View */}
        <main className="flex-1 relative bg-slate-50">
          {selectedFile === 'design.json' ? (
            <>
              {/* 3D Canvas */}
              <div className="absolute inset-0">
                <Canvas shadows camera={{ position: [15, 15, 15], fov: 45 }}>
                  <Scene />
                </Canvas>
              </div>
              
              {/* Overlay Controls */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button 
                  onClick={addContainer}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加房箱</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 h-full overflow-y-auto font-mono text-sm">
              <pre className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {currentDrive.files[selectedFile || '']}
              </pre>
            </div>
          )}
        </main>

        {/* Right Sidebar - Properties */}
        {selectedFile === 'design.json' && selectedContainer && (
          <aside className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-lg z-10">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>属性面板</span>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              
              {/* Color */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">颜色</label>
                <input 
                  type="color" 
                  value={selectedContainer.color}
                  onChange={(e) => updateContainer(selectedContainer.id, { color: e.target.value })}
                  className="w-full h-10 rounded border border-slate-200 cursor-pointer p-1"
                />
              </div>

              {/* Position */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">位置 (X, Y, Z)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['x', 'y', 'z'].map((axis, i) => (
                    <div key={axis}>
                      <span className="text-[10px] text-slate-400 uppercase mb-1 block">{axis}轴</span>
                      <input 
                        type="number"
                        step="0.5"
                        value={selectedContainer.position[i]}
                        onChange={(e) => {
                          const newPos = [...selectedContainer.position];
                          newPos[i] = parseFloat(e.target.value) || 0;
                          updateContainer(selectedContainer.id, { position: newPos });
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">尺寸 (长, 高, 宽)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['w', 'h', 'd'].map((axis, i) => (
                    <div key={axis}>
                      <span className="text-[10px] text-slate-400 uppercase mb-1 block">{axis}</span>
                      <input 
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={selectedContainer.size[i]}
                        onChange={(e) => {
                          const newSize = [...selectedContainer.size];
                          newSize[i] = parseFloat(e.target.value) || 0.1;
                          updateContainer(selectedContainer.id, { size: newSize });
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => removeContainer(selectedContainer.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除该房箱</span>
                </button>
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
