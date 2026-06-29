'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, formatDate, getDaysLeft, lightenColor, hexToRgba } from '@/features/seller/plans/lib/helpers';
import type { PlansMap, SubscriptionInfo } from '@/features/seller/plans/types';

interface Props {
  currentPlan: string; plansData: PlansMap;
  subscriptionInfo: SubscriptionInfo | null;
  isDetailsExpanded: boolean; onToggleDetails: () => void;
  onFeatureClick: (planKey: string) => void;
}

export default function CurrentPlanCard({ currentPlan, plansData, subscriptionInfo, isDetailsExpanded, onToggleDetails, onFeatureClick }: Props) {
  const data = plansData[currentPlan];
  if (!data) return null;

  const visibleLimit = data.compactVisibleCount ?? 5;
  const planColor = data.cssColor ?? '#14b8a6';

  const hasBg = !!data.bgImage;

  let daysLeft = 0;
  let expiryBadge: React.ReactNode = null;

  if (currentPlan === 'basic') {
    expiryBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/30">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Vigencia: Indefinida
      </span>
    );
  } else if (subscriptionInfo?.plan === currentPlan) {
    daysLeft = getDaysLeft(subscriptionInfo.expiryDate);
    const isWarning = daysLeft <= 15;
    expiryBadge = (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        isWarning
          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/30'
          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/30'
      }`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Vence: {formatDate(subscriptionInfo.expiryDate)} ({daysLeft} días restantes)
      </span>
    );
  } else {
    expiryBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/30">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Vigencia: Activa
      </span>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20 border-2 transition-all duration-500"
      style={{
        borderColor: planColor,
        boxShadow: `0 0 0 1px ${hexToRgba(planColor, 0.3)}, 0 20px 60px ${hexToRgba(planColor, 0.1)}, 0 8px 20px rgba(0,0,0,0.05)`,
      }}
    >
      <div className="absolute inset-0" style={{
        background: hasBg
          ? `url('${data.bgImage}') center/cover`
          : `linear-gradient(135deg, ${lightenColor(planColor, 0.85)} 0%, ${lightenColor(planColor, 0.7)} 50%, ${lightenColor(planColor, 0.4)} 100%)`
      }} />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent dark:from-gray-900/95 dark:via-gray-900/70 dark:to-transparent" />

      <div className="relative p-6 sm:p-8 md:p-10 max-w-lg">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: hexToRgba(planColor, 0.12), color: planColor, border: `1px solid ${hexToRgba(planColor, 0.3)}` }}>
          {data.name}
        </span>

        <div className="mb-5">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
              {data.usePriceMode === false && data.priceText ? data.priceText : (currentPlan === 'basic' ? 'GRATIS' : formatPrice(data.price, data.currency ?? 'S/'))}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data.usePriceMode === false && data.priceText ? (data.priceSubtext ?? '') : (currentPlan === 'basic' ? '' : (data.period ?? '/mes'))}
            </span>
          </div>
        </div>

        <div className="mb-6">{expiryBadge}</div>

        <div className="space-y-2 mb-6">
          {(data.features ?? []).slice(0, visibleLimit).map((f, i) => (
            <div
              key={`feat-${i}-${(f.text ?? '').slice(0, 8)}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2.5 text-sm cursor-pointer transition-all px-1 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${
                f.active
                  ? 'text-gray-700 dark:text-gray-200'
                  : 'text-gray-400 dark:text-gray-500 line-through'
              }`}
              onClick={() => onFeatureClick(currentPlan)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFeatureClick(currentPlan); }}
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

        <button
          onClick={onToggleDetails}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <span>{isDetailsExpanded ? 'Ver menos' : 'Ver detalles'}</span>
          <motion.svg animate={{ rotate: isDetailsExpanded ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </motion.svg>
        </button>

        <AnimatePresence>
          {isDetailsExpanded && (data.features ?? []).length > visibleLimit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="h-px bg-gray-200/50 dark:bg-white/10 my-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(data.features ?? []).slice(visibleLimit).map((f, i) => (
                  <div
                    key={`detail-${i}-${(f.text ?? '').slice(0, 8)}`}
                    className={`flex items-center gap-1.5 text-xs ${
                      f.active
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 line-through'
                    }`}
                  >
                    <span className={`shrink-0 ${f.active ? 'text-emerald-500' : 'text-gray-400'}`}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
