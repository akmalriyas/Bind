import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  CheckSquare,
  Square,
  RotateCw,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  FilePlus,
  Copy,
  FileText,
  Upload,
} from 'lucide-react';
import PageCard from './PageCard';
import PageThumbnailPreview from './PageThumbnailPreview';
import PageViewerModal from './PageViewerModal';

export default function PageGrid({
  document,
  pages = [],
  documentColor = 'violet',
  onToggleSelection,
  onDeletePage,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onReorder,
  onRotatePage,
  onDuplicatePage,
  onInsertBlankPage,
  onAddPages,
}) {
  const [activeDragId, setActiveDragId] = useState(null);
  const [viewingPageId, setViewingPageId] = useState(null);
  const [gridSize, setGridSize] = useState(160); // In pixels

  const selectedCount = pages.filter((p) => p.selected).length;
  const allSelected = pages.length > 0 && selectedCount === pages.length;

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
    setActiveDragId(null);
  };

  const activeDraggedPage = pages.find((p) => p.id === activeDragId);
  const viewingPage = pages.find((p) => p.id === viewingPageId);

  // Safe modal navigation
  const handleModalNavigate = (targetIndex) => {
    if (targetIndex >= 0 && targetIndex < pages.length) {
      setViewingPageId(pages[targetIndex].id);
    }
  };

  const handleModalDelete = (pageId) => {
    const currentIndex = pages.findIndex((p) => p.id === pageId);
    onDeletePage(pageId);
    if (pages.length <= 1) {
      setViewingPageId(null);
    } else if (currentIndex < pages.length - 1) {
      setViewingPageId(pages[currentIndex + 1].id);
    } else if (currentIndex > 0) {
      setViewingPageId(pages[currentIndex - 1].id);
    } else {
      setViewingPageId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#08090d] relative overflow-hidden">
      {/* ── Subheader Utility Bar ── */}
      <div className="h-11 border-b border-white/[0.07] bg-[#0d0e14]/90 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-20">
        {/* Left Stats & Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-300">
              {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
            </span>
            {selectedCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {selectedCount} selected
              </span>
            )}
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Select All Toggle */}
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            disabled={pages.length === 0}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              pages.length > 0
                ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            {allSelected ? (
              <Square size={13} className="text-violet-400" />
            ) : (
              <CheckSquare size={13} />
            )}
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </button>

          {selectedCount > 0 && (
            <button
              onClick={onInvertSelection}
              className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] px-2 py-1 rounded-md transition-colors"
            >
              Invert
            </button>
          )}
        </div>

        {/* Right Tools: Zoom Slider & Insert */}
        <div className="flex items-center gap-3">
          {/* Zoom Slider Control */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-md">
            <button
              onClick={() => setGridSize((prev) => Math.max(prev - 25, 120))}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Zoom Out Grid"
            >
              <ZoomOut size={12} />
            </button>

            <input
              type="range"
              min="120"
              max="240"
              step="10"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />

            <button
              onClick={() => setGridSize((prev) => Math.min(prev + 25, 240))}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Zoom In Grid"
            >
              <ZoomIn size={12} />
            </button>

            <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">
              {Math.round((gridSize / 160) * 100)}%
            </span>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Quick Insert Page Button */}
          <button
            onClick={onInsertBlankPage || onAddPages}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-colors"
            title="Insert a page into this document"
          >
            <FilePlus size={13} className="text-zinc-400" />
            <span>Insert Page</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Grid / Empty Document State ── */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {pages.length === 0 ? (
            /* ── Empty Pages State (When all pages are deleted) ── */
            <div className="flex flex-col items-center justify-center py-20 text-center select-none">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-500 mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                No Pages in this Document
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-5">
                All pages have been deleted or removed. You can insert new blank pages or import other PDF documents.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onInsertBlankPage}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all"
                >
                  <Plus size={14} />
                  <span>Insert Page</span>
                </button>
                <button
                  onClick={onAddPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all"
                >
                  <Upload size={14} />
                  <span>Import PDF</span>
                </button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div
                  className="grid gap-6 auto-rows-max pb-36"
                  style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
                  }}
                >
                  {pages.map((page) => (
                    <PageCard
                      key={page.id}
                      page={page}
                      documentColor={documentColor}
                      onToggleSelection={() => onToggleSelection(page.id)}
                      onDelete={() => onDeletePage(page.id)}
                      onView={() => setViewingPageId(page.id)}
                      onRotate={(id) => onRotatePage && onRotatePage(id)}
                      onDuplicate={(id) => onDuplicatePage && onDuplicatePage(id)}
                    />
                  ))}

                  {/* Add Page Card Placeholder Tile */}
                  <div
                    onClick={onInsertBlankPage || onAddPages}
                    className="aspect-[8.5/11] rounded-lg border border-dashed border-white/[0.12] hover:border-violet-500/50 
                               bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-150 cursor-pointer 
                               flex flex-col items-center justify-center gap-2 group text-zinc-500 hover:text-zinc-300"
                    title="Insert a new page"
                  >
                    <div className="w-8 h-8 rounded-md bg-white/[0.04] group-hover:bg-violet-500/20 group-hover:text-violet-300 flex items-center justify-center transition-colors">
                      <FilePlus size={16} />
                    </div>
                    <span className="text-[11px] font-medium tracking-wide">Insert Page</span>
                  </div>
                </div>
              </SortableContext>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeDraggedPage ? (
                  <div className="aspect-[8.5/11] w-40 rounded-lg bg-[#14151e] border-2 border-violet-500 ring-4 ring-violet-500/20 shadow-2xl rotate-2 scale-105 overflow-hidden flex flex-col cursor-grabbing">
                    <PageThumbnailPreview page={activeDraggedPage} docColor={documentColor} />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      Page {activeDraggedPage.pageNumber}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* ── Page Lightbox / Inspector Modal (Safe page tracking) ── */}
      {viewingPage && (
        <PageViewerModal
          page={viewingPage}
          pages={pages}
          documentColor={documentColor}
          onClose={() => setViewingPageId(null)}
          onNavigate={handleModalNavigate}
          onRotate={(id) => onRotatePage && onRotatePage(id)}
          onDelete={handleModalDelete}
        />
      )}
    </div>
  );
}
