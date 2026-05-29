'use client';

<<<<<<< HEAD
import { Truck, CreditCard, ShieldCheck, Lock, AlertCircle, X } from 'lucide-react';
=======
/**
 * OrderSummary.tsx
 *
 * CAMBIO vs versión Culqi:
 *  - Eliminado: useCulqi, openCheckout
 *  - Agregado: useIzipay, flujo en 3 pasos al hacer clic en "Realizar pedido":
 *      1. submitOrder()           → crea la orden, obtiene orderId
 *      2. createIzipaySession()   → obtiene formToken del backend
 *      3. loadSmartForm(token)    → Krypton inyecta el formulario en BillingInfo
 *  - KR.onPaymentSuccess (definido en useIzipay) → setOrderResult + setStep(3)
 */

import { Truck, ShieldCheck, Lock, Tag } from 'lucide-react';
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCheckoutSubmit } from '../../hooks/useCheckoutSubmit';
import { useIzipay } from '../../hooks/useIzipay';
import { orderApi } from '@/shared/lib/api/OrdenRepository';
import { useCallback } from 'react';
import type { DeliveryMethod } from '@/store/checkoutStore';

const DELIVERY_OPTIONS: {
  value: DeliveryMethod;
  label: string;
  cost: number;
}[] = [
  { value: 'pickup', label: '🏪 Recoger en tienda (Gratis)', cost: 0 },
  { value: 'delivery', label: '🚚 Delivery a domicilio (S/ 10.00)', cost: 10 },
  { value: 'service_store', label: '🏢 Servicio en tienda (Gratis)', cost: 0 },
  {
    value: 'service_home',
    label: '🏠 Servicio a domicilio (S/ 20.00)',
    cost: 20,
  },
];

const inputCls =
  'w-full px-4 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm ' +
  'bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] ' +
  'focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none ' +
  'focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 transition-all ' +
  'text-gray-800 dark:text-[var(--text-primary)]';

export default function OrderSummary() {
<<<<<<< HEAD
    const orderData = useCheckoutStore((s) => s.orderData);
    const setOrderData = useCheckoutStore((s) => s.setOrderData);
    const isProcessing = useCheckoutStore((s) => s.isProcessing);
    const { submitOrder, submitError, clearError, subtotal, total } = useCheckoutSubmit();
=======
  const orderData = useCheckoutStore((s) => s.orderData);
  const setOrderData = useCheckoutStore((s) => s.setOrderData);
  const isProcessing = useCheckoutStore((s) => s.isProcessing);
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const setOrderResult = useCheckoutStore((s) => s.setOrderResult);
  const setStep = useCheckoutStore((s) => s.setStep);
  const personalData = useCheckoutStore((s) => s.personalData);
  const shippingData = useCheckoutStore((s) => s.shippingData);
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361

  const { submitOrder, isSubmitting, error: submitError } = useCheckoutSubmit();

  // useIzipay registra listeners de KR.onPaymentSuccess / KR.onError
  const {
    loadSmartForm,
    isLoading: izipayLoading,
    error: izipayError,
  } = useIzipay({
    onSuccess: useCallback(
      (result) => {
        // El pago fue exitoso — Izipay ya cobró vía webhook
        // Solo avanzamos al paso 3 con los datos que ya tenemos
        setOrderResult({
          orderId: result.clientAnswer.orderDetails.orderId,
          email: personalData.email,
          total: result.clientAnswer.orderDetails.orderTotalAmount / 100,
          items: cartItems,
          personalData,
          shippingData,
          orderData,
        });
        setStep(3);
      },
      [
        cartItems,
        personalData,
        shippingData,
        orderData,
        setOrderResult,
        setStep,
      ],
    ),
  });

  const selectedItems = cartItems.filter((i) => i.selected);
  const subtotal = selectedItems.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0,
  );
  const total = subtotal + orderData.deliveryCost - orderData.discount;

  const handleDeliveryChange = (value: DeliveryMethod) => {
    const option = DELIVERY_OPTIONS.find((o) => o.value === value);
    setOrderData({ deliveryMethod: value, deliveryCost: option?.cost ?? 0 });
  };

  /**
   * Flujo principal al hacer clic en "Realizar pedido":
   * 1. Crear orden → orderId
   * 2. Crear sesión Izipay → formToken
   * 3. Inyectar formToken → Smart Form visible en BillingInfo
   */
  const handlePagar = async () => {
    // Paso 1: crear orden
    const result = await submitOrder();
    if (!result) return; // submitOrder ya seteó el error

    // Paso 2: obtener formToken del backend
    let session;
    try {
      session = await orderApi.createIzipaySession({
        order_id: result.orderId,
        email: result.email,
      });
    } catch (err) {
      console.error('[Izipay] error creando sesión', err);
      return;
    }

    // Paso 3: inyectar token en el Smart Form
    await loadSmartForm(session.form_token);
    // A partir de aquí el usuario ve el formulario en BillingInfo y paga.
    // KR.onPaymentSuccess → setOrderResult + setStep(3)
  };

  const displayError = submitError || izipayError;
  const isBusy = isProcessing || isSubmitting || izipayLoading;

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm sticky top-[100px]">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2 rounded-t-2xl">
        <span className="text-white text-2xl">🧾</span>
        <h3 className="font-bold text-white">Resumen del Pedido</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Error unificado */}
        {displayError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
            {displayError}
          </div>
        )}

