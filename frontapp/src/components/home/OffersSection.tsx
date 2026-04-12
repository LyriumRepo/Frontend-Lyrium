'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Eye, ExternalLink } from 'lucide-react';
import { Producto } from '@/types/public';
import { useCarritoStore } from '@/store/carritoStore';

interface OfferBlockProps {
  titulo: string;
  productos: Producto[];
  backgroundImage: string;
  linkText?: string;
}

function OfferCard({ producto, allProducts, onAddToCart, onQuickView }: { 
  producto: Producto; 
  allProducts: Producto[];
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {
  const [imgSrc, setImgSrc] = useState(producto.imagen || '/img/no-image.png');
  const [imgError, setImgError] = useState(false);

  const getFallbackImage = () => {
    const validImages = allProducts
      .filter(p => p.imagen && p.imagen !== producto.imagen && p.imagen !== '')
      .map(p => p.imagen);
    
    if (validImages.length > 0) {
      return validImages[Math.floor(Math.random() * validImages.length)];
    }
    return '/img/no-image.png';
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(getFallbackImage());
    }
  };

  return (
    <article className="oferta-card flex-shrink-0 snap-center w-[190px] md:w-[220px] bg-white/[0.92] dark:bg-[var(--bg-secondary)]/92 backdrop-blur-lg border border-white/40 dark:border-[var(--border-subtle)]/50 rounded-[20px] p-3 shadow-[0_10px_25px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] group transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_15px_35px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col items-center relative mr-[14px] md:mr-5">
      {/* Image wrapper — aspect-square, contain, con action bar al fondo */}
      <div className="oferta-image-wrapper relative w-full aspect-square rounded-[18px] overflow-hidden bg-white dark:bg-[var(--bg-muted)] flex items-center justify-center">
        <Link href={`/producto/${producto.slug}`}>
          <Image
            src={imgSrc}
            alt={producto.titulo}
            fill
            sizes="(max-width: 768px) 190px, 220px"
            className="object-contain p-[7.5%] transition-transform duration-500 group-hover:scale-[1.08]"
            draggable={false}
            onError={handleImageError}
          />
        </Link>

        {/* Tag */}
        {producto.tag && (
          <span className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md z-20">
            {producto.tag}
          </span>
        )}

        {/* Bottom action bar — slides up on hover, always visible on mobile */}
        <div className="oferta-actions absolute bottom-0 left-0 w-full h-[44px] flex bg-sky-500 dark:bg-[var(--brand-green)] transform translate-y-full group-hover:translate-y-0 md:translate-y-full md:group-hover:translate-y-0 max-md:!translate-y-0 transition-transform duration-300 z-10">
          <button
            onClick={() => onAddToCart(producto)}
            className="oferta-action-btn flex-1 flex items-center justify-center text-white border-r border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Agregar al carrito"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onQuickView(producto)}
            className="oferta-action-btn flex-1 flex items-center justify-center text-white border-r border-white/20 dark:border-white/15 hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Vista rápida"
            aria-label="Vista rápida"
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <Link
            href={`/producto/${producto.slug}`}
            className="oferta-action-btn flex-1 flex items-center justify-center text-white hover:bg-white/15 dark:hover:bg-white/10 transition-colors"
            title="Ver producto"
            aria-label="Ver producto"
          >
            <ExternalLink className="w-[18px] h-[18px]" />
          </Link>
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 w-full text-center">
        <h3 className="oferta-title text-[13px] font-bold text-sky-700 dark:text-[var(--brand-green)] uppercase whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
          {producto.titulo}
        </h3>
        <p className="oferta-price text-[15px] font-extrabold text-gray-800 dark:text-[var(--text-primary)]">
          S/ {producto.precio.toFixed(2)}
        </p>
        <div className="text-amber-400 text-xs mt-1">
          {producto.estrellas || '★★★★★'}
        </div>
      </div>
    </article>
  );
}

function OfferBlock({ titulo, productos, backgroundImage, linkText = 'Ver todo', onAddToCart, onQuickView }: OfferBlockProps & { 
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {
  if (productos.length === 0) {
    return (
      <section className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)] tracking-tight">{titulo}</h2>
        </div>
        <div className="min-h-[200px] rounded-[30px] shadow-2xl overflow-hidden">
          <div className="w-full h-[200px] bg-gradient-to-br from-sky-50 to-sky-100 dark:from-[var(--bg-secondary)] dark:to-[var(--bg-muted)] flex flex-col items-center justify-center text-center p-8">
            <p className="text-sky-600 dark:text-[var(--brand-green)] text-lg font-medium">
              No hay datos para mostrar por ahora
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Pronto tendremos productos en esta sección
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)] tracking-tight">{titulo}</h2>
        <button type="button" className="text-sm font-bold text-sky-600 dark:text-[var(--brand-green)] hover:text-sky-700 dark:hover:text-[var(--color-success)] flex items-center gap-1">
          {linkText} →
        </button>
      </div>

      <div
        className="relative min-h-[480px] rounded-[30px] shadow-2xl overflow-hidden"
      >
        {/* Parallax background */}
        <div
          className="absolute inset-0 z-0 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: `url('${backgroundImage}')`, backgroundPosition: 'center 20%' }}
        />
        <div className="absolute inset-0 bg-white/5 dark:bg-[var(--bg-secondary)]/50 backdrop-blur-[1px] z-10 pointer-events-none" />

        <div className="relative z-20 p-4 md:p-8 min-h-[480px] flex items-center">
          <div className="flex flex-col w-full">
            {/* Scrollable product cards */}
            <div className="flex items-center overflow-x-auto lg:overflow-x-hidden lg:flex-nowrap lg:justify-end gap-4 lg:gap-5 py-6 lg:py-0 snap-x snap-mandatory scrollbar-hide max-w-full lg:ml-auto lg:max-w-5xl lg:mr-8 touch-pan-x">
              {productos.map((producto) => (
                <OfferCard 
                  key={producto.id} 
                  producto={producto} 
                  allProducts={productos}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface OffersSectionProps {
  ofertasServicios: Producto[];
  ofertasProductos: Producto[];
  productosNuevos: Producto[];
}

export default function OffersSection({
  ofertasServicios,
  ofertasProductos,
  productosNuevos,
}: OffersSectionProps) {
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

  return (
    <div className="space-y-12 mt-12">
      <OfferBlock
        titulo="Las mejores ofertas de Servicios"
        productos={ofertasServicios}
        backgroundImage="/img/Inicio/7.png"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Las mejores ofertas de productos"
        productos={ofertasProductos}
        backgroundImage="/img/Inicio/6.webp"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Productos Nuevos"
        productos={productosNuevos}
        backgroundImage="/img/Inicio/8.png"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />
    </div>
  );
}