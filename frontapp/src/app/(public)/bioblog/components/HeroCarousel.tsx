'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { blogApi } from '@/shared/lib/api/blog';
import { useAutoScrollCarousel } from '../hooks/useAutoScrollCarousel';

interface HeroPost {
    id: number;
    title: string;
    slug: string;
    summary: string;
    featured_image: string;
    category_name: string;
    published_at: string;
}

export default function HeroCarousel() {
    const [posts, setPosts] = useState<HeroPost[]>([]);
    const shouldDuplicate = posts.length > 3;
    const {
        shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily,
        isPaused, togglePause, handleKeyDown,
        handlePointerDown, handlePointerMove, handlePointerUp,
    } = useAutoScrollCarousel(shouldDuplicate);

    useEffect(() => {
        blogApi.getRecentPosts(4).then((data) => {
            if (data && data.length > 0) {
                setPosts(data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    summary: p.summary ?? '',
                    featured_image: p.featured_image ?? '/img/bioblog/blog-teclas.jpg',
                    category_name: p.category?.name ?? 'General',
                    published_at: p.published_at ?? '',
                })));
            }
        }).catch(() => {});
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    const items = shouldDuplicate ? [...posts, ...posts] : posts;

    return (
        <div className="w-full pb-16 px-4 max-w-[1920px] mx-auto overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="relative group/carousel">
                <div className="flex items-center justify-between mb-6 px-4">
                    <div />
                    <button
                        type="button"
                        onClick={togglePause}
                        aria-pressed={isPaused}
                        aria-label={isPaused ? 'Reanudar carrusel automático' : 'Pausar carrusel automático'}
                        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                    >
                        {isPaused ? (
                            <Play className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        ) : (
                            <Pause className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                        )}
                        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                            {isPaused ? 'En pausa' : 'Auto-scroll'}
                        </span>
                    </button>
                </div>

                <button
                    onClick={() => shift('left')}
                    aria-label="Anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                        border border-sky-100 dark:border-sky-900/40
                        flex items-center justify-center
                        text-sky-600 dark:text-sky-400
                        hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400
                        transition-all duration-200
                        opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100
                        -translate-x-1 group-hover/carousel:translate-x-0 focus-visible:translate-x-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => shift('right')}
                    aria-label="Siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                        border border-sky-100 dark:border-sky-900/40
                        flex items-center justify-center
                        text-sky-600 dark:text-sky-400
                        hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400
                        transition-all duration-200
                        opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100
                        translate-x-1 group-hover/carousel:translate-x-0 focus-visible:translate-x-0"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Artículos destacados del blog"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="overflow-hidden relative focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-[3rem] cursor-grab active:cursor-grabbing"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    }}
                    onMouseEnter={() => { pausedRef.current = true; if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); }}
                    onMouseLeave={() => { if (!isPaused) pausedRef.current = false; }}
                    onTouchStart={() => pauseTemporarily()}
                    onTouchEnd={() => {}}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <div
                        ref={trackRef}
                        className="flex gap-5 will-change-transform py-4 px-2 items-stretch"
                        style={{ width: 'max-content' }}
                    >
                        {items.map((post, i) => (
                            <div key={`${post.id}-${i}`} className="flex-shrink-0 w-[500px] md:w-[650px] lg:w-[750px] flex">
                                <div className="relative w-full h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer">
                                    <Image
                                        src={post.featured_image}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 70vw"
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent" />
                                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end md:justify-center items-start max-w-2xl">
                                        <div className="mb-6 overflow-hidden">
                                            <span className="inline-block px-4 py-1.5 bg-sky-500/20 dark:bg-[var(--icons-green)] backdrop-blur-md border border-sky-400/30 text-sky-300 dark:text-[var(--brand-green-hover)] rounded-full text-xs font-black tracking-widest uppercase">
                                                {post.category_name}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg line-clamp-2">
                                            <Link href={`/bioblog/${post.slug}`} className="hover:text-sky-400 transition-colors duration-300">
                                                {post.title}
                                            </Link>
                                        </h2>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3 text-slate-300 text-xs font-bold tracking-widest uppercase">
                                                <span className="text-sky-500 dark:text-[var(--icons-green)]">BY LYRIUM</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-500" />
                                                <span>{formatDate(post.published_at)}</span>
                                            </div>
                                            <p className="text-slate-300 text-lg line-clamp-2 max-w-lg hidden md:block">
                                                {post.summary}
                                            </p>
                                        </div>
                                        <div className="mt-8">
                                            <Link
                                                href={`/bioblog/${post.slug}`}
                                                className="inline-flex items-center gap-2 text-white font-bold tracking-widest text-sm hover:gap-4 transition-all duration-300 group/btn"
                                            >
                                                LEER ARTÍCULO
                                                <ChevronRight className="text-sky-500 dark:text-[var(--icons-green)] group-hover/btn:text-white transition-colors" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}