'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import TopMedalBadge from '@/components/ui/TopMedalBadge';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface StoreData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  address: string | null;
  phone: string | null;
  category: string | null;
  rating: number;
  product_count: number;
}

export default function TiendasRegistradasPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ per_page: '50' });
    if (search) params.set('search', search);

    fetch(`${LARAVEL_API_URL}/stores?${params}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setStores(json.data);
        else setError('Error al cargar tiendas');
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <main className="min-h-screen to-transparent py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 md:py-4 w-full rounded-full
             bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)]
             text-white
             shadow-[0_10px_25px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)]
             font-black tracking-tight text-center
             text-base sm:text-lg md:text-[clamp(20px,2.6vw,34px)]">
          <Icon name="Store" className="w-5 h-5 sm:w-[28px] sm:h-[28px] md:w-[38px] md:h-[38px] shrink-0" />
          Tiendas Registradas
        </h1>

        <div className="bg-white dark:bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-4 md:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-[var(--text-secondary)] dark:text-white/90 font-semibold text-sm md:text-base whitespace-nowrap">
              Total: <span className="text-[var(--text-primary)] font-extrabold">{stores.length}</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tienda..."
              className="flex-1 max-w-xs px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-11 h-11 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-sky-50 dark:bg-[var(--brand-green-hover)] border-sky-200 dark:border-[var(--icons-green)]'
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
                  ? 'bg-sky-50 dark:bg-[var(--brand-green-hover)] border-sky-200 dark:border-[var(--icons-green)]'
                  : 'bg-white dark:bg-[var(--bg-card)] border-[var(--border-subtle)]'
              }`}
              aria-label="Vista en lista"
            >
              <Icon name="Menu" className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {loading && <div className="p-20 text-center text-gray-400 text-lg">Cargando tiendas...</div>}
        {error && <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl">{error}</div>}

        {!loading && !error && stores.length === 0 && (
          <div className="p-20 text-center text-gray-400">No hay tiendas registradas aún</div>
        )}

        {!loading && !error && stores.length > 0 && (
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
                <Link href={`/tienda/${store.slug}`}>
                  <div className="relative h-56 overflow-hidden group">
                    <img
                      src={store.banner || '/img/stores/default-cover.webp'}
                      alt={store.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-1 rounded-full">
                        {store.category || 'Tienda'}
                      </span>
                      {store.product_count > 0 && (
                        <span className="ml-2 text-[10px] font-bold text-white/80 bg-black/40 px-2 py-1 rounded-full">
                          {store.product_count} productos
                        </span>
                      )}
                    </div>

                    {store.rating > 0 && (
                      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 text-[11px] font-bold text-white bg-black/40 px-2 py-1 rounded-full">
                        <Icon name="Star" className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {store.rating.toFixed(1)}
                      </div>
                    )}

                    <div className="absolute inset-0 p-4 flex flex-col justify-between z-5">
                      <div>
                        <h3 className="text-white font-extrabold text-lg sm:text-xl drop-shadow-lg leading-tight line-clamp-2">
                          {store.name}
                        </h3>
                      </div>

                      <div className="text-white/95 font-semibold text-sm space-y-1.5 pr-20">
                        {store.address && (
                          <div className="flex items-center gap-2 drop-shadow-md">
                            <Icon name="MapPin" className="w-4.5 h-4.5" />
                            <span className="line-clamp-1">{store.address}</span>
                          </div>
                        )}
                        {store.phone && (
                          <div className="flex items-center gap-2 drop-shadow-md">
                            <Icon name="Phone" className="w-4.5 h-4.5" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute right-4 -bottom-5 z-20 w-20 h-20 rounded-full bg-white dark:bg-[var(--bg-card)] border-4 border-white/85 dark:border-[var(--border-subtle)] shadow-2xl flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={store.logo || '/img/stores/default-logo.webp'}
                          alt={`${store.name} logo`}
                          className="w-3/5 h-3/5 object-contain"
                        />
                        <TopMedalBadge entityType="store" entityId={store.id} size="sm" className="absolute bottom-1 right-1 z-10" />
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="pt-6 pb-4 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-[var(--bg-muted)] dark:to-[var(--bg-card)] flex items-center gap-3">
                  <Link
                    href={`/tienda/${store.slug}`}
                    className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--brand-green)] text-white flex items-center justify-center shadow-lg 
                    shadow-[0_10px_25px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)] hover:-translate-y-0.5 transition-all flex-shrink-0"
                    aria-label={`Ver tienda ${store.name}`}
                  >
                    <Icon name="ArrowRight" className="w-5 h-5" />
                  </Link>
                  <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                    {store.description ? (
                      <span className="line-clamp-1">{store.description}</span>
                    ) : (
                      <span className="italic">Sin descripción</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)] dark:text-white/90 mb-4">
            ¿Tienes una tienda y quieres registrarte?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 dark:bg-[var(--brand-green)] hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] border-2 border-[var(--border-subtle)] text-white font-bold rounded-xl transition-colors"
          >
            <Icon name="UserPlus" className="w-5 h-5" />
            Registra tu Tienda
          </Link>
        </div>
      </div>
    </main>
  );
}
