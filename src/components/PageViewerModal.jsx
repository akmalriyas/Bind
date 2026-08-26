import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import PageThumbnailPreview from './PageThumbnailPreview';

export default function PageViewerModal({
  page,
  pages = [],
  documentColor = 'violet',
  onClose,
  onRotate,
  onDelete,
  onNavigate,
}) {
  const [zoom, setZoom] = useState(1);

  // Keyboard navigation — MUST be before any early return (Rules of Hooks)
  useEffect(() => {
    if (!page) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const idx = pages.findIndex((p) => p.id === page.id);
      if (e.key === 'ArrowLeft' && idx > 0) {
        onNavigate(idx - 1);
      }
      if (e.key === 'ArrowRight' && idx < pages.length - 1) {
        onNavigate(idx + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, pages, onClose, onNavigate]);

  // Reset zoom when navigating to a different page
  useEffect(() => {
    setZoom(1);
  }, [page?.id]);

  if (!page) return null;

  const currentIndex = pages.findIndex((p) => p.id === page.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < pages.length - 1;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const rotation = page.rotation || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-2xl select-none"
        onClick={onClose}
      >
        {/* ── Top Header Toolbar ── */}
        <div
          className="h-12 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-zinc-950/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Page Info */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white tracking-wide">
              Page {page.pageNumber} of {pages.length}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              8.5 × 11 in • {rotation}° rotation
            </span>
          </div>

          {/* Center Zoom Controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-md p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-0.5 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRotate && onRotate(page.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-colors"
              title="Rotate Page"
            >
              <RotateCw size={13} />
              <span>Rotate</span>
            </button>

            <button
              onClick={() => onDelete && onDelete(page.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              title="Delete Page"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Preview (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Main Viewport Canvas ── */}
        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
          {/* Previous Page Button */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex - 1);
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white shadow-2xl transition-all z-20 hover:scale-105"
              title="Previous Page (←)"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next Page Button */}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex + 1);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white shadow-2xl transition-all z-20 hover:scale-105"
              title="Next Page (→)"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Rendered Large Paper Sheet */}
          <motion.div
            key={page.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="aspect-[8.5/11] max-h-[82vh] h-full bg-[#13141d] border border-white/15 rounded-lg shadow-2xl overflow-hidden relative cursor-default"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <PageThumbnailPreview page={page} docColor={documentColor} />
          </motion.div>
        </div>

        {/* ── Bottom Floating Tip ── */}
        <div className="h-8 flex items-center justify-center shrink-0 text-[11px] text-zinc-500 font-mono">
          Use ← / → arrows to navigate • Esc to close
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
