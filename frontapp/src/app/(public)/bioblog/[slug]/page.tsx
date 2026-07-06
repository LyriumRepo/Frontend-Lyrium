'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock, Eye } from 'lucide-react';
import { blogApi, BlogPostApi } from '@/shared/lib/api/blog';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import BlogComments from '../components/BlogComments';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [post, setPost] = useState<BlogPostApi | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPost();
    }, [slug]);

    const loadPost = async () => {
        setLoading(true);
        try {
            const postData = await blogApi.getPostBySlug(slug);
            setPost(postData);
            if (postData) {
                blogApi.registerArticleView(postData.id);
            }
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const readingTime = (content: string): string => {
        const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const mins = Math.max(1, Math.ceil(words / 200));
        return `${mins} min de lectura`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
                <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 animate-pulse">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-10 w-3/4 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-6 w-1/2 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    <div className="h-[400px] w-full bg-slate-200 dark:bg-[#2A3F33] rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-slate-200 dark:bg-[#2A3F33] rounded" />
                        <div className="h-4 w-5/6 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                        <div className="h-4 w-4/6 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">
                        Artículo no encontrado
                    </h2>
                    <p className="text-slate-500 dark:text-[var(--text-muted)] mb-8">
                        El artículo que buscas no existe o ha sido eliminado.
                    </p>
                    <Link
                        href="/bioblog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al BioBlog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            {/* Backdrop sutil */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Volver */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link
                        href="/bioblog"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm font-medium text-slate-600 dark:text-[var(--text-secondary)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al BioBlog
                    </Link>
                </motion.div>

                <article className="mt-8">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Category + Reading Time */}
                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-500/20">
                                {post.category?.name ?? 'General'}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {readingTime(post.content)}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] leading-tight mb-6 tracking-tight">
                            {post.title}
                        </h1>

                        {/* Author & Date */}
                        <div className="flex flex-wrap items-center gap-5 pb-8 border-b border-slate-200 dark:border-[var(--border-subtle)] mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {(post.author_name ?? 'L').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-[var(--text-primary)]">
                                        {post.author_name ?? 'Lyrium BioMarketplace'}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-[var(--text-muted)]">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(post.published_at ?? '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.header>

                    {/* Featured Image */}
                    {post.featured_image && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-slate-100 dark:ring-[var(--border-subtle)]"
                        >
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                width={1200}
                                height={630}
                                className="w-full h-auto max-h-[500px] object-cover"
                                priority
                            />
                        </motion.div>
                    )}

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <style>{`
                            .blog-content {
                                color: #334155;
                            }
                            .dark .blog-content {
                                color: #E2E8F0;
                            }
                            .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
                                color: #1E293B;
                                font-weight: 800;
                                line-height: 1.2;
                                margin-top: 2rem;
                                margin-bottom: 0.75rem;
                                letter-spacing: -0.01em;
                            }
                            .dark .blog-content h1,
                            .dark .blog-content h2,
                            .dark .blog-content h3,
                            .dark .blog-content h4 {
                                color: #F1F5F9;
                            }
                            .blog-content h2 { font-size: 1.75rem; }
                            .blog-content h3 { font-size: 1.35rem; }
                            .blog-content p {
                                margin-bottom: 1.25rem;
                                line-height: 1.75;
                                font-size: 1.0625rem;
                            }
                            .blog-content img {
                                max-width: 100%;
                                height: auto;
                                border-radius: 16px;
                                margin: 1.5rem 0;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                            }
                            .dark .blog-content img {
                                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                            }
                            .blog-content a {
                                color: #059669;
                                text-decoration: underline;
                                text-underline-offset: 2px;
                            }
                            .dark .blog-content a {
                                color: #34D399;
                            }
                            .blog-content ul, .blog-content ol {
                                margin-bottom: 1.25rem;
                                padding-left: 1.5rem;
                            }
                            .blog-content li {
                                margin-bottom: 0.5rem;
                                line-height: 1.7;
                            }
                            .blog-content blockquote {
                                border-left: 4px solid #10B981;
                                padding: 1rem 1.5rem;
                                margin: 1.5rem 0;
                                background: #F0FDF4;
                                border-radius: 0 12px 12px 0;
                                font-style: italic;
                            }
                            .dark .blog-content blockquote {
                                background: rgba(16, 185, 129, 0.08);
                                border-left-color: #34D399;
                            }
                            .blog-content iframe {
                                max-width: 100%;
                                border-radius: 16px;
                                margin: 1.5rem 0;
                            }
                            .blog-content pre {
                                background: #1E293B;
                                color: #E2E8F0;
                                padding: 1.25rem;
                                border-radius: 12px;
                                overflow-x: auto;
                                margin: 1.5rem 0;
                            }
                        `}</style>
                        <div
                            className="blog-content leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                        />
                    </motion.div>

                    {/* Tags footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-12 pt-6 border-t border-slate-200 dark:border-[var(--border-subtle)] flex flex-wrap items-center gap-3"
                    >
                        <Tag className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />
                        <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#2A3F33] text-slate-600 dark:text-[var(--text-secondary)] rounded-full text-xs font-semibold border border-slate-200 dark:border-[var(--border-subtle)]">
                            {post.category?.name ?? 'General'}
                        </span>
                    </motion.div>
                </article>

                {/* Comments */}
                <BlogComments articleId={post.id} />
            </div>
        </div>
    );
}
