'use client';

import { ShoppingCart, Package, CreditCard, CheckCircle, FileText } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useTheme } from 'next-themes';

const STEPS = [
  { id: 1, label: 'Carrito', Icon: ShoppingCart },
  { id: 2, label: 'Empaque', Icon: Package },
  { id: 3, label: 'Datos', Icon: CreditCard },
  { id: 4, label: 'Confirmación', Icon: CheckCircle },
  { id: 5, label: 'Boleta', Icon: FileText },
] as const;

const STEP_COLORS_LIGHT = {
  1: { accent: '#E6EE9C', glow: 'rgba(192,223,22,0.35)' },
  2: { accent: '#38BDF8', glow: 'rgba(56,189,248,0.35)' },
  3: { accent: '#78E0A1', glow: 'rgba(120,224,161,0.35)' },
  4: { accent: '#5B9BD5', glow: 'rgba(91,155,213,0.35)' },
  5: { accent: '#0EA5E9', glow: 'rgba(14,165,233,0.35)' },
};

const STEP_COLORS_DARK = {
  1: { accent: '#E6EE9C', glow: 'rgba(192,223,22,0.35)' },
  2: { accent: '#34d399', glow: 'rgba(52,211,153,0.35)' },
  3: { accent: '#78E0A1', glow: 'rgba(120,224,161,0.35)' },
  4: { accent: '#10b981', glow: 'rgba(16,185,129,0.35)' },
  5: { accent: '#059669', glow: 'rgba(5,150,105,0.35)' },
};

const COMPLETED_GRADIENT_LIGHT = 'linear-gradient(135deg,#C0DF16,#78E0A1,#5B9BD5)';
const COMPLETED_GRADIENT_DARK = 'linear-gradient(135deg,#C0DF16,#78E0A1,#10b981)';
const CONNECTOR_GRADIENT_LIGHT = 'linear-gradient(90deg,#C0DF16,#78E0A1,#5B9BD5)';
const CONNECTOR_GRADIENT_DARK = 'linear-gradient(90deg,#C0DF16,#78E0A1,#10b981)';

export default function CheckoutStepBar() {
  const currentStep     = useCheckoutStore((s) => s.currentStep);
  const deliveryMethod  = useCheckoutStore((s) => s.orderData.deliveryMethod);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const STEP_COLORS = isDark ? STEP_COLORS_DARK : STEP_COLORS_LIGHT;
  const completedGradient = isDark ? COMPLETED_GRADIENT_DARK : COMPLETED_GRADIENT_LIGHT;
  const connectorGradient = isDark ? CONNECTOR_GRADIENT_DARK : CONNECTOR_GRADIENT_LIGHT;

  const isPickup = deliveryMethod === 'pickup';
  const visibleSteps = isPickup ? STEPS.filter((s) => s.id !== 2) : STEPS;

  const getCircleClass = (stepId: number) => {
    if (stepId < currentStep) return 'step-circle--completed';
    if (stepId === currentStep) return 'step-circle--active';
    return 'step-circle--pending';
  };

  const connectorFill = (afterStep: number) => {
    if (currentStep > afterStep) return '100%';
    return '0%';
  };

  const currentLabel = visibleSteps.find((s) => s.id === currentStep)?.label ?? '';
  const progressPct = Math.round((currentStep / visibleSteps.length) * 100);

  return (
    <div
      id="checkout-step-bar"
      className="bg-white dark:bg-[var(--bg-secondary)] relative z-30"
    >
      <p className="sr-only" role="status" aria-live="polite">
        Paso {currentStep} de {visibleSteps.length}: {currentLabel}. Llevas {progressPct}% del proceso de compra.
      </p>
      <div className="relative max-w-6xl mx-auto flex items-center justify-center px-4">
        {/* Steps */}
        <nav
          aria-label="Progreso de la compra"
          className="flex items-center justify-between w-full max-w-2xl mx-auto py-4 relative"
        >
          {visibleSteps.map((step, idx) => {
            const color = STEP_COLORS[step.id as 1 | 2 | 3 | 4 | 5];
            const circleClass = getCircleClass(step.id);
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const { Icon } = step;

            return (
              <div
                key={step.id}
                className={`flex items-center ${idx < visibleSteps.length - 1 ? 'flex-1' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Paso ${step.id} de ${visibleSteps.length}: ${step.label}${isCompleted ? ' (completado)' : isActive ? ' (paso actual)' : ''}`}
              >
                {/* Step column */}
                <div
                  className="flex flex-col items-center justify-center gap-2 relative z-10"
                  style={
                    {
                      '--step-accent': color.accent,
                      '--step-glow': color.glow,
                    } as React.CSSProperties
                  }
                >
                  {/* Circle */}
                  <div
                    aria-hidden="true"
                    className={[
                      'w-9 h-9 text-sm sm:w-14 sm:h-14 sm:text-lg rounded-full flex items-center justify-center font-black shadow-xl transition-all duration-300 select-none flex-shrink-0',
                      isActive
                        ? 'text-white scale-110 animate-pulse-glow'
                        : isCompleted
                          ? 'text-white scale-100'
                          : 'text-white opacity-50',
                    ].join(' ')}
                    style={{
                      background: isCompleted
                        ? completedGradient
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
                      style={{
                        background: `linear-gradient(135deg, ${color.accent}33, ${color.accent}55)`,
                      }}
                    />
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-[var(--bg-card)] rounded-xl flex items-center justify-center shadow-md border border-gray-100/50 dark:border-[var(--border-subtle)]">
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-500 ${
                          isActive
                            ? 'text-sky-600 dark:text-emerald-400'
                            : isCompleted
                              ? 'text-emerald-500'
                              : 'text-gray-400 dark:text-[var(--text-muted)]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Connector (placed after the step column) */}
                {idx < visibleSteps.length - 1 && (
                  <div className="flex-1 h-3 flex items-start px-1 sm:px-2 relative z-0 -mt-4 sm:-mt-10">
                    {/* Negative margin to align with circle vertical center */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-full overflow-hidden transition-all duration-500">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: connectorFill(step.id),
                          background:
                            connectorGradient,
                          boxShadow: '0 0 10px rgba(16,242,39,0.5)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
