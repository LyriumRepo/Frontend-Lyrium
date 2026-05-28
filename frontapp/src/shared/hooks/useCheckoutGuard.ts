// src/shared/hooks/useCheckoutGuard.ts
'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './useAuthstore';

export function useCheckoutGuard() {
  const router = useRouter();
  const { validate, invalidateCache, showCheckoutModal, setShowCheckoutModal } =
    useAuthStore();

  const goToCheckout = async () => {
    // Descarta el cache para releer el token fresco
    invalidateCache();
    await validate();

    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      setShowCheckoutModal(true);
    }
  };

  return {
    goToCheckout,
    showAuthModal: showCheckoutModal,
    setShowAuthModal: setShowCheckoutModal,
  };
}
