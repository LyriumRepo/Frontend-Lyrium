'use client';

import { useState, useEffect }  from 'react';
import { Truck, Package, Weight, ChevronDown, Home, Store } from 'lucide-react';
import { useCheckoutStore }     from '@/store/checkoutStore';
import type { LaravelCalcResponse, CourierOption, TipoEntrega, TiendaLogistica } from '@/store/checkoutStore';

const MARKUP     = 1.05; 
const SHARF_KEYS = ['sharf', 'sharf express'];
const applyMarkup = (price: number | null | undefined): number | null =>
  price == null ? null : Math.ceil(price * MARKUP * 100) / 100;

const isSharf = (courier: string | undefined | null) =>
  !!courier && SHARF_KEYS.includes(courier.toLowerCase());

function getPrecioFinal(op: CourierOption, tipo: TipoEntrega): number | null {
  if (isSharf(op.courier)) {
    const raw = op.agencia?.precio ?? op.domicilio?.precio ?? op.precio ?? null;
    return applyMarkup(raw);
  }
  if (tipo === 'agencia') {
    if (op.agencia?.disponible && op.agencia.precio != null) return applyMarkup(op.agencia.precio);
    if (op.precio != null) return applyMarkup(op.precio);
    return null;
  }
  if (op.domicilio?.disponible && op.domicilio.precio != null) return applyMarkup(op.domicilio.precio);
  if (op.precio != null) return applyMarkup(op.precio);
  return null;
}

function getPesoTotal(tienda: TiendaLogistica): number {
  return (tienda.cajas?.detalle ?? []).reduce((s, c) => s + (c.pesoFacturable ?? 0), 0);
}

