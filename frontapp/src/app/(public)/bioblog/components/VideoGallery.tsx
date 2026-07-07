'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';

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
    const [showAll, setShowAll] = useState(false);
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

    const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, 6);

    return (
        <div className="w-full py-16 bg-slate-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Título */}
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

                    {/* Filtros de Categoría */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => { setActiveFilter(cat.value); setShowAll(false); }}
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
                    {!loading && videos.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <p>No hay videos disponibles.</p>
                        </div>
                    )}
                    {!loading && videos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                className={activeFilter !== '*' && video.category !== activeFilter ? 'hidden' : ''}
                            >
                                <div className="group rounded-xl overflow-hidden bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl transition-all duration-300">
                                    <Link href={`/bioblog/video/${video.id}`} className="block relative aspect-video overflow-hidden">
                                        <Image
                                            src={imgErrors.has(video.id) || !video.videoId ? '/img/bioblog/blog-teclas.jpg' : YT_THUMB(video.videoId)}
                                            alt={video.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={() => handleImgError(video.id)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center">
                                                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className="px-2 py-0.5 bg-black/70 text-white text-[10px] font-semibold rounded">
                                                {video.categoryLabel}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="p-3 flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-[#2A3F33] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-sky-600 dark:text-lime-300">
                                                {video.title.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-slate-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight">
                                                <Link href={`/bioblog/video/${video.id}`}>
                                                    {video.title}
                                                </Link>
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-[var(--text-secondary)] mt-1">
                                                Lyrium
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </div>
                    )}
                    {filteredVideos.length > 6 && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="px-8 py-3 bg-white dark:bg-[var(--bg-secondary)] text-slate-800 dark:text-[var(--text-primary)] font-bold rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 dark:border-[var(--border-subtle)] transform active:scale-95 flex items-center gap-2"
                            >
                                {showAll ? 'Ver menos' : 'Cargar más'}
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
    );
}
