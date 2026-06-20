'use client';

import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import type { RpaResult } from '../types/auth';

interface ResultadoRegistroProps {
  result: RpaResult;
  onContinue: () => void;
  onRetry: () => void;
  isSubmitting?: boolean;
}

const ESTADO_CONFIG = {
  ACEPTADO: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    title: 'Solicitud Aprobada',
    subtitle: 'Tu tienda ha sido creada exitosamente',
  },
  REVISION: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    title: 'Solicitud en Revisión',
    subtitle: 'Se requiere revisión manual por el equipo',
  },
  RECHAZADO: {
    icon: XCircle,
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
    title: 'Solicitud Rechazada',
    subtitle: 'No cumple con los requisitos del marketplace',
  },
};

const RIESGO_CONFIG = {
  BAJO: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Bajo' },
  MEDIO: { text: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Medio' },
  ALTO: { text: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Alto' },
};

export function ResultadoRegistro({ result, onContinue, onRetry, isSubmitting }: ResultadoRegistroProps) {
  const config = ESTADO_CONFIG[result.estado];
  const riesgoKey = result.riesgo.toUpperCase() as keyof typeof RIESGO_CONFIG;
  const riesgoConfig = RIESGO_CONFIG[riesgoKey];
  const Icon = config.icon;

  const scoreColor =
    result.score >= 70 ? 'bg-emerald-500'
    : result.score >= 50 ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 w-[90%] mx-auto flex flex-col items-center justify-center">
        <div className={`w-20 h-20 ${config.bg} rounded-2xl flex items-center justify-center mb-6 ${config.border} border`}>
          <Icon className={`w-10 h-10 ${config.text}`} />
        </div>

        <h3 className="text-2xl font-black text-[var(--text-primary)] text-center">
          {config.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center mt-1 mb-8">
          {config.subtitle}
        </p>

        <div className="w-full space-y-4 mb-8">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-3">
              Puntaje de Riesgo
            </p>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-black tabular-nums ${riesgoConfig.text}`}>
                {result.score}
              </span>
              <div className="flex-1">
                <div className="h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${scoreColor}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[var(--text-secondary)]">0</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">100</span>
                </div>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${riesgoConfig.bg} ${riesgoConfig.text}`}>
                {riesgoConfig.label}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-3">
              Diagnóstico
            </p>
            <ul className="space-y-2">
              {result.diagnostico.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    result.estado === 'ACEPTADO' ? 'bg-emerald-500' :
                    result.estado === 'RECHAZADO' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full space-y-3">
          {result.estado === 'ACEPTADO' && (
            <button
              type="button"
              onClick={onContinue}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
              ) : (
                <><span>Ir a mi tienda</span> <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          )}

          {(result.estado === 'RECHAZADO' || result.estado === 'REVISION') && (
            <>
              <button
                type="button"
                onClick={onRetry}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Reintentando...</>
                ) : (
                  <><RefreshCw className="w-5 h-5" /> <span>Intentar de nuevo</span></>
                )}
              </button>

              <button
                type="button"
                onClick={onContinue}
                disabled={isSubmitting}
                className="w-full py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
