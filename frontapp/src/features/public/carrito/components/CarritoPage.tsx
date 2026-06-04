'use client';

import { useEffect } from "react";
import {
  Loader2,
  ShoppingBag,
  Sparkles,
  Info,
} from "lucide-react";
import { useCarritoStore } from "@/store/carritoStore";
import { useCarritoCatalog } from '../hooks/useCarritoCatalog';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import CartDrawer from './drawer/CartDrawer';
import CartPopup from './CartPopup';
import ProductDetailModal from './modals/ProductDetailModal';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';
import AuthRequiredModal from '@/shared/components/AuthRequiredModal';
import { useAuthStore } from '@/shared/hooks/useAuthstore';

export default function CarritoPage() {
  const { isLoading, isError } = useCarritoCatalog();
  const { validate, showCheckoutModal, setShowCheckoutModal } = useAuthStore();
  useEffect(() => {
    validate();
  }, [validate]);

  const products = useCarritoStore((s) => s.products);
  const cartItems = useCarritoStore((s) => s.cartItems);
  const openCart = useCarritoStore((s) => s.openCart);
  const openDetailModal = useCarritoStore((s) => s.openDetailModal);
  const updateItemQuantity = useCarritoStore((s) => s.updateQuantity);
  const removeFromCart = useCarritoStore((s) => s.removeFromCart);
  const openPopup = useCarritoStore((s) => s.openPopup);

  const { addToCart: addToCartApi } = useAddToCart();

  const handleAdd = async (id: number | string) => {
    await addToCartApi(Number(id), 1);
    openPopup();
  };

  const handleView = (id: number | string) => {
    openDetailModal(id);
  };

  const handleIncrease = (id: number | string) => {
    const item = cartItems.find((i) => String(i.id) === String(id));
    if (!item) return;
    updateItemQuantity(Number(id), Number(item.cantidad ?? 1) + 1);
  };

  const handleDecrease = (id: number | string) => {
    const item = cartItems.find((i) => String(i.id) === String(id));
    if (!item) return;
    const qty = Number(item.cantidad ?? 1);
    if (qty <= 1) removeFromCart(Number(id));
    else updateItemQuantity(Number(id), qty - 1);
  };

  const handleDelete = (id: number | string) => removeFromCart(Number(id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div
          className="rounded-3xl px-6 py-6 md:px-8 md:py-7 mb-7"
          style={{
            background:
              'radial-gradient(900px 260px at 35% -10%, rgba(35,180,254,.16), transparent 60%), radial-gradient(900px 260px at 95% 0%, rgba(132,204,22,.14), transparent 55%), linear-gradient(90deg, rgba(35,180,254,.08), rgba(132,204,22,.08))',
            border: '1px solid rgba(35,180,254,.16)',
          }}
        >
          <FilterBar />

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-[var(--text-primary)] bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm px-3 py-1 rounded-full">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                Catálogo Lyrium
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl text-slate-800 dark:text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-sky-500" /> Productos
              </h2>
              <p className="text-sm text-slate-400 dark:text-[var(--text-muted)] mt-1 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-sky-500" />
                Busca, compara y añade al carrito en un clic.
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            <span className="text-sm">Cargando productos...</span>
          </div>
        )}

        {!isLoading && !isError && (
          <ProductGrid onAdd={handleAdd} onView={handleView} />
        )}
      </div>

      <CartDrawer />
      <CartPopup />
      <ProductDetailModal
        onAdd={handleAdd}
        onOpenCart={openCart}
        productsCache={products}
      />
      <AuthRequiredModal
        open={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />
    </div>
  );
}
