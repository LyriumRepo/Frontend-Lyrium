'use client';

import { ShoppingBag, Tag, ArrowRight, Loader2, Truck, Store } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { DeliveryMethod } from '@/store/checkoutStore';
import BranchSelector from '@/features/public/checkout/components/step3/BranchSelector';

interface Props {
  onContinue: () => void;
}

const DELIVERY_OPTIONS: { key: DeliveryMethod; label: string; sub: string; icon: typeof Truck }[] = [
  { key: 'delivery', label: 'Envío a domicilio', sub: 'o recoge en agencia', icon: Truck },
  { key: 'pickup',   label: 'Retiro en tienda',  sub: 'Recoge en sucursal',  icon: Store },
];

export default function CartSummary({ onContinue }: Props) {
  const cartItems        = useCheckoutStore((s) => s.cartItems);
  const isLoading        = useCheckoutStore((s) => s.cartLoading);
  const deliveryMethod   = useCheckoutStore((s) => s.orderData.deliveryMethod);
  const selectedBranchId = useCheckoutStore((s) => s.orderData.selectedBranchId);
  const setOrderData     = useCheckoutStore((s) => s.setOrderData);

  const selectedItems = cartItems.filter((i) => i.selected);
  const isPickup = deliveryMethod === 'pickup';

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
    <div className="rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] p-6 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-5">
      {/* Título */}
        <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-sky-500 dark:text-emerald-400" />
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
          <span className="text-sky-600 dark:text-emerald-400 text-lg">
            S/ {total.toFixed(2)}
          </span>
        </div>

        {/* Nota IGV */}
        <p className="text-[11px] text-gray-400 dark:text-[var(--text-muted)] -mt-2">
          Incluye IGV: S/ {igv.toFixed(2)}
        </p>

      {/* Modalidad de envío */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wider">
            Modalidad de entrega
          </p>
          <div className="flex flex-col gap-1.5">
            {DELIVERY_OPTIONS.map(({ key, label, sub, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setOrderData({ deliveryMethod: key, selectedBranchId: key === 'pickup' ? null : undefined })}
                className={[
                  'flex items-center gap-2.5 py-2 px-3 rounded-lg border transition-all duration-200 text-left',
                  deliveryMethod === key
                    ? 'border-sky-400 dark:border-emerald-500 bg-sky-50 dark:bg-emerald-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] hover:border-gray-300 dark:hover:border-gray-600',
                ].join(' ')}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${deliveryMethod === key ? 'text-sky-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-bold ${deliveryMethod === key ? 'text-sky-700 dark:text-emerald-300' : 'text-gray-700 dark:text-[var(--text-secondary)]'}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] ml-1.5">
                    · {sub}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de sucursal (solo Retiro en Tienda) */}
        {isPickup && selectedItems.some((i) => i.id > 0) && (
          <div className="rounded-xl border border-sky-100 dark:border-emerald-900/50 bg-sky-50/30 dark:bg-emerald-950/10 p-2.5">
            <BranchSelector />
          </div>
        )}

        {/* Botón continuar */}
        <button
          onClick={onContinue}
          disabled={selectedItems.length === 0 || isLoading || (isPickup && selectedItems.some((i) => i.id > 0) && !selectedBranchId)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl
            bg-sky-500 hover:bg-sky-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:bg-gray-200 disabled:dark:bg-[var(--bg-muted)]
            disabled:text-gray-400 disabled:cursor-not-allowed
            text-white font-semibold transition shadow-lg shadow-sky-200/50
            dark:shadow-emerald-900/20"
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
            hover:text-sky-500 dark:hover:text-emerald-400 transition"
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
