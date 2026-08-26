import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, Undo2, X } from 'lucide-react';

export default function Toast({ toast, onDismiss, onUndo }) {
  return (
    <AnimatePresence>
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-xl bg-[#141520]/95 border border-white/[0.14] shadow-2xl shadow-black/80 text-xs text-white"
          >
            {toast.type === 'success' && <CheckCircle size={14} className="text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle size={14} className="text-red-400" />}
            {(!toast.type || toast.type === 'info') && <Info size={14} className="text-violet-400" />}

            <span className="font-medium">{toast.message}</span>

            {toast.undoable && (
              <button
                onClick={() => {
                  onUndo && onUndo();
                  onDismiss();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-violet-300 hover:text-white font-medium transition-colors ml-1"
              >
                <Undo2 size={12} />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={onDismiss}
              className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 ml-1"
            >
              <X size={12} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
