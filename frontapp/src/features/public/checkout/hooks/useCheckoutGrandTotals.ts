'use client';
import { useMemo } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { CourierOption, TipoEntrega } from '@/store/checkoutStore';

const MARKUP = 1.05;
const applyMarkup = (p: number | null | undefined): number | null =>
  p == null ? null : Math.ceil(p * MARKUP * 100) / 100;

const isSharf = (courier: string) =>
  ['sharf', 'sharf express'].includes(courier.toLowerCase());

function getPrecioFinal(
  op: CourierOption | undefined,
  tipo: TipoEntrega,
): number | null {
  if (!op) return null;
  if (isSharf(op.courier)) {
    return applyMarkup(
      op.agencia?.precio ?? op.domicilio?.precio ?? op.precio ?? null,
    );
  }
  if (tipo === 'agencia') {
    if (op.agencia?.disponible && op.agencia.precio != null)
      return applyMarkup(op.agencia.precio);
    return op.precio != null ? applyMarkup(op.precio) : null;
  }
  if (op.domicilio?.disponible && op.domicilio.precio != null)
    return applyMarkup(op.domicilio.precio);
  return op.precio != null ? applyMarkup(op.precio) : null;
}

export interface CheckoutGrandTotals {
  grandTotalProductos: number;
  grandTotalEnvio: number;  
  grandTotal: number;    
  isReady: boolean;      
}

export function useCheckoutGrandTotals(): CheckoutGrandTotals {
  const shippingQuotes  = useCheckoutStore(s => s.shippingQuotes);
  const selectedCourier = useCheckoutStore(s => s.selectedCourier);
  const tipoEntrega     = useCheckoutStore(s => s.selectedTipoEntrega);
  const cartItems       = useCheckoutStore(s => s.cartItems);

  return useMemo<CheckoutGrandTotals>(() => {
    const selectedItems = cartItems.filter(i => i.selected);
    // Convención del carrito: id > 0 = producto físico (necesita envío), id <= 0 = servicio (no).
    const productItems  = selectedItems.filter(i => i.id > 0);
    const serviceItems  = selectedItems.filter(i => i.id <= 0);
    const serviceTotal  = serviceItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // Carrito solo de servicios: no hay nada que enviar, no hay que esperar cotización de envío.
    if (productItems.length === 0) {
      return {
        grandTotalProductos: serviceTotal,
        grandTotalEnvio: 0,
        grandTotal: serviceTotal,
        isReady: selectedItems.length > 0,
      };
    }

    // Hay productos físicos: se necesita la cotización de envío antes de dar el total por listo.
    if (!shippingQuotes || !selectedCourier) {
      return { grandTotalProductos: serviceTotal, grandTotalEnvio: 0, grandTotal: serviceTotal, isReady: false };
    }

    const tiendas = shippingQuotes.tiendas?.filter(t => !t.error) ?? [];
    if (tiendas.length === 0) {
      return { grandTotalProductos: serviceTotal, grandTotalEnvio: 0, grandTotal: serviceTotal, isReady: false };
    }

    let grandTotalProductos = serviceTotal;
    let grandTotalEnvio     = 0;

    tiendas.forEach(tienda => {
      const opciones = tienda.logistica?.opciones ?? [];
      const op =
        opciones.find(o => o.courier === selectedCourier) ??
        opciones[0]; // fallback: courier más barato disponible para esta tienda
      const precioEnvio = getPrecioFinal(op, tipoEntrega) ?? 0;
      const items       = productItems.filter(i => i.storeId === tienda.tiendaId);
      grandTotalProductos += items.reduce((s, i) => s + i.price * i.quantity, 0);
      grandTotalEnvio     += precioEnvio;
    });

    return {
      grandTotalProductos,
      grandTotalEnvio,
      grandTotal: grandTotalProductos + grandTotalEnvio,
      isReady: true,
    };
  }, [shippingQuotes, selectedCourier, tipoEntrega, cartItems]);
}