<<<<<<< HEAD
            {/* Error message */}
            {submitError && (
                <div className="px-5">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-relaxed">{submitError}</p>
                        </div>
                        <button onClick={clearError} className="shrink-0 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Place order button */}
            <div className="px-5 pb-5">
                <button
                    id="btnPlaceOrder"
                    type="button"
                    onClick={submitOrder}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <ShieldCheck className="w-5 h-5" />
                    )}
                    {isProcessing ? 'Procesando...' : 'Realizar pedido'}
                </button>
                <p className="text-xs text-center text-gray-400 dark:text-[var(--text-muted)] mt-3 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Pago 100% seguro y protegido
                </p>
            </div>
=======
        {/* Método de envío */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-1">
            <Truck className="w-4 h-4" /> Método de Envío
          </label>
          <select
            value={orderData.deliveryMethod}
            onChange={(e) =>
              handleDeliveryChange(e.target.value as DeliveryMethod)
            }
            className={inputCls}
          >
            {DELIVERY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
        </div>

        <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />

        {/* Código promocional */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Código promocional"
              value={orderData.promoCode}
              onChange={(e) => setOrderData({ promoCode: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none transition-all text-gray-800 dark:text-[var(--text-primary)]"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2.5 bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] rounded-xl font-bold text-xs transition-all"
          >
            Aplicar
          </button>
        </div>

        <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />

        {/* Desglose */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
            <span>Subtotal ({selectedItems.length} productos)</span>
            <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
              S/ {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
            <span>Envío</span>
            <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
              {orderData.deliveryCost === 0
                ? 'Gratis'
                : `S/ ${orderData.deliveryCost.toFixed(2)}`}
            </span>
          </div>
          {orderData.discount > 0 && (
            <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
              <span>Descuento</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -S/ {orderData.discount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-3 border-t-2 border-gray-100 dark:border-[var(--border-subtle)] flex justify-between items-center">
          <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">
            Total
          </span>
          <span className="text-2xl font-black text-sky-600 dark:text-[var(--brand-sky)]">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón — orquesta el flujo Izipay */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handlePagar}
          disabled={isBusy || selectedItems.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isBusy ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          {isBusy ? 'Procesando...' : 'Realizar pedido'}
        </button>
        <p className="text-xs text-center text-gray-400 dark:text-[var(--text-muted)] mt-3 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Pago 100% seguro con Izipay
        </p>
      </div>
    </div>
  );
}
