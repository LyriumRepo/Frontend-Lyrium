'use client';
import { useCallback }        from 'react';
import { useCheckoutStore }   from '@/store/checkoutStore';
import type { TipoEntrega, LaravelCalcResponse } from '@/store/checkoutStore';
import { LARAVEL_API_URL }    from '@/shared/lib/config/flags';

function normalizeResponse(data: any): LaravelCalcResponse {
  if (data.tiendas) return data as LaravelCalcResponse;

  const tiendas = (data.vendedores ?? []).map((v: any) => ({
    tiendaId:   v.vendedorId ?? v.id,
    tienda:     v.vendedor   ?? v.tienda,
    tiendaSlug: v.vendedorSlug ?? null,
    origen:     v.origen,
    productos:  v.productos,
    cajas:      v.cajas,
    logistica:  v.logistica,
    error:      v.error,
  }));

  return {
    success:     data.success,
    destino:     data.destino,
    tipoEntrega: data.tipoEntrega,
    tiendas,
    resumen: {
      totalTiendas:   data.resumen?.totalVendedores ?? tiendas.length,
      totalProductos: data.resumen?.totalProductos  ?? 0,
      totalOpciones:  data.resumen?.totalOpciones   ?? 0,
      hayLocal:       data.resumen?.esLocal         ?? false,
    },
  };
}

export function useShippingQuotes() {
  const cartItems           = useCheckoutStore((s) => s.cartItems);
  const shippingData        = useCheckoutStore((s) => s.shippingData);
  const selectedTipoEntrega = useCheckoutStore((s) => s.selectedTipoEntrega);
  const setShippingQuotes   = useCheckoutStore((s) => s.setShippingQuotes);
  const setSelectedCourier  = useCheckoutStore((s) => s.setSelectedCourier);
  const setLoadingQuotes    = useCheckoutStore((s) => s.setLoadingQuotes);
  const setQuotesError      = useCheckoutStore((s) => s.setQuotesError);
  const setOrderData        = useCheckoutStore((s) => s.setOrderData);
  const isLoadingQuotes     = useCheckoutStore((s) => s.isLoadingQuotes);
  const quotesError         = useCheckoutStore((s) => s.quotesError);
  const shippingQuotes      = useCheckoutStore((s) => s.shippingQuotes);

  const fetchQuotes = useCallback(async (
    dept?: string, prov?: string, dist?: string, tipoEntrega?: TipoEntrega,
  ) => {
    const departamento = dept ?? shippingData.departamento;
    const provincia    = prov ?? shippingData.provincia;
    const distrito     = dist ?? shippingData.distrito;
    const tipo         = tipoEntrega ?? selectedTipoEntrega;

    if (!departamento || !provincia || !distrito) return;

    // Los service holds (id < 0) no necesitan cotización de envío
    const selectedItems = cartItems.filter((i) => i.selected && i.id > 0);
    if (!selectedItems.length) {
      // Carrito solo con servicios — no hay envío que cotizar
      setLoadingQuotes(false);
      return;
    }

    setLoadingQuotes(true);
    setQuotesError(null);
    setShippingQuotes(null);
    setSelectedCourier(null);

    const productos = selectedItems.map((item) => ({
      productId:  item.id,
      name:       item.name,
      quantity:   item.quantity,
      unitPrice:  item.price,
      peso:       item.peso   ?? 0.5,
      largo:      item.largo  ?? 30,
      ancho:      item.ancho  ?? 20,
      alto:       item.alto   ?? 15,
      store_id:   item.storeId ?? 0,
      store_name: item.storeName || `Tienda ${item.storeId ?? 0}`,
      store_slug: item.storeSlug ?? null,
      origen: item.origen ?? {
        departamento: 'LA LIBERTAD',
        provincia:    'TRUJILLO',
        distrito:     'TRUJILLO',
      },
    }));

    try {
      const res = await fetch(`${LARAVEL_API_URL}/logistics/calcular`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  AbortSignal.timeout(90_000),
        body: JSON.stringify({
          productos,
          destino:     { departamento, provincia, distrito },
          tipoEntrega: tipo,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const raw = await res.json();
      if (!raw.success) throw new Error(raw.error ?? 'Respuesta inválida del servidor.');

      const data = normalizeResponse(raw);
      setShippingQuotes(data);

      let bestCourier: string | null = null;
      let bestPrice = Infinity;

      for (const tienda of data.tiendas ?? []) {
        for (const opcion of tienda.logistica?.opciones ?? []) {
          const price = tipo === 'agencia'
            ? (opcion.agencia?.precio  ?? opcion.precio ?? Infinity)
            : (opcion.domicilio?.precio ?? opcion.precio ?? Infinity);

          if (typeof price === 'number' && price < bestPrice) {
            bestPrice   = price;
            bestCourier = opcion.courier;
          }
        }
      }

      if (bestCourier) {
        setSelectedCourier(bestCourier);
        setOrderData({ deliveryCost: bestPrice === Infinity ? 0 : bestPrice });
      }

    } catch (err) {
      const msg = err instanceof Error
        ? (err.name === 'TimeoutError' ? 'Tiempo agotado. Intenta nuevamente.' : err.message)
        : 'Error inesperado al cotizar.';
      setQuotesError(msg);
    } finally {
      setLoadingQuotes(false);
    }
  }, [
    shippingData, cartItems, selectedTipoEntrega,
    setShippingQuotes, setSelectedCourier,
    setLoadingQuotes, setQuotesError, setOrderData,
  ]);

  return { fetchQuotes, isLoadingQuotes, quotesError, shippingQuotes };
}
