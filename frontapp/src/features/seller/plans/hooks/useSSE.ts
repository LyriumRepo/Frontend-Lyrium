'use client';
// ============================================
// HOOK — useSSE
// Equivalente a sse.js, adaptado a React
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import { getSSEUrl } from '@/features/seller/plans/lib/api';
import type { SSEEventMap } from '@/features/seller/plans/types';

type SSEHandler<K extends keyof SSEEventMap> = (data: SSEEventMap[K]) => void;
type AnyHandler = (data: unknown) => void;

export function useSSE(
  canal: string,
  usuarioId: string,
  handlers: Partial<{ [K in keyof SSEEventMap]: SSEHandler<K> }>,
  enabled: boolean = true,
) {
  const sourceRef       = useRef<EventSource | null>(null);
  const reconnectDelay  = useRef(1000);
  const MAX_DELAY       = 30000;
  const handlersRef     = useRef(handlers);
  handlersRef.current   = handlers;

  const connect = useCallback(() => {
    // Canal 'admin' no requiere usuarioId — los demás sí
    if (!enabled) return;
    if (canal !== 'admin' && (!usuarioId || usuarioId === 'default')) return;

    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }

    const url    = getSSEUrl(canal, usuarioId);
    const source = new EventSource(url);
    sourceRef.current = source;

    source.addEventListener('conectado', () => {
      reconnectDelay.current = 1000;
    });

    const eventos: (keyof SSEEventMap)[] = [
      'solicitudes_actualizadas',
      'solicitud_actualizada',
      'planes_actualizados',
      'colores_actualizados',
      'pagos_actualizados',
      'pago_confirmado',
      'pago_fallido',
      'plan_vencido',
    ];

    eventos.forEach(ev => {
      source.addEventListener(ev, (e: MessageEvent) => {
        let data: unknown = {};
        try { data = JSON.parse(e.data); } catch {}
        const handler = handlersRef.current[ev] as AnyHandler | undefined;
        if (handler) handler(data);
      });
    });

    source.addEventListener('reconectar', () => {
      setTimeout(connect, 500);
    });

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      setTimeout(connect, reconnectDelay.current);
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, MAX_DELAY);
    };
  }, [canal, usuarioId, enabled]);

  useEffect(() => {
    connect();
    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [connect]);
}
