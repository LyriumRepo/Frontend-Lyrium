'use client';

import { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import TopMedalBadge from '@/components/ui/TopMedalBadge';

export interface StoreHeaderProps {
  store: {
    id: number;
    name: string;
    logo: string;
    cover?: string;
    category: string;
    address: string;
    open: boolean;
    plan: 'basic' | 'premium';
  };
  stats: {
    products: number;
    rating: number;
    reviews: number;
  };
  onSearch?: (query: string) => void;
}

export default function StoreHeader({ store, stats, onSearch }: StoreHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const addressShort = store.address?.split(',')[0] || 'Sin ubicación';

  return (
    <div className="mt-2">
      <div className="max-w-[1600px] mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-sky-200/20 dark:border-gray-700"
        >
          {/* Fila 1: Logo + Nombre + Badges + Buscador */}
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Logo + Nombre + Badges */}
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-lg ring-2 ring-white/50 flex items-center justify-center">
                    <Image
                      src={store.logo || '/img/store/tienda-94.png'}
                      alt={store.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/store/tienda-94.png';
                      }}
                    />
                  </div>
                  <TopMedalBadge entityType="store" entityId={store.id} size="sm" className="absolute bottom-0 right-0 z-10" />
                </div>

                {/* Nombre + Badges */}
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {store.name}
                  </h1>

                  {/* Badge Plan */}
                  {store.plan === 'premium' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs font-medium border border-amber-200 dark:border-amber-700/50 shadow-sm">
                      <Icon name="Crown" className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-medium border border-emerald-200 dark:border-emerald-700/50 shadow-sm">
                      <Icon name="CheckCircle" className="w-3 h-3" />
                      Verificado
                    </span>
                  )}

                  {/* Badge Estado */}
                  {store.open ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 rounded text-xs font-medium border border-sky-200 dark:border-sky-700/50 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                      Abierto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium border border-red-200 dark:border-red-700/50 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Cerrado
                    </span>
                  )}
                </div>
              </div>

              {/* Buscador */}
              <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                <div className="relative group">
                  {/* Ícono lupa */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-sky-500 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] border-1 dark:border-white/70 flex items-center justify-center shadow-sm">
                    <Icon name="Search" className="w-4 h-4 text-white" />
                  </div>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="Buscar productos en esta tienda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl bg-white border-2 border-slate-200 
                      text-sm text-slate-700 placeholder-slate-400 
                      focus:outline-none focus:border-sky-400 focus:shadow-lg focus:shadow-sky-100
                      hover:border-slate-300 dark:hover:border-white
                      transition-all duration-200 shadow-md
                      dark:bg-[var(--bg-secondary)] dark:border-white dark:text-white dark:placeholder-white
                      dark:focus:border-white dark:focus:shadow-lime-900/20"
                  />

                  {/* Tecla Enter */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <kbd className="px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-[var(--brand-green)] dark:text-white rounded border border-slate-200 dark:border-white/70">
                      Enter
                    </kbd>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Fila 2: Stats compactos */}
          <div className="px-4 lg:px-6 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                <Icon name="MapPin" className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                <span className="font-medium truncate max-w-[180px]">{addressShort}</span>
              </div>
              {store.category && (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                  <Icon name="Tag" className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <span className="font-medium truncate max-w-[160px]">{store.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                <Icon name="Star" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-medium">{stats.rating > 0 ? `${stats.rating} ★` : 'Sin reseñas'}</span>
                <span className="text-slate-400 dark:text-white/50">· {stats.reviews} reseñas</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/80">
                <Icon name="Package" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-medium">{stats.products} productos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
