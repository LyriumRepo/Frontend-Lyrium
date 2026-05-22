'use client';

/**
 * useAddToCart.ts — R17: botón "Agregar al carrito" en detalle de producto
 *
 * Conecta la UI del producto con:
 *   1. cartApi.addItem()  → Laravel CartController
 *   2. useCarritoStore.openCart()  → abre el drawer
 *
 * Uso:
 *   const { addToCart, loading, addedToCart } = useAddToCart();
 *   <button onClick={() => addToCart(product.id, quantity)} />
 *
 * Ubicación: src/features/public/product/hooks/useAddToCart.ts
 */

import { useState, useCallback } from 'react';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { useCarritoStore } from '@/store/carritoStore';

interface UseAddToCartReturn {
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  loading: boolean;
  addedToCart: boolean;
  error: string | null;
}

export function useAddToCart(): UseAddToCartReturn {
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCart = useCarritoStore((s) => s.openCart);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      setLoading(true);
      setError(null);

      try {
        await cartApi.addItem(productId, quantity);
        setAddedToCart(true);
        openCart(); // Abre el drawer para que el usuario vea el carrito

        // Resetear el estado visual tras 2 s
        setTimeout(() => setAddedToCart(false), 2000);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : 'Error al agregar al carrito'
        );
      } finally {
        setLoading(false);
      }
    },
    [openCart]
  );

  return { addToCart, loading, addedToCart, error };
}