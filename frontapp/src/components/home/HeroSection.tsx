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

  const prev = useCallback(
    () => setCurrent((c) => (c === 0 ? banners.length - 1 : c - 1)),
    [banners.length]
  );

  const next = useCallback(
    () => setCurrent((c) => (c === banners.length - 1 ? 0 : c + 1)),
    [banners.length]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (banners.length === 0) {
    return (
      <section className="relative w-full !mt-0">
        <div className="hidden md:block w-full -mb-px">
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
        <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-sky-50 to-sky-100 dark:from-[var(--bg-secondary)] dark:to-[var(--bg-muted)] flex flex-col items-center justify-center text-center p-8">
          <p className="text-sky-600 dark:text-[var(--brand-green)] text-lg font-medium">
            No hay datos para mostrar por ahora
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Pronto tendremos banners disponibles
          </p>
        </div>
        <div className="hidden md:block w-full -mt-px">
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

  return (
    <section className="relative w-full !mt-0">
      {/* Banner Superior */}
      <div className="hidden md:block w-full -mb-px">
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
      <div className="relative overflow-hidden max-w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="min-w-full overflow-hidden">
              <picture>
                <source
                  srcSet={banner.imagenMobile || '/img/no-image.png'}
                  media="(max-width: 767px)"
                />
                <Image
                  src={banner.imagen || '/img/no-image.png'}
                  alt={banner.titulo}
                  width={1600}
                  height={600}
                  className="w-full h-auto object-cover cursor-pointer origin-center"
                  style={{ transform: 'scaleX(1.006)' }}
                  priority
                />
              </picture>
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
          {banners.map((_, i) => (
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
      <div className="hidden md:block w-full -mt-px">
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