import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  X,
  Plus,
  Files,
  Search,
  HardDrive,
  Layers,
} from 'lucide-react';

export default function Sidebar({
  documents = [],
  activeDocumentId,
  collapsed,
  onToggleCollapse,
  onSelectDocument,
  onRemoveDocument,
  onAddDocument,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 250 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="bg-[#0e0f15] border-r border-white/[0.08] flex flex-col shrink-0 h-full overflow-hidden z-30 relative select-none"
    >
      {/* ── Header ── */}
      <div className="h-11 px-3 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Files size={14} className="text-zinc-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              Documents
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-zinc-400 font-mono">
              {documents.length}
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`
            p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors
            ${collapsed ? 'mx-auto' : ''}
          `}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* ── Document Search Filter (When expanded and multiple docs) ── */}
      {!collapsed && documents.length > 3 && (
        <div className="px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] focus-within:border-violet-500/50 transition-colors">
            <Search size={12} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter docs..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Document List ── */}
      <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1">
        <AnimatePresence initial={false} mode="popLayout">
          {filteredDocs.map((doc) => {
            const isActive = doc.id === activeDocumentId;

            return (
              <motion.div
                key={doc.id}
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <div
                  onClick={() => onSelectDocument(doc.id)}
                  className={`
                    group relative flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-150
                    ${isActive
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm'
                      : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200 border border-transparent'
                    }
                    ${collapsed ? 'justify-center p-2.5' : ''}
                  `}
                  title={collapsed ? `${doc.name} • ${doc.pages.length} pages` : undefined}
                >
                  {/* File Icon */}
                  <div className={`p-1.5 rounded-md ${isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-zinc-400 group-hover:text-zinc-300'}`}>
                    <FileText size={14} />
                  </div>

                  {!collapsed && (
                    <>
                      {/* Document Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                            <Layers size={10} className="text-zinc-600" />
                            {doc.pages.length} pp
                          </span>
                          {doc.fileSize && (
                            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                              <HardDrive size={10} className="text-zinc-600" />
                              {doc.fileSize}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Close/Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveDocument(doc.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all"
                        title="Close Document"
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Clean Bottom Action ── */}
      <div className="p-2.5 border-t border-white/[0.06] bg-[#0b0c11] shrink-0">
        <button
          onClick={onAddDocument}
          className={`
            flex items-center justify-center gap-2 w-full py-2 rounded-lg
            text-xs font-medium text-zinc-300 hover:text-white
            bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-zinc-500
            transition-all active:scale-[0.98]
            ${collapsed ? 'px-0' : 'px-3'}
          `}
          title="Import PDF Files"
        >
          <Plus size={14} className="text-zinc-400" />
          {!collapsed && <span>Add Document</span>}
        </button>
      </div>
    </motion.aside>
  );
}
