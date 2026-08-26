import React from 'react';
import {
  Minus,
  Square,
  X,
  Search,
  Undo2,
  Redo2,
  FolderOpen,
  FileText,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Command
} from 'lucide-react';

export default function Titlebar({
  activeDocument,
  onAddDocument,
  onMerge,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) {
  return (
    <header className="h-10 bg-[#0c0d12] border-b border-white/[0.08] flex items-center justify-between titlebar-drag shrink-0 select-none relative z-50 w-full px-3">
      {/* ── Left: Wordmark & Document Breadcrumb ── */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        {/* Clean, Sharp BIND Wordmark */}
        <div className="flex items-center gap-2 pr-2">
          <span className="font-extrabold text-[12px] tracking-[0.2em] text-white uppercase font-mono">
            BIND
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 font-mono border border-white/[0.06]">
            v1.0
          </span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Undo / Redo Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z / ⌘Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y / ⌘⇧Z)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Active Document Breadcrumb */}
        {activeDocument && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10 text-xs">
            <FileText size={13} className="text-violet-400" />
            <span className="text-zinc-300 font-medium truncate max-w-[220px]">
              {activeDocument.name}
            </span>
          </div>
        )}
      </div>

      {/* ── Center: Search / Quick Command Palette Trigger ── */}
      <div className="hidden md:flex items-center titlebar-no-drag">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer w-64 justify-between">
          <div className="flex items-center gap-1.5">
            <Search size={12} className="text-zinc-500" />
            <span className="text-[11px]">Search pages or commands...</span>
          </div>
          <kbd className="text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-zinc-400 border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Right: Quick Actions & Window Controls ── */}
      <div className="flex items-center h-full titlebar-no-drag gap-2">
        <button
          onClick={onAddDocument}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
          title="Open PDF Document"
        >
          <FolderOpen size={13} className="text-zinc-400" />
          <span>Open</span>
        </button>

        {/* Native Frameless Window Controls */}
        <div className="flex h-full items-center -mr-3">
          <button
            onClick={() => window.electronAPI?.minimizeWindow?.()}
            className="w-11 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => window.electronAPI?.maximizeWindow?.()}
            className="w-11 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Maximize"
          >
            <Square size={12} />
          </button>
          <button
            onClick={() => window.electronAPI?.closeWindow?.()}
            className="w-12 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-600 transition-colors"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
