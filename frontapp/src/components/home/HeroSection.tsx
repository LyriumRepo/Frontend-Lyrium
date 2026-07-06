'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types/public';

interface HeroSectionProps {
  banners: Banner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  // 6 imágenes PNG locales ubicadas en public/img/Inicio/ (desktop) y sus
  // equivalentes recortados para mobile (retrato) en BANNER_GRANDE_INICIO_MOBILE/.
  const displayBanners = [
    { id: 1, titulo: 'Banner 1', imagen: '/img/BANNER_GRANDE_INICIO/1.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/1.webp' },
    { id: 2, titulo: 'Banner 2', imagen: '/img/BANNER_GRANDE_INICIO/2.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/2.webp' },
    { id: 3, titulo: 'Banner 3', imagen: '/img/BANNER_GRANDE_INICIO/3.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/3.webp' },
    { id: 4, titulo: 'Banner 4', imagen: '/img/BANNER_GRANDE_INICIO/4.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/4.webp' },
    { id: 5, titulo: 'Banner 5', imagen: '/img/BANNER_GRANDE_INICIO/5.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/5.webp' },
    { id: 6, titulo: 'Banner 6', imagen: '/img/BANNER_GRANDE_INICIO/6.png', imagenMobile: '/img/BANNER_GRANDE_INICIO_MOBILE/6.webp' },
  ];

  const prev = useCallback(
    () => setCurrent((c) => (c === 0 ? displayBanners.length - 1 : c - 1)),
    [displayBanners.length]
  );

  const next = useCallback(
    () => setCurrent((c) => (c === displayBanners.length - 1 ? 0 : c + 1)),
    [displayBanners.length]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full !mt-0">
      {/* Banner Superior */}
      {/* El domo verde del PNG solo ocupa ~54.4% del ancho del lienzo (centrado, con
          márgenes transparentes a los lados). En mobile recortamos con aspect-ratio +
          object-cover: aspect-[16/5] deja visible el ~54% central del lienzo, que es
          exactamente la zona del domo. En md+ se mantiene el render natural original
          (aspect auto + scaleX(1.005) hairline). */}
      <div className="block w-full -mb-px overflow-hidden">
        <Image
          src="/img/BANNER_SUPERIOR.png"
          alt="Banner Superior"
          width={1600}
          height={270}
          className="w-full h-auto object-cover block aspect-[16/5] md:aspect-auto md:min-h-[80px] origin-center md:scale-x-[1.005]"
          priority
        />
      </div>

      {/* Carrusel de Banners */}
      {/* El track necesita un ancho EXPLÍCITO (numSlides * 100%) para que el navegador
          pueda resolver translateX(-N%) de forma fiable — antes dependía de min-w-full
          dentro de un contenedor sin ancho propio, lo que en ciertos casos hacía que el
          transform se calculara sobre una base indeterminada y no se aplicara (quedaba
          en matrix(1,0,0,1,0,0), sin mover nada), dejando slides mostrando contenido de
          otro slide con parte de fondo visible = la sensación de "desalineado". */}
      <div className="relative overflow-hidden max-w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            width: `${displayBanners.length * 100}%`,
            transform: `translateX(-${(current * 100) / displayBanners.length}%)`,
          }}
        >
          {displayBanners.map((banner) => (
            <div
              key={banner.id}
              className="overflow-hidden"
              style={{ width: `${100 / displayBanners.length}%` }}
            >
              <Image
                src={banner.imagenMobile}
                alt={banner.titulo}
                width={650}
                height={932}
                className="w-full h-auto object-cover cursor-pointer origin-center block md:hidden"
                priority
              />
              <Image
                src={banner.imagen}
                alt={banner.titulo}
                width={1600}
                height={600}
                className="w-full h-auto object-cover cursor-pointer origin-center hidden md:block"
                style={{ transform: 'scaleX(1.006)' }}
                priority
              />
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {displayBanners.map((_, i) => (
            <button
              key={`slide-indicator-${i}`}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? 'bg-sky-500 scale-110' : 'bg-white/60 hover:bg-white/80'
                }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Banner Inferior */}
      {/* Mismo caso que el banner superior: recorte con aspect-ratio + object-cover
          solo en mobile (aspect-[17/5] ≈ el zoom 1.75 previo); en desktop se mantiene
          el render natural con el scaleX(1.006) original. */}
      <div className="block w-full -mt-px overflow-hidden">
        <Image
          src="/img/BANNER_INFERIOR.png"
          alt="Banner Inferior"
          width={1600}
          height={270}
          className="w-full h-auto object-cover block aspect-[17/5] md:aspect-auto md:min-h-[80px] origin-center md:scale-x-[1.006]"
        />
      </div>
    </section>
  );
}