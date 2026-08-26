import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FilePlus, ShieldCheck, Zap, Layers, FileText } from 'lucide-react';

export default function DropZone({ onFileDrop, dragOver, onDragStateChange }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none relative overflow-hidden bg-[#08090d]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-md w-full flex flex-col items-center text-center relative z-10"
      >
        {/* ── Drop Target Card ── */}
        <div
          onClick={() => onFileDrop('browse')}
          onDragOver={(e) => {
            e.preventDefault();
            onDragStateChange(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            onDragStateChange(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDragStateChange(false);
            if (e.dataTransfer.files?.length > 0) {
              onFileDrop(e.dataTransfer.files);
            }
          }}
          className={`
            w-full p-9 rounded-2xl border border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center gap-3.5 group
            ${dragOver
              ? 'border-violet-500 bg-violet-500/10 scale-102 shadow-2xl'
              : 'border-white/15 bg-white/[0.02] hover:border-violet-500/50 hover:bg-white/[0.04]'
            }
          `}
        >
          {/* Upload Icon Box */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
            ${dragOver
              ? 'bg-violet-600 text-white shadow-lg'
              : 'bg-white/[0.05] text-zinc-400 group-hover:bg-violet-600 group-hover:text-white'
            }
          `}>
            <Upload size={22} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {dragOver ? 'Drop PDF to import' : 'Drop PDF files here'}
            </h3>
            <p className="text-xs text-zinc-400">
              or click anywhere to browse local files
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFileDrop('browse');
            }}
            className="mt-1 px-4 py-2 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all flex items-center gap-2"
          >
            <FilePlus size={14} />
            <span>Select PDF File</span>
          </button>
        </div>

        {/* ── Feature Badges ── */}
        <div className="grid grid-cols-3 gap-3 mt-6 w-full">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center gap-1">
            <Zap size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-300">Drag & Reorder</span>
            <span className="text-[10px] text-zinc-500">Fluid rearranging</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center gap-1">
            <Layers size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-300">Merge & Slice</span>
            <span className="text-[10px] text-zinc-500">Fast page deletion</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center gap-1">
            <ShieldCheck size={14} className="text-zinc-400" />
            <span className="text-[11px] font-medium text-zinc-300">100% Offline</span>
            <span className="text-[10px] text-zinc-500">Private & local</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
