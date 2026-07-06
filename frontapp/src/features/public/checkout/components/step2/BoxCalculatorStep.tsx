'use client';

import { RefreshCw, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useCheckoutStore }    from '@/store/checkoutStore';
import type { CajaDetalle, TiendaBoxResult, CartItem } from '@/store/checkoutStore';
import { useBoxCalculation }   from '../../hooks/useBoxCalculation';

const TIPO_COLOR: Record<string, string> = {
  XXS:'bg-slate-100  text-slate-700  dark:bg-slate-800 dark:text-slate-300',
  XS: 'bg-sky-100   text-sky-700    dark:bg-sky-900/40 dark:text-sky-300',
  S:  'bg-sky-100 text-sky-700     dark:bg-sky-900/40 dark:text-sky-300',
  M:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  ML: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  L:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  XL: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
};
const tipoColor = (t: string) =>
  TIPO_COLOR[t?.toUpperCase()] ?? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';

function getPeso(c: CajaDetalle & Record<string, any>) {
  return {
    real:       c.pesoReal         ?? c.peso?.real         ?? 0,
    volumetrico: c.pesoVolumetrico ?? c.peso?.volumetrico  ?? 0,
    facturable: c.pesoFacturable   ?? c.peso?.facturable   ?? 0,
  };
}
function getDims(c: CajaDetalle & Record<string, any>) {
  const d = c.dimensiones ?? c;
  return { largo: d.largo ?? 0, ancho: d.ancho ?? 0, alto: d.alto ?? 0 };
}

