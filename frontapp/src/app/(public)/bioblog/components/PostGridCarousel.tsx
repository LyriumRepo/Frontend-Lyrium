'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export default function PostGridCarousel() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const shouldDuplicate = posts.length > 3;
    const { shift, trackRef, pausedRef, resumeTimerRef, pauseTemporarily } = useAutoScrollCarousel(shouldDuplicate);

    useEffect(() => {
        blogApi.getRecentPosts(6).then((data) => {
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
        <div className="w-full py-16 px-4 max-w-[1600px] mx-auto bg-gray-50 dark:bg-[var(--bg-primary)]">
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
                        {items.map((post, i) => (
                            <div key={`${post.id}-${i}`} className="flex-shrink-0 w-[350px] flex">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (i % posts.length) * 0.08 }}
                                    className="flex flex-col h-[450px] group bg-white dark:bg-[var(--bg-secondary)] border border-slate-100 dark:border-[var(--border-subtle)] rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-500"
                                >
                                    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl mb-5">
                                        <Image
                                            src={post.featured_image}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] md:text-xs font-black text-sky-500 dark:text-[var(--icons-green)] uppercase tracking-widest leading-none">
                                                {post.category_name}
                                            </span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-3 group-hover:text-sky-600 dark:group-hover:text-[var(--icons-green)] transition-colors line-clamp-2">
                                            <Link href={`/bioblog/${post.slug}`}>{post.title}</Link>
                                        </h3>
                                        <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm leading-relaxed mb-4 line-clamp-3 font-medium text-justify">
                                            {post.summary}
                                        </p>
                                        <div className="mt-auto text-[10px] font-bold text-slate-400 dark:text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                                            LYRIUM <span className="text-slate-300">|</span> {formatDate(post.published_at)}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}