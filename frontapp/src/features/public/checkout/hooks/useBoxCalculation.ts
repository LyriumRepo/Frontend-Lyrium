'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useCheckoutStore }               from '@/store/checkoutStore';
import type { TiendaBoxResult }           from '@/store/checkoutStore';
import { LARAVEL_API_URL }               from '@/shared/lib/config/flags';

export function useBoxCalculation() {
  const cartItems         = useCheckoutStore((s) => s.cartItems);
  const setBoxCalculation = useCheckoutStore((s) => s.setBoxCalculation);
  const setLoadingBox     = useCheckoutStore((s) => s.setLoadingBox);
  const setBoxError       = useCheckoutStore((s) => s.setBoxError);
  const boxCalculation    = useCheckoutStore((s) => s.boxCalculation);
  const isLoadingBox      = useCheckoutStore((s) => s.isLoadingBox);
  const boxError          = useCheckoutStore((s) => s.boxError);
  const abortRef = useRef<AbortController | null>(null);

  const calcularCajas = useCallback(async () => {
    // Solo productos físicos (id > 0) necesitan caja/empaque; los servicios (id <= 0) se excluyen.
    const selectedItems = cartItems.filter((i) => i.selected && i.id > 0);
    if (selectedItems.length === 0) return;

    const grupos = new Map<number, {
      store_id:   number;
      store_name: string;
      store_slug?: string;
      origen:     { departamento: string; provincia: string; distrito: string };
      productos:  Array<{ nombre: string; cantidad: number; peso: number; largo: number; ancho: number; alto: number; precio: number; product_id?: number | null }>;
    }>();

    for (const item of selectedItems) {
      const sid = item.storeId ?? 0;
      if (!grupos.has(sid)) {
        grupos.set(sid, {
          store_id:   sid,
          store_name: item.storeName  ?? 'Tienda',
          store_slug: item.storeSlug,
          origen: item.origen ?? { departamento: 'LA LIBERTAD', provincia: 'TRUJILLO', distrito: 'TRUJILLO' },
          productos: [],
        });
      }
      grupos.get(sid)!.productos.push({
        nombre:     item.name,
        cantidad:   item.quantity,
        peso:       item.peso   ?? 0.5,
        largo:      item.largo  ?? 30,
        ancho:      item.ancho  ?? 20,
        alto:       item.alto   ?? 15,
        precio:     item.price  ?? 0,
        product_id: (item.id && Number(item.id) > 0) ? Number(item.id) : null,
      });
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoadingBox(true);
    setBoxError(null);

    try {
      const resultados = await Promise.all(
        Array.from(grupos.values()).map(async (grupo): Promise<TiendaBoxResult> => {
          try {
            const res = await fetch(`${LARAVEL_API_URL}/logistics/calcular-caja`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              signal:  abortRef.current!.signal,
              body: JSON.stringify({
                productos: grupo.productos,
              }),
            });

            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              throw new Error(body.error ?? `HTTP ${res.status}`);
            }

            const data = await res.json();
            if (!data.success) throw new Error(data.error ?? 'Respuesta inválida');

            return {
              store_id:   grupo.store_id,
              store_name: grupo.store_name,
              store_slug: grupo.store_slug,
              origen:     grupo.origen,
              productos:  grupo.productos.map((p) => ({
                nombre: p.nombre, cantidad: p.cantidad, peso: p.peso, precio: p.precio,
              })),
              caja:       data.caja       ?? '',
              cajas:      data.cajas      ?? [],
              eficiencia: data.eficiencia ?? 1,
            };
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') throw err;
            return {
              store_id:   grupo.store_id,
              store_name: grupo.store_name,
              store_slug: grupo.store_slug,
              origen:     grupo.origen,
              productos:  grupo.productos.map((p) => ({
                nombre: p.nombre, cantidad: p.cantidad, peso: p.peso, precio: p.precio,
              })),
              caja: '', cajas: [], eficiencia: 0,
              error: err instanceof Error ? err.message : 'Error desconocido',
            };
          }
        })
      );

      setBoxCalculation(resultados);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Error calculando cajas';
      setBoxError(msg);
    } finally {
      setLoadingBox(false);
    }
  }, [cartItems, setBoxCalculation, setLoadingBox, setBoxError]);

  const cartKey = cartItems.filter((i) => i.selected && i.id > 0).map((i) => `${i.id}:${i.quantity}`).sort().join('|');
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (cartKey === prevKeyRef.current) return;
    prevKeyRef.current = cartKey;
    if (cartKey) { calcularCajas(); } else { setBoxCalculation(null); }
  }, [cartKey]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return { boxCalculation, isLoadingBox, boxError, recalcular: calcularCajas };
}
