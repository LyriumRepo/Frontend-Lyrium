'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw, Loader2, Mail, Send } from 'lucide-react';
import type { RpaResult } from '../types/auth';

const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

interface ResultadoRegistroProps {
  result: RpaResult;
  onContinue: () => void;
  onRetry: () => void;
  isSubmitting?: boolean;
  email?: string;
}

const ESTADO_CONFIG = {
  ACEPTADO: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    title: 'Solicitud Aprobada',
    subtitle: 'Tu tienda ha sido creada exitosamente.',
  },
  REVISION: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    title: 'Solicitud en Revisión',
    subtitle: 'Hemos recibido tu solicitud. El equipo evaluará tu caso.',
  },
  RECHAZADO: {
    icon: XCircle,
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
    title: 'Solicitud Rechazada',
    subtitle: 'No cumple con los requisitos del marketplace.',
  },
};

export function ResultadoRegistro({ result, onContinue, onRetry, isSubmitting, email }: ResultadoRegistroProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const config = ESTADO_CONFIG[result.estado];
  const Icon = config.icon;

  const handleSendDiagnostico = useCallback(async () => {
    setSending(true);
    setSendError(null);
    try {
      const response = await fetch(`${LARAVEL_API}/auth/send-diagnostico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          application_id: result.application_id,
          email: email || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar');
      }

      setSent(true);
    } catch (e: any) {
      setSendError(e.message || 'No se pudo enviar el diagnóstico.');
    } finally {
      setSending(false);
    }
  }, [result.application_id, email]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 w-[90%] mx-auto flex flex-col items-center justify-center">
        <div className={`w-20 h-20 ${config.bg} rounded-2xl flex items-center justify-center mb-6 ${config.border} border`}>
          <Icon className={`w-10 h-10 ${config.text}`} />
        </div>

        <h3 className="text-2xl font-black text-[var(--text-primary)] text-center">
          {config.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center mt-1 mb-6 max-w-sm">
          {config.subtitle}
        </p>

        {sendError && (
          <div className="w-full mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center">
            {sendError}
          </div>
        )}

        {sent && (
          <div className="w-full mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Diagnóstico enviado a tu correo
          </div>
        )}

        <button
          type="button"
          onClick={handleSendDiagnostico}
          disabled={sending || sent}
          className="w-full mb-6 py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-teal-500/30 dark:border-teal-400/20 text-teal-600 dark:text-teal-400 text-sm font-bold hover:bg-teal-50 dark:hover:bg-teal-500/5 transition disabled:opacity-50"
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : sent ? (
            <><Mail className="w-4 h-4" /> Enviado</>
          ) : (
            <><Send className="w-4 h-4" /> Enviar diagnóstico a mi correo</>
          )}
        </button>

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
                <><ArrowRight className="w-5 h-5" /> <span>Volver al inicio</span></>
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