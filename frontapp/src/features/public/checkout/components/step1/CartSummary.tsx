'use client';

import { ShoppingBag, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

interface Props {
  onContinue: () => void;
}

export default function CartSummary({ onContinue }: Props) {
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const isLoading = useCheckoutStore((s) => s.cartLoading);

  const selectedItems = cartItems.filter((i) => i.selected);

  // Cálculos del resumen
  const subtotal = selectedItems.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0,
  );
  const discount = selectedItems.reduce(
    (acc, i) => acc + (i.originalPrice - i.price) * i.quantity,
    0,
  );
  const total = subtotal; // precios ya incluyen IGV por ley peruana
  const igv = Math.round((total - total / 1.18) * 100) / 100; // IGV extraído (solo informativo)

  // ── Skeleton mientras carga ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-24" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-16" />
          </div>
        ))}
        <div className="h-12 bg-gray-200 dark:bg-[var(--bg-muted)] rounded-xl mt-4" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] p-6 space-y-5 lg:sticky lg:top-24">
      {/* Título */}
      <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-sky-500" />
        Resumen
      </h2>

      {/* Desglose */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-[var(--text-secondary)]">
          <span>Total de artículos ({selectedItems.length})</span>
          <span className={discount > 0 ? 'line-through text-gray-400' : ''}>
            S/ {(subtotal + discount).toFixed(2)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Descuento
            </span>
            <span>- S/ {discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 dark:text-[var(--text-secondary)]">
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-100 dark:border-[var(--border-subtle)]" />

      {/* Total */}
      <div className="flex justify-between font-bold text-base">
        <span className="text-gray-900 dark:text-[var(--text-primary)]">Total estimado</span>
        <span className="text-sky-600 dark:text-sky-400 text-lg">
          S/ {total.toFixed(2)}
        </span>
      </div>

      {/* Nota IGV */}
      <p className="text-[11px] text-gray-400 dark:text-[var(--text-muted)] -mt-2">
        Incluye IGV: S/ {igv.toFixed(2)}
      </p>

      {/* Botón continuar */}
      <button
        onClick={onContinue}
        disabled={selectedItems.length === 0 || isLoading}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl
          bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:dark:bg-[var(--bg-muted)]
          disabled:text-gray-400 disabled:cursor-not-allowed
          text-white font-semibold transition shadow-lg shadow-sky-200/50
          dark:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando...
          </>
        ) : (
          <>
            Continuar
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Seguir comprando */}
      <a
        href="/tiendas"
        className="block text-center text-sm text-gray-500 dark:text-[var(--text-muted)]
          hover:text-sky-500 dark:hover:text-sky-400 transition"
      >
        ← Seguir comprando
      </a>

      {/* Badges de confianza */}
      <div className="pt-2 space-y-1.5 border-t border-gray-100 dark:border-[var(--border-subtle)]">
        {[
          {
            icon: '🚀',
            text: 'Entrega rápida',
            sub: 'Cupón S/ 1.00 por entrega tardía',
          },
          {
            icon: '🔒',
            text: 'Seguridad & Privacidad',
            sub: 'Datos personales seguros',
          },
        ].map(({ icon, text, sub }) => (
          <div key={text} className="flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">{icon}</span>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)]">
                {text}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
