'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexToRgba, lightenColor, formatPrice, isMobile } from '@/features/seller/plans/lib/helpers';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  showcasePlan: string; plansData: PlansMap; planOrder: string[];
  currentPlan: string; claimedPlans: string[];
  hasPendingRequest: boolean;
  onOpenPayment: (plan: string) => void;
  onClaimFree: (plan: string) => void;
  onOpenDowngrade: (plan: string) => void;
  onFeatureClick: (plan: string) => void;
}

export default function Showcase({ showcasePlan, plansData, planOrder, currentPlan, claimedPlans, hasPendingRequest, onOpenPayment, onClaimFree, onOpenDowngrade, onFeatureClick }: Props) {
  const [showcaseExpanded, setShowcaseExpanded] = useState(false);
  const data = plansData[showcasePlan];

  const isCurrent   = showcasePlan === currentPlan;
  const currentIdx  = planOrder.indexOf(currentPlan);
  const targetIdx   = planOrder.indexOf(showcasePlan);
  const isDowngrade = targetIdx < currentIdx;
  const planLocked  = !!(data?.enableClaimLock && claimedPlans.includes(showcasePlan));
  const pending     = hasPendingRequest;

  if (!data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Sin planes disponibles</p>
      </div>
    );
  }

  const defaultLimit = isMobile() ? 5 : 6;
  const configLimit  = data.compactVisibleCount ?? defaultLimit;
  const maxShow      = showcaseExpanded ? (data.features?.length ?? 0) : configLimit;

  const planColor = data.cssColor ?? '#14b8a6';
  const lightBg = lightenColor(planColor, 0.85);

  const priceSection = (() => {
    if (!data.requiresPayment && data.price === 0 && showcasePlan !== 'basic') {
      const refPlan = plansData.standard ?? plansData[planOrder[Math.min(1, planOrder.length - 1)]];
      const refTotal = refPlan ? refPlan.price * 6 : 0;
      return (
        <div className="space-y-1">
          {refTotal > 0 && <div className="text-lg line-through text-gray-400 dark:text-gray-500">{formatPrice(refTotal, data.currency)}</div>}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black" style={{ color: planColor }}>Gratis</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">— Prueba gratuita 6 meses</span>
          </div>
        </div>
      );
    }
    if (data.usePriceMode === false && data.priceText) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black" style={{ color: planColor }}>{data.priceText}</span>
          {data.priceSubtext && <span className="text-sm text-gray-500 dark:text-gray-400">{data.priceSubtext}</span>}
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
            {data.price === 0 ? 'GRATIS' : formatPrice(data.price, data.currency)}
          </span>
          {data.price > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">{data.period ?? '/mes'}</span>}
        </div>
        {data.priceAnnual > 0 && data.price > 0 && (
          <div className="flex items-baseline gap-1 text-sm">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(data.priceAnnual, data.currency)}</span>
            <span className="text-gray-500 dark:text-gray-400">{data.periodAnnual ?? '/año'}</span>
          </div>
        )}
      </div>
    );
  })();

  let ctaBtn: React.ReactNode;
  const btnBase = "px-8 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:shadow-black/10 active:scale-[0.97]";
  if (isCurrent) {
    ctaBtn = <button className={`${btnBase} bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`} disabled>Plan Actual</button>;
  } else if (planLocked) {
    ctaBtn = (
      <div className="space-y-2">
        <button className={`${btnBase} bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed`} disabled>{data.claimedButtonText ?? 'Ya reclamado'}</button>
        {data.claimedWarningText && <p className="text-xs text-red-500 dark:text-red-400 text-center font-medium">{data.claimedWarningText}</p>}
      </div>
    );
  } else if (pending) {
    ctaBtn = <button className={`${btnBase} bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`} disabled>Solicitud pendiente</button>;
  } else if (isDowngrade) {
    ctaBtn = (
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className={`${btnBase} text-white shadow-lg`}
        style={{ background: `linear-gradient(135deg, ${planColor}, ${hexToRgba(planColor, 0.7)})` }}
        onClick={() => onOpenDowngrade(showcasePlan)}
      >
        {data.subscribeButtonText ?? 'Suscribirse'}
      </motion.button>
    );
  } else {
    const isFree = !data.requiresPayment;
    if (isFree) {
      ctaBtn = (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className={`${btnBase} bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20`}
          onClick={() => onClaimFree(showcasePlan)}
        >
          {data.subscribeButtonText ?? 'Activar gratis'}
        </motion.button>
      );
    } else {
      ctaBtn = (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className={`${btnBase} text-white shadow-lg`}
          style={{ background: `linear-gradient(135deg, ${planColor}, ${hexToRgba(planColor, 0.7)})` }}
          onClick={() => onOpenPayment(showcasePlan)}
        >
          {data.subscribeButtonText ?? 'Suscribirse'}
        </motion.button>
      );
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/5 dark:shadow-black/20 border-2 transition-all duration-500"
      style={{
        borderColor: planColor,
        boxShadow: `0 0 0 1px ${hexToRgba(planColor, 0.3)}, 0 20px 60px ${hexToRgba(planColor, 0.1)}, 0 8px 20px rgba(0,0,0,0.05)`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br" style={{
        background: data.bgImage
          ? `url('${data.bgImage}') center/cover`
          : `linear-gradient(135deg, ${lightBg} 0%, ${lightenColor(planColor, 0.7)} 50%, ${lightenColor(planColor, 0.4)} 100%)`
      }} />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent dark:from-gray-900/95 dark:via-gray-900/70 dark:to-transparent" />

      <div className="relative p-6 sm:p-8 md:p-10 max-w-lg">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
          style={{ background: hexToRgba(planColor, 0.12), color: planColor, border: `1px solid ${hexToRgba(planColor, 0.3)}` }}
        >
          {data.badge}
        </span>

        <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight" style={{ color: planColor }}>
          {data.name}
        </h2>

        {data.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">{data.description}</p>
        )}

        <div className="mb-6">{priceSection}</div>

        <div className="space-y-2 mb-6">
          {(data.features ?? []).slice(0, maxShow).map((f, i) => (
            <div
              key={`${showcasePlan}-sf-${i}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2.5 text-sm cursor-pointer transition-all px-1 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${
                f.active ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'
              }`}
              onClick={() => onFeatureClick(showcasePlan)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFeatureClick(showcasePlan); }}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                f.active
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {f.active ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {(data.features?.length ?? 0) > configLimit && (
          <button
            onClick={() => setShowcaseExpanded(!showcaseExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
          >
            <span>{showcaseExpanded ? 'Ver menos' : `Ver ${(data.features?.length ?? 0) - configLimit} beneficios más`}</span>
            <motion.svg animate={{ rotate: showcaseExpanded ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </motion.svg>
          </button>
        )}

        <div>{ctaBtn}</div>
      </div>
    </div>
  );
}
