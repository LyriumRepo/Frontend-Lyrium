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
  backgroundPosition,
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
    productosAMostrar = [
      {
        id: 27,
        titulo: "Programas de Rehabilitación Integral",
        precio: 60.00,
        imagen: "/img/Inicio/5/1.png",
        estrellas: "★★★★★",
        slug: "programas-rehabilitacion-integral",
        vendedor: { slug: "norclab", nombre: "Norclab" },
        categorias: ["Servicios Médicos"]
      },
      {
        id: 36,
        titulo: "Masajes Corporales",
        precio: 30.00,
        imagen: "/img/Inicio/5/2.png",
        estrellas: "★★★★★",
        slug: "masajes-corporales",
        vendedor: { slug: "pimo", nombre: "Pimó" },
        categorias: ["Bienestar"]
      },
      {
        id: 34,
        titulo: "Blanqueamiento Dental",
        precio: 120.00,
        imagen: "/img/Inicio/5/3.png",
        estrellas: "★★★★★",
        slug: "blanqueamiento-dental",
        vendedor: { slug: "rydent", nombre: "RyDent" },
        categorias: ["Servicios Médicos"]
      },
      {
        id: 35,
        titulo: "Diagnóstico Unipolar",
        precio: 120.00,
        imagen: "/img/Inicio/5/4.png",
        estrellas: "★★★★★",
        slug: "diagnostico-unipolar",
        vendedor: { slug: "centro-medico", nombre: "Centro Médico" },
        categorias: ["Servicios Médicos"]
      }
    ];
  } else if (titulo === "Las mejores ofertas de Servicios" || titulo === "Las mejores ofertas de servicios") {
    productosAMostrar = [
      {
        id: 21,
        titulo: "Ecografía Obstétrica",
        precio: 80.00,
        imagen: "/img/Inicio/4/3.png",
        estrellas: "★★★★★",
        slug: "ecografia-obstetrica",
        vendedor: { slug: "centromedicodigital", nombre: "Centro Médico Digital" },
        categorias: ["Servicios Médicos"]
      },
      {
        id: 23,
        titulo: "EXTRACTO DE ALGARROBO",
        precio: 38.00,
        imagen: "/img/Inicio/4/1.png",
        estrellas: "★★★★★",
        slug: "extracto-de-algarrobo",
        vendedor: { slug: "riquesascampesinas", nombre: "Riquesas Campesinas" },
        categorias: ["Digestión Saludable"]
      },
      {
        id: 22,
        titulo: "Profilaxis /Destartarización",
        precio: 50.00,
        imagen: "/img/Inicio/4/2.png",
        estrellas: "★★★★★",
        slug: "profilaxis-destartraje-fluor",
        vendedor: { slug: "rydent", nombre: "RyDent" },
        categorias: ["Servicios Médicos"]
      }
    ];
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

  if (productosAMostrar.length === 0) {
    return (
      <section className="space-y-4 md:space-y-6 flex flex-col items-center">
        <div className="w-[1467px] max-w-full pl-10 pr-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold pl-8">{titulo}</h2>

          <div className="relative w-full h-[650px] rounded-[30px] shadow-2xl overflow-hidden">
            <div className="absolute inset-0">
              {fallbackImages.map((img, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 bg-cover bg-no-repeat bg-center transition-opacity duration-1000 ${
                    i === bgIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    backgroundImage: `url('${img}')`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: backgroundPosition || 'center 15%',
                    backgroundRepeat: 'no-repeat'
                  }}
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

  const allItems = [...productosAMostrar, ...productosAMostrar];

  return (
    <section className="space-y-4 md:space-y-6 flex flex-col items-center w-full">
      <div className="w-[1467px] max-w-full pl-10 pr-4 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold pl-8">{titulo}</h2>
        <button className="text-sm font-bold text-sky-600 pr-8">
          {linkText} →
        </button>
      </div>

      <div className="relative w-[1467px] max-w-full h-[650px] rounded-[30px] shadow-2xl overflow-hidden mx-auto">
        <div className="absolute inset-0">
          {fallbackImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 bg-cover bg-no-repeat bg-center transition-opacity duration-1000 ${
                i === bgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${img}')`,
                backgroundAttachment: 'fixed',
                backgroundPosition: backgroundPosition || 'center 15%',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

        <div className="relative z-10 p-4 pb-6 md:p-8 md:pb-10 h-full flex flex-col justify-end">
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