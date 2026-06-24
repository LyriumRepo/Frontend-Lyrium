'use client';

import { memo } from 'react';
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
    const formatPrice = (price: number, currency: string) => {
        return `${currency} ${price.toFixed(2)}`;
    };

    const getButtonText = () => {
        if (isCurrentPlan) return 'Plan Actual';
        if ((isClaimed || isTrialUsed) && plan.claimedButtonText) return plan.claimedButtonText;
        return plan.subscribeButtonText || 'Suscribirse';
    };

    const getButtonStyle = () => {
        if (isCurrentPlan) {
            return {
                backgroundColor: buttonColors?.currentBg || 'var(--bg-secondary)',
                color: buttonColors?.currentColor || 'var(--text-secondary)'
            };
        }
        if (isClaimed || isTrialUsed) {
            return {
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'not-allowed' as const
            };
        }
        return {
            backgroundColor: buttonColors?.subscribeBg || plan.cssColor || '#3b82f6',
            color: buttonColors?.subscribeColor || '#ffffff'
        };
    };

    const visibleFeatures = plan.features?.slice(0, 5) || [];

    return (
        <div
            className={`bg-[var(--bg-card)] rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                isActive ? 'border-blue-500' : 'border-transparent shadow-md'
            } ${isCurrentPlan ? 'bg-green-500/5' : ''}`}
            style={{
                '--plan-color': plan.cssColor,
                borderColor: isActive ? plan.cssColor : isCurrentPlan ? `${plan.cssColor}50` : 'transparent',
            } as React.CSSProperties}
        >
            {/* Imagen del plan */}
            {plan.bgImage && (
                <div className="relative w-full h-44 overflow-hidden">
                    <img
                        src={plan.bgImage}
                        alt={plan.name}
                        className="w-full h-full object-cover object-top"
                    />
                    {/* Gradiente inferior para transición suave */}
                    <div
                        className="absolute inset-x-0 bottom-0 h-16"
                        style={{
                            background: `linear-gradient(to bottom, transparent, var(--bg-card))`
                        }}
                    />
                    {/* Badge sobre la imagen */}
                    {plan.badge && (
                        <span
                            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                            style={{ backgroundColor: plan.cssColor }}
                        >
                            {plan.badge}
                        </span>
                    )}
                    {/* Plan actual badge */}
                    {isCurrentPlan && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-500 shadow-md">
                            ✓ Plan Actual
                        </span>
                    )}
                </div>
            )}

            <div className="px-5 pb-5 pt-1">
                {/* Nombre y precio */}
                <div className="mb-4">
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] uppercase tracking-wide mb-1">
                        {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold" style={{ color: plan.cssColor }}>
                            {plan.usePriceMode && plan.priceText
                                ? plan.priceText
                                : formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-[var(--text-secondary)] text-sm">
                            {plan.usePriceMode ? plan.priceSubtext : plan.period}
                        </span>
                    </div>
                    {plan.description && (
                        <p className="text-[var(--text-secondary)] text-xs mt-2 leading-relaxed">
                            {plan.description}
                        </p>
                    )}
                </div>

                {/* Divisor con color del plan */}
                <div className="h-px mb-4 rounded-full opacity-30" style={{ backgroundColor: plan.cssColor }} />

                {/* Features */}
                <div className="space-y-2 mb-5">
                    {visibleFeatures.map((feature, idx) => (
                        <div
                            key={`${feature.text}-${idx}`}
                            className={`flex items-start gap-2 text-xs ${
                                feature.active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] line-through'
                            }`}
                        >
                            <Icon
                                name="Check"
                                className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                                    feature.active ? '' : 'text-[var(--text-secondary)]'
                                }`}
                                style={feature.active ? { color: plan.cssColor } : undefined}
                            />
                            <span>{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* Botones */}
                <div className="space-y-2">
                    <button
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                        style={getButtonStyle()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrentPlan && !isClaimed && !isTrialUsed) onSelect();
                        }}
                        disabled={isCurrentPlan || isClaimed || isTrialUsed}
                    >
                        {getButtonText()}
                    </button>

                    <button
                        className="w-full flex items-center justify-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewBenefits();
                        }}
                    >
                        <span>Ver beneficios</span>
                        <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export const PlanCard = memo(PlanCardComponent);
