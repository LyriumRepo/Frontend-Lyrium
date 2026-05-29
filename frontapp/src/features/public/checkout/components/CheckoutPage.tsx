/**
 * CheckoutPage.tsx - VERSIÓN ACTUALIZADA
 * ARCHIVO: src/features/public/checkout/components/CheckoutPage.tsx
 *
 * CAMBIOS vs versión anterior:
 *  - Llama a useCheckoutSubmit() al montar → carga el carrito real del backend
 *  - Muestra error si falla la carga
 *  - El resto del comportamiento es idéntico
 */

'use client';

import { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
<<<<<<< HEAD
import { useCarritoStore } from '@/store/carritoStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
=======
import { useCheckoutSubmit } from '../hooks/useCheckoutSubmit';
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
import CheckoutStepBar from './CheckoutStepBar';
import CheckoutHeader from './CheckoutHeader';
import CartItemList from './step1/CartItemList';
import CartSummary from './step1/CartSummary';
import PersonalDataForm from './step2/PersonalDataForm';
import ShippingForm from './step2/ShippingForm';
import BillingInfo from './step2/BillingInfo';
import OrderSummary from './step2/OrderSummary';
import OrderConfirmation from './step3/OrderConfirmation';
import ModalPostCompra from './modals/ModalPostCompra';
import ModalRegistroUsuario from './modals/ModalRegistroUsuario';

export default function CheckoutPage() {
<<<<<<< HEAD
    const currentStep = useCheckoutStore((s) => s.currentStep);
    const setStep = useCheckoutStore((s) => s.setStep);
    const setCartItems = useCheckoutStore((s) => s.setCartItems);
    const orderResult = useCheckoutStore((s) => s.orderResult);
    const isProcessing = useCheckoutStore((s) => s.isProcessing);

    // Cargar carrito al montar el checkout
    useEffect(() => {
        async function loadCart() {
            try {
                const serverCart = await cartApi.getCart();
                if (serverCart.items && serverCart.items.length > 0) {
                    const mapped = serverCart.items.map((item) => ({
                        id: item.id,
                        storeId: (item.product as any).store_id ?? 0,
                        storeName: (item.product as any).store_name ?? 'Tienda',
                        name: item.product.name,
                        image: item.product.image ?? '/img/placeholder.png',
                        price: item.unitPrice,
                        originalPrice: item.product.regular_price ?? item.unitPrice,
                        quantity: item.quantity,
                        selected: true,
                    }));
                    setCartItems(mapped);
                    return;
                }
            } catch {
                // Fallo al cargar carrito del backend, continuar
            }

            // Si el backend está vacío, intentar desde carritoStore local
            const localItems = useCarritoStore.getState().cartItems;
            if (localItems.length > 0) {
                const mapped = localItems.map((item) => ({
                    id: Number(item.producto_id),
                    storeId: 0,
                    storeName: item.vendedor_nombre ?? 'Tienda',
                    name: item.producto_nombre ?? 'Producto',
                    image: item.imagen_url ?? '/img/placeholder.png',
                    price: Number(item.precio_unitario),
                    originalPrice: Number(item.precio_unitario),
                    quantity: Number(item.cantidad),
                    selected: true,
                }));
                setCartItems(mapped);
            }
        }
        loadCart();
    }, [setCartItems]);

    const [showPostCompra, setShowPostCompra] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);

    useEffect(() => {
        if (currentStep === 3) {
            setShowPostCompra(true);
        }
    }, [currentStep]);
=======
  const currentStep = useCheckoutStore((s) => s.currentStep);
  const setStep = useCheckoutStore((s) => s.setStep);
  const orderResult = useCheckoutStore((s) => s.orderResult);
  const isProcessing = useCheckoutStore((s) => s.isProcessing);

  // ← NUEVO: inicializa el hook que carga el carrito del backend al montar
  const { isLoading, error, clearError } = useCheckoutSubmit();

  const [showPostCompra, setShowPostCompra] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361

  useEffect(() => {
    if (currentStep === 3) {
      setShowPostCompra(true);
    }
  }, [currentStep]);

  const email = orderResult?.email ?? '';

<<<<<<< HEAD
                {/* Sticky top bar — logo + compact step circles */}
                <div id="checkout-top-wrapper" className="sticky top-0 z-[10000] bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-100 dark:border-[var(--border-subtle)] shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none">
                    <CheckoutStepBar />
                </div>

                {/* Dynamic header — gradient with step title */}
                <CheckoutHeader />

                {/* Main content */}
                <div id="checkout-main-content" className={`transition-all duration-700 ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}>
                    <div className="max-w-6xl mx-auto px-4 pt-4 pb-8">

                        {/* ── PASO 1 ── */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <CartItemList onDeleteSelected={() => { }} />
                                </div>
                                <div className="lg:col-span-1">
                                    <CartSummary onContinue={() => setStep(2)} />
                                </div>
                            </div>
                        )}

                        {/* ── PASO 2 ── */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <PersonalDataForm />
                                    <ShippingForm />
                                    <BillingInfo />
                                </div>
                                <div className="lg:col-span-1">
                                    <OrderSummary />
                                </div>
                            </div>
                        )}

                        {/* ── PASO 3 ── */}
                        {currentStep === 3 && (
                            <OrderConfirmation />
                        )}
                    </div>
                </div>

                {/* Processing overlay */}
                {isProcessing && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1700] flex items-center justify-center px-4">
                        <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-modal-pop">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-sky-100 dark:border-sky-900/30 rounded-full" />
                                <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-3xl">🛡️</div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] uppercase tracking-tight">Procesando Pedido</h3>
                                <p className="text-[10px] text-sky-400 dark:text-[var(--brand-sky)] font-bold uppercase tracking-[0.2em] animate-pulse">Encriptando transacción...</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {[0.1, 0.2, 0.3].map((d) => (
                                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--brand-sky)] animate-bounce" style={{ animationDelay: `${d}s` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ModalPostCompra
                isOpen={showPostCompra}
                email={email}
                onClose={() => setShowPostCompra(false)}
                onSync={() => { }}
                onOpenRegistro={() => { setShowPostCompra(false); setShowRegistro(true); }}
            />
            <ModalRegistroUsuario
                isOpen={showRegistro}
                email={email}
                onClose={() => setShowRegistro(false)}
            />
=======
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] antialiased">
      <div className="min-h-screen bg-white dark:bg-[var(--bg-primary)]">
        {/* Sticky header */}
        <div
          className="sticky top-0 z-[10000] bg-white dark:bg-[var(--bg-secondary)]
          border-b border-gray-100 dark:border-[var(--border-subtle)]
          shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none"
        >
          <CheckoutStepBar />
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
        </div>

        <CheckoutHeader />

        {/* Error de carga del carrito */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <div
              className="flex items-center justify-between gap-4 bg-red-50 dark:bg-red-950/30
              border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400
              rounded-2xl px-5 py-3 text-sm"
            >
              <span>⚠️ {error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div
          className={`transition-all duration-700 ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}
        >
          <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
            {/* PASO 1 */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* CartItemList ya lee del checkoutStore que useCheckoutSubmit pobló */}
                  <CartItemList />
                </div>
                <div className="lg:col-span-1">
                  {/* CartSummary muestra el resumen y el botón para avanzar */}
                  <CartSummary onContinue={() => setStep(2)} />
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <PersonalDataForm />
                  <ShippingForm />
                  <BillingInfo />
                </div>
                <div className="lg:col-span-1">
                  <OrderSummary />
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {currentStep === 3 && <OrderConfirmation />}
          </div>
        </div>

        {/* Overlay de procesando */}
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
                <div className="absolute inset-0 border-4 border-sky-100 dark:border-sky-900/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                  🛡️
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] uppercase tracking-tight">
                  Procesando Pedido
                </h3>
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-[0.2em] animate-pulse">
                  Encriptando transacción...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[0.1, 0.2, 0.3].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
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
        onClose={() => setShowPostCompra(false)}
        onSync={() => {}}
        onOpenRegistro={() => {
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
