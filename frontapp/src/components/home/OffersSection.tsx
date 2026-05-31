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
      <article className="w-[220px] shrink-0 bg-white/[0.92] dark:bg-[var(--bg-secondary)]/92 backdrop-blur-lg border border-white/40 dark:border-[var(--border-subtle)]/50 rounded-[20px] p-3 shadow-md group transition-all duration-300 hover:-translate-y-[5px] flex flex-col items-center relative">
      <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-white dark:bg-[var(--bg-muted)] flex items-center justify-center">
                  <Image
            src={imgSrc}
            alt={producto.titulo}
            fill
           
            className={imgSrc.includes('1.png') ? "object-contain p-[7.5%]" : "object-cover"}
            onError={handleImageError}
          />

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

       <div className="mt-3 w-full text-center flex flex-col items-center">
        <h3 className="text-[13px] font-bold truncate w-full">{producto.titulo}</h3>
        <p className="text-[15px] font-extrabold">S/ {producto.precio.toFixed(2)}</p>
        <div className="flex justify-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, idx) => {
            const isFilled = idx < (producto.estrellas ? producto.estrellas.length : 5);
            return (
              <Star
                key={idx}
                className={`w-3.5 h-3.5 ${
                  isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            );
          })}
        </div>
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
  enableCardCarousel = false,
  onAddToCart,
  onQuickView,
}: OfferBlockProps & {
  onAddToCart: (product: Producto) => void;
  onQuickView: (product: Producto) => void;
}) {

  const [bgIndex, setBgIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);

   
  useEffect(() => {
    if (productos.length === 0 && fallbackImages.length > 0) {
      const interval = setInterval(() => {
        setBgIndex((prev) => (prev + 1) % fallbackImages.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [productos.length, fallbackImages]);

 
  useEffect(() => {
    const esServiciosVacio = titulo === "Las mejores ofertas de Servicios" && productos.length === 0;
    if (!enableCardCarousel && !esServiciosVacio) return;

    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 900) setItemsPerView(2);
      else if (window.innerWidth < 1200) setItemsPerView(3);
      else {
       
        setItemsPerView(esServiciosVacio ? 3 : 5);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [enableCardCarousel, titulo, productos.length]);

  
  const totalPages = Math.max(1, Math.ceil(productos.length / itemsPerView));
  const esServiciosVacio = titulo === "Las mejores ofertas de Servicios" && productos.length === 0;
  
 
  const totalPagesServices = esServiciosVacio ? Math.max(1, homeData.ofertasServicios.length - itemsPerView + 1) : 1;
  // 4. Desplazamiento automático para carrusel normal
  useEffect(() => {
    if (!enableCardCarousel || totalPages <= 1 || productos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [enableCardCarousel, totalPages, productos.length]);

  // 5. Desplazamiento automático específico para Servicios vacíos
  useEffect(() => {
    if (!esServiciosVacio || totalPagesServices <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPagesServices - 1 ? 0 : prev + 1));
    }, 4500);

    return () => clearInterval(interval);
  }, [esServiciosVacio, totalPagesServices]);

  // 6. Resetear la página si excede el límite al cambiar tamaño de pantalla
  useEffect(() => {
    const maxPages = esServiciosVacio ? totalPagesServices : totalPages;
    if (currentPage >= maxPages) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages, totalPagesServices, esServiciosVacio]);

 
    if (productos.length === 0) {
    let productosAMostrar: Producto[] = [];
    let animationName = '';

    if (titulo === "Las mejores ofertas de Servicios" || titulo === "Las mejores ofertas de servicios") {
      productosAMostrar = homeData.ofertasServicios;
      animationName = 'infiniteScrollServices';
    } else if (titulo === "Las mejores ofertas de productos" || titulo === "Las mejores ofertas de Productos") {
      productosAMostrar = homeData.ofertasProductos;
      animationName = 'infiniteScrollProducts';
    } else if (titulo === "Productos Nuevos" || titulo === "Productos nuevos") {
      productosAMostrar = homeData.productosNuevos;
      animationName = 'infiniteScrollNewProducts';
    }

    if (productosAMostrar.length > 0) {
      const allItems = [...productosAMostrar, ...productosAMostrar];

      return (
        <section className="space-y-4 md:space-y-6 flex flex-col items-center">
          {/* Estilos CSS para el desplazamiento continuo y efecto de pausa en Hover */}
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

          <div className="w-[1467px] max-w-full pl-10 pr-4 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold pl-8">{titulo}</h2>

            <div className="relative w-full h-[496px] rounded-[30px] shadow-2xl overflow-hidden">
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

              {/* Overlay original */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

              {/* Contenedor del scroll continuo alineado a la derecha */}
              <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-center">
                <div 
                  className="w-full ml-auto overflow-hidden md:mr-12 mr-4"
                  style={{ 
                    maxWidth: '820px',
                    maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
                  }}
                >
                  <div
                    className={`flex gap-5 animate-${animationName}`}
                    style={{ width: 'max-content' }}
                  >
                    {allItems.map((producto, index) => (
                      <OfferCard
                        key={`${producto.id}-${index}`}
                        producto={producto}
                        allProducts={productosAMostrar}
                        onAddToCart={onAddToCart}
                        onQuickView={onQuickView}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Estado vacío de fallback por defecto
    return (
      <section className="space-y-4 md:space-y-6 flex flex-col items-center">
        <div className="w-[1467px] max-w-full pl-10 pr-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold pl-8">{titulo}</h2>

          <div className="relative w-full h-[496px] rounded-[30px] shadow-2xl overflow-hidden">
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

            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

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
 
  return (
    <section className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">{titulo}</h2>
        <button className="text-sm font-bold text-sky-600">
          {linkText} →
        </button>
      </div>

      <div className="relative w-[1467px] h-[496px] rounded-[30px] shadow-2xl overflow-hidden mx-auto">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />

        <div className="relative z-10 p-4 md:p-8 h-full flex flex-col justify-center">
          <div className="overflow-hidden">
            {enableCardCarousel ? (
              <div
                className="flex gap-5 will-change-transform"
                style={{
                  transition: 'transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)',
                  transform: `translateX(-${currentPage * itemsPerView * 240}px)`,
                }}
              >
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
            ) : (
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
            )}
          </div>

          {enableCardCarousel && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={`offer-page-${index}`}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentPage ? 'w-6 bg-indigo-500' : 'w-2 bg-white/70'
                  }`}
                  aria-label={`Ir a la página ${index + 1}`}
                />
              ))}
            </div>
          )}
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
    '/img/7.png',
  ];

  const productosImages = [
    '/img/inicio/las_mejores_ofertas/6.png',
    '/img/2.png',
    '/img/5.png',
    '/img/8.png',
  ];

  const nuevosImages = [
    '/img/Inicio/las_mejores_ofertas/8.png',
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
        enableCardCarousel
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