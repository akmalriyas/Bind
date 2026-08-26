import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, GripVertical, Maximize2, RotateCw, Copy, FileText } from 'lucide-react';
import PageThumbnailPreview from './PageThumbnailPreview';

export default function PageCard({
  page,
  documentColor = 'violet',
  onToggleSelection,
  onDelete,
  onView,
  onRotate,
  onDuplicate,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const rotation = page.rotation || 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col items-center group relative select-none"
    >
      {/* ── Main Document Page Sheet ── */}
      <div
        onClick={onToggleSelection}
        className={`
          relative w-full aspect-[8.5/11] rounded-md cursor-pointer
          bg-[#13141c] border transition-all duration-150 overflow-hidden flex flex-col
          ${page.selected 
            ? 'border-violet-500 ring-2 ring-violet-500/80 ring-offset-2 ring-offset-[#08090d] shadow-lg shadow-violet-500/20' 
            : 'border-white/[0.08] hover:border-white/[0.2] hover:shadow-xl hover:shadow-black/60'
          }
        `}
      >
        {/* Rotation Container */}
        <div 
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <PageThumbnailPreview page={page} docColor={documentColor} />
        </div>

        {/* ── Top Floating Action Strip on Hover ── */}
        <div 
          className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/85 via-black/40 to-transparent 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center justify-between px-1.5 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tactile Drag Handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/15 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical size={13} />
          </div>

          {/* Icon Toolset */}
          <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md rounded p-0.5 border border-white/10">
            <button
              onClick={() => onRotate && onRotate(page.id)}
              className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/20 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw size={11} />
            </button>
            <button
              onClick={() => onDuplicate && onDuplicate(page.id)}
              className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/20 transition-colors"
              title="Duplicate Page"
            >
              <Copy size={11} />
            </button>
            <button
              onClick={onView}
              className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/20 transition-colors"
              title="Inspect / Zoom"
            >
              <Maximize2 size={11} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded text-zinc-300 hover:text-red-400 hover:bg-red-500/20 transition-colors"
              title="Delete Page"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* ── Selection Checkbox Badge ── */}
        {page.selected && (
          <div className="absolute top-2 left-2 z-20">
            <div className="w-4 h-4 rounded bg-violet-600 text-white flex items-center justify-center shadow-md border border-white/30">
              <Check size={10} strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Selection Tint */}
        {page.selected && (
          <div className="absolute inset-0 bg-violet-500/[0.08] pointer-events-none z-10" />
        )}
      </div>

      {/* ── Bottom Page Label ── */}
      <div className="mt-2 flex items-center justify-center gap-1">
        <span className={`
          text-[11px] font-mono transition-colors
          ${page.selected ? 'text-violet-400 font-semibold' : 'text-zinc-500 group-hover:text-zinc-300'}
        `}>
          Page {page.pageNumber}
        </span>
      </div>
    </div>
  );
}
