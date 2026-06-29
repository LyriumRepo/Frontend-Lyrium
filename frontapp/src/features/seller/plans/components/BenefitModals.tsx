'use client';
import { motion } from 'framer-motion';
import Modal from '@/features/seller/plans/shared/Modal';
import { benefitDetailsFallback } from '@/features/seller/plans/lib/benefitDetails';
import type { PlansMap, DetailedBenefit } from '@/features/seller/plans/types';

interface BenefitAskProps {
  open: boolean; planKey: string; plansData: PlansMap;
  onClose: () => void; onGoToDetail: () => void;
}

export function BenefitAskModal({ open, planKey, plansData, onClose, onGoToDetail }: BenefitAskProps) {
  const data = plansData[planKey];
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </motion.div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">¿Desea conocer los beneficios más a detalle?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Podrás ver una descripción completa de cada beneficio incluido en el plan {data?.name ?? planKey}.</p>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={onClose}>No, gracias</button>
          <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all" onClick={onGoToDetail}>Sí, ver detalles</button>
        </div>
      </div>
    </Modal>
  );
}

interface BenefitFullProps {
  open: boolean; planKey: string; plansData: PlansMap; onClose: () => void;
}

export function BenefitFullModal({ open, planKey, plansData, onClose }: BenefitFullProps) {
  const data = plansData[planKey];
  const details: DetailedBenefit[] = (data?.detailedBenefits && data.detailedBenefits.length > 0)
    ? data.detailedBenefits
    : (benefitDetailsFallback[planKey] ?? []) as DetailedBenefit[];

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: data?.cssColor ?? '#14b8a6' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Beneficios del Plan {data?.name ?? planKey}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conoce a detalle cada beneficio incluido</p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {details.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No hay detalles disponibles para este plan.</p>
        ) : (
          details.map((d, i) => {
            const iconChar = ('emoji' in d && d.emoji) ? d.emoji : ('icon' in d ? (d as any).icon : '');
            const iconColor = d.color ?? data?.cssColor ?? '#14b8a6';
            return (
              <motion.div
                key={`bd-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 border" style={{ background: `${iconColor}15`, color: iconColor, borderColor: `${iconColor}25` }}>
                  {iconChar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5">{d.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{d.description}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
