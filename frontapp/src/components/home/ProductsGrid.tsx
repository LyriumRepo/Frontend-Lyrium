'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Categoria } from '@/types/public';

interface ProductsGridProps {
  categorias: Categoria[];
  titulo?: string;
}

export default function ProductsGrid({ categorias, titulo = 'Categorías de productos saludables' }: ProductsGridProps) {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setItemsPerView(2);
      else if (window.innerWidth < 768) setItemsPerView(3);
      else if (window.innerWidth < 1280) setItemsPerView(4);
      else setItemsPerView(5);
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
      className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{titulo}</h2>

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
          {categorias.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.slug ? `/productos/${cat.slug}` : '#'}
              className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
            >
              <article className="rounded-[2.5rem] overflow-hidden shadow-md bg-sky-400 dark:bg-sky-500 group cursor-pointer h-28 md:h-36">
                <Image
                  src={cat.imagen || '/img/no-image.png'}
                  alt={cat.nombre}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </article>
              <div className="py-3 text-center">
                <p className="text-[11px] md:text-sm font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">
                  {cat.nombre}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}