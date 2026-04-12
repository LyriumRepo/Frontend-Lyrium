'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Categoria } from '@/types/public';

interface ServicesGridProps {
  categorias: Categoria[];
}

export default function ServicesGrid({ categorias }: ServicesGridProps) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, categorias.length - itemsPerView);

  const goToNext = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || isDragging || categorias.length <= 1) return;
    
    intervalRef.current = setInterval(goToNext, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isDragging, categorias.length, goToNext]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrent((c) => Math.max(0, c - 1));
      } else {
        setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section 
      className="!mt-0 space-y-4 md:space-y-6 max-w-7xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">
        Categorías de servicios saludables
      </h2>

      {categorias.length === 0 ? (
        <div className="min-h-[200px] rounded-[30px] shadow-lg bg-gradient-to-br from-sky-50 to-sky-100 dark:from-[var(--bg-secondary)] dark:to-[var(--bg-muted)] flex flex-col items-center justify-center text-center p-8">
          <p className="text-sky-600 dark:text-[var(--brand-green)] text-lg font-medium">
            No hay datos para mostrar por ahora
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Pronto tendremos categorías disponibles
          </p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="flex transition-transform duration-700 gap-4"
            style={{
              transform: `translateX(-${current * (100 / itemsPerView)}%)`,
            }}
          >
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
              >
                <article className="rounded-[2.5rem] overflow-hidden shadow-md bg-white dark:bg-[var(--bg-card)] group cursor-default h-44 md:h-52 border border-gray-100 dark:border-[var(--border-subtle)]">
                  <Image
                    src={categoria.imagen || '/img/no-image.png'}
                    alt={categoria.nombre}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </article>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}