function BoxChip({
  tiendaBox,
  isLoading,
}: {
  tiendaBox?: TiendaBoxResult;
  isLoading:  boolean;
}) {
  if (isLoading) {
    return (
      <div className="mx-4 mb-3 mt-1 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2 text-xs text-[var(--brand-sky)] dark:text-emerald-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span className="animate-pulse">Calculando caja para este vendedor...</span>
      </div>
    );
  }

  if (tiendaBox?.error) {
    return (
      <div className="mx-4 mb-3 mt-1 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 p-3 text-xs text-red-600 dark:text-red-400">
        ⚠️ {tiendaBox.error}
      </div>
    );
  }

  if (!tiendaBox || !tiendaBox.cajas?.length) return null;

  const cajas    = tiendaBox.cajas;
  const eff      = Math.round((tiendaBox.eficiencia ?? 0) * 100);
  const effColor = eff >= 80 ? 'text-teal-600 dark:text-emerald-400'
                 : eff >= 60 ? 'text-sky-600 dark:text-sky-400'
                 : 'text-sky-400 dark:text-sky-500';

  return (
    <div className="mx-4 mb-3 mt-1 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 p-3 space-y-2">

      
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--brand-sky)] dark:text-emerald-400 flex items-center gap-1.5">
          📦 {tiendaBox.caja || `${cajas.length} caja${cajas.length !== 1 ? 's' : ''}`}
        </span>
        <span className={`text-[11px] font-bold ${effColor}`}>
          ⚡ {eff}% eficiencia
        </span>
      </div>

      
      {cajas.map((caja, i) => {
        const p    = getPeso(caja as any);
        const dims = getDims(caja as any);
        return (
          <div
            key={i}
            className="flex items-center justify-between bg-white dark:bg-gray-900/60 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2 gap-3"
          >
            
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${tipoColor(caja.tipo)}`}>
                {caja.tipo}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                {dims.largo}×{dims.ancho}×{dims.alto} cm
              </span>
            </div>

            
            <div className="text-right font-mono text-[11px] shrink-0 space-y-0.5">
              <div className="text-gray-400">Real: {p.real.toFixed(3)} kg</div>
              <div className="text-gray-400">Vol: {p.volumetrico.toFixed(3)} kg</div>
              <div className={`font-bold ${tipoColor(caja.tipo).split(' ')[1]}`}>
                Fact: {p.facturable.toFixed(3)} kg
              </div>
            </div>
          </div>
        );
      })}

      
      <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-0.5 border-t border-gray-100 dark:border-gray-800">
        <span>{cajas.length} caja{cajas.length !== 1 ? 's' : ''} en total</span>
        <span className="font-mono font-bold text-[var(--brand-sky)] dark:text-emerald-400">
          {cajas.reduce((s, c) => s + getPeso(c as any).facturable, 0).toFixed(3)} kg facturable
        </span>
      </div>
    </div>
  );
}

function ProductRow({ item }: { item: CartItem }) {
  const hasDims = item.largo && item.ancho && item.alto;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {item.name}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
          {hasDims
            ? `${item.largo}×${item.ancho}×${item.alto} cm · ${item.peso ?? '?'} kg`
            : `${item.peso ?? '?'} kg`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">
          ×{item.quantity}
        </span>
        <span className="font-mono text-sm font-bold text-[var(--brand-sky-hover)] dark:text-emerald-400">
          S/ {(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function VendorGroupCard({
  items,
  tiendaBox,
  isLoading,
}: {
  items:     CartItem[];
  tiendaBox?: TiendaBoxResult;
  isLoading: boolean;
}) {
  const first      = items[0];
  const storeName  = first.storeName  || 'Tienda';
  const origen     = first.origen;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/40">

      
      <div className="flex items-start justify-between px-4 py-3 bg-sky-50 dark:bg-emerald-600/15 border-b border-sky-100 dark:border-emerald-600/30">
        <div>
          <p className="text-sm font-bold text-[var(--brand-sky)] dark:text-emerald-400 flex items-center gap-1.5">
            🏪 {storeName}
          </p>
          {origen && (
            <p className="text-[11px] text-[var(--brand-sky-hover)] dark:text-emerald-400 mt-0.5">
              📍 {origen.distrito}, {origen.provincia} — {origen.departamento}
            </p>
          )}
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="inline-flex items-center text-[11px] font-bold bg-[var(--brand-sky)] dark:bg-emerald-600 text-white rounded-full px-2.5 py-0.5">
            {totalUnits} item{totalUnits !== 1 ? 's' : ''}
          </span>
          <p className="font-mono text-xs text-[var(--brand-sky-hover)] dark:text-emerald-400 mt-1">
            S/ {subtotal.toFixed(2)}
          </p>
        </div>
      </div>

      
      {items.map((item) => (
        <ProductRow key={item.id} item={item} />
      ))}

      
      <BoxChip tiendaBox={tiendaBox} isLoading={isLoading} />
    </div>
  );
}

export default function BoxCalculatorStep() {
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const setStep   = useCheckoutStore((s) => s.setStep);
  const { boxCalculation, isLoadingBox, boxError, recalcular } = useBoxCalculation();

  // Solo productos físicos (id > 0) requieren caja/empaque; los servicios (id <= 0) no.
  const selectedItems = cartItems.filter((i) => i.selected && i.id > 0);

  const grupos = new Map<number, CartItem[]>();
  for (const item of selectedItems) {
    const sid = item.storeId ?? 0;
    if (!grupos.has(sid)) grupos.set(sid, []);
    grupos.get(sid)!.push(item);
  }

  const boxByStore = new Map<number, TiendaBoxResult>();
  for (const t of boxCalculation ?? []) boxByStore.set(t.store_id, t);

  const totalCajas  = (boxCalculation ?? []).reduce((s, t) => s + (t.cajas?.length ?? 0), 0);
  const subtotal    = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalUnits  = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const canContinue = !isLoadingBox && !boxError && !!boxCalculation?.length;

  if (selectedItems.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-5xl">📦</div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Sin productos seleccionados</h3>
        <p className="text-sm text-gray-400">Vuelve al carrito y selecciona al menos un producto.</p>
        <button
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-sky)] dark:bg-emerald-600 text-white text-sm font-bold hover:bg-[var(--brand-sky-hover)] dark:hover:bg-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Ir al carrito
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      
      <div className="rounded-2xl bg-gradient-to-r from-[var(--brand-sky)] to-[var(--brand-sky-hover)] dark:from-emerald-600 dark:to-emerald-700 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black tracking-tight">📦 Cálculo de Cajas</h2>
            <p className="text-sky-100 dark:text-white/70 text-xs mt-0.5">Empaque optimizado por tienda</p>
          </div>
          <button
            onClick={recalcular}
            title="Recalcular"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBox ? 'animate-spin' : ''}`} />
            Calcular
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Cajas',      value: isLoadingBox ? '…' : totalCajas },
            { label: 'Tiendas',    value: grupos.size },
            { label: 'Productos',  value: totalUnits },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/20 backdrop-blur-sm p-3 text-center">
              <p className="text-[11px] text-white/80 leading-none">{label}</p>
              <p className="font-black text-xl mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      
      {boxError && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-600 text-sm">
          <span>⚠️ {boxError}</span>
          <button
            onClick={recalcular}
            className="flex items-center gap-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 hover:bg-red-200 px-3 py-1.5 rounded-lg transition shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      
      <div className="space-y-4">
        {Array.from(grupos.entries()).map(([storeId, items]) => (
          <VendorGroupCard
            key={storeId}
            items={items}
            tiendaBox={boxByStore.get(storeId)}
            isLoading={isLoadingBox}
          />
        ))}
      </div>

      
      {canContinue && (
        <div className="flex gap-2 items-start p-4 rounded-xl bg-sky-50 dark:bg-emerald-600/15 border border-sky-100 dark:border-emerald-600/30 text-[var(--brand-sky)] dark:text-emerald-400 text-sm">
          <span className="shrink-0">📍</span>
          <p>
            ¡Listo! En el <strong>siguiente paso</strong> elige tu destino y verás
            los precios de envío de cada courier para estas cajas.
          </p>
        </div>
      )}

      
      <div className="flex gap-2 items-start p-4 rounded-xl bg-sky-50 dark:bg-emerald-600/15 border border-sky-100 dark:border-emerald-600/30 text-[var(--brand-sky)] dark:text-emerald-400 text-sm">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          El <strong>peso facturable</strong> es el mayor entre peso real y volumétrico
          (largo×ancho×alto÷5000). Los couriers cobran por este valor.
        </p>
      </div>
    </div>
  );
}