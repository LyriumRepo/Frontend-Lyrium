'use client';

/**
 * useCartLoader.ts
 * Carga el carrito + service holds una sola vez al montar el checkout.
 * Solo debe usarse desde CheckoutPage (nunca desde componentes hijos que se monten/desmonten).
 */

import { useEffect } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { serviceRepository } from '@/shared/lib/api/serviRepository';
import type { CartItem } from '@/store/checkoutStore';

function getCartToken(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('cart_session_id');
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

export function useCartLoader() {
  const cartLoading = useCheckoutStore((s) => s.cartLoading);
  const cartError = useCheckoutStore((s) => s.cartError);
  const setCartLoading = useCheckoutStore((s) => s.setCartLoading);
  const setCartError = useCheckoutStore((s) => s.setCartError);
  const setCartItems = useCheckoutStore((s) => s.setCartItems);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setCartLoading(true);
        const [cart, holdsRes] = await Promise.all([
          cartApi.getCart(),
          (() => {
            const token = getCartToken();
            return token
              ? serviceRepository.getServiceHolds(token).catch(() => null)
              : Promise.resolve(null);
          })(),
        ]);

        if (cancelled) return;

        const checkoutItems: CartItem[] = [];

        if (cart.items && cart.items.length > 0) {
          for (const item of cart.items) {
            checkoutItems.push({
              id: item.productId,
              storeId:   item.store_id   ?? 0,
              storeName: item.store_name ?? '',
              storeSlug: item.store_slug ?? undefined,
              name: item.product.name,
              image: item.product.image ?? '',
              price: item.product.price,
              originalPrice: item.product.regular_price ?? item.product.price,
              quantity: item.quantity,
              selected: true,
              peso:  item.peso,
              largo: item.largo,
              ancho: item.ancho,
              alto:  item.alto,
              origen: item.origen,
            });
          }
        }

        if (holdsRes?.holds && holdsRes.holds.length > 0) {
          for (const hold of holdsRes.holds) {
            checkoutItems.push({
              id: -hold.id,
              storeId: 0,
              storeName: '',
              name: `${hold.service_name} — ${hold.specialist_name}`,
              image: hold.service_image ?? '',
              price: hold.service_price,
              originalPrice: hold.service_price,
              quantity: 1,
              selected: true,
              service_address: hold.service_address,
            });
          }
        }

        setCartItems(checkoutItems);
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando carrito en checkout:', err);
          setCartError('No se pudo cargar tu carrito. Intenta recargar la página.');
        }
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [setCartLoading, setCartError, setCartItems]);

  return { cartLoading, cartError };
}
