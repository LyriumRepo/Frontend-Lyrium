'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import HeroPill from '@/components/layout/public/HeroPill';
import { blogApi, BlogPostApi } from '@/shared/lib/api/blog';
import { sanitizeHtml } from '@/shared/lib/sanitize';

interface Comment {
    id: number;
    author_name: string;
    content: string;
    created_at: string;
}

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [post, setPost] = useState<BlogPostApi | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentForm, setCommentForm] = useState({
        author_name: '',
        author_email: '',
        content: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [commentSuccess, setCommentSuccess] = useState(false);

    useEffect(() => {
        loadPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const loadPost = async () => {
        setLoading(true);
        try {
            const postData = await blogApi.getPostBySlug(slug);

            setPost(postData);
            if (postData) {
                const comms = await blogApi.getComments(postData.id);
                setComments(comms);
            }
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post || !commentForm.author_name.trim() || !commentForm.content.trim()) return;

        setSubmitting(true);
        try {
            await blogApi.createComment({
                post_id: post.id,
                author_name: commentForm.author_name,
                author_email: commentForm.author_email,
                content: commentForm.content,
            });
            setCommentSuccess(true);
            setCommentForm({ author_name: '', author_email: '', content: '' });
            loadPost();
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
                <div className="loader-small" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                <HeroPill icon="WarningCircle" text="Artículo no encontrado" />
                <p className="text-slate-600 mt-4 mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
                <Link href="/bioblog" className="text-emerald-500 hover:underline">
                    Volver al BioBlog
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-10">
            {/* Volver */}
            <Link
                href="/bioblog"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-500 mb-4"
            >
                <Icon name="ArrowLeft" className="w-4 h-4" />
                Volver al BioBlog
            </Link>

            {/* Hero Pill */}
            <HeroPill icon="Article" text={post.category_name} />

            {/* Artículo */}
            <article className="mt-6">
                {/* Header */}
                <header className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <span>{post.author}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.published_at)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Icon name="Eye" className="w-4 h-4" />
                            {post.views} vistas
                        </span>
                    </div>
                </header>

                {/* Imagen destacada */}
                {post.featured_image && (
                    <div className="mb-6 md:mb-8 rounded-2xl overflow-hidden">
                        <Image
                            src={post.featured_image}
                            alt={post.title}
                            width={800}
                            height={400}
                            className="w-full h-auto max-h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Contenido */}
                <div
                    className="prose prose-lg max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                        Etiquetas:
                        <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                            {post.category_name}
                        </span>
                    </span>
                </div>
            </article>

            {/* Comentarios */}
            <section className="mt-10 md:mt-14">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Icon name="ChatCircle" className="text-emerald-600" />
                    Comentarios ({comments.length})
                </h2>

                {/* Lista de comentarios */}
                {comments.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                                        {comment.author_name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-800">{comment.author_name}</span>
                                            <span className="text-xs text-slate-400">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-slate-600">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-xl p-6 text-center mb-8">
                        <p className="text-slate-500">Sé el primero en comentar este artículo.</p>
                    </div>
                )}

                {/* Formulario de comentario */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Deja tu comentario</h3>

                    {commentSuccess && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                            <Icon name="CheckCircle" className="w-5 h-5" />
                            <span>¡Comentario enviado! Será visible tras ser aprobado.</span>
                        </div>
                    )}

                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="author_name" className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="author_name"
                                    value={commentForm.author_name}
                                    onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="author_email" className="block text-sm font-medium text-slate-700 mb-1">
                                    Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    id="author_email"
                                    value={commentForm.author_email}
                                    onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                                Comentario <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                value={commentForm.content}
                                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Icon name="PaperPlaneRight" className="w-5 h-5" />
                                    Enviar Comentario
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