const COURIER_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  Shalom: { 
    label: 'Shalom Express', 
    emoji: '🔴', 
    color: 'text-red-600 dark:text-red-400', 
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' 
  },
  Olva: { 
    label: 'Olva Courier',   
    emoji: '🟡', 
    color: 'text-yellow-600 dark:text-yellow-400',   
    bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'   
  },
  Sharf: { 
    label: 'Sharf Express',  
    emoji: '🟣', 
    color: 'text-purple-600 dark:text-purple-400',  
    bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'  
  },
  Urbano: { 
    label: 'Urbano Envíos',  
    emoji: '🟢', 
    color: 'text-green-600 dark:text-green-400', 
    bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
  },
};
const getMeta = (courier: string) => {
  const key = Object.keys(COURIER_META).find(k => k.toLowerCase() === courier.toLowerCase());
  return key ? COURIER_META[key] : { label: courier, emoji: '📬', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700', tiempo: '2-5 días' };
};

interface Props { quotes: LaravelCalcResponse }

export default function CourierSelector({ quotes }: Props) {
  const setSelectedCourier     = useCheckoutStore(s => s.setSelectedCourier);
  const setOrderData           = useCheckoutStore(s => s.setOrderData);
  const selectedCourier        = useCheckoutStore(s => s.selectedCourier);
  const tipoEntrega            = useCheckoutStore(s => s.selectedTipoEntrega);
  const setSelectedTipoEntrega = useCheckoutStore(s => s.setSelectedTipoEntrega);

  const tiendas = quotes.tiendas?.filter(t => !t.error) ?? [];
  const precioPorCourier: Record<string, number> = {};

  for (const tienda of tiendas) {
    for (const op of tienda.logistica?.opciones ?? []) {
      const p = getPrecioFinal(op, isSharf(op.courier) ? 'domicilio' : tipoEntrega);
      if (p == null) continue;
      precioPorCourier[op.courier] = (precioPorCourier[op.courier] ?? 0) + p;
    }
  }

  const couriersDisponibles = Object.keys(precioPorCourier);

  useEffect(() => {
    if (!selectedCourier && couriersDisponibles.length > 0) {
      const barato = couriersDisponibles.reduce((a, b) =>
        (precioPorCourier[a] ?? Infinity) < (precioPorCourier[b] ?? Infinity) ? a : b
      );
      setSelectedCourier(barato);
      setOrderData({ deliveryCost: precioPorCourier[barato] ?? 0 });
    }
  }, [couriersDisponibles.join(',')]);

  function handleCourier(courier: string) {
    setSelectedCourier(courier || null);
    setOrderData({ deliveryCost: precioPorCourier[courier] ?? 0 });
  }

  function handleTipo(tipo: TipoEntrega) {
    setSelectedTipoEntrega(tipo);
    if (selectedCourier) {
    }
  }

  if (couriersDisponibles.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
        ⚠️ Sin couriers disponibles para este destino.
      </div>
    );
  }

  const totalTiendas = tiendas.length;
  const totalCajas   = tiendas.reduce((s, t) => s + (t.cajas?.cantidad ?? 0), 0);
  const totalPeso    = tiendas.reduce((s, t) => s + getPesoTotal(t), 0);

  return (
    <div className="space-y-4">

      {/* ── 1. TIPO DE ENTREGA — siempre arriba ────────────────────────── */}
      <div className="rounded-2xl border-2 border-sky-100 dark:border-sky-900/50 bg-white dark:bg-gray-900/40 p-4">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Tipo de entrega
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'domicilio' as TipoEntrega, label: 'A domicilio', emoji: '🏠', desc: 'Te lo llevamos' },
            { key: 'agencia'   as TipoEntrega, label: 'En agencia',  emoji: '🏢', desc: 'Recoge tú' },
          ] as const).map(({ key, label, emoji, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTipo(key)}
              className={[
                'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition text-center',
                tipoEntrega === key
                  ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-sky-300',
              ].join(' ')}
            >
              <span className="text-xl">{emoji}</span>
              <span className="font-bold text-sm">{label}</span>
              <span className={`text-[11px] ${tipoEntrega === key ? 'text-sky-100' : 'text-gray-400'}`}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. RESUMEN DE EMPAQUE ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
        <Package className="w-4 h-4 text-teal-500 shrink-0" />
        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{totalCajas} caja{totalCajas !== 1 ? 's' : ''}</span>
          {' '}desde {totalTiendas} tienda{totalTiendas !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <Weight className="w-3.5 h-3.5" />
          <span className="font-mono font-bold">{totalPeso.toFixed(2)} kg</span>
        </div>
      </div>

      {/* ── 3. SELECTOR DE COURIER ───────────────────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          🚚 Selecciona tu courier
        </label>
        <div className="relative">
          <select
            value={selectedCourier ?? ''}
            onChange={e => handleCourier(e.target.value)}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          >
            <option value="">— Elige un courier —</option>
            {couriersDisponibles.map(courier => {
              const meta  = getMeta(courier);
              const total = precioPorCourier[courier] ?? 0;
              const suffix = isSharf(courier) ? ' · Solo domicilio' : '';
              return (
                <option key={courier} value={courier}>
                  {meta.emoji} {meta.label}{suffix}  —  S/ {total.toFixed(2)}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Precios incluyen IGV de servicio (5%)
        </p>
      </div>
      {selectedCourier && tiendas.map(tienda => {
        const op       = tienda.logistica?.opciones?.find(o => o.courier === selectedCourier);
        const meta     = getMeta(selectedCourier);
        const isLocal  = tienda.logistica?.esLocal ?? false;
        const pesoT    = getPesoTotal(tienda);
        const sharfMode = isSharf(selectedCourier);
        const precioAg  = applyMarkup(op?.agencia?.precio  ?? op?.precio ?? null);
        const precioDom = applyMarkup(op?.domicilio?.precio ?? op?.precio ?? null);
        const precioFinal = getPrecioFinal(op ?? {} as CourierOption, tipoEntrega);

        return (
          <div key={tienda.tiendaId} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3 bg-gradient-to-r from-teal-50 to-sky-50 dark:from-gray-800 dark:to-teal-950/20 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">🏪 {tienda.tienda}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
  📍 {[tienda.origen?.departamento, tienda.origen?.provincia, tienda.origen?.distrito]
    .filter(Boolean).join(' › ')}
</p>
              </div>
              <div className="text-right shrink-0 ml-3 space-y-1">
                <p className="text-[11px] text-gray-400">{tienda.cajas?.resumen}</p>
                <div className="flex items-center gap-1 justify-end text-[11px] text-teal-600 dark:text-teal-400 font-mono">
                  <Weight className="w-3 h-3" />
                  {pesoT.toFixed(2)} kg
                </div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${isLocal ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'}`}>
                  {isLocal ? 'Local' : 'Interprovincial'}
                </span>
              </div>
            </div>

            {/* Opción del courier */}
            <div className="p-4">
              {op ? (
                <div className={`rounded-xl border p-4 space-y-3 ${meta.bg}`}>

                  {/* Courier + tiempo */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold text-sm ${meta.color}`}>{meta.emoji} {meta.label}</p>
                    </div>
                    <div className="text-right">
                      {precioFinal != null
                        ? <p className={`text-xl font-black font-mono ${meta.color}`}>S/ {precioFinal.toFixed(2)}</p>
                        : <p className="text-sm text-gray-400">No disponible</p>
                      }
                    </div>
                  </div>

                  {/* Agencias Shalom */}
                  {(op.agenciaOrigen || op.agenciaDestino) && (
  <div className="rounded-lg bg-white/60 dark:bg-gray-900/40 border border-white/80 dark:border-gray-700/50 px-3 py-2 space-y-1.5">
    {op.agenciaOrigen && (
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <span className="font-semibold">📤 Recojo en:</span>{' '}
        {op.agenciaOrigen.nombre ?? op.agenciaOrigen.display}
        {op.agenciaOrigen.direccion && (
          <span className="text-gray-400"> · {op.agenciaOrigen.direccion}</span>
        )}
      </p>
    )}
    {op.agenciaDestino && (
      <p className="text-xs text-gray-600 dark:text-gray-400">
        <span className="font-semibold">📥 Entrega en:</span>{' '}
        {op.agenciaDestino.nombre ?? op.agenciaDestino.display}
        {op.agenciaDestino.direccion && (
          <span className="text-gray-400"> · {op.agenciaDestino.direccion}</span>
        )}
      </p>
    )}
  </div>
)}

                  {sharfMode ? (
                    <div className="rounded-lg px-3 py-2.5 bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Solo domicilio</p>
                          <p className="text-[10px] text-gray-400">Puerta a puerta</p>
                        </div>
                      </div>
                      {precioDom != null && (
                        <p className={`text-base font-black font-mono ${meta.color}`}>S/ {precioDom.toFixed(2)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Agencia */}
                      <div className={`rounded-lg px-3 py-2 text-center border ${op.agencia?.disponible ? 'bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700' : 'opacity-40 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <Store className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Agencia</p>
                        {op.agencia?.disponible && precioAg != null
                          ? <p className={`text-base font-black font-mono ${meta.color}`}>S/ {precioAg.toFixed(2)}</p>
                          : <p className="text-sm text-gray-400">—</p>
                        }
                      </div>
                      {/* Domicilio */}
                      <div className={`rounded-lg px-3 py-2 text-center border ${op.domicilio?.disponible ? 'bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700' : 'opacity-40 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                        <Home className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Domicilio</p>
                        {op.domicilio?.disponible && precioDom != null
                          ? <p className={`text-base font-black font-mono ${meta.color}`}>S/ {precioDom.toFixed(2)}</p>
                          : <p className="text-sm text-gray-400">No disponible</p>
                        }
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-3 text-sm text-gray-400 flex items-center gap-2">
                  ⚠️ {selectedCourier} no tiene cobertura desde {tienda.origen?.display}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── 5. TOTAL DE ENVÍO ────────────────────────────────────────── */}
      {selectedCourier && precioPorCourier[selectedCourier] != null && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40">
          <div>
            <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
              Total envío con {getMeta(selectedCourier).label}
            </p>
            <p className="text-[11px] text-teal-600/70 dark:text-teal-500">
              {tipoEntrega === 'domicilio' ? '🏠 A domicilio' : '🏢 En agencia'} · {totalPeso.toFixed(2)} kg
            </p>
          </div>
          <p className="font-black font-mono text-xl text-teal-700 dark:text-teal-400">
            S/ {precioPorCourier[selectedCourier].toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}