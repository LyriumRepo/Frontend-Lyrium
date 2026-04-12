'use client';
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
  let nombrePlan: string | null    = null;

  if (avisoPorVencer?.porVencer) {
    diasRestantes = avisoPorVencer.diasRestantes ?? null;
    nombrePlan    = avisoPorVencer.nombrePlan ?? null;
  } else if (subscriptionInfo?.expiryDate && currentPlan !== 'basic') {
    const diff = getDaysLeft(subscriptionInfo.expiryDate);
    if (diff > 0 && diff <= 15) { diasRestantes = diff; nombrePlan = plansData[currentPlan]?.name ?? currentPlan; }
  }

  if (!diasRestantes || diasRestantes <= 0) return null;

  const urgente = diasRestantes <= 5;
  const texto = urgente
    ? `🚨 ¡URGENTE! Tu plan <strong>${nombrePlan}</strong> vence en <strong>${diasRestantes} día${diasRestantes === 1 ? '' : 's'}</strong>. Renueva ahora para no perder el acceso.`
    : `⚠️ Tu plan <strong>${nombrePlan}</strong> vence en <strong>${diasRestantes} día${diasRestantes === 1 ? '' : 's'}</strong>. Te recomendamos renovar pronto.`;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${urgente ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${urgente ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <span className={`flex-1 text-sm font-medium ${urgente ? 'text-red-800' : 'text-amber-800'}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(texto) }} />
      <button className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors" onClick={onClose} title="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
