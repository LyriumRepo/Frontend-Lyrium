'use client';
import { motion } from 'framer-motion';
import Modal from '@/features/seller/plans/shared/Modal';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import type { PlansMap } from '@/features/seller/plans/types';

interface DowngradeProps {
  open: boolean; plan: string | null; plansData: PlansMap;
  onClose: () => void; onConfirm: () => void;
}

export function DowngradeModal({ open, plan, plansData, onClose, onConfirm }: DowngradeProps) {
  const data = plan ? plansData[plan] : null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </motion.div>
        <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-2">¿Cambiar a un plan menor?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Estás a punto de cambiar tu plan a <strong className="text-gray-700 dark:text-gray-200">{data?.name ?? plan}</strong>. Perderás acceso a algunas funciones de tu plan actual.
        </p>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={onClose}>Cancelar</button>
          <button className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all" onClick={onConfirm}>Sí, continuar</button>
        </div>
      </div>
    </Modal>
  );
}

interface DowngradeConfirm2Props {
  open: boolean; plan: string | null; plansData: PlansMap;
  confirmText: string; onCancel: () => void; onExecute: () => void;
}

export function DowngradeConfirm2Modal({ open, plan, plansData, confirmText, onCancel, onExecute }: DowngradeConfirm2Props) {
  const data = plan ? plansData[plan] : null;
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="text-center py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </motion.div>
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Última confirmación</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          ¿Confirmas el cambio al plan <strong className="text-gray-700 dark:text-gray-200">{data?.name ?? plan}</strong>?{' '}
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(confirmText) }} />
        </p>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={onCancel}>Cancelar</button>
          <button className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-500/20 transition-all" onClick={onExecute}>Confirmar cambio</button>
        </div>
      </div>
    </Modal>
  );
}
