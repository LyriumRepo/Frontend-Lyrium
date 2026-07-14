'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCartLoader } from '../hooks/useCartLoader';
import CheckoutStepBar from './CheckoutStepBar';
import CheckoutHeader from './CheckoutHeader';
import CartItemList from './step1/CartItemList';
import CartSummary from './step1/CartSummary';
import BoxCalculatorStep from './step2/BoxCalculatorStep';
import PackagingSummary from './step2/PackagingSummary';
import PersonalDataForm from './step3/PersonalDataForm';
import ShippingForm     from './step3/ShippingForm';
import BillingInfo      from './step3/BillingInfo';
import OrderSummary     from './step3/OrderSummary';
import OrderConfirmation from './step4/OrderConfirmation';
import BoletaView from './step5/BoletaView';
import ModalPostCompra from './modals/ModalPostCompra';
import ModalRegistroUsuario from './modals/ModalRegistroUsuario';

export default function CheckoutPage() {
  const currentStep      = useCheckoutStore((s) => s.currentStep);
  const setStep          = useCheckoutStore((s) => s.setStep);
  const orderResult      = useCheckoutStore((s) => s.orderResult);
  const isProcessing     = useCheckoutStore((s) => s.isProcessing);
  const reset            = useCheckoutStore((s) => s.reset);
  const cartError        = useCheckoutStore((s) => s.cartError);
  const clearCartError   = useCheckoutStore((s) => s.setCartError);
  const cartItems        = useCheckoutStore((s) => s.cartItems);
  const deliveryMethod   = useCheckoutStore((s) => s.orderData.deliveryMethod);
  const orderData        = useCheckoutStore((s) => s.orderData);

  const clearError = useCallback(() => clearCartError(null), [clearCartError]);

  // Carga carrito + service holds al montar (una sola vez)
  useCartLoader();

  const [showPostCompra, setShowPostCompra] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);
  const dismissedRef = useRef(false);
  const [showResumedBanner, setShowResumedBanner] = useState(false);

  // Si el usuario cerró la pestaña, perdió conexión o se quedó sin batería a
  // mitad del checkout (pasos 2-3), el borrador queda guardado en localStorage
  // (ver persist() en checkoutStore) y lo retomamos aquí en vez de perderlo.
  // Los pasos 4-5 son post-envío (confirmación/boleta de una compra ya hecha),
  // así que esos sí arrancan siempre desde cero para no "revivir" una orden vieja.
  useEffect(() => {
    if (currentStep >= 4) reset();
    else if (currentStep >= 2) setShowResumedBanner(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentStep === 4 && !dismissedRef.current) {
      setShowPostCompra(true);
    }
  }, [currentStep]);

  const handleClosePostCompra = useCallback(() => {
    dismissedRef.current = true;
    setShowPostCompra(false);
  }, []);

  const email = orderResult?.email ?? '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] antialiased">
      <div className="min-h-screen bg-white dark:bg-[var(--bg-primary)]">
        <div
          id="checkout-top-wrapper"
          className="sticky top-0 z-40 bg-white dark:bg-[var(--bg-secondary)]
          border-b border-gray-100 dark:border-[var(--border-subtle)]
          shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none"
        >
          <CheckoutStepBar />
        </div>

        <CheckoutHeader />

        {showResumedBanner && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <div
              role="status"
              className="flex items-center justify-between gap-4 bg-sky-50 dark:bg-emerald-950/30
              border border-sky-200 dark:border-emerald-800 text-sky-700 dark:text-emerald-400
              rounded-2xl px-5 py-3 text-sm"
            >
              <span>↺ Retomamos tu compra donde la dejaste.</span>
              <button
                onClick={() => setShowResumedBanner(false)}
                className="text-sky-500 hover:text-sky-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {cartError && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <div
              className="flex items-center justify-between gap-4 bg-red-50 dark:bg-red-950/30
              border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400
              rounded-2xl px-5 py-3 text-sm"
            >
              <span>⚠️ {cartError}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div
          id="checkout-main-content"
          className={`transition-all duration-700 ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}
        >
          <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
            {/* PASO 1 — Carrito */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CartItemList />
                </div>
                <div className="lg:col-span-1">
                  <CartSummary
                    onContinue={() => {
                      const hasPhysicalProducts = cartItems.some((i) => i.selected && i.id > 0);
                      if (!hasPhysicalProducts) { setStep(3); return; }
                      setStep(deliveryMethod === 'pickup' ? 3 : 2);
                    }}
                  />
                </div>
              </div>
            )}

            {/* PASO 2 — Empaque (cajas calculadas) */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BoxCalculatorStep/>
                </div>
                <div className="lg:col-span-1">
                  <PackagingSummary />
                </div>
              </div>
            )}

            {/* PASO 3 — Finalizar compra */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-8">
                  <div className="relative">
                    <PersonalDataForm />
                    <div className="absolute -bottom-5 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[var(--border-subtle)] to-transparent" />
                  </div>
                  {cartItems.some((i) => i.id > 0) && orderData.deliveryMethod !== 'pickup' && (
                    <div className="relative">
                      <ShippingForm />
                      <div className="absolute -bottom-5 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[var(--border-subtle)] to-transparent" />
                    </div>
                  )}
                  <BillingInfo />
                </div>
                <div className="lg:col-span-1">
                  <OrderSummary />
                </div>
              </div>
            )}

            {/* PASO 4 — Confirmación */}
            {currentStep === 4 && <OrderConfirmation />}

            {/* PASO 5 — Boleta */}
            {currentStep === 5 && <BoletaView />}
          </div>
        </div>

        {isProcessing && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1700]
            flex items-center justify-center px-4"
          >
            <div
              className="bg-white dark:bg-[var(--bg-card)] rounded-3xl p-8
              max-w-sm w-full shadow-2xl text-center space-y-6 animate-modal-pop"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-sky-100 dark:border-emerald-900/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-sky-500 dark:border-emerald-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                  🛡️
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] uppercase tracking-tight">
                  Procesando Pedido
                </h3>
                <p className="text-[10px] text-sky-400 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] animate-pulse">
                  Encriptando transacción...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[0.1, 0.2, 0.3].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-emerald-500 animate-bounce"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalPostCompra
        isOpen={showPostCompra}
        email={email}
        onClose={handleClosePostCompra}
        onSync={() => {}}
        onOpenRegistro={() => {
          dismissedRef.current = true;
          setShowPostCompra(false);
          setShowRegistro(true);
        }}
      />
      <ModalRegistroUsuario
        isOpen={showRegistro}
        email={email}
        onClose={() => setShowRegistro(false)}
      />
    </div>
  );
}
