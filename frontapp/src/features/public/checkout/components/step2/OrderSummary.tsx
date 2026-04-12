'use client';

import { Truck, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useCheckoutSubmit } from '../../hooks/useCheckoutSubmit';
import type { DeliveryMethod, PaymentMethod } from '@/store/checkoutStore';

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string; cost: number }[] = [
    { value: 'pickup', label: '🏪 Recoger en tienda (Gratis)', cost: 0 },
    { value: 'delivery', label: '🚚 Delivery a domicilio (S/ 10.00)', cost: 10 },
    { value: 'service_store', label: '🏢 Servicio en tienda (Gratis)', cost: 0 },
    { value: 'service_home', label: '🏠 Servicio a domicilio (S/ 20.00)', cost: 20 },
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
    { value: 'credit_card', label: '💳 Tarjeta de Crédito' },
    { value: 'debit_card', label: '💳 Tarjeta de Débito' },
    { value: 'yape_plin', label: '📱 Yape / Plin' },
    { value: 'pago_efectivo', label: '💵 PagoEfectivo' },
];

const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 transition-all text-gray-800 dark:text-[var(--text-primary)]";

export default function OrderSummary() {
    const orderData = useCheckoutStore((s) => s.orderData);
    const setOrderData = useCheckoutStore((s) => s.setOrderData);
    const isProcessing = useCheckoutStore((s) => s.isProcessing);
    const { submitOrder, subtotal, total } = useCheckoutSubmit();

    const handleDeliveryChange = (value: DeliveryMethod) => {
        const option = DELIVERY_OPTIONS.find((o) => o.value === value);
        setOrderData({ deliveryMethod: value, deliveryCost: option?.cost ?? 0 });
    };

    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm sticky top-[100px]">
            <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2 rounded-t-2xl">
                <span className="text-white text-2xl">🧾</span>
                <h3 className="font-bold text-white">Resumen del Pedido</h3>
            </div>

            <div className="p-5 space-y-4">
                {/* Delivery Method */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-1">
                        <Truck className="w-4 h-4" /> Método de Envío
                    </label>
                    <select value={orderData.deliveryMethod} onChange={(e) => handleDeliveryChange(e.target.value as DeliveryMethod)} className={inputCls}>
                        {DELIVERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-1">
                        <CreditCard className="w-4 h-4" /> Método de Pago
                    </label>
                    <select value={orderData.paymentMethod} onChange={(e) => setOrderData({ paymentMethod: e.target.value as PaymentMethod })} className={inputCls}>
                        {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                {/* Save payment toggle */}
                <div className="p-4 bg-purple-50/60 dark:bg-purple-900/20 rounded-2xl border border-purple-100/40 dark:border-purple-800/30">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" checked={orderData.savePayment} onChange={(e) => setOrderData({ savePayment: e.target.checked })} className="sr-only peer" />
                            <div className="w-10 h-6 bg-gray-200 dark:bg-[var(--bg-muted)] rounded-full peer peer-checked:bg-purple-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full transition-all" />
                        </div>
                        <span className="text-xs font-bold text-purple-900/70 dark:text-purple-400/80 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                            💾 Guardar para futuras compras
                        </span>
                    </label>
                </div>

                <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />

                {/* Promo code */}
                <div className="flex gap-2">
                    <input type="text" placeholder="Código promocional" value={orderData.promoCode} onChange={(e) => setOrderData({ promoCode: e.target.value })} className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none transition-all text-gray-800 dark:text-[var(--text-primary)]" />
                    <button type="button" className="px-4 py-2.5 bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] rounded-xl font-bold text-xs transition-all">
                        Aplicar
                    </button>
                </div>

                <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />

                {/* Breakdown */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
                        <span>Envío</span>
                        <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                            {orderData.deliveryCost === 0 ? 'Gratis' : `S/ ${orderData.deliveryCost.toFixed(2)}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-[var(--text-muted)]">
                        <span>Descuento</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">-S/ {orderData.discount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t-2 border-gray-100 dark:border-[var(--border-subtle)] flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Total</span>
                    <span className="text-2xl font-black text-sky-600 dark:text-[var(--brand-sky)]">S/ {total.toFixed(2)}</span>
                </div>
            </div>

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
        </div>
    );
}
