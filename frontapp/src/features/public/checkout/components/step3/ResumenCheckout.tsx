'use client';
import { Package, Weight, Truck, Store, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { TiendaLogistica, CourierOption, TipoEntrega } from '@/store/checkoutStore';

const MARKUP = 1.05;
const applyMarkup = (p: number | null | undefined): number | null =>
  p == null ? null : Math.ceil(p * MARKUP * 100) / 100;

const isSharf = (courier: string) =>
  ['sharf', 'sharf express'].includes(courier.toLowerCase());

const tieneDomicilio = (op: CourierOption | undefined) =>
  !!op && (isSharf(op.courier) || !!op.domicilio?.disponible);

function getPrecioFinal(op: CourierOption | undefined, tipo: TipoEntrega): number | null {
  if (!op) return null;
  if (isSharf(op.courier)) {
    return applyMarkup(op.agencia?.precio ?? op.domicilio?.precio ?? op.precio ?? null);
  }
  if (tipo === 'agencia') {
    if (op.agencia?.disponible && op.agencia.precio != null) return applyMarkup(op.agencia.precio);
    return op.precio != null ? applyMarkup(op.precio) : null;
  }
  if (op.domicilio?.disponible && op.domicilio.precio != null) return applyMarkup(op.domicilio.precio);
  if (op.agencia?.disponible && op.agencia.precio != null) return applyMarkup(op.agencia.precio);
  return op.precio != null ? applyMarkup(op.precio) : null;
}

const getPesoTienda = (t: TiendaLogistica) =>
  (t.cajas?.detalle ?? []).reduce((s, c) => s + (c.pesoFacturable ?? 0), 0);

const Divider = () => <div className="h-px bg-gray-100 dark:bg-gray-800" />;

export default function ResumenCheckout() {
  const cartItems       = useCheckoutStore(s => s.cartItems);
  const shippingQuotes  = useCheckoutStore(s => s.shippingQuotes);
  const selectedCourier = useCheckoutStore(s => s.selectedCourier);
  const tipoEntrega     = useCheckoutStore(s => s.selectedTipoEntrega);
  const deliveryMethod  = useCheckoutStore(s => s.orderData.deliveryMethod);
  const selectedBranchId = useCheckoutStore(s => s.orderData.selectedBranchId);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const selectedItems  = cartItems.filter(i => i.selected);
  const productItems   = selectedItems.filter(i => i.id > 0);
  const serviceItems   = selectedItems.filter(i => i.id <= 0);
  const serviceTotal   = serviceItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Retiro en Tienda: resumen simplificado sin envío ────────────────────
  if (deliveryMethod === 'pickup') {
    if (productItems.length === 0 && serviceItems.length === 0) return null;

    const grandTotalProductos = productItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const grandTotal = grandTotalProductos + serviceTotal;

    // Agrupar productos por tienda
    const storeIds = [...new Set(productItems.map(i => i.storeId))];
    const tiendaRows = storeIds.map(storeId => {
      const items = productItems.filter(i => i.storeId === storeId);
      const storeName = items[0]?.storeName ?? `Tienda #${storeId}`;
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      return { storeId, storeName, items, subtotal };
    });

    return (
      <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/40">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* Por tienda */}
          {tiendaRows.map(({ storeId, storeName, items, subtotal }) => {
            const isOpen = expanded.has(storeId);
            return (
              <div key={storeId} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(storeId)}
                  className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Store className="w-4 h-4 text-teal-500 dark:text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {storeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm font-bold text-sky-600 dark:text-emerald-400">
                      S/ {subtotal.toFixed(2)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-1 pt-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="truncate max-w-[160px]">
                            {item.name}
                            <span className="ml-1 text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="font-mono shrink-0">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <Store className="w-3.5 h-3.5" />
                      <span className="font-medium">Retiro en tienda — sin costo de envío</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Servicios */}
          {serviceItems.length > 0 && (
            <div className="px-5 py-3.5 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-4 h-4 text-teal-500 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">Servicios</span>
              </div>
              {serviceItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pl-6">
                  <span className="truncate max-w-[220px]">{item.name}</span>
                  <span className="font-mono shrink-0">S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* TOTALES */}
          <div className="px-5 py-4 space-y-2 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal productos</span>
              <span className="font-mono">S/ {grandTotalProductos.toFixed(2)}</span>
            </div>
            {serviceItems.length > 0 && (
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal servicios</span>
                <span className="font-mono">S/ {serviceTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span>Envío</span>
              <span className="font-mono font-bold">S/ 0.00 (Retiro)</span>
            </div>
            <Divider />
            <div className="flex justify-between items-center pt-1">
              <span className="font-black text-base text-gray-900 dark:text-white">TOTAL GENERAL</span>
              <span className="font-black font-mono text-2xl text-sky-600 dark:text-emerald-400">
                S/ {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Envío a domicilio: flujo original ──────────────────────────────────
  if (!shippingQuotes || !selectedCourier) return null;

  const tiendas = shippingQuotes.tiendas?.filter(t => !t.error) ?? [];

  if (tiendas.length === 0 || selectedItems.length === 0) return null;
  let grandTotalProductos = 0;
  let grandTotalEnvio     = 0;

  const tiendaRows = tiendas.map(tienda => {
    const op   = tienda.logistica?.opciones?.find(o => o.courier === selectedCourier);
    const sinDomicilioAqui = !isSharf(selectedCourier) && tipoEntrega === 'domicilio' && !tieneDomicilio(op);
    const tipoEfectivo: TipoEntrega = sinDomicilioAqui ? 'agencia' : tipoEntrega;
    const precioEnvio = getPrecioFinal(op, tipoEfectivo) ?? 0;
    const items = selectedItems.filter(i => i.storeId === tienda.tiendaId);
    const subtotalProductos = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const pesoTotal  = getPesoTienda(tienda);
    const totalTienda = subtotalProductos + precioEnvio;

    grandTotalProductos += subtotalProductos;
    grandTotalEnvio     += precioEnvio;

    return { tienda, items, subtotalProductos, precioEnvio, totalTienda, pesoTotal, op, tipoEfectivo, sinDomicilioAqui };
  });

  const grandTotal = grandTotalProductos + grandTotalEnvio + serviceTotal;

  return (
    <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/40">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {/* ── Por tienda ───────────────────────────────────────────────── */}
        {tiendaRows.map(({ tienda, items, subtotalProductos, precioEnvio, totalTienda, pesoTotal, tipoEfectivo }) => {
          const isOpen = expanded.has(tienda.tiendaId);
          return (
            <div key={tienda.tiendaId} className="overflow-hidden">

              {/* Cabecera clicable */}
              <button
                type="button"
                onClick={() => toggle(tienda.tiendaId)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Store className="w-4 h-4 text-teal-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {tienda.tienda}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-gray-400 shrink-0">
                    📍 {tienda.origen?.display}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-sm font-bold text-sky-600 dark:text-emerald-400">
                    S/ {totalTienda.toFixed(2)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Detalle desplegable */}
              {isOpen && (
                <div className="px-5 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800">

                  {/* Productos */}
                  <div className="space-y-1 pt-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate max-w-[160px]">
                          {item.name}
                          <span className="ml-1 text-gray-400">×{item.quantity}</span>
                        </span>
                        <span className="font-mono shrink-0">
                          S/ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cajas + peso */}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
                    <Package className="w-3.5 h-3.5 text-teal-500 dark:text-emerald-400 shrink-0" />
                    <span>{tienda.cajas?.resumen}</span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <Weight className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono">{pesoTotal.toFixed(2)} kg</span>
                  </div>

                  {/* Courier elegido */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">{selectedCourier}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>
                        {isSharf(selectedCourier)
                          ? 'Puerta a puerta'
                          : tipoEfectivo === 'domicilio' ? '🏠 A domicilio' : '🏢 En agencia'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sky-600 dark:text-emerald-400">
                      + S/ {precioEnvio.toFixed(2)}
                    </span>
                  </div>

                  {/* Subtotales tienda */}
                  <div className="pt-2 space-y-1 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Subtotal productos</span>
                      <span className="font-mono">S/ {subtotalProductos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Envío</span>
                      <span className="font-mono">S/ {precioEnvio.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {/* ── Servicios (sin envío) ────────────────────────────────────── */}
        {serviceItems.length > 0 && (
          <div className="px-5 py-3.5 space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-4 h-4 text-teal-500 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Servicios</span>
            </div>
            {serviceItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pl-6">
                <span className="truncate max-w-[220px]">{item.name}</span>
                <span className="font-mono shrink-0">S/ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── TOTALES GENERALES ─────────────────────────────────────── */}
        <div className="px-5 py-4 space-y-2 bg-gray-50 dark:bg-gray-800/40">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal productos</span>
            <span className="font-mono">S/ {grandTotalProductos.toFixed(2)}</span>
          </div>
          {serviceItems.length > 0 && (
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal servicios</span>
              <span className="font-mono">S/ {serviceTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Total envío ({selectedCourier})</span>
            <span className="font-mono">S/ {grandTotalEnvio.toFixed(2)}</span>
          </div>
          <Divider />
          <div className="flex justify-between items-center pt-1">
            <span className="font-black text-base text-gray-900 dark:text-white">TOTAL GENERAL</span>
            <span className="font-black font-mono text-2xl text-sky-600 dark:text-emerald-400">
              S/ {grandTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 text-right">
            Incluye 5% de servicio de envío
          </p>
        </div>
      </div>

    </div>
  );
}
