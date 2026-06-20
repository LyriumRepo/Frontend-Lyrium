'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';

interface VideoItem {
    id: number;
    title: string;
    videoId: string;
    category: string;
    categoryLabel: string;
}

const YT_THUMB = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function VideoGallery() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
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
                    videoId: v.youtube_id ?? '',
                    category: v.category ?? 'general',
                    categoryLabel: v.category_label ?? v.category ?? 'General',
                }))
                : [];
            setVideos(items);
            const cats = Array.from(new Set(items.map((v) => v.category)));
            setCategories(cats);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const filteredVideos = activeFilter === '*'
        ? videos
        : videos.filter(v => v.category === activeFilter);

    const displayedVideos = showAll ? filteredVideos : filteredVideos.slice(0, 6);

    return (
        <>
            {/* Video Principal */}
            <div className="w-full pb-6 bg-white dark:bg-[var(--bg-secondary)] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 aspect-video group">
                        <iframe
                            className="absolute inset-0 w-full h-full border-0 transition-opacity duration-300"
                            src="https://www.youtube.com/embed/wiJzsSP_5Ao?rel=0&modestbranding=1&autoplay=0"
                            title="Video BioBlog"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>

            {/* Galería de Videos Filtrable */}
            <div className="w-full py-1 bg-slate-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Filtros de Categoría */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        <button
                            onClick={() => { setActiveFilter('*'); setShowAll(false); }}
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                activeFilter === '*'
                                    ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg'
                                    : 'bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[#2A3F33] border border-slate-200 dark:border-[var(--border-subtle)]'
                            }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setActiveFilter(cat); setShowAll(false); }}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    activeFilter === cat
                                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg'
                                        : 'bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[#2A3F33] border border-slate-200 dark:border-[var(--border-subtle)]'
                                }`}
                            >
                                {categories.find(c => c === cat) ? cat.charAt(0).toUpperCase() + cat.slice(1) : cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No hay videos disponibles.</p>
                        </div>
                    ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedVideos.map((video) => (
                            <div
                                key={video.id}
                                className={`premium-gallery-item group ${activeFilter !== '*' && video.category !== activeFilter ? 'hidden' : ''}`}
                            >
                                <div className="relative rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)]">
                                    {/* Miniatura */}
                                    <div className="aspect-video relative overflow-hidden">
                                        <Image
                                            src={imgErrors.has(video.id) || !video.videoId ? '/img/bioblog/blog-teclas.jpg' : YT_THUMB(video.videoId)}
                                            alt={video.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                                            onError={() => handleImgError(video.id)}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                                        {/* Botón Play */}
                                        <a
                                            href={`https://www.youtube.com/embed/${video.videoId}?feature=oembed&autoplay=1`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                blogApi.registerVideoView(video.id);
                                                window.open(`https://www.youtube.com/embed/${video.videoId}?feature=oembed&autoplay=1`, '_blank');
                                            }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="w-16 h-16 bg-sky-500 dark:bg-[var(--icons-green)] text-white rounded-full flex items-center justify-center transform transition-all duration-500 scale-90 group-hover:scale-100 shadow-xl group-hover:shadow-sky-500/50 dark:group-hover:shadow-lime-100/50">
                                                <Play className="w-8 h-8 ml-1" fill="currentColor" />
                                            </div>
                                        </a>

                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-md text-slate-800 dark:text-[var(--text-primary)] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                                                {video.categoryLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-6">
                                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight group-hover:text-sky-600 dark:group-hover:text-lime-200 transition-colors line-clamp-2">
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón Cargar Más */}
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
                    </>
                    )}
                </div>
            </div>
        </>
    );
}
