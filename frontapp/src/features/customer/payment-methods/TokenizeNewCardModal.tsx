'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';
import { paymentMethodApi, TokenizeSession } from '@/shared/lib/api/paymentMethodRepository';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface MockCardForm {
  pan: string;
  titular: string;
  exp_month: string;
  exp_year: string;
  brand: string;
}

function guessBrand(pan: string): string {
  if (/^4/.test(pan)) return 'Visa';
  if (/^5[1-5]/.test(pan)) return 'Mastercard';
  if (/^3[47]/.test(pan)) return 'American Express';
  return 'Desconocida';
}

export default function TokenizeNewCardModal({ onClose, onSuccess }: Props) {
  const [session, setSession] = useState<TokenizeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mockForm, setMockForm] = useState<MockCardForm>({
    pan: '',
    titular: '',
    exp_month: '',
    exp_year: '',
    brand: '',
  });
  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await paymentMethodApi.tokenize();
      setSession(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar tokenización');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (session?.mode !== 'izipay') return;
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const KR = (window as any).KR;
      if (!KR) {
        setError('SDK de Izipay no disponible. Recarga la página.');
        return;
      }

      try {
        if (KR.setFormConfig) {
          KR.setFormConfig({ formToken: session.form_token });
        } else if (KR.setFormToken) {
          KR.setFormToken(session.form_token);
        }

        if (KR.onSubmit) {
          KR.onSubmit((response: any) => {
            const krAnswer = response['kr-answer'] || response.answer || response;
            const cardToken = krAnswer.cardToken;
            const pan = krAnswer.pan || '';
            const brand = krAnswer.brand || krAnswer.effectiveBrand || '';
            const expMonth = krAnswer.expiryMonth || '';
            const expYear = krAnswer.expiryYear || '';

            if (!cardToken) {
              setError('No se recibió el token de la tarjeta.');
              return;
            }

            saveCard({
              cardToken,
              last4: pan.slice(-4),
              brand,
              expMonth: String(expMonth).padStart(2, '0'),
              expYear: String(expYear),
            });
          });
        }

        if (KR.onError) {
          KR.onError((error: any) => {
            setError(error.message || 'Error en el formulario de Izipay.');
          });
        }
      } catch (e) {
        setError('Error al configurar KR SDK.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [session]);

  const saveCard = async (data: {
    cardToken: string;
    last4: string;
    brand: string;
    expMonth: string;
    expYear: string;
  }) => {
    setSaving(true);
    try {
      await paymentMethodApi.create({
        tipo_metodo: 'tarjeta',
        titular: mockForm.titular || 'Tarjeta guardada',
        card_token: data.cardToken,
        card_last4: data.last4,
        card_brand: data.brand,
        card_exp_month: data.expMonth,
        card_exp_year: data.expYear,
        detalle_extra: 'debito',
        is_default: false,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la tarjeta');
    } finally {
      setSaving(false);
    }
  };

  const handleMockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pan = mockForm.pan.replace(/\s+/g, '');
    const last4 = pan.slice(-4);
    const brand = mockForm.brand || guessBrand(pan);

    await saveCard({
      cardToken: `mock_token_${Date.now()}`,
      last4,
      brand,
      expMonth: mockForm.exp_month,
      expYear: mockForm.exp_year,
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[1.5rem] sm:rounded-[3.5rem] max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-5 sm:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Icon name="CreditCard" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-black tracking-tighter">Nueva Tarjeta</h3>
                <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">
                  Tokenización Segura
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
              <Icon name="X" className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-10 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[calc(85vh-200px)]">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 flex items-start gap-3">
              <Icon name="AlertCircle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
            </div>
          )}

          {!loading && session?.mode === 'izipay' && (
            <div>
              <div
                ref={containerRef}
                className="kr-smart-form pb-4"
                kr-card-form-expanded="true"
              >
                <button className="kr-payment-button" />
                <div className="kr-form-error" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center mt-4">
                Tus datos viajan encriptados — nunca almacenamos tu CVV
              </p>
            </div>
          )}

          {!loading && session?.mode === 'mock' && (
            <form onSubmit={handleMockSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  value={mockForm.pan}
                  onChange={(e) => {
                    const pan = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setMockForm({ ...mockForm, pan, brand: guessBrand(pan) });
                  }}
                  required
                  placeholder="0000 0000 0000 0000"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-3 sm:p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  value={mockForm.titular}
                  onChange={(e) => setMockForm({ ...mockForm, titular: e.target.value })}
                  required
                  placeholder="Nombre completo"
                  className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-3 sm:p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                    Mes (MM)
                  </label>
                  <input
                    type="text"
                    value={mockForm.exp_month}
                    onChange={(e) => setMockForm({ ...mockForm, exp_month: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                    required
                    placeholder="12"
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-3 sm:p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
                    Año (AAAA)
                  </label>
                  <input
                    type="text"
                    value={mockForm.exp_year}
                    onChange={(e) => setMockForm({ ...mockForm, exp_year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    required
                    placeholder="2028"
                    className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-3 sm:p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
                  />
                </div>
              </div>

              {mockForm.brand && (
                <div className="p-3 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-xl text-center">
                  <span className="text-xs font-bold text-sky-600 dark:text-[var(--icons-green)]">
                    {mockForm.brand}
                  </span>
                </div>
              )}

              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] px-4 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Tarjeta'}
                </button>
              </div>
            </form>
          )}

          {session?.mode === 'izipay' && saving && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
              <span className="ml-3 text-xs font-bold text-gray-500">Guardando tarjeta...</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
