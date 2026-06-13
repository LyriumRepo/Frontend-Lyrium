'use client';

import { Truck, ShieldCheck, Lock, Tag } from 'lucide-react';
import Image from 'next/image';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useIzipay } from '../../hooks/useIzipay';
import { useCheckoutSubmit } from '../../hooks/useCheckoutSubmit';
import { orderApi } from '@/shared/lib/api/OrdenRepository';
import { liriosApi, type LiriosEligibility } from '@/shared/lib/api/liriosRepository';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import IzipayModal from '../modals/IzipayModal';
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
  const orderData = useCheckoutStore((s) => s.orderData);
  const setOrderData = useCheckoutStore((s) => s.setOrderData);
  const isProcessing = useCheckoutStore((s) => s.isProcessing);
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const setOrderResult = useCheckoutStore((s) => s.setOrderResult);
  const setStep = useCheckoutStore((s) => s.setStep);
  const personalData = useCheckoutStore((s) => s.personalData);
  const shippingData = useCheckoutStore((s) => s.shippingData);

  const [showIzipayModal, setShowIzipayModal] = useState(false);
  const [pendingFormToken, setPendingFormToken] = useState<string | null>(null);
  const [liriosEligibility, setLiriosEligibility] = useState<LiriosEligibility | null>(null);
  const [liriosLoading, setLiriosLoading] = useState(false);
  const [liriosInput, setLiriosInput] = useState('');

  const { isAuthenticated } = useAuth();

  const { submitOrder, isSubmitting, error: submitError } = useCheckoutSubmit();

  const {
    loadSmartForm,
    isLoading: izipayLoading,
    error: izipayError,
  } = useIzipay({
    onSuccess: useCallback(
      (result) => {
        setShowIzipayModal(false);
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

  // Una vez que el modal está montado (el div.kr-smart-form existe en el DOM),
  // inyectamos el formToken para que Krypton renderice el formulario dentro del modal.
  useEffect(() => {
    if (showIzipayModal && pendingFormToken) {
      loadSmartForm(pendingFormToken);
      setPendingFormToken(null);
    }
  }, [showIzipayModal, pendingFormToken, loadSmartForm]);

  const selectedItems = cartItems.filter((i) => i.selected);
  const hasProducts = selectedItems.some((i) => i.id > 0);
  const subtotal = selectedItems.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0,
  );

  // Fetch Lirios eligibility when cart changes
  const cartTotalForLirios = useMemo(() => {
    const sub = selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return sub + (hasProducts ? orderData.deliveryCost : 0);
  }, [selectedItems, hasProducts, orderData.deliveryCost]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLiriosEligibility(null);
      return;
    }
    let cancelled = false;
    setLiriosLoading(true);
    liriosApi.getCheckoutEligibility(cartTotalForLirios)
      .then((res) => { if (!cancelled) setLiriosEligibility(res); })
      .catch(() => { if (!cancelled) setLiriosEligibility(null); })
      .finally(() => { if (!cancelled) setLiriosLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, cartTotalForLirios]);

  const handleLiriosChange = (value: string) => {
    setLiriosInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0 && liriosEligibility) {
      const max = liriosEligibility.max_lirios_usables;
      const clamped = Math.min(num, max);
      setOrderData({ liriosUsed: clamped, liriosDiscount: clamped });
    } else {
      setOrderData({ liriosUsed: 0, liriosDiscount: 0 });
    }
  };

  const total = subtotal + (hasProducts ? orderData.deliveryCost : 0) - orderData.discount - orderData.liriosDiscount;

  const handleDeliveryChange = (value: DeliveryMethod) => {
    const option = DELIVERY_OPTIONS.find((o) => o.value === value);
    setOrderData({ deliveryMethod: value, deliveryCost: option?.cost ?? 0 });
  };

  const handlePagar = async () => {
    const result = await submitOrder();
    if (!result) return;

    let session;
    try {
      const cartToken = typeof window !== 'undefined'
        ? sessionStorage.getItem('cart_session_id') ?? undefined
        : undefined;
      session = await orderApi.createIzipaySession({
        order_id: result.orderId,
        email: result.email,
        cart_token: cartToken,
      });
    } catch (err) {
      console.error('[Izipay] error creando sesión', err);
      return;
    }

    // Abrir modal con el Smart Form. El useEffect inyectará el formToken
    // una vez que el div.kr-smart-form esté en el DOM.
    setPendingFormToken(session.form_token);
    setShowIzipayModal(true);
  };

  const handleCloseModal = () => {
    setShowIzipayModal(false);
    setPendingFormToken(null);
  };

  const displayError = submitError || izipayError;
  const isBusy = isProcessing || isSubmitting || izipayLoading;

  return (
    <>
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

        {/* Dirección de servicio a domicilio (read‑only) */}
        {selectedItems.some((i) => i.service_address) && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
              <Truck className="w-4 h-4" /> Dirección de atención
            </p>
            {selectedItems.filter((i) => i.service_address).map((i) => (
              <div key={i.id} className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold">{i.name}</p>
                <p className="text-amber-600 dark:text-amber-400">{i.service_address}</p>
              </div>
            ))}
          </div>
        )}

        {/* Método de envío — solo si hay productos */}
        {hasProducts && (
          <>
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
            </div>

            <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
          </>
        )}

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

        {/* Lirios puntos */}
        {isAuthenticated && liriosEligibility && liriosEligibility.eligible && (
          <>
            <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6">
                    <Image src="/img/intro/Flor6.png" alt="" fill className="object-contain" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    Lirios
                  </span>
                </div>
                {liriosLoading ? (
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {liriosEligibility.balance} disponibles
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 leading-relaxed">
                Máximo descuento: <strong>S/ {liriosEligibility.max_discount.toFixed(2)}</strong> ({liriosEligibility.max_lirios_usables} Lirios)
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={liriosEligibility.max_lirios_usables}
                  placeholder="0 Lirios"
                  value={liriosInput}
                  onChange={(e) => handleLiriosChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-emerald-200 dark:border-emerald-700/50 rounded-xl text-xs bg-white dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-emerald-400 dark:focus:border-emerald-500 focus:outline-none transition-all text-gray-800 dark:text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const max = liriosEligibility.max_lirios_usables;
                    setLiriosInput(String(max));
                    setOrderData({ liriosUsed: max, liriosDiscount: max });
                  }}
                  className="px-3 py-2 bg-emerald-100 dark:bg-emerald-800/40 hover:bg-emerald-200 dark:hover:bg-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-[10px] transition-all whitespace-nowrap"
                >
                  Usar máx
                </button>
              </div>
            </div>
          </>
        )}

        <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />

        {/* Desglose */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
            <span>Subtotal ({selectedItems.length} {hasProducts ? 'productos' : 'servicios'})</span>
            <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
              S/ {subtotal.toFixed(2)}
            </span>
          </div>
          {hasProducts && (
            <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
              <span>Envío</span>
              <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                {orderData.deliveryCost === 0
                  ? 'Gratis'
                  : `S/ ${orderData.deliveryCost.toFixed(2)}`}
              </span>
            </div>
          )}
          {orderData.discount > 0 && (
            <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
              <span>Descuento cupón</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -S/ {orderData.discount.toFixed(2)}
              </span>
            </div>
          )}
          {orderData.liriosDiscount > 0 && (
            <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <div className="relative w-4 h-4">
                  <Image src="/img/intro/Flor6.png" alt="" fill className="object-contain" />
                </div>
                Lirios
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -S/ {orderData.liriosDiscount.toFixed(2)}
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

    <IzipayModal isOpen={showIzipayModal} onClose={handleCloseModal} error={izipayError} />
    </>
  );
}
