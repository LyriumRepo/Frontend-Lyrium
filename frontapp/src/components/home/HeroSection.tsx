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

  const desktopBanners = [
    { id: 1, titulo: 'Banner 1', imagen: '/img/BANNER_GRANDE_INICIO/1.png' },
    { id: 2, titulo: 'Banner 2', imagen: '/img/BANNER_GRANDE_INICIO/2.png' },
    { id: 3, titulo: 'Banner 3', imagen: '/img/BANNER_GRANDE_INICIO/3.png' },
    { id: 4, titulo: 'Banner 4', imagen: '/img/BANNER_GRANDE_INICIO/4.png' },
    { id: 5, titulo: 'Banner 5', imagen: '/img/BANNER_GRANDE_INICIO/5.png' },
    { id: 6, titulo: 'Banner 6', imagen: '/img/BANNER_GRANDE_INICIO/6.png' },
  ];

  const mobileBanners = [
    { id: 1, titulo: 'Banner 1', imagen: '/img/Inicio/movil/1.webp' },
    { id: 2, titulo: 'Banner 2', imagen: '/img/Inicio/movil/2.webp' },
    { id: 3, titulo: 'Banner 3', imagen: '/img/Inicio/movil/3.webp' },
    { id: 4, titulo: 'Banner 4', imagen: '/img/Inicio/movil/4.webp' },
    { id: 5, titulo: 'Banner 5', imagen: '/img/Inicio/movil/5.webp' },
    { id: 6, titulo: 'Banner 6', imagen: '/img/Inicio/movil/6.webp' },
  ];

  const prev = useCallback(
    () => setCurrent((c) => (c === 0 ? desktopBanners.length - 1 : c - 1)),
    [desktopBanners.length]
  );

  const next = useCallback(
    () => setCurrent((c) => (c === desktopBanners.length - 1 ? 0 : c + 1)),
    [desktopBanners.length]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full !mt-0">
      {/* Banner Superior — solo desktop/tablet, se ve distorsionado en mobile */}
      <div className="hidden sm:block w-full -mb-px">
        <Image
          src="/img/BANNER_SUPERIOR.png"
          alt="Banner Superior"
          width={1600}
          height={270}
          className="w-full h-auto object-cover min-h-[80px] block origin-center"
          style={{ transform: 'scaleX(1.005)' }}
          priority
        />
      </div>

      {/* Carrusel de Banners */}
      <div className="relative overflow-hidden w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{
            transform: `translateX(-${current * 100}%)`
          }}
        >
          {desktopBanners.map((banner, index) => {
            const mobBanner = mobileBanners[index];
            return (
              <div key={banner.id} className="w-full flex-shrink-0 overflow-hidden">
                <div className="hidden sm:block w-full">
                  <Image
                    src={banner.imagen}
                    alt={banner.titulo}
                    width={1600}
                    height={600}
                    className="w-full h-auto object-cover cursor-pointer origin-center"
                    style={{ transform: 'scaleX(1.006)' }}
                    priority
                  />
                </div>
                <div className="block sm:hidden w-full">
                  <Image
                    src={mobBanner.imagen}
                    alt={mobBanner.titulo}
                    width={640}
                    height={640}
                    className="w-full h-auto object-cover cursor-pointer origin-center"
                    style={{ transform: 'scaleX(1.006)' }}
                    priority
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={prev}
          className="flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={next}
          className="flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all duration-300 z-10"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Indicadores */}
        <div className="flex absolute bottom-4 left-1/2 -translate-x-1/2 gap-2 z-10">
          {desktopBanners.map((_, i) => (
            <button
              key={`slide-indicator-${i}`}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${i === current ? 'bg-sky-500 scale-110' : 'bg-white/60 hover:bg-white/80'
                }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Banner Inferior — solo desktop/tablet, se ve distorsionado en mobile */}
      <div className="hidden sm:block w-full -mt-px">
        <Image
          src="/img/BANNER_INFERIOR.png"
          alt="Banner Inferior"
          width={1600}
          height={270}
          className="w-full h-auto object-cover min-h-[80px] block origin-center"
          style={{ transform: 'scaleX(1.006)' }}
        />
      </div>
    </section>
  );
}