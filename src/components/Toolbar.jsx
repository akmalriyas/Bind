import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Layers,
  FileDown,
  RotateCw,
  X,
  Copy,
  Download,
  FileText
} from 'lucide-react';

export default function Toolbar({
  selectedCount,
  totalCount,
  onDeleteSelected,
  onRotateSelected,
  onDuplicateSelected,
  onMerge,
  onExport,
  onDeselectAll,
}) {
  const isSelectionActive = selectedCount > 0;
  const canDuplicate = selectedCount === 1;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <motion.div
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl backdrop-blur-2xl bg-[#0f1017]/95 border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.7)] select-none"
      >
        <AnimatePresence mode="wait">
          {isSelectionActive ? (
            /* ── Selection Action Mode ── */
            <motion.div
              key="selection-mode"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1"
            >
              {/* Selected Badge */}
              <div className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-violet-300">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="font-mono">{selectedCount} Selected</span>
                <button
                  onClick={onDeselectAll}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors ml-0.5"
                  title="Clear Selection (Esc)"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Rotate 90° */}
              <button
                onClick={onRotateSelected}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Rotate selected pages 90°"
              >
                <RotateCw size={13} className="text-zinc-400" />
                <span>Rotate</span>
              </button>

              {/* Duplicate — only enabled for single page selection */}
              {onDuplicateSelected && (
                <button
                  onClick={canDuplicate ? onDuplicateSelected : undefined}
                  disabled={!canDuplicate}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    canDuplicate
                      ? 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                      : 'text-zinc-600 cursor-not-allowed'
                  }`}
                  title={canDuplicate ? 'Duplicate page' : 'Select exactly 1 page to duplicate'}
                >
                  <Copy size={13} />
                  <span>Duplicate</span>
                </button>
              )}

              {/* Delete Selected */}
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors"
                title="Delete selected pages (Del)"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Export Selected */}
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all active:scale-[0.98]"
              >
                <FileDown size={13} />
                <span>Export Selected</span>
              </button>
            </motion.div>
          ) : (
            /* ── Default Workspace Mode ── */
            <motion.div
              key="default-mode"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1"
            >
              {/* Document Page Counter */}
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-400 font-mono">
                <FileText size={13} className="text-zinc-500" />
                <span>{totalCount} {totalCount === 1 ? 'Page' : 'Pages'}</span>
              </div>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Merge Action */}
              <button
                onClick={onMerge}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Merge multiple PDF files"
              >
                <Layers size={13} className="text-zinc-400" />
                <span>Merge PDFs</span>
              </button>

              {/* Export Full PDF */}
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all active:scale-[0.98]"
              >
                <Download size={13} />
                <span>Export PDF</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
