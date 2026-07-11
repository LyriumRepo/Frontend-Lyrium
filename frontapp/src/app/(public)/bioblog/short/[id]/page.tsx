'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, Calendar, ExternalLink, Music2, Youtube } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';
import BlogComments from '../../components/BlogComments';

function parseShortUrl(url: string, platform: string): { type: 'tiktok' | 'youtube_shorts' | 'unknown'; embedUrl: string | null; videoId?: string } {
    if (platform === 'tiktok' || url.includes('tiktok.com')) {
        const fullMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
        const vtMatch = url.match(/(?:vt|vm)\.tiktok\.com\/([a-zA-Z0-9]+)/);
        const numericId = fullMatch?.[1];
        if (numericId) {
            return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/${numericId}`, videoId: numericId };
        }
        if (vtMatch?.[1]) {
            return { type: 'tiktok', embedUrl: null, videoId: vtMatch[1] };
        }
        return { type: 'tiktok', embedUrl: null };
    }

    if (platform === 'youtube_shorts' || url.includes('youtube.com/shorts') || url.includes('youtu.be/shorts')) {
        const match = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)([a-zA-Z0-9_-]{11})/);
        const id = match?.[1];
        if (id) {
            return { type: 'youtube_shorts', embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, videoId: id };
        }
        return { type: 'youtube_shorts', embedUrl: null };
    }

    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return { type: 'youtube_shorts', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`, videoId: ytMatch[1] };
    }

    return { type: 'unknown', embedUrl: null };
}

export default function ShortDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [short, setShort] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            blogApi.getShort(id).then((data) => {
                setShort(data);
                if (data) blogApi.registerShortView(id);
            }).catch(() => {}).finally(() => setLoading(false));
        }
    }, [id]);

    const formatDate = (d: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatDuration = (d: string | number | null) => {
        if (!d) return '';
        if (typeof d === 'number') return `${d}s`;
        if (d.includes(':')) return d;
        return `${d}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="aspect-[9/16] max-w-sm mx-auto bg-slate-200 dark:bg-[#2A3F33] rounded-3xl" />
                    <div className="h-8 w-3/4 mx-auto bg-slate-200 dark:bg-[#2A3F33] rounded" />
                </div>
            </div>
        );
    }

    if (!short) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <Play className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">Short no encontrado</h2>
                    <Link href="/bioblog" className="text-emerald-600 hover:underline">Volver al BioBlog</Link>
                </div>
            </div>
        );
    }

    const parsed = parseShortUrl(short.url ?? '', short.platform ?? '');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link
                        href="/bioblog"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm font-medium text-slate-600 dark:text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al BioBlog
                    </Link>
                </motion.div>

                <article className="mt-6">
                    {/* Short Embed */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-sm mx-auto"
                    >
                        {parsed.embedUrl ? (
                            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-white/10">
                                <iframe
                                    src={parsed.embedUrl}
                                    className="absolute inset-0 w-full h-full border-0"
                                    title={short.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
                                    {parsed.type === 'tiktok' ? <Music2 className="w-3.5 h-3.5 text-white/80" /> : <Youtube className="w-3.5 h-3.5 text-white/80" />}
                                    <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                                        {parsed.type === 'tiktok' ? 'TikTok' : 'YouTube Shorts'}
                                    </span>
                                </div>
                            </div>
                        ) : short.thumbnail ? (
                            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-white/10 group">
                                <img
                                    src={short.thumbnail}
                                    alt={short.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                <a
                                    href={short.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                        <Play className="w-8 h-8 ml-0.5 text-slate-800" fill="currentColor" />
                                    </div>
                                </a>
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h2 className="text-xl font-bold text-white mb-1">{short.title}</h2>
                                </div>
                            </div>
                        ) : (
                            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4">
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
                                    <Youtube className="w-3.5 h-3.5 text-white/80" />
                                    <span className="text-[10px] font-semibold text-white uppercase tracking-wider">YouTube Shorts</span>
                                </div>
                                <Play className="w-16 h-16 text-white/20" />
                                <p className="text-white/40 text-sm font-medium">Vista previa no disponible</p>
                                <a
                                    href={short.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Ver original
                                </a>
                            </div>
                        )}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-2xl mx-auto text-center mt-8"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                            <span className="px-3.5 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-200/50 dark:border-purple-500/20 flex items-center gap-1.5">
                                {parsed.type === 'tiktok' ? <Music2 className="w-3 h-3" /> : <Youtube className="w-3 h-3" />}
                                {short.platform?.replace('_', ' ') ?? 'Short'}
                            </span>
                            {short.duration && (
                                <span className="text-xs text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(short.duration)}
                                </span>
                            )}
                            {short.published_at && (
                                <span className="text-xs text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(short.published_at)}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-4">
                            {short.title}
                        </h1>

                        {short.description && (
                            <p className="text-slate-600 dark:text-[var(--text-secondary)] leading-relaxed">
                                {short.description}
                            </p>
                        )}

                        <a
                            href={short.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-500/30"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Abrir en {short.platform?.replace('_', ' ') || 'plataforma externa'}
                        </a>
                    </motion.div>
                </article>

                <BlogComments shortId={id} />
            </div>
        </div>
    );
}
