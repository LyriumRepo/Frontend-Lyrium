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
    const empty: CheckoutGrandTotals = {
      grandTotalProductos: 0,
      grandTotalEnvio: 0,
      grandTotal: 0,
      isReady: false,
    };

    if (!shippingQuotes || !selectedCourier) return empty;

    const tiendas       = shippingQuotes.tiendas?.filter(t => !t.error) ?? [];
    const selectedItems = cartItems.filter(i => i.selected);

    if (tiendas.length === 0 || selectedItems.length === 0) return empty;

    let grandTotalProductos = 0;
    let grandTotalEnvio     = 0;

    tiendas.forEach(tienda => {
      const op          = tienda.logistica?.opciones?.find(o => o.courier === selectedCourier);
      const precioEnvio = getPrecioFinal(op, tipoEntrega) ?? 0;
      const items       = selectedItems.filter(i => i.storeId === tienda.tiendaId);
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
