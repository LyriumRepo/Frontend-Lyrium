'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { blogApi } from '@/shared/lib/api/blog';
import { Headphones, ExternalLink, Clock, Tag, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAutoScrollCarousel } from '../hooks/useAutoScrollCarousel';

interface PodcastItem {
    id: number;
    title: string;
    description: string;
    type: string;
    platform: string;
    url: string;
    cover_image: string | null;
    thumbnail: string | null;
    audio_url: string | null;
    duration: string | null;
    tags: string[] | null;
    published_at: string | null;
}

function formatDuration(duration: string | null): string {
    if (!duration) return '';
    if (duration.includes(':')) return duration;
    const mins = Math.floor(Number(duration) / 60);
    const secs = Number(duration) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PodcastSection() {
    const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const audioPodcasts = podcasts.filter(p => p.type === 'audio' || p.type === 'podcast');
    const shouldDuplicate = audioPodcasts.length > 3;
    const { shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily } = useAutoScrollCarousel(shouldDuplicate);

    useEffect(() => {
        blogApi.getPodcasts()
            .then((data: any[]) => {
                setPodcasts(data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description ?? '',
                    type: p.type ?? 'audio',
                    platform: p.platform ?? '',
                    url: p.url ?? '',
                    cover_image: p.cover_image ?? null,
                    thumbnail: p.thumbnail ?? null,
                    audio_url: p.audio_url ?? null,
                    duration: p.duration ?? null,
                    tags: p.tags ?? null,
                    published_at: p.published_at ?? null,
                })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const items = shouldDuplicate ? [...audioPodcasts, ...audioPodcasts] : audioPodcasts;

    return (
        <>
            <div className="w-full py-16 bg-slate-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="pt-8 pb-12 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <span className="h-px w-12 bg-lime-500" />
                            <span className="text-lime-600 dark:text-lime-400 font-bold tracking-widest text-sm uppercase">Lyrium</span>
                            <span className="h-px w-12 bg-lime-500" />
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-6 drop-shadow-sm uppercase">
                            PODCAST - AUDIOS
                        </h3>
                        <p className="text-slate-600 dark:text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light text-center max-w-5xl mx-auto">
                            Escucha nuestros podcasts sobre vida ecológica, bienestar natural y sostenibilidad.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : audioPodcasts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Headphones className="w-12 h-12 mx-auto mb-4 opacity-40" />
                            <p>No hay podcasts disponibles aún.</p>
                        </div>
                    ) : showAll ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {audioPodcasts.map((podcast, index) => (
                                    <motion.div
                                        key={podcast.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.04 }}
                                        className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] shadow-md hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="relative w-full sm:w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-[#1e2a2a]">
                                            {podcast.cover_image ? (
                                                <img src={podcast.cover_image} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Headphones className="w-10 h-10 text-slate-400" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <Link href={`/bioblog/podcast/${podcast.id}`}>
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">{podcast.title}</h4>
                                            </Link>
                                            {podcast.description && <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)] line-clamp-2">{podcast.description}</p>}
                                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                                {podcast.platform && <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2.5 py-1 rounded-full">{podcast.platform}</span>}
                                                {podcast.duration && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(podcast.duration)}</span>}
                                            </div>
                                            {podcast.tags && podcast.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {podcast.tags.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-[10px] text-slate-400 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <Link href={`/bioblog/podcast/${podcast.id}`} className="pt-2 flex items-center text-sm font-medium text-lime-600 dark:text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Escuchar <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-10">
                                <button onClick={() => setShowAll(false)} className="px-8 py-3 bg-white dark:bg-[var(--bg-secondary)] text-slate-800 dark:text-[var(--text-primary)] font-bold rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 dark:border-[var(--border-subtle)] transform active:scale-95">
                                    Ver menos
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative group/carousel">
                                <div className="flex items-center justify-between mb-6">
                                    <div />
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500" />
                                        </span>
                                        <span className="text-xs font-semibold text-lime-600 dark:text-lime-400 uppercase tracking-wider">
                                            Auto-scroll
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => shift('left')}
                                    aria-label="Anterior"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                                        w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                                        border border-lime-100 dark:border-lime-900/40
                                        flex items-center justify-center
                                        text-lime-600 dark:text-lime-400
                                        hover:bg-lime-50 dark:hover:bg-lime-950/40 hover:border-lime-400
                                        transition-all duration-200
                                        opacity-0 group-hover/carousel:opacity-100
                                        -translate-x-1 group-hover/carousel:translate-x-0"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => shift('right')}
                                    aria-label="Siguiente"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                                        w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
                                        border border-lime-100 dark:border-lime-900/40
                                        flex items-center justify-center
                                        text-lime-600 dark:text-lime-400
                                        hover:bg-lime-50 dark:hover:bg-lime-950/40 hover:border-lime-400
                                        transition-all duration-200
                                        opacity-0 group-hover/carousel:opacity-100
                                        translate-x-1 group-hover/carousel:translate-x-0"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                <div
                                    className="overflow-hidden relative"
                                    style={{
                                        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                                    }}
                                    onMouseEnter={() => { pausedRef.current = true; if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); }}
                                    onMouseLeave={() => { pausedRef.current = false; }}
                                    onTouchStart={() => pauseTemporarily()}
                                    onTouchEnd={() => {}}
                                >
                                    <div
                                        ref={trackRef}
                                        className="flex gap-5 will-change-transform py-4 px-2 items-stretch"
                                        style={{ width: 'max-content' }}
                                    >
                                        {items.map((podcast, i) => (
                                            <div key={`${podcast.id}-${i}`} className="flex-shrink-0 w-[480px] flex">
                                                <div className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] shadow-md hover:shadow-xl transition-all duration-300 w-full">
                                                    <div className="relative w-full sm:w-40 h-40 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-[#1e2a2a]">
                                                        {podcast.cover_image ? (
                                                            <img src={podcast.cover_image} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center"><Headphones className="w-10 h-10 text-slate-400" /></div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <Link href={`/bioblog/podcast/${podcast.id}`}>
                                                            <h4 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">{podcast.title}</h4>
                                                        </Link>
                                                        {podcast.description && <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)] line-clamp-2">{podcast.description}</p>}
                                                        <div className="flex flex-wrap items-center gap-3 pt-1">
                                                            {podcast.platform && <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2.5 py-1 rounded-full">{podcast.platform}</span>}
                                                            {podcast.duration && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(podcast.duration)}</span>}
                                                        </div>
                                                        {podcast.tags && podcast.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                {podcast.tags.slice(0, 3).map((tag, i) => (
                                                                    <span key={i} className="text-[10px] text-slate-400 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" />#{tag}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <Link href={`/bioblog/podcast/${podcast.id}`} className="pt-2 flex items-center text-sm font-medium text-lime-600 dark:text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Escuchar <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {audioPodcasts.length > 4 && (
                                <div className="flex justify-center mt-10">
                                    <button onClick={() => setShowAll(true)} className="px-8 py-3 bg-white dark:bg-[var(--bg-secondary)] text-slate-800 dark:text-[var(--text-primary)] font-bold rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 dark:border-[var(--border-subtle)] transform active:scale-95 flex items-center gap-2">
                                        Ver más <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}