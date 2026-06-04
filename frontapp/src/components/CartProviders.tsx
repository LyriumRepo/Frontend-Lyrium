// src/components/CartProviders.tsx
'use client';
import CartDrawer from '@/features/public/carrito/components/drawer/CartDrawer';
import CartPopup from '@/features/public/carrito/components/CartPopup';

export default function CartProviders() {
  return (
    <>
      <CartDrawer />
      <CartPopup />
    </>
  );
}
