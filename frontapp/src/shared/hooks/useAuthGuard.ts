'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useCarritoStore } from '@/store/carritoStore';
import { Producto } from '@/types/public';

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const addToCart = useCarritoStore((s) => s.addToCart);
  const openCart = useCarritoStore((s) => s.openCart);

  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    callback();
  };

  const addToCartProtected = (producto: Producto, cantidad = 1) => {
    requireAuth(() => {
      for (let i = 0; i < cantidad; i++) {
        addToCart(producto);
      }
      openCart();
    });
  };

  const proceedToCheckoutProtected = () => {
    requireAuth(() => {
      router.push('/checkout');
    });
  };

  return { addToCartProtected, proceedToCheckoutProtected, requireAuth, isAuthenticated };
}
