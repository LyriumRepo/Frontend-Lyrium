'use client';

import { ShoppingBag, Sparkles, Info, ShoppingCart } from 'lucide-react';

import { useCarritoStore } from '@/store/carritoStore';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import CartDrawer from './drawer/CartDrawer';
import ProductDetailModal from './modals/ProductDetailModal';

export default function CarritoPage() {
    const products = useCarritoStore((s) => s.products);
    const openCart = useCarritoStore((s) => s.openCart);
    const openDetailModal = useCarritoStore((s) => s.openDetailModal);
    const cartItems = useCarritoStore((s) => s.cartItems);

    // Handlers — sin backend por ahora
    const handleAdd = () => { openCart(); };
    const handleView = (id: number | string) => { openDetailModal(id); };
    const handleIncrease = () => { };
    const handleDecrease = () => { };
    const handleDelete = () => { };

    const cartCount = cartItems.reduce((a, i) => a + Number(i.cantidad ?? 0), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* ── Hero / Filtros ─────────────────────────────────────── */}
                <div className="rounded-3xl px-6 py-6 md:px-8 md:py-7 mb-7"
                    style={{
                        background: 'radial-gradient(900px 260px at 35% -10%, rgba(35,180,254,.16), transparent 60%), radial-gradient(900px 260px at 95% 0%, rgba(132,204,22,.14), transparent 55%), linear-gradient(90deg, rgba(35,180,254,.08), rgba(132,204,22,.08))',
                        border: '1px solid rgba(35,180,254,.16)',
                    }}
                >
                    <FilterBar />

                    <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs text-slate-700 bg-white/85 border border-sky-100 backdrop-blur-sm px-3 py-1 rounded-full">
                                <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                                Catálogo Lyrium
                            </div>
                            <h2 className="mt-3 text-2xl md:text-3xl text-slate-800 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-7 h-7 text-sky-500" /> Productos
                            </h2>
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-sky-500" />
                                Busca, compara y añade al carrito en un clic.
                            </p>
                        </div>

                        {/* Cart button */}
                        <button
                            onClick={() => { openCart(); }}
                            className="relative self-start lg:self-center inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition shadow-lg shadow-sky-200/50"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Ver carrito
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black grid place-items-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Product Grid ───────────────────────────────────────── */}
                <ProductGrid onAdd={handleAdd} onView={handleView} />
            </div>

            {/* ── Drawer ─────────────────────────────────────────────────── */}
            <CartDrawer
                productsCache={products}
                onAdd={handleAdd}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onDelete={handleDelete}
                onViewProduct={handleView}
            />

            {/* ── Detail Modal ───────────────────────────────────────────── */}
            <ProductDetailModal
                onAdd={handleAdd}
                onOpenCart={openCart}
                productsCache={products}
            />
        </div>
    );
}
