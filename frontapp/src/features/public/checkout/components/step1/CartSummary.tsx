'use client';

import Image from 'next/image';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

interface Props {
    onContinue: () => void;
}

export default function CartSummary({ onContinue }: Props) {
    const cartItems = useCheckoutStore((s) => s.cartItems);
    const selected = cartItems.filter((i) => i.selected);

    const originalTotal = selected.reduce((acc, i) => acc + i.originalPrice * i.quantity, 0);
    const subtotal = selected.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discount = originalTotal - subtotal;

    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm p-5 sticky top-[100px]">
            <h3 className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)] mb-4">Resumen</h3>

            {/* Thumbnails */}
            {selected.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {selected.map((item) => (
                        <div key={item.id} className="w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]">
                            <Image src={item.image} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            {/* Breakdown */}
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[var(--text-muted)]">Total de artículos</span>
                    <span className="text-gray-400 dark:text-[var(--text-muted)] line-through">S/ {originalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[var(--text-muted)]">Descuento</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">- S/ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span className="text-gray-700 dark:text-[var(--text-secondary)]">Subtotal</span>
                    <span className="text-gray-800 dark:text-[var(--text-primary)]">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-[var(--text-muted)]">Envío</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Gratis</span>
                </div>
                <div className="h-px bg-gray-100 dark:bg-[var(--border-subtle)]" />
                <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-800 dark:text-[var(--text-primary)]">Total estimado</span>
                    <span className="text-sky-600 dark:text-[var(--brand-sky)]">S/ {subtotal.toFixed(2)}</span>
                </div>
            </div>

            {/* CTA */}
            <button
                id="btnContinueFromSummary"
                onClick={onContinue}
                className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
                <ArrowRight className="w-5 h-5" />
                Continuar {selected.length > 0 ? `(${selected.length})` : '(Modo Prueba)'}
            </button>
            <a
                href="/"
                className="mt-2 w-full py-3 rounded-2xl bg-white dark:bg-[var(--bg-card)] border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-400 dark:hover:border-[var(--brand-sky)] hover:bg-sky-50 dark:hover:bg-sky-900/10 text-gray-600 dark:text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-[var(--brand-sky)] font-medium inline-flex items-center justify-center gap-2 transition-all text-sm"
            >
                <ShoppingBag className="w-4 h-4" />
                Seguir comprando
            </a>

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)] space-y-3">
                <div className="flex items-start gap-2">
                    <Truck className="w-5 h-5 text-sky-500 dark:text-[var(--brand-sky)] mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">Entrega rápida</p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Cupón S/ 1.00 por entrega tardía ✓</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-500 dark:text-[var(--brand-sky)] mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">Seguridad & Privacidad</p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Pagos seguros · Datos personales seguros</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
