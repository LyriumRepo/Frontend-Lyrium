'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

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
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const addressShort = store.address?.split(',')[0] || 'Sin ubicación';

  return (
    <div
      id="tiendaHeaderSticky"
      className={`relative z-50 transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 right-0' : 'mt-4'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4">
        <div
          className={`
            relative overflow-hidden rounded-2xl shadow-2xl
            bg-cover bg-center bg-no-repeat
            border border-sky-200/20
            transition-all duration-300
            ${isSticky ? 'rounded-none' : ''}
          `}
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.88)),
              url('${store.cover || '/img/store/tienda-94.png'}')
            `,
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Fila 1: Logo + Nombre + Badges + Buscador */}
          <div className="px-4 lg:px-6 py-4 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Logo + Nombre + Badges */}
              <div className="flex items-center gap-3">
                {/* Logo */}
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

                {/* Nombre + Badges */}
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white drop-shadow-md">
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm">
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
                      hover:border-slate-300
                      transition-all duration-200 shadow-md
                      dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400
                      dark:focus:border-sky-400 dark:focus:shadow-sky-900/20"
                  />

                  {/* Tecla Enter */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <kbd className="px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                      Enter
                    </kbd>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Fila 2: Cards de información */}
          <div className="px-4 lg:px-6 py-3 bg-white/40 backdrop-blur-sm border-t border-white/50 dark:bg-black/20 dark:border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Card: Ubicación */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-l-4 border-l-sky-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default dark:border-sky-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Ubicación</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white truncate">{addressShort}</p>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-1 flex items-center gap-0.5">
                      <Icon name="MapPin" className="w-3 h-3" />
                      Ver en mapa
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="MapPin" className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                </div>
              </div>

              {/* Card: Categoría */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default dark:border-purple-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Categoría</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white truncate">{store.category}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-0.5">
                      <Icon name="Tag" className="w-3 h-3" />
                      Productos naturales
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="Tag" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Card: Valoración */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-l-4 border-l-amber-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default dark:border-amber-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Valoración</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {stats.rating > 0 ? `${stats.rating} ★` : 'Sin reseñas'}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-0.5">
                      <Icon name="Users" className="w-3 h-3" />
                      {stats.reviews} reseñas
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="Star" className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Card: Productos */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border-l-4 border-l-emerald-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default dark:border-emerald-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Productos Activos</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.products}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
                      <Icon name="CheckCircle" className="w-3 h-3" />
                      Disponibles
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="Package" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer cuando está sticky para evitar superposición */}
      {isSticky && <div className="h-4" />}
    </div>
  );
}
