import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { vfs } from '../services/vfs';
import { ChevronLeft, Download, FileJson, FolderTree, Plus, Box as BoxIcon, Settings, Trash2, Camera, Palette, X, Maximize, Minimize, ZoomIn, Bed as BedIcon, Armchair, Refrigerator, Bath, Tv, Table, Library, Droplet, Flame, List } from 'lucide-react';
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
    selectedPartId,
    updateContainer,
    resetCameraToIsometric,
    cameraZoom,
    setCameraZoom,
    isFullscreen,
    setFullscreen,
    isPanelOpen,
    setPanelOpen,
    isLibraryOpen,
    setLibraryOpen,
    isSceneListOpen,
    setSceneListOpen,
    addPart,
    updatePart,
    removePart,
    selectPart,
    selectContainer,
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

  const selectedPart = useMemo(() => {
    if (!designData) return null;
    return designData.parts?.find((p: any) => p.id === selectedPartId);
  }, [designData, selectedPartId]);

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
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans relative">
      {/* Fullscreen Header Hover Target */}
      {isFullscreen && <div className="fixed top-0 left-0 right-0 h-4 z-[60] peer" />}
      {/* Header */}
      <header className={`h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm transition-transform duration-300 ${
        isFullscreen ? 'fixed top-0 left-0 right-0 z-[55] -translate-y-full peer-hover:translate-y-0 hover:translate-y-0 shadow-lg' : 'relative z-10'
      }`}>
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
                isPanelOpen && !selectedPart
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Settings className={`w-4 h-4 ${isPanelOpen && !selectedPart ? "text-indigo-600" : "text-slate-500"}`} />
              <span>配置房箱参数</span>
            </button>
          )}

          {selectedPart && (
            <button 
              onClick={() => setPanelOpen(!isPanelOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border shadow-sm whitespace-nowrap ${
                isPanelOpen && selectedPart
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Settings className={`w-4 h-4 ${isPanelOpen && selectedPart ? "text-indigo-600" : "text-slate-500"}`} />
              <span>配置零件参数</span>
            </button>
          )}

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button 
            onClick={() => setSceneListOpen(!isSceneListOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border shadow-sm whitespace-nowrap ${
              isSceneListOpen
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <List className={`w-4 h-4 ${isSceneListOpen ? "text-indigo-600" : "text-slate-500"}`} />
            <span>对象列表</span>
          </button>

          <button 
            onClick={() => setLibraryOpen(!isLibraryOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border shadow-sm whitespace-nowrap ${
              isLibraryOpen
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Plus className={`w-4 h-4 ${isLibraryOpen ? "text-indigo-600" : "text-slate-500"}`} />
            <span>加入零件</span>
          </button>

          <button 
            onClick={() => setFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title={isFullscreen ? "退出全屏" : "全屏渲染"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-indigo-600" /> : <Maximize className="w-4 h-4 text-indigo-600" />}
            <span>{isFullscreen ? "退出全屏" : "全屏"}</span>
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
        <main className="flex-1 relative bg-slate-50">
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas shadows camera={{ position: [15, 15, 15], fov: 45 }}>
              <Scene />
            </Canvas>
          </div>
          

          {/* Scene Outliner Panel */}
          {isSceneListOpen && (
            <aside className={`absolute left-4 ${isLibraryOpen ? 'top-[420px]' : 'top-4'} bottom-4 w-64 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-20 overflow-hidden transform origin-left transition-all duration-300`}>
              <div className="p-5 border-b border-slate-100/50 bg-white/30 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <List className="w-5 h-5 text-indigo-600" />
                    对象列表
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">点击选中进行编辑或移动</p>
                </div>
                <button 
                  onClick={() => setSceneListOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 transition-colors"
                  title="关闭面板"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">容器</div>
                {designData?.containers?.map((c: any, i: number) => (
                  <button 
                    key={c.id}
                    onClick={() => { selectContainer(c.id); setPanelOpen(true); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedContainerId === c.id 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BoxIcon className="w-4 h-4 opacity-70" />
                      <span>房箱 {i + 1}</span>
                    </div>
                  </button>
                ))}
                
                <div className="text-xs font-bold text-slate-400 mt-6 mb-2 uppercase tracking-wide">零件</div>
                {designData?.parts?.map((p: any) => (
                  <button 
                    key={p.id}
                    onClick={() => { selectPart(p.id); setPanelOpen(true); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedPartId === p.id 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 opacity-70" />
                      <span>{
                        p.type === 'Bed' ? '单人床' :
                        p.type === 'Sofa' ? '沙发' :
                        p.type === 'Fridge' ? '冰箱' :
                        p.type === 'Toilet' ? '马桶' :
                        p.type === 'TV' ? '电视' :
                        p.type === 'Table' ? '桌子' :
                        p.type === 'Chair' ? '椅子' :
                        p.type === 'Wardrobe' ? '衣柜' :
                        p.type === 'Sink' ? '洗手台' :
                        p.type === 'Shower' ? '淋浴室' :
                        p.type === 'Stove' ? '炉灶' : p.type
                      }</span>
                    </div>
                    {selectedPartId === p.id && (
                      <div 
                        onClick={(e) => { e.stopPropagation(); removePart(p.id); }}
                        className="p-1 hover:bg-indigo-100 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
                {(!designData?.parts || designData.parts.length === 0) && (
                  <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    空空如也
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Parts Library Panel */}
          {isLibraryOpen && (
            <aside className="absolute left-4 top-4 bottom-4 w-64 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-20 overflow-hidden transform origin-left transition-transform">
              <div className="p-5 border-b border-slate-100/50 bg-white/30 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BoxIcon className="w-5 h-5 text-indigo-600" />
                    零件库
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">点击零件加入场景中</p>
                </div>
                <button 
                  onClick={() => setLibraryOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 transition-colors"
                  title="关闭面板"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                <button onClick={() => addPart('Bed')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <BedIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">单人床</span>
                </button>
                <button onClick={() => addPart('Sofa')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Armchair className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">沙发</span>
                </button>
                <button onClick={() => addPart('Fridge')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Refrigerator className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">冰箱</span>
                </button>
                <button onClick={() => addPart('Toilet')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Bath className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">马桶</span>
                </button>
                <button onClick={() => addPart('TV')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Tv className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">电视</span>
                </button>
                <button onClick={() => addPart('Table')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Table className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">桌子</span>
                </button>
                <button onClick={() => addPart('Chair')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Library className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">椅子</span>
                </button>
                <button onClick={() => addPart('Wardrobe')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <BoxIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">衣柜</span>
                </button>
                <button onClick={() => addPart('Sink')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Droplet className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">洗手台</span>
                </button>
                <button onClick={() => addPart('Shower')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Bath className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">淋浴室</span>
                </button>
                <button onClick={() => addPart('Stove')} className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <Flame className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">炉灶</span>
                </button>
              </div>
            </aside>
          )}

        </main>

        {/* Floating Properties Panel */}
        {isPanelOpen && (selectedContainer || selectedPart) && (
          <aside className="absolute right-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-20 overflow-hidden transform origin-right transition-transform">
            <div className="p-5 border-b border-slate-100/50 bg-white/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  {selectedPart ? '零件参数设置' : '房箱参数设置'}
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {selectedPart ? '可用键盘↑↓←→移动位置，Q/E键旋转' : '拖动滑块或输入数值（单位：米）'}
                </p>
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
              
              {/* Dimensions (Only for Container currently, maybe scale for parts) */}
              {selectedContainer && !selectedPart && (
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
              )}

              {selectedPart && (
                <div className="space-y-6">
                  {/* Position Info for part */}
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    <label className="text-sm font-bold text-slate-700 mb-2 block">快捷操作</label>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      使用键盘 <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">↑</kbd> <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">↓</kbd> <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">←</kbd> <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">→</kbd> 移动零件位置，使用 <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">Q</kbd> / <kbd className="bg-white border rounded px-1 shadow-sm text-slate-700 font-sans mx-0.5">E</kbd> 进行旋转。
                    </p>

                    <button 
                      onClick={() => removePart(selectedPart.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除零件
                    </button>
                  </div>
                </div>
              )}

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
                      value={selectedPart ? selectedPart.color : selectedContainer?.color}
                      onChange={(e) => {
                        if (selectedPart) {
                          updatePart(selectedPart.id, { color: e.target.value });
                        } else if (selectedContainer) {
                          updateContainer(selectedContainer.id, { color: e.target.value });
                        }
                      }}
                      className="absolute -inset-2 w-20 h-20 cursor-pointer border-0 p-0"
                    />
                  </div>
                  <div className="flex-1 text-[11px] font-medium text-slate-500 leading-relaxed">
                    点击左侧色圆形块，<br/>为您的{selectedPart ? '零件' : '房箱'}选择满意的喷漆颜色。
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
