'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { blogApi } from '@/shared/lib/api/blog';
import { useAutoScrollCarousel } from '../hooks/useAutoScrollCarousel';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    summary: string;
    featured_image: string;
    category_name: string;
    published_at: string;
    comments_count: number;
}

export default function FeaturedCarousel() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const shouldDuplicate = posts.length > 3;
    const {
        shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily,
        isPaused, togglePause, handleKeyDown,
        handlePointerDown, handlePointerMove, handlePointerUp,
    } = useAutoScrollCarousel(shouldDuplicate);

    useEffect(() => {
        blogApi.getFeaturedPosts(7).then((data) => {
            if (data && data.length > 0) {
                setPosts(data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    summary: p.summary ?? '',
                    featured_image: p.featured_image ?? '/img/bioblog/blog-teclas.jpg',
                    category_name: p.category?.name ?? 'General',
                    published_at: p.published_at ?? '',
                    comments_count: 0,
                })));
            } else {
                return blogApi.getRecentPosts(7).then((fallback) => {
                    if (fallback && fallback.length > 0) {
                        setPosts(fallback.map((p: any) => ({
                            id: p.id,
                            title: p.title,
                            slug: p.slug,
                            summary: p.summary ?? '',
                            featured_image: p.featured_image ?? '/img/bioblog/blog-teclas.jpg',
                            category_name: p.category?.name ?? 'General',
                            published_at: p.published_at ?? '',
                            comments_count: 0,
                        })));
                    }
                });
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
        <div className="w-full py-16 px-4 max-w-[1600px] mx-auto bg-gradient-to-b from-slate-50 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-secondary)]">
            <div className="relative group/carousel">
                <div className="flex items-center justify-between mb-6">
                    <div />
                    <button
                        type="button"
                        onClick={togglePause}
                        aria-pressed={isPaused}
                        aria-label={isPaused ? 'Reanudar carrusel automático' : 'Pausar carrusel automático'}
                        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    >
                        {isPaused ? (
                            <Play className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <Pause className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            {isPaused ? 'En pausa' : 'Auto-scroll'}
                        </span>
                    </button>
                </div>

                <button
                    onClick={() => shift('left')}
                    aria-label="Anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                        border border-amber-100 dark:border-amber-900/40
                        flex items-center justify-center
                        text-amber-600 dark:text-amber-400
                        hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400
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
                        border border-amber-100 dark:border-amber-900/40
                        flex items-center justify-center
                        text-amber-600 dark:text-amber-400
                        hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400
                        transition-all duration-200
                        opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100
                        translate-x-1 group-hover/carousel:translate-x-0 focus-visible:translate-x-0"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Artículos destacados"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="overflow-hidden relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-[2rem] cursor-grab active:cursor-grabbing"
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
                            <div key={`${post.id}-${i}`} className="flex-shrink-0 w-[350px] flex">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: (i % posts.length) * 0.1 }}
                                    className="relative w-full h-[450px] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl"
                                >
                                    <Image
                                        src={post.featured_image}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
                                    <div className="absolute top-8 left-8 flex flex-col items-start gap-2">
                                        <Image
                                            src="/img/bioblog/ICON.png"
                                            alt="Lyrium"
                                            width={40}
                                            height={40}
                                            className="rounded-full shadow-lg"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-tight">LYRIUM</span>
                                            <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest leading-tight">
                                                {formatDate(post.published_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
                                        <h3 className="text-3xl font-bold text-white leading-tight mb-3 drop-shadow-md line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-8 line-clamp-2 max-w-2xl text-justify">
                                            {post.summary}
                                        </p>
                                        <div className="w-full flex justify-between items-center py-4 border-t border-white/20">
                                            <Link href={`/bioblog/${post.slug}`} className="text-xs font-bold text-white hover:text-sky-300 transition-colors">
                                                Leer Más
                                            </Link>
                                            <span className="text-xs text-white/60 font-medium flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {post.comments_count} Comments
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/bioblog/${post.slug}`} className="absolute inset-0 z-20" />
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}