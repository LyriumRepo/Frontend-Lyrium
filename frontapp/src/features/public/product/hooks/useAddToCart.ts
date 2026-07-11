// useAddToCart.ts
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

  const openPopup = useCarritoStore((s) => s.openPopup); // ← antes era openCart
  const setLastAddedProductId = useCarritoStore((s) => s.setLastAddedProductId);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      setLoading(true);
      setError(null);
      try {
        await cartApi.addItem(productId, quantity);
        setAddedToCart(true);
        setLastAddedProductId(productId);
        openPopup(); // ← abre popup, no drawer
        setTimeout(() => setAddedToCart(false), 2000);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : 'Error al agregar al carrito',
        );
      } finally {
        setLoading(false);
      }
    },
    [openPopup, setLastAddedProductId],
  );

  return { addToCart, loading, addedToCart, error };
}
