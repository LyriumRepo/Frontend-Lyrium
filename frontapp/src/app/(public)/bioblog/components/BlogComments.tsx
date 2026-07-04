'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, CheckCircle, Clock, Pencil, Trash2, X, Check, LogIn } from 'lucide-react';
import { blogApi, CommentApi } from '@/shared/lib/api/blog';
import { useAuth } from '@/shared/lib/context/AuthContext';

interface BlogCommentsProps {
    articleId?: number;
    videoId?: number;
    podcastId?: number;
    shortId?: number;
}

export default function BlogComments({ articleId, videoId, podcastId, shortId }: BlogCommentsProps) {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [comments, setComments] = useState<CommentApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const loadComments = async () => {
        setLoading(true);
        try {
            const data = await blogApi.getComments({
                article_id: articleId,
                video_id: videoId,
                podcast_id: podcastId,
                short_id: shortId,
            });
            setComments(data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (articleId || videoId || podcastId || shortId) {
            loadComments();
        }
    }, [articleId, videoId, podcastId, shortId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await blogApi.createComment({
                article_id: articleId,
                video_id: videoId,
                podcast_id: podcastId,
                short_id: shortId,
                content,
            });
            if (res?.success) {
                setSuccess(true);
                setContent('');
                setTimeout(() => setSuccess(false), 4000);
                loadComments();
            } else {
                setError(res?.message || 'Error al enviar comentario');
            }
        } catch {
            setError('Error al enviar comentario');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (id: number) => {
        if (!editContent.trim()) return;
        try {
            const res = await blogApi.updateComment(id, { content: editContent });
            if (res?.success) {
                setEditingId(null);
                setEditContent('');
                loadComments();
            } else {
                setError(res?.message || 'Error al editar comentario');
            }
        } catch {
            setError('Error al editar comentario');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este comentario?')) return;
        try {
            const res = await blogApi.deleteComment(id);
            if (res?.success) {
                loadComments();
            } else {
                setError(res?.message || 'Error al eliminar comentario');
            }
        } catch {
            setError('Error al eliminar comentario');
        }
    };

    const startEdit = (comment: CommentApi) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getInitial = (comment: CommentApi) => {
        if (comment.user?.display_name) return comment.user.display_name.charAt(0).toUpperCase();
        return comment.author_name.charAt(0).toUpperCase();
    };

    const getDisplayName = (comment: CommentApi) => {
        if (comment.user?.display_name) return comment.user.display_name;
        return comment.author_name;
    };

    const getAvatar = (comment: CommentApi) => {
        return comment.user?.avatar || null;
    };

    return (
        <section className="max-w-4xl mx-auto px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-10"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/10 dark:to-teal-400/10 border border-emerald-200/50 dark:border-emerald-500/20">
                        <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
                            Comentarios
                        </h2>
                        <p className="text-slate-500 dark:text-[var(--text-muted)] text-sm mt-0.5">
                            {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 border border-slate-100 dark:border-[var(--border-subtle)]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#2A3F33]" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                                        <div className="h-3 w-16 bg-slate-200 dark:bg-[#2A3F33] rounded" />
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-slate-200 dark:bg-[#2A3F33] rounded" />
                            </div>
                        ))}
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {comments.map((comment, i) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    className="group bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        {getAvatar(comment) ? (
                                            <img src={getAvatar(comment)!} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                                                {getInitial(comment)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                <span className="font-semibold text-slate-800 dark:text-[var(--text-primary)] text-sm">
                                                    {getDisplayName(comment)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(comment.created_at)}
                                                </span>
                                                {comment.can_edit && (
                                                    <div className="flex gap-1 ml-auto">
                                                        <button
                                                            onClick={() => startEdit(comment)}
                                                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-500 transition"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(comment.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {editingId === comment.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-primary)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-800 dark:text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
                                                        >
                                                            <X className="w-3.5 h-3.5" /> Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(comment.id)}
                                                            disabled={!editContent.trim()}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-50"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-slate-600 dark:text-[var(--text-secondary)] text-sm leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white/50 dark:bg-[var(--bg-secondary)]/50 rounded-3xl border border-dashed border-slate-200 dark:border-[var(--border-subtle)]"
                    >
                        <MessageCircle className="w-10 h-10 text-slate-300 dark:text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-[var(--text-muted)] font-medium">
                            Sé el primero en comentar
                        </p>
                    </motion.div>
                )}

                <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-[var(--border-subtle)] shadow-lg shadow-slate-200/50 dark:shadow-black/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">
                            Deja tu comentario
                        </h3>
                    </div>

                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-5 py-3.5 rounded-xl mb-6 text-sm font-medium"
                            >
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                Comentario publicado
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {authLoading ? (
                        <div className="animate-pulse bg-white dark:bg-[var(--bg-secondary)] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-[var(--border-subtle)]">
                            <div className="h-5 w-40 bg-slate-200 dark:bg-[#2A3F33] rounded mb-4" />
                            <div className="h-24 w-full bg-slate-200 dark:bg-[#2A3F33] rounded mb-4" />
                            <div className="h-10 w-44 bg-slate-200 dark:bg-[#2A3F33] rounded ml-auto" />
                        </div>
                    ) : isAuthenticated ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                                        {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)]">
                                    Comentando como {user?.display_name || 'usuario registrado'}
                                </span>
                            </div>
                            <div className="group/field">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[var(--bg-primary)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-800 dark:text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-400/10 transition-all resize-none"
                                    placeholder="Comparte tu opinión..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <motion.button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2.5 group/btn"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                            Publicar Comentario
                                        </>
                                    )}
                                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                </motion.button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <LogIn className="w-8 h-8 text-slate-300 dark:text-[var(--text-muted)] mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-[var(--text-muted)] text-sm">
                                <a href="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                                    Inicia sesión
                                </a>{' '}
                                para dejar un comentario
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
