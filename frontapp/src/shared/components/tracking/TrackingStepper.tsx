'use client';

import React from 'react';

export interface TrackingStepDef {
  key: string | number;
  label: string;
  /** Filename under /imagenes-seguimiento/, e.g. '1.png' */
  image: string;
}

// Paleta de progresión para pasos completados: de lima claro → verde profundo.
const STEP_COMPLETED_COLORS = [
  { border: 'border-[#bde90d]', shadow: 'shadow-[#bde90d]/40', dot: '#bde90d' },
  { border: 'border-[#6BAF7B]', shadow: 'shadow-[#6BAF7B]/40', dot: '#6BAF7B' },
  { border: 'border-emerald-500', shadow: 'shadow-emerald-400/40', dot: '#10b981' },
  { border: 'border-teal-500', shadow: 'shadow-teal-400/40', dot: '#14b8a6' },
];

/**
 * Stepper de seguimiento unificado (imágenes circulares + check-badge + anillo
 * pulsante en el paso activo + barra de progreso con degradado). Usado en
 * Mis Pedidos (cliente), y en Ventas (vendedor) para productos y servicios —
 * un solo componente para que las tres vistas luzcan y se animen igual.
 */
export function TrackingStepper({
  steps,
  currentStep,
  validated = false,
}: {
  steps: TrackingStepDef[];
  /** Posición 1-indexada dentro de `steps` (no el id del paso). */
  currentStep: number;
  /** Si true, el último paso se pinta como completado (check) en vez de "activo". */
  validated?: boolean;
}) {
  const totalSteps = steps.length;
  const activeIndex = Math.min(Math.max(currentStep - 1, 0), totalSteps - 1);
  const progress = totalSteps > 1 ? (activeIndex / (totalSteps - 1)) * 100 : 100;
  // Los centros de los círculos caen en 50%/N, 150%/N, ... del ancho de la fila,
  // así que la línea debe entrar exactamente 50%/N por cada lado para alinear
  // con esos centros sin importar cuántos pasos tenga el flujo.
  const lineInset = `calc(50% / ${totalSteps})`;

  return (
    <div className="space-y-4 animate-card-entrance">
      <div className="relative flex justify-between items-start pt-2 pb-6">
        <div
          className="absolute top-[20px] sm:top-[28px] h-[3px] bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-full z-0"
          style={{ left: lineInset, right: lineInset }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #bde90d, #6BAF7B, #2A5A4D)',
            }}
          />
        </div>

        {steps.map((step, i) => {
          const isLast = i === totalSteps - 1;
          const isCompleted = i < activeIndex || (validated && isLast && i === activeIndex);
          const isActive = i === activeIndex && !isCompleted;
          const color = STEP_COMPLETED_COLORS[Math.min(i, STEP_COMPLETED_COLORS.length - 1)];

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10 gap-1 sm:gap-2"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-[3px] overflow-hidden transition-all duration-700 flex-shrink-0 flex items-center justify-center bg-white dark:bg-[var(--bg-card)]
                    ${isCompleted
                      ? `${color.border} shadow-lg ${color.shadow}`
                      : isActive
                        ? 'border-sky-500 dark:border-[var(--turquesa-500)] shadow-lg shadow-sky-400/30 dark:shadow-[var(--turquesa-500)]/30 scale-110 ring-4 ring-sky-200/50 dark:ring-[var(--turquesa-500)]/20'
                        : 'border-gray-200 dark:border-[var(--border-subtle)] opacity-50'
                    }`}
                >
                  <img
                    src={`/imagenes-seguimiento/${step.image}`}
                    alt={step.label}
                    className={`w-[90%] h-[90%] rounded-full object-cover transition-all duration-700 ${!isCompleted && !isActive ? 'grayscale opacity-60' : ''}`}
                  />
                </div>

                {isCompleted && (
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)]"
                    style={{ backgroundColor: color.dot }}
                  >
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400 dark:border-[var(--turquesa-500)] animate-ping opacity-25 pointer-events-none" />
                )}
              </div>

              <p className={`text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight px-0.5 break-words transition-all duration-700
                ${isActive
                  ? 'text-sky-600 dark:text-[var(--icons-green)]'
                  : isCompleted
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-300 dark:text-[var(--border-subtle)]'
                }`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
