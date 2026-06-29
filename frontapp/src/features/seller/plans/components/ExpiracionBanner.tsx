'use client';
import { motion } from 'framer-motion';
import { getDaysLeft } from '@/features/seller/plans/lib/helpers';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import type { SubscriptionInfo, AvisoVencimientoResponse, PlansMap } from '@/features/seller/plans/types';

interface Props {
  avisoPorVencer: AvisoVencimientoResponse | null;
  subscriptionInfo: SubscriptionInfo | null;
  currentPlan: string; plansData: PlansMap;
  onClose: () => void;
}

export default function ExpiracionBanner({ avisoPorVencer, subscriptionInfo, currentPlan, plansData, onClose }: Props) {
  let diasRestantes: number | null = null;
  let nombrePlan: string | null = null;

  if (avisoPorVencer?.porVencer) {
    diasRestantes = avisoPorVencer.diasRestantes ?? null;
    nombrePlan = avisoPorVencer.nombrePlan ?? null;
  } else if (subscriptionInfo?.expiryDate && currentPlan !== 'basic') {
    const diff = getDaysLeft(subscriptionInfo.expiryDate);
    if (diff > 0 && diff <= 15) { diasRestantes = diff; nombrePlan = plansData[currentPlan]?.name ?? currentPlan; }
  }

  if (!diasRestantes || diasRestantes <= 0) return null;

  const urgente = diasRestantes <= 5;
  const texto = urgente
    ? `Tu plan <strong>${nombrePlan}</strong> vence en <strong>${diasRestantes} día${diasRestantes === 1 ? '' : 's'}</strong>. Renueva ahora para no perder el acceso.`
    : `Tu plan <strong>${nombrePlan}</strong> vence en <strong>${diasRestantes} día${diasRestantes === 1 ? '' : 's'}</strong>. Te recomendamos renovar pronto.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${
        urgente
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        urgente
          ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400'
          : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400'
      }`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <span className={`flex-1 text-sm font-medium leading-relaxed ${
        urgente ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
      }`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(texto) }} />
      <button className="shrink-0 w-7 h-7 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center text-current opacity-60 hover:opacity-100" onClick={onClose} title="Cerrar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </motion.div>
  );
}
