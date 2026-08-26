import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileDown, Check, Download, ShieldCheck } from 'lucide-react';

export default function ExportModal({
  document,
  selectedCount = 0,
  isSelectionExport = false,
  onClose,
  onExport,
}) {
  const defaultName = isSelectionExport
    ? `${document?.name.replace('.pdf', '')}_selection.pdf`
    : `${document?.name || 'Document.pdf'}`;

  const [filename, setFilename] = useState(defaultName);
  const [compressLevel, setCompressLevel] = useState('standard'); // 'lossless' | 'standard' | 'compressed'

  const handleExportSubmit = (e) => {
    e.preventDefault();
    onExport(filename, compressLevel);
    onClose();
  };

  const totalPagesToExport = isSelectionExport ? selectedCount : document?.pages.length || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
          className="max-w-md w-full bg-[#12131b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
                <FileDown size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-none">
                  {isSelectionExport ? 'Export Selected Pages' : 'Export Document'}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Save {totalPagesToExport} pages as a new PDF file
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleExportSubmit} className="p-6 space-y-5">
            {/* File Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                File Name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/80 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Quality / Compression */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Quality Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lossless', label: 'Maximum', desc: '100% Quality' },
                  { id: 'standard', label: 'Balanced', desc: 'Optimal' },
                  { id: 'compressed', label: 'Compact', desc: 'Small size' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCompressLevel(preset.id)}
                    className={`
                      p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all
                      ${compressLevel === preset.id
                        ? 'bg-violet-500/15 border-violet-500/50 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    <span className="text-xs font-semibold leading-none">
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 text-xs text-zinc-400">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Exported locally via pdf-lib. No files leave your device.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
              >
                <Download size={14} />
                <span>Save PDF</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
