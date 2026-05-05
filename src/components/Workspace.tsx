import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FolderPlus, FileArchive, Folder, Trash2, Clock, Upload } from 'lucide-react';
import { vfs } from '../services/vfs';
import { motion } from 'motion/react';

export default function Workspace() {
  const { projects, loadWorkspace, createProject, openProject, deleteProject, importProject } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleCreate = () => {
    const name = prompt('输入工程名称:', '新工程 ' + (projects.length + 1));
    if (name) {
      createProject(name);
    }
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
              onClick={handleCreate}
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
                    if(confirm(`确定删除工程 ${proj.name} 吗？`)) {
                      deleteProject(proj.id);
                    }
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
    </div>
  );
}
