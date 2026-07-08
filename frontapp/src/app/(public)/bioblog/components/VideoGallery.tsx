'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';
import { useAutoScrollCarousel } from '../hooks/useAutoScrollCarousel';

function extractYoutubeId(url: string, youtubeId: string | null): string {
    if (youtubeId) return youtubeId;
    if (!url) return '';
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return '';
}

interface VideoItem {
    id: number;
    title: string;
    videoId: string;
    category: string;
    categoryLabel: string;
}

const YT_THUMB = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const CATEGORIES = [
    { value: '*', label: 'Todos' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'jardineria', label: 'Jardinería' },
];

export default function VideoGallery() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [activeFilter, setActiveFilter] = useState('*');
    const [loading, setLoading] = useState(true);
    const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

    const handleImgError = (id: number) => {
        setImgErrors(prev => new Set(prev).add(id));
    };

    useEffect(() => {
        blogApi.getVideos().then((data: any[]) => {
            const items: VideoItem[] = (data && data.length > 0)
                ? data.map((v: any) => ({
                    id: v.id,
                    title: v.title,
                    videoId: extractYoutubeId(v.url ?? '', v.youtube_id),
                    category: v.category ?? 'general',
                    categoryLabel: v.category_label ?? v.category ?? 'General',
                }))
                : [];
            setVideos(items);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const filteredVideos = activeFilter === '*'
        ? videos
        : videos.filter(v => v.category === activeFilter);

    const hasAutoScroll = filteredVideos.length > 3;
    const { shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily } = useAutoScrollCarousel(hasAutoScroll);
    const items = hasAutoScroll ? [...filteredVideos, ...filteredVideos] : filteredVideos;

    return (
        <div className="w-full py-16 bg-slate-50 dark:bg-[var(--bg-primary)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="pt-8 pb-12 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <span className="h-px w-12 bg-sky-500" />
                        <span className="text-sky-600 dark:text-sky-400 font-bold tracking-widest text-sm uppercase">Lyrium</span>
                        <span className="h-px w-12 bg-sky-500" />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-6 drop-shadow-sm uppercase">VIDEOS</h3>
                    <p className="text-slate-600 dark:text-[var(--text-secondary)] text-base md:text-lg leading-relaxed font-light text-center max-w-5xl mx-auto">
                        Contenido audiovisual sobre vida saludable, recetas, jardinería y más.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveFilter(cat.value)}
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                activeFilter === cat.value
                                    ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg'
                                    : 'bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[#2A3F33] border border-slate-200 dark:border-[var(--border-subtle)]'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {!loading && filteredVideos.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>No hay videos disponibles.</p>
                    </div>
                )}
                {!loading && filteredVideos.length > 0 && (
                    <div className="relative group/carousel">
                        <div className="flex items-center justify-between mb-6">
                            <div />
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
                                </span>
                                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                    Auto-scroll
                                </span>
                            </div>
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
                                border border-sky-100 dark:border-sky-900/40
                                flex items-center justify-center
                                text-sky-600 dark:text-sky-400
                                hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400
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
                                {items.map((video, i) => (
                                    <div key={`${video.id}-${i}`} className="flex-shrink-0 w-[380px] flex">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: (i % filteredVideos.length) * 0.06 }}
                                            className="group w-full rounded-[2rem] overflow-hidden bg-white dark:bg-[var(--bg-secondary)] border border-emerald-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.03]"
                                        >
                                            <Link href={`/bioblog/video/${video.id}`} className="block relative aspect-video overflow-hidden">
                                                <Image
                                                    src={imgErrors.has(video.id) || !video.videoId ? '/img/bioblog/blog-teclas.jpg' : YT_THUMB(video.videoId)}
                                                    alt={video.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={() => handleImgError(video.id)}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="w-14 h-14 bg-[var(--brand-green)] rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                                        <Play className="w-7 h-7 ml-0.5 text-white" fill="currentColor" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-[var(--brand-green)]/30 text-[var(--brand-green)] dark:text-[var(--icons-green)] text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                                                        {video.categoryLabel}
                                                    </span>
                                                </div>
                                            </Link>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--brand-green)] dark:group-hover:text-[var(--icons-green)] transition-colors">
                                                    <Link href={`/bioblog/video/${video.id}`}>{video.title}</Link>
                                                </h3>
                                                <p className="text-xs font-bold text-[var(--brand-green)] dark:text-[var(--icons-green)] uppercase tracking-widest mt-2">
                                                    LYRIUM
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}