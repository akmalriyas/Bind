import React from 'react';

export default function PageThumbnailPreview({ page, docColor = 'violet' }) {
  const { pageNumber, templateType = 'text_columns' } = page;

  // Color accents for graphics
  const accents = {
    violet: {
      primary: '#8b5cf6',
      subtle: 'rgba(139, 92, 246, 0.15)',
      gradient: 'from-violet-500/20 to-purple-500/5',
      badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    blue: {
      primary: '#3b82f6',
      subtle: 'rgba(59, 130, 246, 0.15)',
      gradient: 'from-blue-500/20 to-indigo-500/5',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    emerald: {
      primary: '#10b981',
      subtle: 'rgba(16, 185, 129, 0.15)',
      gradient: 'from-emerald-500/20 to-teal-500/5',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    }
  };

  const currentAccent = accents[docColor] || accents.violet;

  // Render different realistic document page templates
  switch (templateType) {
    case 'cover':
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between select-none">
          {/* Top Branding */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: currentAccent.primary }} />
              <div className="h-1.5 w-12 bg-white/40 rounded-full" />
            </div>
            <div className="h-1 w-6 bg-white/20 rounded-full" />
          </div>

          {/* Center Title & Graphic */}
          <div className="my-auto space-y-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/[0.05] border border-white/[0.08]">
              <div className="w-4 h-4 rounded-full border-2 border-violet-400/50 border-t-violet-400" />
            </div>
            <div className="h-3 w-4/5 bg-white/80 rounded-sm" />
            <div className="h-2 w-3/5 bg-white/50 rounded-sm" />
            <div className="h-1.5 w-2/3 bg-white/25 rounded-sm pt-1" />
            
            {/* Visual decorative bar */}
            <div className="pt-2">
              <div className="h-0.5 w-full bg-gradient-to-r from-violet-500/50 via-fuchsia-500/30 to-transparent" />
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between items-center">
              <div className="h-1.5 w-16 bg-white/30 rounded-full" />
              <div className="h-1.5 w-8 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'financial_table':
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between select-none">
          {/* Header */}
          <div className="space-y-1.5 mb-2">
            <div className="flex justify-between items-center">
              <div className="h-2 w-20 bg-white/70 rounded-sm" />
              <div className="h-1.5 w-10 bg-emerald-400/60 rounded-full" />
            </div>
            <div className="h-1 w-28 bg-white/20 rounded-full" />
          </div>

          {/* Table Graphic */}
          <div className="flex-1 rounded border border-white/[0.08] bg-white/[0.02] flex flex-col overflow-hidden my-1">
            {/* Table Header */}
            <div className="h-4 bg-white/[0.06] border-b border-white/[0.08] flex items-center px-1.5 gap-2">
              <div className="h-1 w-6 bg-white/50 rounded-full" />
              <div className="h-1 w-8 bg-white/40 rounded-full" />
              <div className="h-1 w-6 bg-white/40 rounded-full ml-auto" />
            </div>
            {/* Rows */}
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className="flex-1 flex items-center px-1.5 gap-2 border-b border-white/[0.04] last:border-0">
                <div className="h-1 w-5 bg-white/25 rounded-full" />
                <div className="h-1 w-10 bg-white/20 rounded-full" />
                <div className="h-1 w-4 bg-emerald-400/40 rounded-full ml-auto" />
              </div>
            ))}
          </div>

          {/* Mini Chart Graphic */}
          <div className="h-7 rounded bg-white/[0.02] border border-white/[0.06] p-1.5 flex items-end gap-1.5 justify-between">
            <div className="h-2 w-2 bg-violet-400/40 rounded-t-sm" />
            <div className="h-3.5 w-2 bg-violet-400/60 rounded-t-sm" />
            <div className="h-4.5 w-2 bg-violet-400/80 rounded-t-sm" />
            <div className="h-3 w-2 bg-violet-400/50 rounded-t-sm" />
            <div className="h-5.5 w-2 bg-violet-400 rounded-t-sm" />
          </div>
        </div>
      );

    case 'chart_analytics':
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between select-none">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="h-2 w-16 bg-white/70 rounded-sm" />
            <div className="w-2 h-2 rounded-full bg-violet-400" />
          </div>

          {/* Two metric cards */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="h-1 w-6 bg-white/30 rounded-full mb-1" />
              <div className="h-2 w-8 bg-white/70 rounded-sm" />
            </div>
            <div className="p-1.5 rounded bg-white/[0.03] border border-white/[0.06]">
              <div className="h-1 w-6 bg-white/30 rounded-full mb-1" />
              <div className="h-2 w-7 bg-emerald-400/70 rounded-sm" />
            </div>
          </div>

          {/* Donut/Bar visualization */}
          <div className="flex-1 rounded bg-white/[0.02] border border-white/[0.06] p-2 flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full border-4 border-violet-500/30 border-t-violet-400 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="h-1 w-full bg-white/30 rounded-full" />
              <div className="h-1 w-3/4 bg-violet-400/50 rounded-full" />
              <div className="h-1 w-1/2 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      );

    case 'legal_contract':
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between select-none">
          {/* Document Stamp Header */}
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-1.5 mb-2">
            <div className="h-2 w-20 bg-white/75 rounded-sm" />
            <div className="px-1 py-0.5 rounded text-[7px] border border-blue-400/40 bg-blue-500/10 text-blue-300 font-mono scale-90">
              SIGNED
            </div>
          </div>

          {/* Numbered Clause Paragraphs */}
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-1 w-2 bg-white/40 rounded-full" />
                <div className="h-1.5 w-12 bg-white/60 rounded-sm" />
              </div>
              <div className="h-1 w-full bg-white/20 rounded-full" />
              <div className="h-1 w-[92%] bg-white/20 rounded-full" />
              <div className="h-1 w-[80%] bg-white/20 rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-1 w-2 bg-white/40 rounded-full" />
                <div className="h-1.5 w-14 bg-white/60 rounded-sm" />
              </div>
              <div className="h-1 w-full bg-white/20 rounded-full" />
              <div className="h-1 w-[88%] bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-2 border-t border-white/[0.06] flex justify-between items-end">
            <div className="space-y-1">
              <div className="h-1 w-12 bg-white/30 rounded-full" />
              <div className="h-2.5 w-16 border-b border-white/40" />
            </div>
            <div className="w-5 h-5 rounded-full border border-dashed border-violet-400/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-violet-400/40" />
            </div>
          </div>
        </div>
      );

    case 'text_columns':
    default:
      return (
        <div className="w-full h-full p-3.5 flex flex-col justify-between select-none">
          {/* Article Headline */}
          <div className="space-y-1.5 mb-2 border-b border-white/[0.06] pb-2">
            <div className="h-2.5 w-3/4 bg-white/80 rounded-sm" />
            <div className="h-1 w-1/3 bg-violet-400/60 rounded-full" />
          </div>

          {/* 2-Column Content */}
          <div className="grid grid-cols-2 gap-2 flex-1 my-1">
            <div className="space-y-1">
              <div className="h-1 w-full bg-white/30 rounded-full" />
              <div className="h-1 w-[90%] bg-white/25 rounded-full" />
              <div className="h-1 w-full bg-white/25 rounded-full" />
              <div className="h-1 w-[85%] bg-white/20 rounded-full" />
              <div className="h-1 w-full bg-white/25 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-full bg-white/25 rounded-full" />
              <div className="h-1 w-[95%] bg-white/25 rounded-full" />
              {/* Callout box */}
              <div className="p-1 rounded bg-violet-500/10 border-l border-violet-400/80 my-1">
                <div className="h-0.5 w-full bg-white/40 rounded-full mb-0.5" />
                <div className="h-0.5 w-3/4 bg-white/30 rounded-full" />
              </div>
              <div className="h-1 w-full bg-white/25 rounded-full" />
              <div className="h-1 w-[80%] bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Page Footer */}
          <div className="pt-2 flex justify-between items-center text-white/30">
            <div className="h-1 w-8 bg-white/20 rounded-full" />
            <div className="h-1 w-4 bg-white/20 rounded-full" />
          </div>
        </div>
      );
  }
}
