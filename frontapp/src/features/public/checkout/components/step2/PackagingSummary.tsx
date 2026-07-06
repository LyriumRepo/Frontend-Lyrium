'use client';

import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

export default function PackagingSummary() {
  const cartItems      = useCheckoutStore((s) => s.cartItems);
  const boxCalculation = useCheckoutStore((s) => s.boxCalculation);
  const isLoadingBox   = useCheckoutStore((s) => s.isLoadingBox);
  const setStep        = useCheckoutStore((s) => s.setStep);

  // Solo productos físicos (id > 0) requieren caja/empaque; los servicios (id <= 0) no.
  const selectedItems = cartItems.filter((i) => i.selected && i.id > 0);
  const subtotal      = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalCajas    = (boxCalculation ?? []).reduce((s, t) => s + (t.cajas?.length ?? 0), 0);
  const canContinue   = !isLoadingBox && (boxCalculation?.length ?? 0) > 0;

  const boxByStore = new Map<number, { cajas: number; nombre: string }>();
  for (const t of boxCalculation ?? []) {
    boxByStore.set(t.store_id, {
      cajas: t.cajas?.length ?? 0,
      nombre: t.store_name ?? 'Tienda',
    });
  }

  const grupos = new Map<number, typeof selectedItems>();
  for (const item of selectedItems) {
    const sid = item.storeId ?? 0;
    if (!grupos.has(sid)) grupos.set(sid, []);
    grupos.get(sid)!.push(item);
  }

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 overflow-hidden">
      
      <div className="px-5 py-4 bg-gradient-to-r from-[var(--brand-sky)] to-[var(--brand-sky-hover)] dark:from-emerald-600 dark:to-emerald-700 flex items-center gap-3">
        <Package className="w-5 h-5 text-white" />
        <h3 className="font-bold text-white">Resumen de empaque</h3>
      </div>

      <div className="p-5 space-y-4">
        
        {Array.from(grupos.entries()).map(([storeId, items]) => {
          const box       = boxByStore.get(storeId);
          const cajas     = box?.cajas ?? 0;
          const nombre    = items[0].storeName || box?.nombre || 'Tienda';
          const subtotalTienda = items.reduce((s, i) => s + i.price * i.quantity, 0);

          return (
            <div key={storeId} className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 py-3">
              
              <p className="text-xs font-bold text-[var(--brand-sky-hover)] dark:text-emerald-400 uppercase tracking-wide mb-2">
                🏪 {nombre}
              </p>

              
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-500 dark:text-gray-400 py-0.5">
                  <span>{item.name} ×{item.quantity}</span>
                  <span className="font-mono">S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  {isLoadingBox ? (
                    <span className="text-[var(--brand-sky)] dark:text-emerald-400 animate-pulse">calculando...</span>
                  ) : (
                    <span className="font-bold text-[var(--brand-sky-hover)] dark:text-emerald-400">
                      {cajas > 0 ? `${cajas} caja${cajas !== 1 ? 's' : ''}` : '—'}
                    </span>
                  )}
                </span>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Subtotal</p>
                  <p className="font-mono font-bold text-sm text-[var(--brand-sky-hover)] dark:text-emerald-400">
                    S/ {subtotalTienda.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {grupos.size} tienda{grupos.size !== 1 ? 's' : ''} · {totalCajas} caja{totalCajas !== 1 ? 's' : ''}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400">Subtotal</p>
            <p className="font-mono font-black text-lg text-[var(--brand-sky-hover)] dark:text-emerald-400">
              S/ {subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          El costo de envío se calcula en el siguiente paso al elegir tu destino
        </p>
      </div>

      
      <div className="px-5 pb-5 flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[var(--brand-sky)] dark:border-emerald-500 text-[var(--brand-sky-hover)] dark:text-emerald-400 font-bold text-sm hover:bg-sky-50 dark:hover:bg-emerald-500/10 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!canContinue}
          className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--brand-sky)] dark:bg-emerald-600 text-white font-bold text-sm hover:bg-[var(--brand-sky-hover)] dark:hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar al destino <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}