'use client';

/**
 * useIzipay.ts
 * ARCHIVO: src/features/public/checkout/hooks/useIzipay.ts
 *
 * CORRECCIONES:
 *  - Bug 1: getKR()?.((response) => {}) era sintaxis inválida → corregido a getKR()?.onSubmit(...)
 *  - Bug 2: Se espera correctamente a que onLoaded dispare antes de registrar listeners
 *  - Bug 3: setFormConfig ahora hace fallback limpio a setFormToken si no existe
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Tipos del SDK Krypton ─────────────────────────────────────────────────────

export interface KryptonPaymentSuccessDetail {
  clientAnswer: {
    orderStatus: string;
    orderDetails: {
      orderId: string;
      orderTotalAmount: number; // en céntimos
      orderCurrency: string;
    };
  };
  hash: string;
}

interface KryptonError {
  errorCode?: string;
  errorMessage?: string;
  detailedErrorCode?: string;
  detailedErrorMessage?: string;
  field?: string;
  error?: {
    errorCode?: string;
    errorMessage?: string;
    detailedErrorMessage?: string;
  };
}

interface IzipayKR {
  onLoaded: (callback: () => void) => void;
  setFormConfig: (config: Record<string, string>) => Promise<void>;
  setFormToken: (token: string) => Promise<void>;
  onSubmit: (
    callback: (result: KryptonPaymentSuccessDetail) => boolean | void,
  ) => void;
  onError: (callback: (error: KryptonError) => boolean | void) => void;
}

function getKR(): IzipayKR | undefined {
  return (window as unknown as { KR?: IzipayKR }).KR;
}

// ── Interfaz pública del hook ─────────────────────────────────────────────────

interface UseIzipayOptions {
  onSuccess: (result: KryptonPaymentSuccessDetail) => void;
}

interface UseIzipayReturn {
  isLoading: boolean;
  isSdkReady: boolean;
  error: string | null;
  loadSmartForm: (formToken: string) => Promise<void>;
  clearError: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useIzipay({ onSuccess }: UseIzipayOptions): UseIzipayReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRegistered = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (listenersRegistered.current) return;
    if (typeof window === 'undefined') return;

    const publicKey = process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY;
    if (!publicKey) {
      console.log('[Izipay] NEXT_PUBLIC_IZIPAY_PUBLIC_KEY no configurada. Ejecutando en modo simulación (MOCK).');
      setIsSdkReady(true);
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 50; // 10 segundos
    let cancelled = false;

    const waitForKR = () => {
      if (cancelled) return;

      const kr = getKR();
      if (kr && typeof kr.onLoaded === 'function') {
        kr.onLoaded(() => {
          if (cancelled) return;

          // NOTA: La public key ya se configuró via kr-public-key en el <script> del layout.
          // NO llamar a setFormConfig aquí porque con un formToken placeholder rompe el SDK.
          // setFormConfig se llama únicamente en loadSmartForm con el formToken real.

          kr.onSubmit((response) => {
            console.log('[Izipay] onSubmit disparado:', response);

            const orderStatus = response?.clientAnswer?.orderStatus;

            if (orderStatus === 'PAID') {
              onSuccessRef.current(response);
              return false;
            }

            return true;
          });

          kr.onError((err) => {
            const errorCode =
              err?.errorCode ?? err?.error?.errorCode ?? 'UNKNOWN';
            const msg =
              err?.detailedErrorMessage ??
              err?.errorMessage ??
              err?.error?.detailedErrorMessage ??
              err?.error?.errorMessage ??
              'Error al procesar el pago. Verifica los datos de tu tarjeta.';

            console.warn(`[Izipay] Error SDK (${errorCode}): ${msg}`);
            setError(msg);
            return true;
          });

          listenersRegistered.current = true;
          setIsSdkReady(true);
          console.log('[Izipay] SDK listo ✓');
        });

        return;
      }

      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        console.error('[Izipay] Timeout esperando getKR()');
        setError(
          'No se pudo inicializar la pasarela de pago. Recarga la página.',
        );
        return;
      }

      setTimeout(waitForKR, 200);
    };

    waitForKR();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadSmartForm = useCallback(async (formToken: string) => {
    if (!formToken) {
      setError('No se recibió el token de pago. Intenta nuevamente.');
      return;
    }

    const kr = getKR();
    if (!kr) {
      setError('El SDK de pago no está listo. Espera un momento.');
      return;
    }

    const hasSetFormConfig = typeof kr.setFormConfig === 'function';
    const hasSetFormToken = typeof kr.setFormToken === 'function';

    if (!hasSetFormConfig && !hasSetFormToken) {
      setError('El SDK de pago no está listo. Espera un momento.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (hasSetFormConfig) {
        await kr.setFormConfig({ formToken });
      } else {
        await kr.setFormToken(formToken);
      }

      console.log('[Izipay] formToken cargado en el Smart Form ✓');
    } catch (err) {
      console.error('[Izipay] Error al cargar formToken:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar el formulario de pago.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, isSdkReady, error, loadSmartForm, clearError };
}
