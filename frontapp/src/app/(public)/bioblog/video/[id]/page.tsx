'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Calendar, Tag, Film } from 'lucide-react';
import { blogApi } from '@/shared/lib/api/blog';
import BlogComments from '../../components/BlogComments';

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

export default function VideoDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            blogApi.getVideo(id).then((data) => {
                setVideo(data);
                if (data) blogApi.registerVideoView(id);
            }).catch(() => {}).finally(() => setLoading(false));
        }
    }, [id]);

    const formatDate = (d: string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="aspect-video bg-slate-200 dark:bg-[#2A3F33] rounded-3xl" />
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <Film className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">Video no encontrado</h2>
                    <Link href="/bioblog" className="text-emerald-600 hover:underline">Volver al BioBlog</Link>
                </div>
            </div>
        );
    }

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
                    {/* Video Embed */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-slate-100 dark:ring-[var(--border-subtle)] mb-8"
                    >
                        {(() => {
                            const ytId = extractYoutubeId(video.url ?? '', video.youtube_id);
                            if (!ytId) {
                                return (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 bg-slate-800 rounded-3xl">
                                        <Film className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Video no disponible</p>
                                        {video.url && (
                                            <a
                                                href={video.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors"
                                            >
                                                Ver en YouTube
                                            </a>
                                        )}
                                    </div>
                                );
                            }
                            return (
                                <iframe
                                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                                    title={video.title}
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full border-0"
                                />
                            );
                        })()}
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3.5 py-1.5 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-full text-xs font-bold uppercase tracking-wider border border-sky-200/50 dark:border-sky-500/20 flex items-center gap-1.5">
                                <Play className="w-3 h-3" />
                                {video.category_label ?? video.category ?? 'Video'}
                            </span>
                            {video.duration && (
                                <span className="text-xs text-slate-400 dark:text-[var(--text-muted)]">
                                    {video.duration}s
                                </span>
                            )}
                            {video.published_at && (
                                <span className="text-xs text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(video.published_at)}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-4">
                            {video.title}
                        </h1>

                        {video.description && (
                            <p className="text-slate-600 dark:text-[var(--text-secondary)] text-lg leading-relaxed max-w-3xl">
                                {video.description}
                            </p>
                        )}
                    </motion.div>
                </article>

                {/* Comments */}
                <BlogComments videoId={id} />
            </div>
        </div>
    );
}
