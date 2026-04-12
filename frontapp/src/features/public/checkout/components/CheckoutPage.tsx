'use client';

import { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
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
    const currentStep = useCheckoutStore((s) => s.currentStep);
    const setStep = useCheckoutStore((s) => s.setStep);
    const orderResult = useCheckoutStore((s) => s.orderResult);
    const isProcessing = useCheckoutStore((s) => s.isProcessing);

    const [showPostCompra, setShowPostCompra] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);

    // Open post-purchase modal when order lands on step 3
    useEffect(() => {
        if (currentStep === 3) {
            setShowPostCompra(true);
        }
    }, [currentStep]);

    const email = orderResult?.email ?? '';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] antialiased">
            <div id="lyrium-stack-wrapper" className="min-h-screen bg-white dark:bg-[var(--bg-primary)]">

                {/* Sticky top wrapper */}
                <div id="checkout-top-wrapper" className="sticky top-0 z-[10000] bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-100 dark:border-[var(--border-subtle)] shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none">
                    <CheckoutStepBar />
                </div>

                {/* Dynamic header — content adapts to current step */}
                <CheckoutHeader />

                {/* Main content */}
                <div id="checkout-main-content" className={`transition-all duration-700 ${isProcessing ? 'blur-sm pointer-events-none' : ''}`}>
                    <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">

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
        </div>
    );
}
