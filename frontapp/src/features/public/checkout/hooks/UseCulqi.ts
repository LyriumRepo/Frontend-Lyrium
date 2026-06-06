'use client';

/**
 * useIzipay.ts
 * ARCHIVO: src/features/public/checkout/hooks/useIzipay.ts
 *
 * Reemplaza UseCulqi.ts.
 *
 * Responsabilidades:
 *  1. Recibe el formToken que viene del backend (/payments/izipay/create-session)
 *  2. Lo inyecta en el Smart Form de Krypton (KR.setFormToken)
 *  3. Escucha KR.onPaymentSuccess → avanza al paso 3
 *  4. Escucha KR.onError → muestra error al usuario
 *
 * Diferencia clave vs Culqi:
 *  - Culqi: frontend genera token → backend cobra
 *  - Izipay: backend crea sesión → Smart Form cobra → backend recibe webhook → frontend escucha evento
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Tipos del SDK Krypton ─────────────────────────────────────────────────────

interface KryptonPaymentSuccessDetail {
  clientAnswer: {
    orderStatus: string; // 'PAID' | 'UNPAID' | ...
    orderDetails: {
      orderId: string;
      orderTotalAmount: number;
      orderCurrency: string;
    };
  };
  hash: string; // para validar en backend si quieres
}

interface KryptonError {
  errorCode: string;
  errorMessage: string;
  detailedErrorMessage?: string;
}

interface CulqiKR {
  setFormToken: (token: string) => Promise<void>;
  onPaymentSuccess: (callback: (result: KryptonPaymentSuccessDetail) => void) => void;
  onError: (callback: (error: KryptonError) => void) => void;
}

function getCulqiKR(): CulqiKR | undefined {
  return (window as unknown as { KR?: CulqiKR }).KR;
}

// ── Interfaz pública del hook ─────────────────────────────────────────────────

interface UseIzipayOptions {
  /** Llamado cuando Izipay confirma el pago exitoso */
  onSuccess: (result: KryptonPaymentSuccessDetail) => void;
}

interface UseIzipayReturn {
  /** true mientras se está cargando el SDK o inyectando el token */
  isLoading: boolean;
  /** Error visible al usuario */
  error: string | null;
  /** Inyecta el formToken en el Smart Form — llamar después de obtenerlo del backend */
  loadSmartForm: (formToken: string) => Promise<void>;
  clearError: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useIzipay({ onSuccess }: UseIzipayOptions): UseIzipayReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRegistered = useRef(false);

  // Registrar los listeners de Krypton una sola vez
  useEffect(() => {
    if (listenersRegistered.current) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 6 segundos

    const register = () => {
      if (typeof window === 'undefined') return;

      const kr = getCulqiKR();
      if (kr) {
        kr.onPaymentSuccess((result) => {
          console.log('[Izipay] pago exitoso', result);
          onSuccess(result);
        });

        kr.onError((err) => {
          console.error('[Izipay] error', err);
          setError(
            err.detailedErrorMessage ||
              err.errorMessage ||
              'Error al procesar el pago. Intenta nuevamente.',
          );
        });

        listenersRegistered.current = true;
        return;
      }

      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        setError(
          'No se pudo inicializar la pasarela de pago. Recarga la página.',
        );
        return;
      }

      setTimeout(register, 200);
    };

    register();
  }, [onSuccess]);

  /**
   * Inyecta el formToken en el Smart Form.
   * Llamar después de que el backend devuelva el token de /payments/izipay/create-session.
   */
  const loadSmartForm = useCallback(async (formToken: string) => {
    if (!formToken) {
      setError('No se recibió el token de pago. Intenta nuevamente.');
      return;
    }

    const kr = getCulqiKR();
    if (!kr) {
      setError(
        'El SDK de pago no está disponible. Recarga la página e intenta nuevamente.',
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await kr.setFormToken(formToken);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al cargar el formulario de pago.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, loadSmartForm, clearError };
}
