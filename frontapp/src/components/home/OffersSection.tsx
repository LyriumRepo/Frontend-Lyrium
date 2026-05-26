'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, ExternalLink } from 'lucide-react';
import { Producto } from '@/types/public';
import { useCarritoStore } from '@/store/carritoStore';

interface OfferBlockProps {
  titulo: string;
  productos: Producto[];
  backgroundImage: string;
  linkText?: string;
  fallbackImages: string[]; // 👈 NUEVO
}

function OfferCard({
  producto,
  allProducts,
  onAddToCart,
  onQuickView,
}: {
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
    <article className="flex-shrink-0 snap-center w-[190px] md:w-[220px] bg-white/[0.92] dark:bg-[var(--bg-secondary)]/92 backdrop-blur-lg border border-white/40 dark:border-[var(--border-subtle)]/50 rounded-[20px] p-3 shadow-md group transition-all duration-300 hover:-translate-y-[5px] flex flex-col items-center relative mr-[14px] md:mr-5">
      <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-white dark:bg-[var(--bg-muted)] flex items-center justify-center">
        <Link href={`/producto/${producto.slug}`}>
          <Image
            src={imgSrc}
            alt={producto.titulo}
            fill
            className="object-contain p-[7.5%]"
            onError={handleImageError}
          />
        </Link>

        <div className="absolute bottom-0 left-0 w-full h-[44px] flex bg-sky-500 transform translate-y-full group-hover:translate-y-0 transition-transform">
          <button onClick={() => onAddToCart(producto)} className="flex-1 flex items-center justify-center text-white">
            <ShoppingCart className="w-[18px] h-[18px]" />
          </button>
          <button onClick={() => onQuickView(producto)} className="flex-1 flex items-center justify-center text-white">
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <Link href={`/producto/${producto.slug}`} className="flex-1 flex items-center justify-center text-white">
            <ExternalLink className="w-[18px] h-[18px]" />
          </Link>
        </div>
      </div>

      <div className="mt-3 w-full text-center">
        <h3 className="text-[13px] font-bold truncate">{producto.titulo}</h3>
        <p className="text-[15px] font-extrabold">S/ {producto.precio.toFixed(2)}</p>
      </div>
    </article>
  );
}

function OfferBlock({
  titulo,
  productos,
  backgroundImage,
  linkText = 'Ver todo',
  fallbackImages,
  onAddToCart,
  onQuickView,
}: OfferBlockProps & {
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (productos.length === 0 && fallbackImages.length > 0) {
      const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % fallbackImages.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [productos.length, fallbackImages]);

  // 🔴 ESTADO VACÍO CON CARRUSEL PERSONALIZADO
  if (productos.length === 0) {
    return (
      <section className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold">{titulo}</h2>

        <div className="min-h-[200px] rounded-[30px] shadow-2xl overflow-hidden relative">

          {/* Carrusel fondo */}
          <div className="absolute inset-0">
            {fallbackImages.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt="Fondo"
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  i === bgIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Texto */}
          <div className="relative z-10 h-[200px] flex flex-col items-center justify-center text-center">
            <p className="text-white text-lg font-semibold">
              No hay datos para mostrar por ahora
            </p>
            <p className="text-white/80 text-sm mt-2">
              Pronto tendremos productos en esta sección
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 🟢 ESTADO NORMAL
  return (
    <section className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">{titulo}</h2>
        <button className="text-sm font-bold text-sky-600">
          {linkText} →
        </button>
      </div>

      <div className="relative min-h-[480px] rounded-[30px] shadow-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />

        <div className="relative z-10 p-4 md:p-8 flex">
          <div className="flex overflow-x-auto gap-4">
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

  // 🔥 Carruseles por sección
  const serviciosImages = [
    '/img/1.png',
    '/img/4.png',
    '/img/7.png',
  ];

  const productosImages = [
    '/img/2.png',
    '/img/5.png',
    '/img/8.png',
  ];

  const nuevosImages = [
    '/img/3.png',
    '/img/6.png',
    '/img/9.png',
  ];

  return (
    <div className="space-y-12 mt-12">
      <OfferBlock
        titulo="Las mejores ofertas de Servicios"
        productos={ofertasServicios}
        backgroundImage="/img/Inicio/7.png"
        fallbackImages={serviciosImages}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Las mejores ofertas de productos"
        productos={ofertasProductos}
        backgroundImage="/img/Inicio/6.webp"
        fallbackImages={productosImages}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Productos Nuevos"
        productos={productosNuevos}
        backgroundImage="/img/Inicio/8.png"
        fallbackImages={nuevosImages}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />
    </div>
  );
}