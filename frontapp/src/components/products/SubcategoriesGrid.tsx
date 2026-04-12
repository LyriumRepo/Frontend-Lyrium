'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ProductCategory } from '@/shared/types/wp/wp-types';

interface SubcategoriesGridProps {
  subcategories: ProductCategory[];
}

const categoryColors = [
  'from-sky-400 to-sky-500',
  'from-emerald-400 to-emerald-500',
  'from-amber-400 to-amber-500',
  'from-rose-400 to-rose-500',
  'from-violet-400 to-violet-500',
  'from-cyan-400 to-cyan-500',
  'from-orange-400 to-orange-500',
  'from-teal-400 to-teal-500',
];

function getCategoryColor(index: number): string {
  return categoryColors[index % categoryColors.length];
}

export default function SubcategoriesGrid({ subcategories }: SubcategoriesGridProps) {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Explora por categoría
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {subcategories.map((subcat, index) => (
          <Link
            key={subcat.id}
            href={`/productos/${subcat.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Imagen o Color de fondo */}
            <div className={`relative h-20 ${subcat.image ? '' : `bg-gradient-to-br ${getCategoryColor(index)}`}`}>
              {subcat.image?.src ? (
                <Image
                  src={subcat.image.src || '/img/no-image.png'}
                  alt={subcat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(index)} flex items-center justify-center`}>
                  <span className="text-3xl">📂</span>
                </div>
              )}
              
              {/* Overlay oscuro para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            {/* Información */}
            <div className="p-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate capitalize">
                {subcat.name.toLowerCase()}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {subcat.count} {subcat.count === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            
            {/* Indicador de hover */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 dark:bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
