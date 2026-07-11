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
   const NOMBRE_OVERRIDE: Record<number, string> = {
    1: 'BIENESTAR FÍSICO Y DEPORTE',
    2: 'MASCOTAS',
    3: 'SUPLEMENTOS VITAMÍNICOS',
    4: 'DIGESTIÓN SALUDABLE',
    5: 'EQUIPOS Y DISPOSITIVOS MÉDICOS',
    6: 'PROTECCIÓN LIMPIEZA Y DESINFECCIÓN',
    7: 'BELLEZA',
  };
  const displayCategories = categorias.slice(0, 7).map((cat, i) => ({
    ...cat,
    nombre: NOMBRE_OVERRIDE[i + 1] ?? cat.nombre,
  }));
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = Math.max(1, Math.ceil(displayCategories.length / itemsPerView));
  const targetItemIndex = Math.min(current * itemsPerView, Math.max(0, displayCategories.length - itemsPerView));

  useEffect(() => {
    setIsMounted(true);
    const update = () => {
      if (window.innerWidth < 480) setItemsPerView(2);
      else if (window.innerWidth < 768) setItemsPerView(3);
      else if (window.innerWidth < 1280) setItemsPerView(4);
      else setItemsPerView(5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, totalPages - 1)));
  }, [itemsPerView, totalPages]);

  const goToNext = useCallback(() => {
    setCurrent((c) => (c >= totalPages - 1 ? 0 : c + 1));
  }, [totalPages]);

  useEffect(() => {
    if (isPaused || isDragging || displayCategories.length <= 1) return;
    
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
        setCurrent((c) => (c >= totalPages - 1 ? 0 : c + 1));
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
          style={
            isMounted
              ? { transform: `translateX(calc(-1 * ${targetItemIndex} * (100% + 1rem) / ${itemsPerView}))` }
              : {}
          }
        >
          {displayCategories.map((cat, index) => {
             
            const localImage = `/img/Inicio/2/${index + 1}.png`;

            return (
              <Link 
                key={cat.id} 
                href={cat.slug ? `/productos/${cat.slug}` : '#'}
                className="block flex-shrink-0 w-[calc(50%-0.5rem)] min-[480px]:w-[calc(33.333%-0.66rem)] md:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)] snap-start"
              >
                <article className="rounded-[2.5rem] overflow-hidden shadow-md bg-[var(--turquesaClaro-100)] dark:bg-[var(--bg-card)] group cursor-pointer h-44 md:h-52">
                  <Image
                    src={localImage}
                    alt={cat.nombre}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </article>
                <div className="py-3 text-center">
                                 <p className="text-[11px] md:text-sm font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">
                    {(() => {
                      const overrides: Record<string, string> = {
                        'Diagnóstico':          'Bienestar Físico y Deporte',
                        'Limpieza Hogar':       'Suplementos Vitamínicos',
                        'Vitaminas':            'Digestión Saludable',
                        'De Paseo y en el Coche': 'Equipos y Dispositivos Médicos',
                        'Hombres':              'Protección Limpieza y Desinfección',
                        'Sistema Nervioso':     'Belleza',
                      };
                      return overrides[cat.nombre] ?? cat.nombre;
                    })()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}