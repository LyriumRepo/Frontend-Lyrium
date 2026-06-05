'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { Star, Trophy, Package, Store, BadgeCheck } from 'lucide-react';

interface MockProduct {
  id: number;
  name: string;
  storeName: string;
  category: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  trend: string;
}

interface MockStore {
  id: number;
  name: string;
  owner: string;
  rating: number;
  reviewsCount: number;
  tier: 'oro' | 'plata' | 'bronce';
  satisfactionRate: number;
}

export function ReviewsPageClient() {
  // ── Muestras Frontend Premium (Marketplace Bio/Salud Perú) ──
  const topProducts: MockProduct[] = [
    {
      id: 1,
      name: 'Miel de Abeja de Oxapampa 1Kg (100% Pura)',
      storeName: 'Apicultura Sierra Verde',
      category: 'Alimentos Orgánicos',
      rating: 5.0,
      reviewsCount: 48,
      salesCount: 312,
      trend: '+12% este mes'
    },
    {
      id: 2,
      name: 'Semillas de Chía Orgánica Ayacuchana',
      storeName: 'Bio-Semillas del Sur',
      category: 'Semillas',
      rating: 4.9,
      reviewsCount: 36,
      salesCount: 245,
      trend: '+8% este mes'
    },
    {
      id: 3,
      name: 'Fertilizante Ecológico Líquido Concentrado',
      storeName: 'EcoVida Perú',
      category: 'Fertilizantes',
      rating: 4.8,
      reviewsCount: 29,
      salesCount: 198,
      trend: '+15% este mes'
    },
    {
      id: 4,
      name: 'Café Orgánico de Quillabamba Seleccionado',
      storeName: 'Café Quillabamba',
      category: 'Alimentos Orgánicos',
      rating: 4.8,
      reviewsCount: 18,
      salesCount: 142,
      trend: '+5% este mes'
    },
    {
      id: 5,
      name: 'Aceite Esencial de Eucalipto Andino Puro',
      storeName: 'Moda Organica & Co.',
      category: 'Cuidado Personal',
      rating: 4.7,
      reviewsCount: 22,
      salesCount: 115,
      trend: '+3% este mes'
    }
  ];

  const topStores: MockStore[] = [
    {
      id: 1,
      name: 'Apicultura Sierra Verde',
      owner: 'Alberto Ríos',
      rating: 4.95,
      reviewsCount: 112,
      tier: 'oro',
      satisfactionRate: 99.4
    },
    {
      id: 2,
      name: 'Bio-Semillas del Sur',
      owner: 'Juan Pérez',
      rating: 4.88,
      reviewsCount: 84,
      tier: 'oro',
      satisfactionRate: 98.1
    },
    {
      id: 3,
      name: 'Café Quillabamba',
      owner: 'Carlos Díaz',
      rating: 4.80,
      reviewsCount: 56,
      tier: 'plata',
      satisfactionRate: 96.5
    },
    {
      id: 4,
      name: 'EcoVida Perú',
      owner: 'Javier Castillo',
      rating: 4.76,
      reviewsCount: 42,
      tier: 'plata',
      satisfactionRate: 95.8
    },
    {
      id: 5,
      name: 'Moda Organica & Co.',
      owner: 'María Silva',
      rating: 4.72,
      reviewsCount: 38,
      tier: 'bronce',
      satisfactionRate: 94.2
    }
  ];

  // Helper para pintar estrellas
  const renderStars = (value: number) => {
    return (
      <div className="flex gap-0.5 items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3.5 h-3.5 ${
              n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-zinc-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 font-industrial">
      
      {/* Cabecera Principal */}
      <ModuleHeader
        title="Gestión de Puntuación"
        subtitle="Rankings generales de calidad, reseñas de catálogo y reputación comercial"
        icon="Star"
      />

      {/* ── Grid Principal de Dos Columnas (Se muestran de forma simultánea) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: TOP DE PRODUCTOS MEJOR CALIFICADOS */}
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight uppercase">
              Top Productos Mejor Calificados
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            {topProducts.map((product, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={product.id}
                  className="p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-all duration-300 flex items-center gap-4 group"
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                      rank === 1
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : rank === 2
                        ? 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                        : rank === 3
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {rank <= 3 ? <Trophy className="w-5 h-5" /> : rank}
                  </div>

                  {/* Icono Producto */}
                  <div className="w-11 h-11 bg-white dark:bg-zinc-800 border border-[var(--border-subtle)] rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-emerald-500" />
                  </div>

                  {/* Info Producto */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-[var(--text-primary)] truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold flex items-center gap-1">
                        <Store className="w-3 h-3" /> {product.storeName}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-black">|</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Calificación y Métricas */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[var(--text-primary)]">{product.rating.toFixed(1)}</span>
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                      {product.reviewsCount} Reseñas validadas
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 2: TOP TIENDAS MEJOR CALIFICADAS */}
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight uppercase">
              Top Tiendas Mejor Calificadas
            </h2>
          </div>

          <div className="space-y-4 flex-1">
            {topStores.map((store, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={store.id}
                  className="p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-all duration-300 flex items-center gap-4 group"
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                      rank === 1
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : rank === 2
                        ? 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                        : rank === 3
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {rank <= 3 ? <Trophy className="w-5 h-5" /> : rank}
                  </div>

                  {/* Icono Tienda */}
                  <div className="w-11 h-11 bg-white dark:bg-zinc-800 border border-[var(--border-subtle)] rounded-xl flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-indigo-500" />
                  </div>

                  {/* Info Tienda */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-[var(--text-primary)] truncate">
                        {store.name}
                      </h3>
                      <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" />
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-widest">
                      Titular: {store.owner}
                    </p>
                  </div>

                  {/* Reputación / Tier */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--text-primary)]">{store.rating.toFixed(2)} ★</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                        store.tier === 'oro'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : store.tier === 'plata'
                          ? 'bg-zinc-400/15 text-zinc-600 dark:text-zinc-400'
                          : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      }`}>
                        Tier {store.tier}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                      {store.satisfactionRate}% Satisfacción ({store.reviewsCount} reseñas)
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
