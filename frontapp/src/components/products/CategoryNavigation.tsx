'use client';

import Link from 'next/link';
import { Package, Store, Heart, Shield, Activity, Sparkles, Home, Scissors, Dumbbell, Stethoscope } from 'lucide-react';
import { ProductCategory } from '@/shared/types/wp/wp-types';

interface CategoryNavigationProps {
  categories: ProductCategory[];
  currentCategorySlug?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  'bienestar_fisico_y_deportes': Dumbbell,
  'mascotas': Activity,
  'suplementos_vitaminicos': Sparkles,
  'digestion_saludable': Heart,
  'belleza': Scissors,
  'equipos_y_dispositivos_medicos': Stethoscope,
  'proteccion_limpieza_y_desinfeccion': Shield,
  'servicios': Store,
  'alojamiento-ecologico': Home,
  'belleza-servicios': Scissors,
  'deportes-servicios': Dumbbell,
  'servicio-de-medicina-natural': Heart,
  'servicios-medicos': Stethoscope,
  'servicios-para-animales': Activity,
  'servicios-sociales': Shield,
};

function getCategoryIcon(slug: string): React.ElementType {
  return categoryIcons[slug] || Package;
}

function getCategoryColor(index: number): string {
  const colors = [
    'bg-sky-100 text-sky-600 hover:bg-sky-200',
    'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
    'bg-amber-100 text-amber-600 hover:bg-amber-200',
    'bg-violet-100 text-violet-600 hover:bg-violet-200',
    'bg-rose-100 text-rose-600 hover:bg-rose-200',
    'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
    'bg-orange-100 text-orange-600 hover:bg-orange-200',
  ];
  return colors[index % colors.length];
}

export default function CategoryNavigation({ categories, currentCategorySlug }: CategoryNavigationProps) {
  // Filtrar la categoría actual
  const otherCategories = categories.filter(cat => cat.slug !== currentCategorySlug);

  if (otherCategories.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
        Explora otras categorías
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {otherCategories.map((cat, index) => {
          const Icon = getCategoryIcon(cat.slug);
          
          return (
            <Link
              key={cat.id}
              href={`/productos/${cat.slug}`}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-full 
                text-xs font-medium transition-all duration-200
                ${getCategoryColor(index)}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap capitalize">
                {cat.name.toLowerCase().replace(/_/g, ' ')}
              </span>
              {cat.count > 0 && (
                <span className="opacity-70 text-[10px]">
                  ({cat.count})
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
