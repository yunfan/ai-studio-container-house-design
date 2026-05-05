import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FolderPlus, FileArchive, Folder, Trash2, Clock, Upload, X } from 'lucide-react';
import { vfs } from '../services/vfs';
import { motion } from 'motion/react';

export default function Workspace() {
  const { projects, loadWorkspace, createProject, openProject, deleteProject, importProject } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleCreateClick = () => {
    setNewProjectName('新工程 ' + (projects.length + 1));
    setCreateDialogOpen(true);
  };

  const submitCreate = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
    }
    setCreateDialogOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importProject(file);
    }
    // reset
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">房箱设计中心</h1>
            <p className="text-slate-500 mt-2">完全离线、支持导入导出的3D工程管理系统</p>
          </div>
          <div className="flex gap-4">
            <input 
              type="file" 
              accept=".zip,.proj" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium text-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span>导入工程 (ZIP)</span>
            </button>
            <button 
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <FolderPlus className="w-4 h-4" />
              <span>新建工程</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={proj.id}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
              onClick={() => openProject(proj.id)}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectToDelete({ id: proj.id, name: proj.name });
                    setDeleteDialogOpen(true);
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="删除工程"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                <Folder className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 line-clamp-1">{proj.name}</h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Clock className="w-4 h-4" />
                <span>上次修改: {formatDate(proj.updatedAt)}</span>
              </div>
            </motion.div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              <FileArchive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">当前没有任何工程</p>
              <p className="text-sm mt-1">点击右上角新建或导入开始设计</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">新建工程</h2>
              <button onClick={() => setCreateDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">工程名称</label>
              <input 
                type="text" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCreateDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={submitCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                创建
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">删除工程</h2>
              <p className="text-slate-600 text-sm">
                确定要删除工程 <span className="font-semibold text-slate-900">{projectToDelete.name}</span> 吗？此操作无法恢复。
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                确定删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
