'use client';

import type { BookingStatus } from '@/shared/lib/api/bookingRepository';

interface Step {
  id: number;
  label: string;
  image: string;
}

const STEPS_HOME: Step[] = [
  { id: 1, label: 'Pendiente',  image: '/imagenes-seguimiento/1.png' },
  { id: 2, label: 'Confirmada', image: '/imagenes-seguimiento/2.png' },
  { id: 3, label: 'En camino',  image: '/imagenes-seguimiento/3.png' },
  { id: 4, label: 'Completada', image: '/imagenes-seguimiento/4.png' },
];

const STEPS_STORE: Step[] = [
  { id: 1, label: 'Pendiente',  image: '/imagenes-seguimiento/1.png' },
  { id: 2, label: 'Confirmada', image: '/imagenes-seguimiento/2.png' },
  { id: 3, label: 'Completada', image: '/imagenes-seguimiento/4.png' },
];

const STEP_COLORS = [
  { border: 'border-[#bde90d]', shadow: 'shadow-[#bde90d]/40', dot: '#bde90d' },
  { border: 'border-[#6BAF7B]', shadow: 'shadow-[#6BAF7B]/40', dot: '#6BAF7B' },
  { border: 'border-emerald-500', shadow: 'shadow-emerald-400/40', dot: '#10b981' },
  { border: 'border-teal-500',   shadow: 'shadow-teal-400/40',   dot: '#14b8a6' },
];

function statusToStep(status: BookingStatus, isHome: boolean): number {
  if (status === 'cancelled' || status === 'no_show') return 0;
  if (isHome) {
    if (status === 'pending') return 1;
    if (status === 'confirmed') return 2;
    if (status === 'on_the_way') return 3;
    if (status === 'completed') return 4;
  }
  if (status === 'pending') return 1;
  if (status === 'confirmed') return 2;
  if (status === 'completed') return 3;
  return 0;
}

export function BookingTimeline({
  status,
  isHome,
}: {
  status: BookingStatus;
  isHome: boolean;
}) {
  if (status === 'cancelled' || status === 'no_show') {
    return (
      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center">
        <p className="text-sm font-bold text-red-700 dark:text-red-300">
          {status === 'cancelled' ? '❌ Reserva cancelada' : '⚠️ Cliente no asistió'}
        </p>
      </div>
    );
  }

  const steps = isHome ? STEPS_HOME : STEPS_STORE;
  const current = statusToStep(status, isHome);
  const activeIdx = Math.min(Math.max(current - 1, 0), steps.length - 1);
  const total = steps.length;
  const progress = total > 1 ? (activeIdx / (total - 1)) * 100 : 100;

  return (
    <div className="space-y-4 animate-card-entrance">
      <div className="relative flex justify-between items-start pt-2 pb-6">
        {/* Línea base + barra de progreso con gradiente */}
        <div className="absolute top-[28px] left-[5%] right-[5%] h-[3px] bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-full z-0">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #bde90d, #6BAF7B, #2A5A4D)',
            }}
          />
        </div>

        {steps.map((s, i) => {
          const isCompleted = i < activeIdx;
          const isActive = i === activeIdx;
          const color = STEP_COLORS[Math.min(i, STEP_COLORS.length - 1)];

          return (
            <div
              key={s.id}
              className="flex flex-col items-center relative z-10 gap-2"
              style={{ width: `${100 / total}%` }}
            >
              {/* Círculo del paso */}
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-full border-[3px] overflow-hidden transition-all duration-700 flex-shrink-0 flex items-center justify-center bg-white dark:bg-[var(--bg-card)]
                    ${isCompleted
                      ? `${color.border} shadow-lg ${color.shadow}`
                      : isActive
                        ? 'border-emerald-500 dark:border-[var(--icons-green)] shadow-lg shadow-emerald-400/30 dark:shadow-[var(--icons-green)]/30 scale-110 ring-4 ring-emerald-200/50 dark:ring-[var(--icons-green)]/20'
                        : 'border-gray-200 dark:border-[var(--border-subtle)] opacity-50'
                    }`}
                >
                  <img
                    src={s.image}
                    alt={`Paso ${s.id}`}
                    className={`w-[90%] h-[90%] rounded-full object-cover transition-all duration-700 ${!isCompleted && !isActive ? 'grayscale opacity-60' : ''}`}
                  />
                </div>

                {/* Badge de completado */}
                {isCompleted && (
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)]"
                    style={{ backgroundColor: color.dot }}
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Anillo pulsante del paso activo */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 dark:border-[var(--icons-green)] animate-ping opacity-25 pointer-events-none" />
                )}
              </div>

              {/* Etiqueta del paso */}
              <p className={`text-center text-[8px] font-black uppercase tracking-wider leading-tight px-0.5 transition-all duration-700
                ${isActive
                  ? 'text-emerald-600 dark:text-[var(--icons-green)]'
                  : isCompleted
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-300 dark:text-[var(--border-subtle)]'
                }`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
