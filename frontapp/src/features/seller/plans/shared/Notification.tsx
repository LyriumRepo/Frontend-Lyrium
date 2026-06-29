'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  msg: string; color: string; visible: boolean; onClose: () => void;
}

export default function Notification({ msg, color, visible, onClose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 right-4 sm:right-6 z-[99999] max-w-sm w-full backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
        >
          <div className="bg-white/95 dark:bg-gray-800/95 p-4 pr-12">
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{msg}</p>
            <button
              className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all flex items-center justify-center"
              onClick={onClose}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
