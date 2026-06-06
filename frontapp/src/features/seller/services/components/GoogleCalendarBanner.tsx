'use client';

/**
 * GoogleCalendarBanner.tsx
 *
 * Banner de conexión OAuth2 con Google Calendar para el panel seller.
 * Consume directamente el repositorio asíncrono que apunta a Laravel en el puerto 8000.
 *
 * Ubicación: src/features/seller/services/components/GoogleCalendarBanner.tsx
 */

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  getGoogleCalendarStatus,
  getGoogleAuthUrl,
  disconnectGoogleCalendar,
} from '@/shared/lib/api/googleCalendarRepository';
import { CalendarStatus } from '../types';

type Feedback = { type: 'success' | 'error'; msg: string } | null;

export default function GoogleCalendarBanner() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // ── 1. Leer resultado del callback OAuth desde los Search Params de la URL ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const param = params.get('calendar');
      if (param === 'connected') {
        setFeedback({
          type: 'success',
          msg: 'Google Calendar conectado correctamente y sincronizado.',
        });
        window.history.replaceState({}, '', '/seller/services');
      } else if (param === 'error') {
        const reason = params.get('reason') ?? 'desconocido';
        setFeedback({
          type: 'error',
          msg: `Error al conectar Calendar (${reason}). Intente nuevamente.`,
        });
        window.history.replaceState({}, '', '/seller/services');
      }
    }
  }, []);

  // ── 2. Cargar estado de sincronización inicial directo de Laravel ──
  const loadStatus = async () => {
    try {
      const data = await getGoogleCalendarStatus();
      setStatus(data);
    } catch (err) {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // ── 3. Redirigir hacia Google OAuth2 (Corregido sin 'any' en el catch) ──
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const data = await getGoogleAuthUrl();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(
          'La API de Laravel no retornó una URL válida de Google.',
        );
      }
    } catch (err) {
      // TypeScript Safe Casting para evitar el error 'any' en catch
      const error = err as Error;
      setFeedback({
        type: 'error',
        msg:
          error.message ??
          'No se pudo iniciar la conexión con Google. Verifique la sesión.',
      });
      setConnecting(false);
    }
  };

  // ── 4. Desconectar Calendario ──
  const handleDisconnect = async () => {
    if (
      !confirm(
        '¿Desconectar Google Calendar? Las reservas futuras no se sincronizarán en tiempo real.',
      )
    )
      return;
    setDisconnecting(true);
    try {
      await disconnectGoogleCalendar();
      setStatus((prev: CalendarStatus | null) =>
        prev ? { ...prev, connected: false, calendar_id: null } : null,
      );
      setFeedback({
        type: 'success',
        msg: 'Google Calendar desconectado correctamente.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: 'Error al desconectar el calendario. Intente de nuevo.',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-4 max-w-full">
      {/* Feedback alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs border font-black uppercase tracking-widest transition-all animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span className="flex-1 leading-relaxed">{feedback.msg}</span>
          <button
            onClick={() => setFeedback(null)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-black/10 hover:bg-black/20 text-current transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Banner UI */}
      {status?.connected ? (
        /* Conectado */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-[#121c17] border border-emerald-500/20 rounded-[1.75rem] shadow-lg shadow-emerald-950/20 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-inner flex-shrink-0">
              <CalendarIcon className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Google Calendar Sincronizado
                </p>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                {status.calendar_id
                  ? `Calendario Activo: ${status.calendar_id}`
                  : 'Las reservas se sincronizarán de forma automática.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/80 hover:text-rose-400 transition-colors px-4 py-2.5 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {disconnecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            Desconectar
          </button>
        </div>
      ) : (
        /* Desconectado */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 bg-zinc-900 border border-zinc-800 border-dashed rounded-[1.75rem] transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400 flex-shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5px] text-sky-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Sincronización con Google Calendar
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed max-w-xl">
                Al conectar tu cuenta, tus citas y servicios médicos se
                sincronizarán de forma automática para evitar colisiones de
                agenda.
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-sky-950/20 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
          >
            {connecting ? (
              <Loader className="w-4 h-4 animate-spin text-white" />
            ) : (
              <CalendarIcon className="w-4 h-4 text-white stroke-[2.5px]" />
            )}
            {connecting ? 'Redirigiendo…' : 'Sincronizar cuenta'}
          </button>
        </div>
      )}
    </div>
  );
}
