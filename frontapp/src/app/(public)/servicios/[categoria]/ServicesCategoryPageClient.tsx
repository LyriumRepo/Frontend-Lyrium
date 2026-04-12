'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Tag, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    type?: string;
}

interface ApiService {
    id: number;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    status: string;
    cancellation_policy: string;
    category_id: number | null;
    category?: { id: number; name: string; slug: string };
    store?: { id: number; name: string; slug: string };
}

interface Props {
    category: ServiceCategory;
    services: ApiService[];
    allCategories: ServiceCategory[];
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function ServiceCard({ service }: { service: ApiService }) {
    return (
        <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight line-clamp-2 group-hover:text-sky-500 transition-colors">
                        {service.name}
                    </h3>
                    <span className="shrink-0 text-base font-black text-emerald-600 dark:text-emerald-400">
                        S/ {Number(service.price).toFixed(2)}
                    </span>
                </div>

                {service.description && (
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] line-clamp-2 mb-4">
                        {service.description}
                    </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(service.duration_minutes)}
                    </span>
                    {service.store && (
                        <span className="flex items-center gap-1 truncate">
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{service.store.name}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="px-5 pb-4">
                <Link
                    href={service.store ? `/tienda/${service.store.slug}` : '#'}
                    className="block w-full text-center py-2.5 rounded-xl bg-sky-50 dark:bg-[var(--brand-sky)]/10 text-sky-600 dark:text-[var(--brand-sky)] text-xs font-black uppercase tracking-wider hover:bg-sky-100 dark:hover:bg-[var(--brand-sky)]/20 transition-colors"
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Agendar cita
                    </span>
                </Link>
            </div>
        </div>
    );
}

export default function ServicesCategoryPageClient({ category, services, allCategories }: Props) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return services;
        const q = search.toLowerCase();
        return services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.store?.name.toLowerCase().includes(q)
        );
    }, [services, search]);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            {/* Header breadcrumb */}
            <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Inicio
                    </Link>
                    <span className="text-gray-300 dark:text-[var(--border-subtle)]">/</span>
                    <span className="text-sm text-gray-400 dark:text-[var(--text-secondary)]">Servicios</span>
                    <span className="text-gray-300 dark:text-[var(--border-subtle)]">/</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-[var(--text-primary)]">{category.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Título */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        {category.name}
                    </h1>
                    <p className="text-gray-500 dark:text-[var(--text-secondary)] mt-2 text-sm">
                        {category.description || `Explora nuestros servicios en ${category.name}`}
                    </p>
                </div>

                {/* Navegación entre categorías de servicios */}
                {allCategories.length > 1 && (
                    <div className="flex gap-2 flex-wrap mb-6">
                        {allCategories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/servicios/${cat.slug}`}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                    cat.slug === category.slug
                                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                                        : 'bg-white dark:bg-[var(--bg-card)] text-gray-600 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-300 hover:text-sky-500'
                                }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Buscador */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-sm text-gray-700 dark:text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/20 transition-all"
                    />
                </div>

                {/* Contador */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    {filtered.length} servicio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                    {search && ` para "${search}"`}
                </p>

                {/* Grid de servicios */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400 dark:text-[var(--text-secondary)]">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold text-sm">
                            {search ? 'No se encontraron servicios para esa búsqueda' : 'No hay servicios disponibles en esta categoría'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}