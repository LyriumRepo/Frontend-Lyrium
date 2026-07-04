'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { forumApi, ForumTopic, ForumPost } from '@/shared/lib/api/forum';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import { formatDate, getInitial } from '@/shared/lib/helpers';

export default function BioForoTopicPage() {
  const params = useParams();
  const topicId = parseInt(params.id as string);

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number | null }>({ id: null });
  const [replyingTo, setReplyingTo] = useState<ForumPost | null>(null);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [moderation, setModeration] = useState<{ show: boolean; message: string; source: 'reply' | 'edit' | 'topic' | null }>({ show: false, message: '', source: null });
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadTopic();
    forumApi.getCurrentUser().then(setCurrentUser).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const loadTopic = async () => {
    setLoading(true);
    try {
      const [topicData, postsData] = await Promise.all([
        forumApi.getTopic(topicId),
        forumApi.getTopicPosts(topicId),
      ]);
      setTopic(topicData);
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.warn('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const isModerationError = (err: unknown): string | null => {
    const msg = err instanceof Error ? err.message : '';
    if (/inapropiad|inadecuad|ofensiv|moderación|lenguaje|contenido inapropiado/i.test(msg)) return msg;
    return null;
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setReplyError('');
    setSubmitting(true);
    try {
      await forumApi.createPost({
        topicid: topicId,
        content: replyContent,
        reply_to: replyingTo?.id,
      });
      setReplyContent('');
      setReplyingTo(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      loadTopic();
    } catch (error) {
      const modMsg = isModerationError(error);
      if (modMsg) {
        setModeration({ show: true, message: modMsg, source: 'reply' });
      } else {
        setReplyError('Error al enviar la respuesta. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (postId: number, type: 'up' | 'down') => {
    try {
      await forumApi.setVote(postId, type);
      loadTopic();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleEditPost = async (postId: number) => {
    if (!editContent.trim()) return;
    setEditError('');
    setSubmitting(true);
    try {
      await forumApi.updatePost(postId, editContent);
      setEditSubmitted(true);
      setTimeout(() => { setEditSubmitted(false); setEditingPost(null); setEditContent(''); }, 1500);
      loadTopic();
    } catch (error) {
      const modMsg = isModerationError(error);
      if (modMsg) {
        setModeration({ show: true, message: modMsg, source: 'edit' });
      } else {
        setEditError('No puedes editar esta respuesta.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('¿Eliminar esta respuesta?')) return;
    setDeleteError('');
    try {
      await forumApi.deletePost(postId);
      loadTopic();
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteError('No puedes eliminar esta respuesta.');
    }
  };

  // ── Skeleton Loading ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 border border-slate-100 dark:border-[var(--border-subtle)] animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-gray-700" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">Tema no encontrado</h2>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mb-6">El tema que buscas no existe o ha sido eliminado.</p>
        <Link href="/bioforo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-lg shadow-sky-200/50">
          Volver al BioForo
        </Link>
      </div>
    );
  }

  const isOwnPost = (post: ForumPost) => currentUser.id !== null && post.user_id === currentUser.id;

  // ── Main Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/30 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6">
        {/* Back link */}
        <Link
          href="/bioforo"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-[var(--text-muted)] hover:text-sky-600 dark:hover:text-sky-400 transition-colors group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver al BioForo
        </Link>

        {/* Topic Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm overflow-hidden"
        >
          <div className="p-5 md:p-7">
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold text-lg md:text-xl flex-shrink-0 shadow-sm">
                {getInitial(topic.author_name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)]">
                    {topic.author_name || 'Anónimo'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/30">
                    {topic.forum_name || 'General'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[var(--text-muted)] mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatDate(topic.created)}
                </div>
              </div>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-[var(--text-primary)] mb-3 leading-tight">
              {topic.title}
            </h1>

            <div
              className="text-slate-600 dark:text-[var(--text-secondary)] leading-relaxed mb-5 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(topic.content || '') }}
            />

            <div className="flex items-center gap-3 flex-wrap border-t border-slate-100 dark:border-[var(--border-subtle)] pt-4">
              <button
                onClick={() => handleVote(topic.id, 'up')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:text-sky-600 dark:hover:text-sky-400 transition-all text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
                {topic.votes_up || 0}
              </button>
              <button
                onClick={() => handleVote(topic.id, 'down')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[var(--bg-muted)] transition-all text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/></svg>
                {topic.votes_down || 0}
              </button>
              <span className="text-xs text-slate-400 dark:text-[var(--text-muted)] ml-1 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {topic.views || 0} vistas
              </span>
            </div>
          </div>
          <div className="h-1.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400" />
        </motion.div>

        {/* Replies section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Respuestas
              <span className="text-sm font-normal text-slate-400 dark:text-[var(--text-muted)]">({posts.length})</span>
            </h3>
          </div>

          {deleteError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {deleteError}
            </motion.div>
          )}

          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] p-10 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-50 dark:bg-[var(--bg-muted)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="text-slate-500 dark:text-[var(--text-secondary)]">No hay respuestas aún. ¡Sé el primero en responder!</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-4">
              <AnimatePresence>
                {posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5 md:p-6">
                      {post.reply_to && (
                        <div className="bg-gradient-to-r from-sky-50 to-teal-50 dark:from-sky-900/15 dark:to-teal-900/15 border-l-4 border-sky-400 p-3.5 rounded-r-xl mb-4">
                          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 mb-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            {post.reply_to_name || 'Cita'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] line-clamp-2">
                            {post.reply_to_content}
                          </p>
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold text-sm flex-shrink-0">
                          {getInitial(post.author_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 dark:text-[var(--text-primary)] text-sm">{post.author_name || 'Anónimo'}</p>
                            <p className="text-xs text-slate-400 dark:text-[var(--text-muted)]">{formatDate(post.created)}</p>
                          </div>
                        </div>
                        {isOwnPost(post) && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => { setEditingPost(post); setEditContent(post.content); setEditError(''); }}
                              className="w-8 h-8 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/10 text-slate-400 hover:text-sky-500 transition-all grid place-items-center"
                              title="Editar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-8 h-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-500 transition-all grid place-items-center"
                              title="Eliminar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {editingPost?.id === post.id ? (
                        <div className="mb-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => { setEditContent(e.target.value); setEditError(''); }}
                            className="w-full p-3.5 border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 outline-none min-h-[100px] bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 transition resize-none"
                          />
                          {editError && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                              {editError}
                            </p>
                          )}
                          <div className="flex gap-2 justify-end mt-3">
                            <button
                              onClick={() => { setEditingPost(null); setEditError(''); }}
                              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-[var(--text-primary)] transition"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleEditPost(post.id)}
                              disabled={submitting || editSubmitted || !editContent.trim()}
                              className="px-4 py-2 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-xl disabled:opacity-50 min-w-[100px] flex items-center justify-center gap-1.5 transition"
                            >
                              {editSubmitted ? (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Guardado</>
                              ) : submitting ? (
                                <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Guardando...</>
                              ) : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-slate-600 dark:text-[var(--text-secondary)] leading-relaxed mb-4 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }}
                        />
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-[var(--border-subtle)]">
                        <button
                          onClick={() => handleVote(post.id, 'up')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-sky-50 dark:hover:bg-sky-900/10 text-slate-500 dark:text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-sky-400 text-xs transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
                          {post.votes_up || 0}
                        </button>
                        <button
                          onClick={() => handleVote(post.id, 'down')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-[var(--bg-muted)] text-slate-500 dark:text-[var(--text-secondary)] hover:text-red-500 text-xs transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/></svg>
                          {post.votes_down || 0}
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo?.id === post.id ? null : post);
                            setReplyError('');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-sky-50 dark:hover:bg-sky-900/10 text-slate-500 dark:text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-sky-400 text-xs transition-all ml-auto"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          Responder
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Reply form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden shadow-sm"
        >
          <div className="px-6 pt-5 pb-6">
            <h4 className="font-semibold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {replyingTo ? (
                <span>Respondiendo a <span className="text-sky-600 font-bold">@{replyingTo.author_name}</span></span>
              ) : (
                'Responder al tema'
              )}
            </h4>
            {replyingTo && (
              <div className="bg-gradient-to-r from-sky-50 to-teal-50 dark:from-sky-900/15 dark:to-teal-900/15 border-l-4 border-sky-400 p-3.5 rounded-r-xl mb-4 text-sm text-slate-600 dark:text-[var(--text-muted)] line-clamp-2">
                {replyingTo.content}
              </div>
            )}
            <textarea
              ref={replyRef}
              value={replyContent}
              onChange={(e) => { setReplyContent(e.target.value); setReplyError(''); }}
              placeholder={replyingTo ? `Escribe tu respuesta a @${replyingTo.author_name}...` : 'Escribe tu respuesta...'}
              className="w-full p-4 border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 outline-none min-h-[120px] bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] transition resize-none"
            />
            {replyError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {replyError}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 dark:bg-black/10 border-t border-slate-100 dark:border-[var(--border-subtle)]">
            <div>
              {replyingTo && (
                <button
                  onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyError(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-[var(--text-primary)] transition"
                >
                  Cancelar respuesta
                </button>
              )}
            </div>
            <button
              onClick={handleReply}
              disabled={submitting || submitted || !replyContent.trim()}
              className="bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] flex items-center justify-center gap-2 shadow-lg shadow-sky-200/50 transition-all hover:-translate-y-0.5"
            >
              {submitted ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Enviado</>
              ) : submitting ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Enviando...</>
              ) : (
                'Publicar Respuesta'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Moderation Modal */}
      <AnimatePresence>
        {moderation.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setModeration(prev => ({ ...prev, show: false }))}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-slate-100 dark:border-[var(--border-subtle)] w-full max-w-md mx-auto overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative px-6 pt-8 pb-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">
                  Contenido no apto
                </h3>
                <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] leading-relaxed">
                  {moderation.message}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setModeration(prev => ({ ...prev, show: false }));
                      if (moderation.source === 'reply') replyRef.current?.focus();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition shadow-lg shadow-sky-200/50"
                  >
                    Entendido, editaré
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-teal-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
