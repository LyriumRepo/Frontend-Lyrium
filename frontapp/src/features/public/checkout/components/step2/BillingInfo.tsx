'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
} from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { paymentMethodApi, type PaymentMethod } from '@/shared/lib/api/paymentMethodRepository';

export default function BillingInfo() {
  const selectedPaymentMethodId = useCheckoutStore((s) => s.orderData.selectedPaymentMethodId);
  const setOrderData = useCheckoutStore((s) => s.setOrderData);

  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [savedYapePlin, setSavedYapePlin] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const allMethods = [...savedCards, ...savedYapePlin];
  const getSelectedMethod = () => allMethods.find((m) => m.id === selectedPaymentMethodId) ?? null;
  const selectedMethodType = getSelectedMethod()?.tipo_metodo ?? null;

  const loadMethods = useCallback(async () => {
    try {
      const data = await paymentMethodApi.list();
      setSavedCards(data.filter((m) => m.tipo_metodo === 'tarjeta' && m.card_token && m.token_status === 'active'));
      setSavedYapePlin(data.filter((m) => m.tipo_metodo === 'yape' || m.tipo_metodo === 'plin'));
    } catch {
      setSavedCards([]);
      setSavedYapePlin([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-5">
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center">
          3
        </span>
        Método de pago
        <Lock className="w-4 h-4 text-emerald-500 ml-auto" />
      </h2>

      {/* Saved cards */}
      {!loading && savedCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Tus tarjetas guardadas
          </p>
          <div className="grid gap-2">
            {savedCards.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() =>
                  setOrderData({
                    selectedPaymentMethodId:
                      selectedPaymentMethodId === method.id ? null : method.id,
                  })
                }
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedPaymentMethodId === method.id
                    ? 'border-sky-500 dark:border-[var(--icons-green)] bg-sky-50 dark:bg-sky-900/20'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 hover:border-sky-200 dark:hover:border-sky-700'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 dark:from-[var(--icons-green)] dark:to-lime-300 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                    {method.card_brand || 'Tarjeta'} •••• {method.card_last4}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {method.card_exp_month && method.card_exp_year
                      ? `Expira ${method.card_exp_month}/${method.card_exp_year.slice(-2)}`
                      : method.titular}
                  </p>
                </div>
                {selectedPaymentMethodId === method.id && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
            {selectedPaymentMethodId && selectedMethodType === 'tarjeta' && (
              <p className="text-[10px] text-sky-600 dark:text-[var(--icons-green)] font-bold text-center">
                El pago se cargará a esta tarjeta guardada
              </p>
            )}
          </div>
        </div>
      )}

      {/* Saved Yape / Plin accounts */}
      {!loading && savedYapePlin.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Tus cuentas Yape / Plin
          </p>
          <div className="grid gap-2">
            {savedYapePlin.map((method) => {
              const isYape = method.tipo_metodo === 'yape';
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() =>
                    setOrderData({
                      selectedPaymentMethodId:
                        selectedPaymentMethodId === method.id ? null : method.id,
                    })
                  }
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPaymentMethodId === method.id
                      ? isYape
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 hover:border-purple-200 dark:hover:border-purple-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isYape
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-blue-500 to-sky-500'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                      {isYape ? 'Yape' : 'Plin'}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {method.documento} &middot; {method.titular}
                    </p>
                  </div>
                  {selectedPaymentMethodId === method.id && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isYape ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
            {selectedPaymentMethodId && selectedMethodType && selectedMethodType !== 'tarjeta' && (
              <p className="text-[10px] font-bold text-center text-purple-600 dark:text-purple-400">
                Recibirás una solicitud de cobro mediante{' '}
                {selectedMethodType === 'yape' ? 'Yape' : 'Plin'} al número{' '}
                {getSelectedMethod()?.documento} a nombre de{' '}
                {getSelectedMethod()?.titular}
              </p>
            )}
            {selectedPaymentMethodId && (
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        </div>
      )}

      {/* Smart Form — only shown when no saved method is selected */}
      {!selectedPaymentMethodId && (
        <>
          <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/40">
            <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">
              Haz clic en <span className="font-bold">&quot;Realizar pedido&quot;</span> para
              cargar el formulario seguro de pago aquí abajo.
            </p>
          </div>

          <div className="kr-smart-form" kr-card-form-expanded="true">
            <button className="kr-payment-button" />
            <div className="kr-form-error" />
          </div>
        </>
      )}

      {/* Available methods info */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Métodos disponibles
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <CreditCard className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Tarjeta crédito / débito
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Smartphone className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Yape / Plin
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Billetera digital
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Banca móvil / Agente
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
        <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Pago 100% seguro
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Procesado por <span className="font-bold">Izipay</span>, respaldado
            por Banco BCP. Lyrium nunca almacena los datos de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
}
