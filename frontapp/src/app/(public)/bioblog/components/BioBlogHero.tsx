'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroPill from '@/components/layout/public/HeroPill';
import { blogApi } from '@/shared/lib/api/blog';

interface Category {
    id: number;
    name: string;
    slug: string;
}

function BioBlogHeroInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const activeCategorySlug = searchParams.get('category') || 'todos';

    useEffect(() => {
        blogApi.getCategories().then(setCategories).catch(console.error);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/bioblog?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const isActive = (slug: string) => slug === activeCategorySlug || (slug === 'todos' && activeCategorySlug === 'todos');

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex-1 space-y-10 md:space-y-16 overflow-x-hidden">
            {/* Hero Section */}
            <HeroPill icon="Newspaper" text="BioBlog" />

            <div className="relative w-full flex flex-col md:flex-row min-h-[500px] md:min-h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:bg-gradient-to-br dark:from-[var(--bg-secondary)] dark:to-[#0A0F0D]">
                {/* Contenido Izquierdo */}
                <div className="relative z-10 flex-1 flex flex-col justify-center p-6 md:p-16 lg:p-24 space-y-8 bg-gradient-to-br from-[#CEEDFA] to-transparent dark:from-[var(--bg-secondary)] dark:to-transparent">
                    {/* Logo/Icono */}
                    <div className="relative w-20 h-20 md:w-32 md:h-32 transition-transform duration-500 hover:scale-110">
                        <Image
                            src="/img/bioblog/ICON.png"
                            alt="Lyrium Logo"
                            fill
                            sizes="(max-width: 768px) 80px, 128px"
                            className="object-contain drop-shadow-xl"
                        />
                    </div>

                    {/* Título Dual */}
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-800 dark:text-[var(--text-primary)] leading-tight">
                            <span className="block text-slate-500 dark:text-[var(--text-secondary)] font-medium text-lg md:text-3xl mb-1">Bienvenidos</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-600 to-emerald-600">
                                Lyrium BioBlog
                            </span>
                        </h2>
                    </div>

                    {/* Descripción */}
                    <div className="max-w-xl">
                        <p className="text-base md:text-xl text-slate-600 dark:text-[var(--text-secondary)] leading-relaxed font-light text-justify">
                            En este espacio encontrarás información confiable, práctica y
                            actualizada para mejorar tu salud, bienestar y calidad de vida.
                            Somos un equipo comprometido con el cuidado integral, donde el
                            conocimiento es la herramienta clave.
                        </p>
                    </div>
                </div>

                {/* Imagen Derecha Decorativa */}
                <div className="relative flex-1 hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f8fafc]/50 dark:to-[#0A0F0D]/50 z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{ backgroundImage: "url('/img/bioblog/Fondos_BioBlog-6.webp')" }}
                    />
                </div>
            </div>

            {/* Sección de Búsqueda y Filtros */}
            <div className="w-full max-w-5xl mx-auto px-2 md:px-4 -mt-8 md:-mt-12 relative z-20">
                <div className="bg-white/90 dark:bg-[var(--bg-secondary)] backdrop-blur-xl p-4 md:p-8 rounded-[2rem] shadow-2xl border border-white/20 dark:border-[var(--border-subtle)]">
                    {/* Barra de Búsqueda */}
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="relative flex items-center">
                            <input
                                type="search"
                                name="s"
                                placeholder="¿Qué deseas buscar para mejorar tu salud?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-24 md:pl-16 md:pr-32 py-4 md:py-5 bg-slate-100/50 dark:bg-[var(--bg-primary)] border-none rounded-2xl text-slate-700 dark:text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-[#9BAF9F] focus:ring-2 focus:ring-sky-500 transition-all duration-300 text-sm md:text-lg shadow-inner"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 px-3 py-2 md:right-3 md:px-6 md:py-3 bg-sky-500 hover:bg-sky-600 text-white text-[10px] md:text-base font-semibold rounded-xl transition-all duration-300 transform active:scale-95 shadow-md"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>

                    {/* Filtros de Categorías */}
                    <div className="mt-6 md:mt-8">
                        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                            {categories.map((category) => (
                                isActive(category.slug) ? (
                                    <button
                                        key={category.id}
                                        className="flex-shrink-0 px-4 py-2 md:px-6 md:py-2.5 bg-sky-500 text-white rounded-full text-xs md:text-sm font-semibold shadow-md active:scale-95 transition-all"
                                    >
                                        {category.name}
                                    </button>
                                ) : (
                                    <Link
                                        key={category.id}
                                        href={`/bioblog?category=${category.slug}`}
                                        className="flex-none px-6 py-2.5 bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-full font-medium hover:border-sky-500 hover:text-sky-500 transition-all"
                                    >
                                        {category.name}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BioBlogHeroFallback() {
    return (
        <div className="relative w-full flex flex-col md:flex-row min-h-[500px] md:min-h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] animate-pulse">
            <div className="flex-1 p-16 space-y-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full" />
                <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

export default function BioBlogHero() {
    return (
        <Suspense fallback={<BioBlogHeroFallback />}>
            <BioBlogHeroInner />
        </Suspense>
    );
}
