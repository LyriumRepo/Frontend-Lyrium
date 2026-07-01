'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Headphones, Calendar, Tag, Clock, ExternalLink, Youtube } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';
import BlogComments from '../../components/BlogComments';

function parseSpotifyUrl(url: string): { type: string; id: string } | null {
    const match = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|episode|show|album)\/([a-zA-Z0-9]+)/);
    if (match) return { type: match[1], id: match[2] };
    return null;
}

function parseYoutubeUrl(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export default function PodcastDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [podcast, setPodcast] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            blogApi.getPodcast(id).then(setPodcast).catch(() => {}).finally(() => setLoading(false));
        }
    }, [id]);

    const formatDate = (d: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatDuration = (d: string | null) => {
        if (!d) return '';
        if (d.includes(':')) return d;
        const mins = Math.floor(Number(d) / 60);
        const secs = Number(d) % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const spotify = podcast?.url ? parseSpotifyUrl(podcast.url) : null;
    const youtubeId = podcast?.url ? parseYoutubeUrl(podcast.url) : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-64 bg-slate-200 dark:bg-[#2A3F33] rounded-3xl" />
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                </div>
            </div>
        );
    }

    if (!podcast) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <Headphones className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">Podcast no encontrado</h2>
                    <Link href="/bioblog" className="text-emerald-600 hover:underline">Volver al BioBlog</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
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
                    {/* Player Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 ring-1 ring-white/10 mb-8"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                            {/* Cover */}
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 ring-2 ring-white/20">
                                {podcast.cover_image ? (
                                    <Image
                                        src={podcast.cover_image}
                                        alt={podcast.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                                        <Headphones className="w-16 h-16 text-white/60" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                            </div>

                            {/* Info + Player */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
                                        {podcast.platform || 'Podcast'}
                                    </span>
                                    {podcast.duration && (
                                        <span className="text-white/60 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDuration(podcast.duration)}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                                    {podcast.title}
                                </h1>

                                {podcast.description && (
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
                                        {podcast.description}
                                    </p>
                                )}

                                {podcast.tags && podcast.tags.length > 0 && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-6">
                                        {podcast.tags.map((tag: string, i: number) => (
                                            <span key={i} className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Embedded Player */}
                    {spotify && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] shadow-lg mb-8"
                        >
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-[var(--border-subtle)]">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <Headphones className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)]">
                                    Escuchar en Spotify
                                </span>
                            </div>
                            <div className="p-4">
                                <iframe
                                    src={`https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator`}
                                    width="100%"
                                    height="152"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    className="rounded-xl border-0"
                                />
                            </div>
                        </motion.div>
                    )}

                    {youtubeId && !spotify && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-slate-100 dark:ring-[var(--border-subtle)] mb-8"
                        >
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full">
                                <Youtube className="w-4 h-4 text-red-400" />
                                <span className="text-xs font-semibold text-white">YouTube</span>
                            </div>
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                                title={podcast.title}
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                            />
                        </motion.div>
                    )}

                    {/* Audio Player (fallback) */}
                    {!spotify && !youtubeId && podcast.audio_url && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="mb-8"
                        >
                            <audio controls className="w-full rounded-xl" src={podcast.audio_url}>
                                Tu navegador no soporta audio HTML5.
                            </audio>
                        </motion.div>
                    )}

                    {!spotify && !youtubeId && !podcast.audio_url && podcast.url && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="flex justify-center mb-8"
                        >
                            <a
                                href={podcast.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Escuchar en {podcast.platform || 'plataforma externa'}
                            </a>
                        </motion.div>
                    )}

                    {/* Metadata */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-[var(--text-muted)] pb-6 border-b border-slate-200 dark:border-[var(--border-subtle)]"
                    >
                        {podcast.published_at && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(podcast.published_at)}
                            </span>
                        )}
                        {podcast.tags && podcast.tags.length > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Tag className="w-4 h-4" />
                                {podcast.tags.slice(0, 3).join(', ')}
                            </span>
                        )}
                    </motion.div>
                </article>

                <BlogComments podcastId={id} />
            </div>
        </div>
    );
}
