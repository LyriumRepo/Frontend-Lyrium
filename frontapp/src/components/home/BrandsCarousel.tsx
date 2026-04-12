'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Marca } from '@/types/public';

interface BrandsCarouselProps {
  marcas: Marca[];
}

export default function BrandsCarousel({ marcas }: BrandsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setItemsPerView(5);
      else if (window.innerWidth >= 1024) setItemsPerView(4);
      else if (window.innerWidth >= 640) setItemsPerView(3);
      else setItemsPerView(2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, marcas.length - itemsPerView);

  const goToNext = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || isDragging || marcas.length <= 1) return;
    
    intervalRef.current = setInterval(goToNext, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isDragging, marcas.length, goToNext]);

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
      className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)]">
        Nuestras marcas
      </h2>

      <div 
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing -mx-4 px-4 bg-white dark:bg-gray-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex transition-transform duration-700 divide-x-2 divide-gray-800 dark:divide-gray-200"
          style={{ transform: `translateX(-${current * (100 / itemsPerView)}%)` }}
        >
          {marcas.map((marca) => (
            <div
              key={marca.id}
              className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
            >
              <div className="h-20 md:h-24 flex items-center justify-center p-2 bg-white dark:bg-gray-900">
                <article className="group cursor-pointer transition-all duration-300">
                  <Image
                    src={marca.logo || '/img/no-image.png'}
                    alt={marca.nombre}
                    width={140}
                    height={80}
                    className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-110"
                  />
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}