'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Plan } from '../types';
import Icon from '@/components/ui/Icon';

interface PlanCardProps {
    plan: Plan;
    isActive: boolean;
    isCurrentPlan: boolean;
    isClaimed: boolean;
    isTrialUsed: boolean;
    onSelect: () => void;
    onViewBenefits: () => void;
    buttonColors?: {
        subscribeBg: string;
        subscribeColor: string;
        currentBg: string;
        currentColor: string;
    };
}

function PlanCardComponent({
    plan,
    isActive,
    isCurrentPlan,
    isClaimed,
    isTrialUsed,
    onSelect,
    onViewBenefits,
    buttonColors
}: PlanCardProps) {
    const planColor = plan.cssColor || '#14b8a6';

    const formatPrice = (price: number, currency: string) => {
        return `${currency} ${price.toFixed(2)}`;
    };

    const getButtonText = () => {
        if (isCurrentPlan) return 'Plan Actual';
        if ((isClaimed || isTrialUsed) && plan.claimedButtonText) return plan.claimedButtonText;
        return plan.subscribeButtonText || 'Suscribirse';
    };

    const isDisabled = isCurrentPlan || isClaimed || isTrialUsed;

    const visibleFeatures = plan.features?.slice(0, 5) || [];

    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${
                isActive
                    ? 'border-teal-500 shadow-lg shadow-teal-500/10 dark:shadow-teal-500/5'
                    : 'border-gray-200/50 dark:border-gray-700/50 shadow-md shadow-black/5'
            }`}
            style={{ '--plan-color': planColor } as React.CSSProperties}
        >
            {plan.badge && (
                <div className="absolute top-0 right-0">
                    <div className="relative">
                        <svg className="absolute -top-1 -right-1 w-20 h-20 text-teal-500/10" viewBox="0 0 80 80" fill="currentColor">
                            <polygon points="80,0 80,80 0,0" />
                        </svg>
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-white rotate-45 origin-center" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {plan.badge}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{plan.name}</h3>

                <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-extrabold" style={{ color: planColor }}>
                        {plan.usePriceMode && plan.priceText ? plan.priceText : formatPrice(plan.price, plan.currency)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{plan.usePriceMode ? plan.priceSubtext : plan.period}</span>
                </div>

                {plan.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4 leading-relaxed">{plan.description}</p>
                )}

                {!plan.description && <div className="mb-4" />}

                <div className="space-y-2 mb-5">
                    {visibleFeatures.map((feature, idx) => (
                        <div key={`${feature.text}-${idx}`} className={`flex items-center gap-2 text-sm ${feature.active ? '' : 'text-gray-400 dark:text-gray-500'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                feature.active
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            }`}>
                                {feature.active ? (
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                ) : (
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                )}
                            </span>
                            <span className={feature.active ? '' : 'line-through'}>{feature.text}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <motion.button
                        whileHover={isDisabled ? {} : { scale: 1.02 }}
                        whileTap={isDisabled ? {} : { scale: 0.98 }}
                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60"
                        style={{
                            backgroundColor: isCurrentPlan ? (buttonColors?.currentBg || '#e5e7eb') : (buttonColors?.subscribeBg || planColor),
                            color: isCurrentPlan ? (buttonColors?.currentColor || '#9ca3af') : (buttonColors?.subscribeColor || '#ffffff'),
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDisabled) onSelect();
                        }}
                        disabled={isDisabled}
                    >
                        {getButtonText()}
                    </motion.button>

                    <button
                        className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewBenefits();
                        }}
                    >
                        <span>Ver beneficios</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export const PlanCard = memo(PlanCardComponent);
