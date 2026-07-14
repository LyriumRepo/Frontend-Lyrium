'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, ExternalLink, Star } from 'lucide-react';
import { Producto } from '@/types/public';
import { useCarritoStore } from '@/store/carritoStore';
import { homeData } from '@/data/homeData';

interface OfferBlockProps {
  titulo: string;
  productos: Producto[];
  backgroundImage: string;
  linkText?: string;
  fallbackImages: string[];
  enableCardCarousel?: boolean;
  backgroundPosition?: string;
  tabletBackgroundSize?: string;
}

function OfferCard({
  producto,
  allProducts,
  onAddToCart,
  onQuickView,
  isNew,
}: {
  producto: Producto;
  allProducts: Producto[];
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
  isNew?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(producto.imagen || '/img/no-image.png');
  const [imgError, setImgError] = useState(false);

  const getFallbackImage = () => {
    return '/img/no-image.png';
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(getFallbackImage());
    }
  };

  return (
    <Link href={producto.slug ? `/producto/${producto.slug}` : '#'} className="block">
      <article className="w-[100px] min-[360px]:w-[110px] sm:w-[195px] shrink-0 bg-[var(--celeste-100)] dark:bg-[#1E3028] backdrop-blur-lg border border-transparent rounded-xl sm:rounded-[18px] overflow-hidden shadow-md group transition-all duration-300 hover:-translate-y-[5px] flex flex-col items-center relative">
      <div className="relative w-full aspect-square overflow-hidden bg-transparent flex items-center justify-center">
        {producto.descuento && producto.descuento > 0 ? (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-red-500 text-white text-[7px] sm:text-[9px] font-extrabold px-1 py-0.5 sm:px-2 sm:py-0.5 rounded-full">
            -{producto.descuento}%
          </span>
        ) : producto.tag && producto.tag.toLowerCase() !== 'nuevo' ? (
          <span className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-[var(--celeste-500)] text-white text-[7px] sm:text-[9px] font-extrabold px-1 py-0.5 sm:px-2 sm:py-0.5 rounded-full uppercase">
            {producto.tag}
          </span>
        ) : null}
                  <Image
            src={imgSrc}
            alt={producto.titulo}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            onError={handleImageError}
          />

        <div className="absolute bottom-0 left-0 w-full h-[30px] sm:h-[38px] flex bg-[var(--celeste-500)] transform translate-y-full group-hover:translate-y-0 transition-transform">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(producto); }} className="flex-1 flex items-center justify-center text-white">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(producto); }} className="flex-1 flex items-center justify-center text-white">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="flex-1 flex items-center justify-center text-white">
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>
      </div>

       <div className="py-1.5 px-2 sm:py-2.5 sm:px-3 w-full text-center flex flex-col items-center">
        <h3 className="text-[9px] min-[360px]:text-[10px] sm:text-[11.5px] font-bold truncate w-full text-slate-900 dark:text-white">{producto.titulo}</h3>
        <p className="text-[10px] min-[360px]:text-[11px] sm:text-[13.5px] font-extrabold text-[var(--celeste-500)] dark:text-[var(--azulCeleste-500)]">S/ {producto.precio.toFixed(2)}</p>
        <div className="flex justify-center gap-0.5 mt-0.5 sm:mt-0.5">
          {Array.from({ length: 5 }).map((_, idx) => {
            const isFilled = idx < (producto.estrellas ? producto.estrellas.length : 5);
            return (
              <Star
                key={idx}
                className={`w-2 h-2 sm:w-3 sm:h-3 ${
                  isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            );
          })}
        </div>
      </div>
    </article>
    </Link>
  );
}

function OfferBlock({
  titulo,
  productos,
  backgroundImage,
  linkText = 'Ver todo',
  fallbackImages,
  enableCardCarousel = false,
  backgroundPosition,
  tabletBackgroundSize,
  onAddToCart,
  onQuickView,
}: OfferBlockProps & {
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (fallbackImages.length > 0) {
      const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % fallbackImages.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [fallbackImages]);

  let productosAMostrar = productos;
  if (titulo === "Las mejores ofertas de productos" || titulo === "Las mejores ofertas de Productos") {
    productosAMostrar = homeData.ofertasProductos;
  } else if (titulo === "Las mejores ofertas de Servicios" || titulo === "Las mejores ofertas de servicios") {
    productosAMostrar = homeData.ofertasServicios;
  } else if (productos.length === 0) {
    if (titulo === "Productos Nuevos" || titulo === "Productos nuevos") {
      productosAMostrar = homeData.productosNuevos;
    }
  }

  const animationName = titulo === "Las mejores ofertas de Servicios" || titulo === "Las mejores ofertas de servicios"
    ? 'infiniteScrollServices'
    : titulo === "Las mejores ofertas de productos" || titulo === "Las mejores ofertas de Productos"
    ? 'infiniteScrollProducts'
    : 'infiniteScrollNewProducts';

  const tabletBgSize = tabletBackgroundSize || 'sm:bg-[length:104%_104%]';

  if (productosAMostrar.length === 0) {
    return (
      <section className="space-y-4 md:space-y-6 flex flex-col items-center">
        <div className="w-[1467px] max-w-full pl-4 md:pl-10 pr-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold pl-2 md:pl-8">{titulo}</h2>

          <div className="relative w-full h-[320px] min-[360px]:h-[340px] sm:h-[540px] rounded-2xl sm:rounded-[30px] shadow-2xl overflow-hidden">
            <div className="absolute inset-0">
              {fallbackImages.map((img, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 bg-[length:100%_100%] ${tabletBgSize} lg:bg-cover bg-fixed bg-no-repeat bg-center transition-opacity duration-1000 ${
                    i === bgIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: `url('${img}')`,
                    backgroundPosition: backgroundPosition || 'center 15%'
                  }}
                />
              ))}
            </div>

        <div className="absolute inset-0 bg-black/15" />

            <div className="relative z-10 h-[200px] flex flex-col items-center justify-center text-center">
              <p className="text-white text-lg font-semibold">
                No hay datos para mostrar por ahora
              </p>
              <p className="text-white/80 text-sm mt-2">
                Pronto tendremos productos en esta sección
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const allItems = [...productosAMostrar, ...productosAMostrar];

  return (
    <section className="space-y-4 md:space-y-6 flex flex-col items-center w-full">
      <div className="w-[1467px] max-w-full pl-4 md:pl-10 pr-4 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold pl-2 md:pl-8">{titulo}</h2>
      </div>

      <div className="relative w-[1467px] max-w-full h-[320px] min-[360px]:h-[340px] sm:h-[540px] rounded-2xl sm:rounded-[30px] shadow-2xl overflow-hidden mx-auto">
        <div className="absolute inset-0">
          {fallbackImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-[length:100%_100%] ${tabletBgSize} lg:bg-cover bg-fixed bg-no-repeat bg-center transition-opacity duration-1000 ${
                i === bgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${img}')`,
                backgroundPosition: backgroundPosition || 'center 15%'
              }}
            />
          ))}
        </div>

            <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 p-2 pb-3 min-[360px]:p-3 min-[360px]:pb-4 sm:p-8 sm:pb-10 h-full flex flex-col justify-end">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes ${animationName} {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .animate-${animationName} {
              animation: ${animationName} 24s linear infinite;
            }
            .animate-${animationName}:hover {
              animation-play-state: paused;
            }
          `}} />

          <div 
            className="w-full mx-auto overflow-hidden"
            style={{ 
              maxWidth: '1200px',
              maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
            }}
          >
            <div
              className={`flex gap-2 min-[360px]:gap-3 sm:gap-4 animate-${animationName}`}
              style={{ width: 'max-content' }}
            >
              {allItems.map((producto, index) => (
                <OfferCard
                  key={`${producto.id}-${index}`}
                  producto={producto}
                  allProducts={productosAMostrar}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  isNew={titulo.toLowerCase().includes('nuevo') || producto.tag?.toLowerCase() === 'nuevo'}
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

  //  Carruseles por sección
  const serviciosImages = [
    '/img/Inicio/las_mejores_ofertas/7.png',
    '/img/1.png',
    '/img/4.png',
  ];

  const productosImages = [
    '/img/Inicio/las_mejores_ofertas/6.png',
    '/img/2.png',
    '/img/5.png',
  ];

  const nuevosImages = [
    '/img/Inicio/las_mejores_ofertas/8.png',
    '/img/3.png',
    '/img/9.png',
  ];

  return (
    <div className="space-y-12 mt-12">
      <OfferBlock
        titulo="Las mejores ofertas de Servicios"
        productos={ofertasServicios}
        backgroundImage="/img/Inicio/las_mejores_ofertas/7.png"
        fallbackImages={serviciosImages}
        backgroundPosition="right 60%"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Las mejores ofertas de productos"
        productos={ofertasProductos}
        backgroundImage="/img/Inicio/las_mejores_ofertas/6.png"
        fallbackImages={productosImages}
        enableCardCarousel
        backgroundPosition="center 80%"
        tabletBackgroundSize="sm:bg-[length:101%_101%]"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />

      <OfferBlock
        titulo="Productos Nuevos"
        productos={productosNuevos}
        backgroundImage="/img/Inicio/las_mejores_ofertas/8.png"
        fallbackImages={nuevosImages}
        backgroundPosition="center 40%"
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
      />
    </div>
  );
}