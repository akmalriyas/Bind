import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Check, ArrowUpDown, FileText, Plus, FileDown } from 'lucide-react';

export default function MergeModal({ documents = [], onClose, onMerge }) {
  const [selectedDocIds, setSelectedDocIds] = useState(
    documents.map((d) => d.id)
  );
  const [outputName, setOutputName] = useState('Merged_Bind_Document.pdf');

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMergeSubmit = (e) => {
    e.preventDefault();
    if (selectedDocIds.length < 2) return;
    onMerge(selectedDocIds, outputName);
    onClose();
  };

  const selectedDocs = documents.filter((d) => selectedDocIds.includes(d.id));
  const totalMergedPages = selectedDocs.reduce((acc, d) => acc + d.pages.length, 0);

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
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-none">
                  Merge Documents
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Combine selected PDFs into a single file
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

          {/* Body */}
          <form onSubmit={handleMergeSubmit} className="p-6 space-y-5">
            {/* Output File Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Output File Name
              </label>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/80 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                placeholder="Merged_Document.pdf"
                required
              />
            </div>

            {/* Document Selection List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Select Documents to Merge
                </label>
                <span className="text-[11px] font-mono text-zinc-400">
                  {selectedDocIds.length} of {documents.length} selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`
                        flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all
                        ${isChecked
                          ? 'bg-violet-500/10 border-violet-500/40 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText size={14} className={isChecked ? 'text-violet-400' : 'text-zinc-500'} />
                        <span className="text-xs font-medium truncate">{doc.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500">
                          {doc.pages.length} pp
                        </span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-violet-600 border-violet-500 text-white'
                              : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Footer */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-300">
              <span>Total Resulting Pages:</span>
              <span className="font-mono font-semibold text-violet-300">
                {totalMergedPages} Pages
              </span>
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
                disabled={selectedDocIds.length < 2}
                className={`
                  px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all
                  ${selectedDocIds.length >= 2
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }
                `}
              >
                <Layers size={14} />
                <span>Merge & Open</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
