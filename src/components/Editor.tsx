import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { vfs } from '../services/vfs';
import { ChevronLeft, Download, FileJson, FolderTree, Plus, Box as BoxIcon, Settings, Trash2, Camera, Palette, X, Maximize, Minimize, ZoomIn } from 'lucide-react';
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
    updateContainer,
    resetCameraToIsometric,
    cameraZoom,
    setCameraZoom,
    isFullscreen,
    setFullscreen,
    isPanelOpen,
    setPanelOpen
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

  const handleSizeChange = (index: number, val: number) => {
    if (!selectedContainer) return;
    let safeVal = val;
    if (isNaN(safeVal) || safeVal <= 0.1) safeVal = 1;

    const newSize = [...selectedContainer.size];
    newSize[index] = safeVal;
    
    const newPos = [...selectedContainer.position];
    if (index === 1) {
      newPos[1] = safeVal / 2; // Always keep the bottom on the ground
    }
    updateContainer(selectedContainer.id, { size: newSize, position: newPos });
  };

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
            <ZoomIn className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">缩放:</span>
            <input 
              type="number" 
              min="0.1" max="5.0" step="0.1"
              value={cameraZoom}
              onChange={(e) => setCameraZoom(parseFloat(e.target.value) || 1)}
              className="w-14 bg-white border border-slate-200 rounded px-1 py-0.5 text-sm font-bold text-indigo-600 focus:outline-none focus:border-indigo-400 text-center"
            />
          </div>

          <button 
            onClick={resetCameraToIsometric}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title="回到斜切剖透视角度"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>斜切视角</span>
          </button>

          {selectedContainer && (
            <button 
              onClick={() => setPanelOpen(!isPanelOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border shadow-sm whitespace-nowrap ${
                isPanelOpen
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Settings className={`w-4 h-4 ${isPanelOpen ? "text-indigo-600" : "text-slate-500"}`} />
              <span>配置房箱参数</span>
            </button>
          )}

          <button 
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title="全屏渲染"
          >
            <Maximize className="w-4 h-4 text-indigo-600" />
            <span>全屏</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>导出工程</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Center - 3D View */}
        <main className={`flex-1 relative bg-slate-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {isFullscreen && (
            <button 
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur border border-slate-200 shadow-xl rounded-xl text-slate-700 hover:bg-white transition-colors"
            >
              <Minimize className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-sm">退出全屏</span>
            </button>
          )}
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas shadows camera={{ position: [15, 15, 15], fov: 45 }}>
              <Scene />
            </Canvas>
          </div>
          

        </main>

        {/* Floating Properties Panel */}
        {isPanelOpen && selectedContainer && (
          <aside className="absolute right-4 top-[72px] bottom-4 w-80 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-20 overflow-hidden transform Origin-right transition-transform">
            <div className="p-5 border-b border-slate-100/50 bg-white/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  房箱参数设置
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">拖动滑块或输入数值（单位：米）</p>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 transition-colors"
                title="关闭面板"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8 pb-10">
              
              {/* Dimensions */}
              <div className="space-y-6">
                
                {/* Length (X) */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-700">长度 (长面)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="2" max="15" step="0.1"
                        value={selectedContainer.size[0]}
                        onChange={(e) => handleSizeChange(0, parseFloat(e.target.value) || 2)}
                        className="w-20 px-2 py-1 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1.5 text-xs font-semibold text-indigo-400 pointer-events-none">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="2" max="15" step="0.1"
                    value={selectedContainer.size[0]}
                    onChange={(e) => handleSizeChange(0, parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>2m</span>
                    <span>15m</span>
                  </div>
                </div>

                {/* Width (Z) */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-700">宽度 (窄面)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="2" max="5" step="0.1"
                        value={selectedContainer.size[2]}
                        onChange={(e) => handleSizeChange(2, parseFloat(e.target.value) || 2)}
                        className="w-20 px-2 py-1 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1.5 text-xs font-semibold text-indigo-400 pointer-events-none">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="2" max="5" step="0.1"
                    value={selectedContainer.size[2]}
                    onChange={(e) => handleSizeChange(2, parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>2m</span>
                    <span>5m</span>
                  </div>
                </div>

                {/* Height (Y) */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-slate-700">高度</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="2" max="4" step="0.1"
                        value={selectedContainer.size[1]}
                        onChange={(e) => handleSizeChange(1, parseFloat(e.target.value) || 2)}
                        className="w-20 px-2 py-1 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-2 top-1.5 text-xs font-semibold text-indigo-400 pointer-events-none">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="2" max="4" step="0.1"
                    value={selectedContainer.size[1]}
                    onChange={(e) => handleSizeChange(1, parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>2m</span>
                    <span>4m</span>
                  </div>
                </div>

              </div>

              <div className="h-px bg-slate-200/60" />

              {/* Color */}
              <div>
                <label className="text-sm font-bold text-slate-700 mt-2 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-400" />
                  外观颜色
                </label>
                <div className="flex gap-4 items-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-md shrink-0 focus-within:ring-2 focus-within:ring-indigo-500">
                    <input 
                      type="color" 
                      value={selectedContainer.color}
                      onChange={(e) => updateContainer(selectedContainer.id, { color: e.target.value })}
                      className="absolute -inset-2 w-20 h-20 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="flex-1 text-[11px] font-medium text-slate-500 leading-relaxed">
                    点击左侧色圆形块，<br/>为您的房箱选择满意的材质喷漆颜色。
                  </div>
                </div>
              </div>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
