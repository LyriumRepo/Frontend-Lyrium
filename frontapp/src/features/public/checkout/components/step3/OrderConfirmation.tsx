'use client';

import { CheckCircle, MapPin, CreditCard, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCheckoutStore } from '@/store/checkoutStore';

const PAYMENT_LABELS: Record<string, string> = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    yape_plin: 'Yape / Plin',
    pago_efectivo: 'PagoEfectivo',
};

const DELIVERY_LABELS: Record<string, string> = {
    pickup: 'Recoger en tienda',
    delivery: 'Delivery a domicilio',
    service_store: 'Servicio en tienda',
    service_home: 'Servicio a domicilio',
};

export default function OrderConfirmation() {
    const result = useCheckoutStore((s) => s.orderResult);

    if (!result) return null;

    const { orderId, email, total, items, personalData, shippingData, orderData } = result;

    const addressLines = orderData.deliveryMethod !== 'pickup'
        ? [shippingData.avenida, shippingData.numero, shippingData.distrito, shippingData.departamento].filter(Boolean).join(', ')
        : 'Retiro en tienda';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left column (7) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Success card */}
                    <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl overflow-hidden p-8 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                            <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-900/20" />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight mb-2 uppercase">¡Gracias por tu compra!</h2>
                        <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2">Tu pedido ha sido procesado con éxito</p>
                        <p className="text-[10px] text-sky-500 dark:text-[var(--brand-sky)] font-bold uppercase tracking-widest mb-6">
                            Recibo digital enviado a: <span className="text-gray-900 dark:text-[var(--text-primary)]">{email}</span>
                        </p>

                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] mb-8">
                            <span className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest">Orden ID:</span>
                            <span className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)]">#{orderId}</span>
                        </div>

                        {/* Shipping + Payment summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="p-5 bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] space-y-3">
                                <div className="flex items-center gap-2 text-sky-500 dark:text-[var(--brand-sky)]">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Envío</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{addressLines || 'Sin dirección especificada'}</p>
                                <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] font-medium italic">
                                    {DELIVERY_LABELS[orderData.deliveryMethod]}
                                </p>
                            </div>
                            <div className="p-5 bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] space-y-3">
                                <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Pago</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{PAYMENT_LABELS[orderData.paymentMethod]}</p>
                                <p className="text-xl font-black text-sky-600 dark:text-[var(--brand-sky)]">S/ {total.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            <Link href="/" className="px-8 py-4 rounded-2xl border-2 border-gray-100 dark:border-[var(--border-subtle)] text-gray-500 dark:text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> Ir al Inicio
                            </Link>
                            <Link href="/seller/orders" className="px-8 py-4 rounded-2xl bg-gray-900 dark:bg-[var(--bg-secondary)] text-white dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all text-center flex items-center justify-center gap-2">
                                Ver Mis Pedidos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right column (5) — Receipt detail */}
                <div className="lg:col-span-5">
                    <div className="bg-gray-50/80 dark:bg-[var(--bg-muted)]/80 backdrop-blur-sm border border-gray-100 dark:border-[var(--border-subtle)] rounded-[2.5rem] p-8 sticky top-24 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xs font-black text-gray-900 dark:text-[var(--text-primary)] uppercase tracking-[0.3em]">Detalle del Recibo</h4>
                            <span className="bg-white dark:bg-[var(--bg-card)] px-3 py-1 rounded-full text-[9px] font-black text-sky-500 dark:text-[var(--brand-sky)] border border-sky-100 dark:border-[var(--border-subtle)] uppercase">
                                Items comprados
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3 items-center bg-white dark:bg-[var(--bg-card)] rounded-2xl p-3 border border-gray-100 dark:border-[var(--border-subtle)]">
                                    <Image src={item.image} alt={item.name} width={56} height={56} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)]">{item.storeName} · x{item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)] flex-shrink-0">
                                        S/ {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-[var(--border-subtle)] space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest">
                                <span>Subtotal Estimado</span>
                                <span>S/ {items.reduce((a, i) => a + i.price * i.quantity, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)]">TOTAL PAGADO</span>
                                <span className="text-2xl font-black text-sky-600 dark:text-[var(--brand-sky)]">S/ {total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
