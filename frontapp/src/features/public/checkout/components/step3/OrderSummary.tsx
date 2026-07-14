'use client';

import { Truck, ShieldCheck, Lock, Tag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useIzipay } from '../../hooks/useIzipay';
import { useCheckoutSubmit } from '../../hooks/useCheckoutSubmit';
import { useCheckoutGrandTotals } from '../../hooks/useCheckoutGrandTotals';
import { orderApi } from '@/shared/lib/api/OrdenRepository';
import { liriosApi, type LiriosEligibility } from '@/shared/lib/api/liriosRepository';
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import IzipayModal from '../modals/IzipayModal';
import ResumenCheckout from './ResumenCheckout';

export default function OrderSummary() {
  const orderData          = useCheckoutStore((s) => s.orderData);
  const setOrderData       = useCheckoutStore((s) => s.setOrderData);
  const isProcessing       = useCheckoutStore((s) => s.isProcessing);
  const cartItems          = useCheckoutStore((s) => s.cartItems);
  const setOrderResult     = useCheckoutStore((s) => s.setOrderResult);
  const setStep            = useCheckoutStore((s) => s.setStep);
  const personalData       = useCheckoutStore((s) => s.personalData);
  const shippingData       = useCheckoutStore((s) => s.shippingData);

  const [showIzipayModal, setShowIzipayModal] = useState(false);
  const [pendingFormToken, setPendingFormToken] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [liriosEligibility, setLiriosEligibility] = useState<LiriosEligibility | null>(null);
  const [liriosLoading, setLiriosLoading] = useState(false);
  const [liriosInput, setLiriosInput] = useState('');

  const { isAuthenticated } = useAuth();
  const { submitOrder, isSubmitting, error: submitError } = useCheckoutSubmit();

  // ── Grand totals (productos + envío con markup) ────────────────────────────
  const { grandTotal, grandTotalEnvio, isReady } = useCheckoutGrandTotals();

  // Ref para capturar el valor vigente dentro de callbacks (evita closure stale)
  const grandTotalsRef = useRef({ grandTotal, grandTotalEnvio });
  useEffect(() => {
    grandTotalsRef.current = { grandTotal, grandTotalEnvio };
  }, [grandTotal, grandTotalEnvio]);

  const backendTotalsRef = useRef({ subtotal: 0, shippingCost: 0 });

  // ── Descuentos ─────────────────────────────────────────────────────────────
  const totalDiscount = orderData.discount + orderData.liriosDiscount;
  const hasDiscounts  = totalDiscount > 0;
  const finalTotal    = grandTotal - totalDiscount;

  // ── Izipay ─────────────────────────────────────────────────────────────────
  const {
    loadSmartForm,
    isLoading: izipayLoading,
    error: izipayError,
  } = useIzipay({
    onSuccess: useCallback(
      async (result) => {
        setShowIzipayModal(false);
        if (pendingOrderId) {
          try {
            await orderApi.confirmIzipayPayment(pendingOrderId);
          } catch {
            // webhook ya procesó el pago, o error no crítico
          }
        }
        setOrderResult({
          orderId: pendingOrderId ?? result.clientAnswer.orderDetails.orderId,
          email: personalData.email,
          total: result.clientAnswer.orderDetails.orderTotalAmount / 100,
          shipping: grandTotalsRef.current.grandTotalEnvio,
          backendSubtotal: backendTotalsRef.current.subtotal,
          backendShipping: backendTotalsRef.current.shippingCost,
          items: cartItems,
          personalData,
          shippingData,
          orderData,
        });
        setStep(4);
      },
      [
        pendingOrderId,
        cartItems,
        personalData,
        shippingData,
        orderData,
        setOrderResult,
        setStep,
      ],
    ),
  });

  useEffect(() => {
    if (showIzipayModal && pendingFormToken) {
      loadSmartForm(pendingFormToken);
      setPendingFormToken(null);
    }
  }, [showIzipayModal, pendingFormToken, loadSmartForm]);

  // ── Lirios eligibility ────────────────────────────────────────────────────
  const selectedItems = cartItems.filter((i) => i.selected);
  const hasProducts   = selectedItems.some((i) => i.id > 0);

  // Usa grandTotal del hook (con markup correcto) para calcular eligibilidad
  const cartTotalForLirios = useMemo(() => grandTotal, [grandTotal]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLiriosEligibility(null);
      return;
    }
    if (!isReady || cartTotalForLirios <= 0) return;
    let cancelled = false;
    setLiriosLoading(true);
    console.log('[Lirios] requesting eligibility, cartTotal:', cartTotalForLirios);
    liriosApi.getCheckoutEligibility(cartTotalForLirios)
      .then((res) => {
        console.log('[Lirios] response:', res);
        if (!cancelled) setLiriosEligibility(res);
      })
      .catch((err) => {
        console.error('[Lirios] error:', err);
        if (!cancelled) setLiriosEligibility(null);
      })
      .finally(() => { if (!cancelled) setLiriosLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, cartTotalForLirios, isReady]);

  const handleLiriosChange = (value: string) => {
    setLiriosInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0 && liriosEligibility) {
      const clamped = Math.min(num, liriosEligibility.max_lirios_usables);
      const discountInSoles = clamped * (liriosEligibility.max_discount / liriosEligibility.max_lirios_usables);
      setOrderData({ liriosUsed: clamped, liriosDiscount: discountInSoles });
    } else {
      setOrderData({ liriosUsed: 0, liriosDiscount: 0 });
    }
  };

  // ── Pagar ─────────────────────────────────────────────────────────────────
  const handlePagar = async () => {
    const result = await submitOrder();
    if (!result) return;

    backendTotalsRef.current = { subtotal: result.subtotal, shippingCost: result.shippingCost };

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

    // Mock mode: el backend ya confirmó el pago, saltar Smart Form
    if (session.form_token.startsWith('MOCK-')) {
      setOrderResult({
        orderId: result.orderId,
        email: result.email,
        total: session.amount,
        shipping: grandTotalsRef.current.grandTotalEnvio,
        backendSubtotal: result.subtotal,
        backendShipping: result.shippingCost,
        items: cartItems,
        personalData,
        shippingData,
        orderData,
      });
      setStep(4);
      return;
    }

    setPendingOrderId(result.orderId);
    setPendingFormToken(session.form_token);
    setShowIzipayModal(true);
  };

  const handleCloseModal = () => {
    setShowIzipayModal(false);
    setPendingFormToken(null);
  };

  const displayError = submitError || izipayError;
  const isBusy       = isProcessing || isSubmitting || izipayLoading;

  return (
    <>
    <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm sticky top-[100px]">
      <div className="px-5 py-4 bg-gradient-to-r from-teal-500 to-sky-500 dark:from-emerald-700 dark:to-emerald-600 flex items-center gap-2 rounded-t-2xl">
        <span className="text-white text-2xl">🧾</span>
        <h3 className="font-bold text-white">Resumen del Pedido</h3>
      </div>

      <div className="p-5 space-y-4">
        {displayError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
            {displayError}
          </div>
        )}

        {/* Dirección de servicio a domicilio (read-only) */}
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

        {/* Resumen por tienda (cajas + courier + TOTAL GENERAL) */}
        {hasProducts ? (
          <>
            <ResumenCheckout />
            <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
          </>
        ) : (
          selectedItems.length > 0 && (
            <>
              <div className="flex justify-between items-center px-1">
                <span className="font-black text-base text-gray-900 dark:text-white">Total a pagar</span>
                <span className="font-black font-mono text-2xl text-sky-600 dark:text-emerald-400">
                  S/ {grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
            </>
          )
        )}

        {/* Código promo */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Código promocional"
              value={orderData.promoCode}
              onChange={(e) => setOrderData({ promoCode: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-[var(--brand-sky)]/30 dark:focus:ring-[var(--brand-green)]/30 focus:outline-none transition-all text-gray-800 dark:text-[var(--text-primary)]"
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
                    const discountInSoles = liriosEligibility.max_discount;
                    setLiriosInput(String(max));
                    setOrderData({ liriosUsed: max, liriosDiscount: discountInSoles });
                  }}
                  className="px-3 py-2 bg-emerald-100 dark:bg-emerald-800/40 hover:bg-emerald-200 dark:hover:bg-emerald-700/50 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-[10px] transition-all whitespace-nowrap"
                >
                  Usar máx
                </button>
              </div>
            </div>
          </>
        )}

        {/* Descuentos (solo si hay alguno) */}
        {hasDiscounts && (
          <>
            <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
            <div className="space-y-2 text-sm">
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

              {/* Total final solo cuando hay descuento (sin descuento, ResumenCheckout ya muestra el total) */}
              <div className="pt-2 border-t border-gray-100 dark:border-[var(--border-subtle)] flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">
                  Total a pagar
                </span>
                <span className="text-2xl font-black text-sky-600 dark:text-emerald-400">
                  S/ {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handlePagar}
          disabled={isBusy || selectedItems.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 dark:from-emerald-700 dark:to-emerald-600 hover:from-teal-600 hover:to-sky-600 dark:hover:from-emerald-800 dark:hover:to-emerald-700 text-white font-bold shadow-lg shadow-teal-200 dark:shadow-emerald-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isBusy ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          {isBusy
            ? 'Procesando...'
            : orderData.selectedPaymentMethodId
              ? 'Pagar con tarjeta guardada'
              : 'Realizar pedido'}
        </button>

        <button
          type="button"
          onClick={() => setStep(orderData.deliveryMethod === 'pickup' ? 1 : 2)}
          disabled={isBusy}
          className="w-full mt-2.5 py-3 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al paso anterior
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
