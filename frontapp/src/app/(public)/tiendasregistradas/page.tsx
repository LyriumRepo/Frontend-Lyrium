'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

interface Store {
  id: string;
  nombre: string;
  ciudad: string;
  telefono: string;
  direccion: string;
  cover: string;
  logo: string;
  estado: string;
}

const stores: Store[] = [
  {
    id: '1',
    nombre: 'Vida Natural05',
    ciudad: 'Piura, Perú',
    telefono: '912345678',
    direccion: 'Urb. Los Educadores Mz m. Lt - 04, Piura, Perú',
    cover: '/img/stores/vida-natural05-cover.webp',
    logo: '/img/stores/vida-natural05-cover.webp',
    estado: '',
  },
  {
    id: '2',
    nombre: 'sanjuandedios',
    ciudad: 'Piura, Perú',
    telefono: '989787676',
    direccion: 'Piura, Perú',
    cover: '/img/stores/sanjuandedios-cover.webp',
    logo: '/img/stores/sanjuandedios-cover.webp',
    estado: '',
  },
  {
    id: '3',
    nombre: 'fisiocenter',
    ciudad: 'Piura, Perú',
    telefono: '987654321',
    direccion: 'Piura, Perú',
    cover: '/img/stores/fisiocenter.webp',
    logo: '/img/stores/fisiocenter.webp',
    estado: '',
  },
  {
    id: '4',
    nombre: 'plazamedic',
    ciudad: 'Piura, Perú',
    telefono: '987676536',
    direccion: 'Piura, Perú',
    cover: '/img/stores/plazamedic.webp',
    logo: '/img/stores/plazamedic.webp',
    estado: '',
  },
  {
    id: '5',
    nombre: 'sotomayor',
    ciudad: 'Piura, Perú',
    telefono: '987878766',
    direccion: 'Piura, Perú',
    cover: '/img/stores/sotomayor.webp',
    logo: '/img/stores/sotomayor.webp',
    estado: '',
  },
  {
    id: '6',
    nombre: 'fitbody',
    ciudad: 'Piura, Perú',
    telefono: '987878722',
    direccion: 'Piura, Perú',
    cover: '/img/stores/fitbody-cover.webp',
    logo: '/img/stores/fitbody-cover.webp',
    estado: '',
  },
  {
    id: '7',
    nombre: 'amó spa',
    ciudad: 'Piura, Perú',
    telefono: '987876763',
    direccion: 'Piura, Perú',
    cover: '/img/stores/amospa-cover.webp',
    logo: '/img/stores/amospa-cover.webp',
    estado: '',
  },
  {
    id: '8',
    nombre: 'vinasol',
    ciudad: 'Piura, Perú',
    telefono: '988978676',
    direccion: 'Piura, Perú',
    cover: '/img/stores/vinasol-cover.webp',
    logo: '/img/stores/vinasol-cover.webp',
    estado: '',
  },
  {
    id: '9',
    nombre: 'vidanatural',
    ciudad: 'Piura, Perú',
    telefono: '987878766',
    direccion: 'Piura, Perú',
    cover: '/img/stores/vidanatural-cover.webp',
    logo: '/img/stores/vidanatural-cover.webp',
    estado: 'Abierto',
  },
];

export default function TiendasRegistradasPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100/30 to-transparent dark:from-sky-900/20 dark:to-transparent py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] text-center uppercase tracking-wide">
          Tiendas Registradas
        </h1>

        <div className="bg-white dark:bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-4 md:p-5 flex items-center justify-between gap-3">
          <div className="text-[var(--text-secondary)] font-semibold text-sm md:text-base">
            Total de Tiendas Registradas:{' '}
            <span className="text-[var(--text-primary)] font-extrabold">{stores.length}</span>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <button
              type="button"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-bold px-4 py-2.5 rounded-full shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Icon name="Settings" className="w-4 h-4" />
              <span>Filtro</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-11 h-11 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700'
                  : 'bg-white dark:bg-[var(--bg-card)] border-[var(--border-subtle)]'
              }`}
              aria-label="Vista en cuadrícula"
            >
              <Icon name="LayoutGrid" className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`w-11 h-11 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700'
                  : 'bg-white dark:bg-[var(--bg-card)] border-[var(--border-subtle)]'
              }`}
              aria-label="Vista en lista"
            >
              <Icon name="Menu" className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        <section className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'grid-cols-1 gap-4'
        }`}>
          {stores.map((store) => (
            <article
              key={store.id}
              className="bg-white dark:bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden group">
                <img
                  src={store.cover}
                  alt={store.nombre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

                {store.estado && (
                  <div className="absolute top-3.5 right-3.5 z-10 font-extrabold text-xs text-white px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm shadow-lg shadow-green-500/25">
                    {store.estado}
                  </div>
                )}

                <div className="absolute inset-0 p-4 flex flex-col justify-between z-5">
                  <div>
                    <h3 className="text-white font-extrabold text-xl drop-shadow-lg leading-tight">
                      {store.nombre}
                    </h3>
                  </div>

                  <div className="text-white/95 font-semibold text-sm space-y-1.5">
                    <div className="flex items-center gap-2 drop-shadow-md">
                      <Icon name="MapPin" className="w-4.5 h-4.5" />
                      <span>{store.ciudad}</span>
                    </div>
                    <div className="flex items-center gap-2 drop-shadow-md">
                      <Icon name="Phone" className="w-4.5 h-4.5" />
                      <span>{store.telefono}</span>
                    </div>
                    {store.direccion && store.direccion !== 'Piura, Perú' && (
                    <div className="flex items-center gap-2 drop-shadow-md opacity-95">
                      <Icon name="Map" className="w-4.5 h-4.5" />
                        <span className="line-clamp-1">{store.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 -bottom-5 z-20 w-20 h-20 rounded-full bg-white dark:bg-[var(--bg-card)] border-4 border-white/85 dark:border-[var(--border-subtle)] shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={store.logo}
                    alt={`${store.nombre} logo`}
                    className="w-3/5 h-3/5 object-contain"
                  />
                </div>
              </div>

              <div className="pt-6 pb-4 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-[var(--bg-muted)] dark:to-[var(--bg-card)] flex items-center gap-3">
                <a
                  href={`/tienda/${store.nombre.toLowerCase().replace(/\s+/g, '-')}`}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 hover:-translate-y-0.5 hover:shadow-sky-500/40 transition-all flex-shrink-0"
                  aria-label={`Ver tienda ${store.nombre}`}
                >
                  <Icon name="ArrowRight" className="w-5 h-5" />
                </a>
                <button
                  type="button"
                  className="h-11 px-5 rounded-full font-extrabold text-sky-500 bg-white dark:bg-[var(--bg-card)] border-2 border-sky-400/55 shadow-md hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-500/70 hover:text-sky-600 transition-all"
                >
                  Seguir
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">
            ¿Tienes una tienda y quieres registrarte?
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors"
          >
            <Icon name="UserPlus" className="w-5 h-5" />
            Registra tu Tienda
          </a>
        </div>
      </div>
    </main>
  );
}
