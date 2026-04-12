'use client';

import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

const STEPS = [
    { id: 1, label: 'Carrito', Icon: ShoppingCart },
    { id: 2, label: 'Datos', Icon: CreditCard },
    { id: 3, label: 'Confirmación', Icon: CheckCircle },
] as const;

const STEP_COLORS = {
    1: { accent: '#E6EE9C', glow: 'rgba(192,223,22,0.35)' },
    2: { accent: '#78E0A1', glow: 'rgba(120,224,161,0.35)' },
    3: { accent: '#5B9BD5', glow: 'rgba(91,155,213,0.35)' },
};

export default function CheckoutStepBar() {
    const currentStep = useCheckoutStore((s) => s.currentStep);

    const getCircleClass = (stepId: number) => {
        if (stepId < currentStep) return 'step-circle--completed';
        if (stepId === currentStep) return 'step-circle--active';
        return 'step-circle--pending';
    };

    const connectorFill = (afterStep: number) => {
        if (currentStep > afterStep) return '100%';
        return '0%';
    };

    return (
        <div id="checkout-step-bar" className="bg-white dark:bg-[var(--bg-secondary)] relative z-30">
            <div className="relative max-w-6xl mx-auto flex items-center justify-center px-4">

                {/* Logo */}
                <div className="absolute left-4 hidden md:flex items-center py-1">
                    <a href="/" className="transition-transform hover:scale-105 active:scale-95">
                        <img src="/img/logo.png" alt="Lyrium" className="h-20 w-auto" />
                    </a>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-between w-full max-w-2xl mx-auto py-3 relative">
                    {STEPS.map((step, idx) => {
                        const color = STEP_COLORS[step.id as 1 | 2 | 3];
                        const circleClass = getCircleClass(step.id);
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const { Icon } = step;

                        return (
                            <div key={step.id} className={`flex items-center ${idx < STEPS.length - 1 ? 'flex-1' : ''}`}>
                                {/* Step column */}
                                <div
                                    className="flex flex-col items-center justify-center gap-2 relative z-10"
                                    style={{ '--step-accent': color.accent, '--step-glow': color.glow } as React.CSSProperties}
                                >
                                    {/* Circle */}
                                    <div
                                        className={[
                                            'w-14 h-14 rounded-full flex items-center justify-center font-black text-lg shadow-xl transition-all duration-300 select-none',
                                            isActive
                                                ? 'text-white scale-110 animate-pulse-glow'
                                                : isCompleted
                                                    ? 'text-white scale-100'
                                                    : 'text-white opacity-50',
                                        ].join(' ')}
                                        style={{
                                            background: isCompleted
                                                ? 'linear-gradient(135deg,#C0DF16,#78E0A1,#5B9BD5)'
                                                : color.accent,
                                            boxShadow: isActive
                                                ? `0 0 0 4px white, 0 8px 32px ${color.glow}`
                                                : `0 4px 16px ${color.glow}`,
                                        }}
                                    >
                                        {isCompleted ? '✓' : step.id}
                                    </div>

                                    {/* Icon + label */}
                                    <div className="relative group transition-transform duration-500 hover:scale-110">
                                        <div
                                            className={[
                                                'absolute -inset-1.5 rounded-xl blur-lg opacity-0 transition-opacity duration-500',
                                                isActive ? 'opacity-100' : '',
                                            ].join(' ')}
                                            style={{ background: `linear-gradient(135deg, ${color.accent}33, ${color.accent}55)` }}
                                        />
                                        <div className="relative w-10 h-10 bg-white dark:bg-[var(--bg-card)] rounded-xl flex items-center justify-center shadow-md border border-gray-100/50 dark:border-[var(--border-subtle)]">
                                            <Icon
                                                className={`w-5 h-5 transition-colors duration-500 ${isActive ? 'text-sky-600 dark:text-[var(--brand-sky)]' : isCompleted ? 'text-emerald-500' : 'text-gray-400 dark:text-[var(--text-muted)]'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Connector (placed after the step column) */}
                                {idx < STEPS.length - 1 && (
                                    <div className="flex-1 h-3 flex items-start px-2 relative z-0 -mt-10"> {/* Negative margin to align with circle vertical center */}
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-full overflow-hidden transition-all duration-500">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: connectorFill(step.id),
                                                    background: 'linear-gradient(90deg,#C0DF16,#78E0A1,#5B9BD5)',
                                                    boxShadow: '0 0 10px rgba(16,242,39,0.5)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
