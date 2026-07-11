'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, ExternalLink, Pause, Play } from 'lucide-react';
import { Producto } from '@/types/public';
import { useCarritoStore } from '@/store/carritoStore';

interface ProductSliderProps {
  productos: Producto[];
  titulo: string;
  bannerImage: string;
}

function CategoryCard({ producto, onAddToCart, onQuickView }: { 
  producto: Producto; 
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {
  return (
    <div className="cat-card flex-shrink-0 w-[210px] bg-[var(--turquesaClaro-100)] dark:bg-[var(--bg-secondary)]/92 rounded-[14px] overflow-hidden text-center shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.3)] border border-[var(--turquesa-100)] dark:border-[var(--border-subtle)]/50 mr-5 transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_15px_35px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
      {/* Image wrapper with hover actions */}
      <div className="relative overflow-hidden w-full aspect-square bg-white dark:bg-[var(--bg-muted)]">
        <Link href={`/producto/${producto.slug}`}>
          <Image
            src={producto.imagen || '/img/no-image.png'}
            alt={producto.titulo}
            fill
            sizes="210px"
            className="object-contain md:object-cover transition-transform duration-500 hover:scale-[1.08]"
            draggable={false}
          />
        </Link>
 
         
        <div className="absolute bottom-0 left-0 w-full h-[44px] flex bg-[var(--brand-green)] dark:bg-[var(--brand-green)] translate-y-full transition-transform duration-300 cat-actions md:group-hover:translate-y-0">
          <button
            onClick={() => onAddToCart(producto)}
            className="flex-1 flex items-center justify-center text-white border-r border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Agregar al carrito"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onQuickView(producto)}
            className="flex-1 flex items-center justify-center text-white border-r border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Vista rápida"
            aria-label="Vista rápida"
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <Link
            href={`/producto/${producto.slug}`}
            className="flex-1 flex items-center justify-center text-white hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Ver producto"
            aria-label="Ver producto"
          >
            <ExternalLink className="w-[18px] h-[18px]" />
          </Link>
        </div>
      </div>
 
      {/* Product info */}
      <div className="py-3 px-3.5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
          {producto.titulo}
        </h3>
        <p className="text-[15px] font-bold text-[var(--brand-green)] dark:text-[var(--text-primary)]">
          S/ {producto.precio.toFixed(2)}
        </p>
        <p className="text-amber-400 text-[13px] mt-1">
          {producto.estrellas || '★★★★★'}
        </p>
      </div>
    </div>
  );
}

export default function ProductSlider({ productos, titulo, bannerImage }: ProductSliderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const openCart = useCarritoStore((s) => s.openCart);
  const openDetailModal = useCarritoStore((s) => s.openDetailModal);
  const addToCart = useCarritoStore((s) => s.addToCart);

  const handleAddToCart = (product: Producto) => {
    addToCart(product);
    openCart();
  };

  const handleQuickView = (product: Producto) => {
    openDetailModal(String(product.id));
  };

  // Responsive items per view
  useEffect(() => {
    setIsMounted(true);
    const update = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalPages = Math.max(1, Math.ceil(productos.length / itemsPerView));

  // Auto-advance effect
  const nextPage = useCallback(() => {
    setCurrentPage((c) => (c >= totalPages - 1 ? 0 : c + 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((c) => (c <= 0 ? totalPages - 1 : c - 1));
  }, [totalPages]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextPage, 6000);
    return () => clearInterval(timer);
  }, [nextPage, isPaused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevPage(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextPage(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsPaused((p) => !p); }
  };

  // Calculate the translateX for the track
  const cardWidth = 230; // 210px card + 20px margin
  const translateX = currentPage * itemsPerView * cardWidth;

  if (productos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 !mt-12">
      <h2 className="text-[1.4rem] font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-5">
        {titulo}
      </h2>

      {/* Split layout: banner left + carousel right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-8 items-center mb-10">
        {/* Left banner */}
        <div className="rounded-[18px] overflow-hidden border border-slate-200 dark:border-[var(--border-subtle)]/50">
          <Image
            src={bannerImage}
            alt={titulo}
            width={600}
            height={500}
            className="w-full block"
            draggable={false}
          />
        </div>

        {/* Right carousel */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={titulo}
          tabIndex={totalPages > 1 ? 0 : undefined}
          onKeyDown={handleKeyDown}
          className="overflow-hidden relative p-4 -m-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-[18px]"
        >
          <div
            className="flex will-change-transform transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)]"
            style={
              isMounted
                ? { transform: `translateX(-${translateX}px)` }
                : {}
            }
          >
            {productos.map((producto) => (
              <div key={producto.id} className="group snap-start">
                <CategoryCard producto={producto} onAddToCart={handleAddToCart} onQuickView={handleQuickView} />
              </div>
            ))}
          </div>

          {/* Dot navigation + pausa */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={`page-${i}`}
                    onClick={() => setCurrentPage(i)}
                    aria-current={i === currentPage}
                    className={`h-[9px] rounded-full border-none cursor-pointer transition-all duration-200 ${i === currentPage
                        ? 'w-[22px] bg-indigo-500'
                        : 'w-[9px] bg-slate-300'
                      }`}
                    aria-label={`Página ${i + 1} de ${totalPages}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                aria-pressed={isPaused}
                aria-label={isPaused ? 'Reanudar carrusel automático' : 'Pausar carrusel automático'}
                className="text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}