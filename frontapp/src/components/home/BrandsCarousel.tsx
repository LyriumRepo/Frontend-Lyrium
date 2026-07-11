'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Marca } from '@/types/public';

interface BrandsCarouselProps {
  marcas: Marca[];
}

export default function BrandsCarousel({ marcas }: BrandsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
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
          style={
            isMounted
              ? { transform: `translateX(-${current * (100 / itemsPerView)}%)` }
              : {}
          }
        >
          {marcas.map((marca) => (
            <Link
              key={marca.id}
              href={marca.slug ? `/tienda/${marca.slug}` : '/tiendasregistradas'}
              className="block flex-shrink-0 w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 snap-start"
            >
              <div className="h-38 md:h-46 flex items-center justify-center p-1 bg-white dark:bg-gray-900 w-full">
                <article className="group transition-all duration-300 w-full h-full relative rounded-2xl overflow-hidden">
                  <Image
                    src={marca.logo || '/img/no-image.png'}
                    alt={marca.nombre}
                    fill
                    className="object-contain p-2 transition-all duration-500 group-hover:scale-110 rounded-2xl"
                  />
                </article>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}