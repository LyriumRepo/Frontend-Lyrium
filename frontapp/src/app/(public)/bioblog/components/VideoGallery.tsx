'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';
import { videoCategories, videos } from '../data/blogData';

export default function VideoGallery() {
    const [activeFilter, setActiveFilter] = useState('*');
    const [showAll, setShowAll] = useState(false);

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
                        {videoCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveFilter(cat.id);
                                    setShowAll(false);
                                }}
                                className={`category px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                                    activeFilter === cat.id
                                        ? 'bg-sky-500 text-white shadow-lg'
                                        : 'bg-white dark:bg-[var(--bg-secondary)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[#2A3F33] border border-slate-200 dark:border-[var(--border-subtle)]'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Contenedor de la Galería */}
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
                                            src={`https://i.ytimg.com/vi/${video.videoId}/maxresdefault.jpg`}
                                            alt={video.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                                        {/* Botón Play */}
                                        <a
                                            href={`https://www.youtube.com/embed/${video.videoId}?feature=oembed&autoplay=1`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="w-16 h-16 bg-sky-500 text-white rounded-full flex items-center justify-center transform transition-all duration-500 scale-90 group-hover:scale-100 shadow-xl group-hover:shadow-sky-500/50">
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
                                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
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
                </div>
            </div>
        </>
    );
}
