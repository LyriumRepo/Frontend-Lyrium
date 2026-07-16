'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/lib/context/AuthContext';

export function useCheckoutGuard() {
  const router = useRouter();
  const { isAuthenticated, showCheckoutModal, setShowCheckoutModal, invalidateTokenCache } =
    useAuth();

  const goToCheckout = async () => {
    // Forzar revalidación del token
    invalidateTokenCache();

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
