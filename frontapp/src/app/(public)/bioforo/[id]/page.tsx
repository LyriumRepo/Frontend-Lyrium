'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { forumApi, ForumTopic, ForumPost } from '@/shared/lib/api/forum';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import { formatDate, getInitial } from '@/shared/lib/helpers';
import { ArrowLeft, Eye, MessageCircle, Heart, ThumbsUp, ThumbsDown, Reply, Send, Edit3, Trash2, Check, X, AlertCircle, Clock, Hash } from 'lucide-react';

const GRADIENTS = [
  'from-emerald-600 via-teal-600 to-sky-600',
  'from-sky-600 via-blue-600 to-indigo-600',
  'from-teal-500 via-emerald-500 to-green-500',
  'from-sky-500 via-cyan-500 to-teal-500',
];

function topicHeroGradient(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}

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
      console.error('Error loading topic:', error);
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
      await forumApi.createPost({ topicid: topicId, content: replyContent, reply_to: replyingTo?.id });
      setReplyContent('');
      setReplyingTo(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      loadTopic();
    } catch (error) {
      const modMsg = isModerationError(error);
      if (modMsg) setModeration({ show: true, message: modMsg, source: 'reply' });
      else setReplyError('Error al enviar la respuesta. Intenta de nuevo.');
    } finally { setSubmitting(false); }
  };

  const handleVote = async (postId: number, type: 'up' | 'down') => {
    try { await forumApi.setVote(postId, type); loadTopic(); }
    catch { console.error('Error voting'); }
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
      if (modMsg) setModeration({ show: true, message: modMsg, source: 'edit' });
      else setEditError('No puedes editar esta respuesta.');
    } finally { setSubmitting(false); }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('¿Eliminar esta respuesta?')) return;
    setDeleteError('');
    try { await forumApi.deletePost(postId); loadTopic(); }
    catch { setDeleteError('No puedes eliminar esta respuesta.'); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-56 md:h-72 rounded-3xl bg-slate-200 dark:bg-gray-800 animate-pulse" />
        {[1,2].map(i => (
          <div key={i} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 border border-slate-100 dark:border-[var(--border-subtle)] animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-gray-700" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
            <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-full mb-2" />
            <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">Tema no encontrado</h2>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mb-6">El tema que buscas no existe o ha sido eliminado.</p>
        <Link href="/bioforo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition shadow-lg shadow-emerald-200/50">
          <ArrowLeft className="w-4 h-4" />
          Volver al BioForo
        </Link>
      </div>
    );
  }

  const isOwnPost = (post: ForumPost) => currentUser.id !== null && post.user_id === currentUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">

        {/* Back link */}
        <Link
          href="/bioforo"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Volver al BioForo
        </Link>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden shadow-xl"
        >
          {topic.image ? (
            <div className="relative h-56 md:h-72">
              <img src={topic.image} alt={topic.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
            </div>
          ) : (
            <div className={`relative h-40 md:h-52 bg-gradient-to-br ${topicHeroGradient(topic.id)}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                {topic.forum_name || 'General'}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                <Eye className="w-3 h-3" />
                {topic.views || 0} vistas
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">
              {topic.title}
            </h1>
          </div>
        </motion.div>

        {/* Author + Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm p-4 md:p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-900/30 dark:to-sky-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0 shadow-sm border-2 border-white dark:border-[var(--bg-secondary)]">
                {getInitial(topic.author_name)}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-[var(--text-primary)] text-sm md:text-base">
                  {topic.author_name || 'Anónimo'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[var(--text-muted)]">
                  <Clock className="w-3 h-3" />
                  {formatDate(topic.created)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Heart className="w-3.5 h-3.5" />
                {topic.votes_up || 0}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                <MessageCircle className="w-3.5 h-3.5" />
                {topic.reply_count || 0}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-500 dark:text-[var(--text-muted)] text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" />
                {topic.views || 0}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm p-5 md:p-8"
        >
          <div
            className="text-slate-700 dark:text-[var(--text-secondary)] leading-relaxed text-[15px] md:text-base prose prose-sm md:prose-base max-w-none prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(topic.content || '') }}
          />
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[var(--border-subtle)] flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleVote(topic.id, 'up')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all text-sm font-semibold"
            >
              <ThumbsUp className="w-4 h-4" />
              {topic.votes_up || 0}
            </button>
            <button
              onClick={() => handleVote(topic.id, 'down')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-500 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[var(--bg-muted)] transition-all text-sm font-semibold"
            >
              <ThumbsDown className="w-4 h-4" />
              {topic.votes_down || 0}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[var(--text-muted)] ml-auto">
              <Hash className="w-3.5 h-3.5" />
              ID: {topic.id}
            </div>
          </div>
        </motion.div>

        {/* Replies section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
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
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {deleteError}
            </motion.div>
          )}

          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] p-12 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-emerald-400" />
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
                        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/15 dark:to-sky-900/15 border-l-4 border-emerald-400 p-3.5 rounded-r-xl mb-4">
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                            <Reply className="w-3 h-3" />
                            {post.reply_to_name || 'Cita'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] line-clamp-2">
                            {post.reply_to_content}
                          </p>
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-900/30 dark:to-sky-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0 shadow-sm">
                          {getInitial(post.author_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-800 dark:text-[var(--text-primary)] text-sm">
                              {post.author_name || 'Anónimo'}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDate(post.created)}
                            </span>
                          </div>
                        </div>
                        {isOwnPost(post) && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => { setEditingPost(post); setEditContent(post.content); setEditError(''); }}
                              className="w-8 h-8 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-slate-400 hover:text-emerald-500 transition-all grid place-items-center"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-8 h-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-500 transition-all grid place-items-center"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingPost?.id === post.id ? (
                        <div className="mb-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => { setEditContent(e.target.value); setEditError(''); }}
                            className="w-full p-3.5 border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none min-h-[100px] bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 transition resize-none"
                          />
                          {editError && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
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
                              className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50 min-w-[100px] flex items-center justify-center gap-1.5 transition"
                            >
                              {editSubmitted ? (
                                <><Check className="w-3.5 h-3.5" /> Guardado</>
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
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-xs transition-all font-medium"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {post.votes_up || 0}
                        </button>
                        <button
                          onClick={() => handleVote(post.id, 'down')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[var(--bg-card)] text-slate-500 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[var(--bg-muted)] text-xs transition-all font-medium"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          {post.votes_down || 0}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(replyingTo?.id === post.id ? null : post); setReplyError(''); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-slate-500 dark:text-[var(--text-secondary)] hover:text-emerald-600 dark:hover:text-emerald-400 text-xs transition-all font-medium ml-auto"
                        >
                          <Reply className="w-3 h-3" />
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
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden shadow-sm"
        >
          <div className="px-6 pt-5 pb-6">
            <h4 className="font-semibold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              {replyingTo ? (
                <span>Respondiendo a <span className="text-emerald-600 font-bold">@{replyingTo.author_name}</span></span>
              ) : (
                'Responder al tema'
              )}
            </h4>
            {replyingTo && (
              <div className="bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-900/15 dark:to-sky-900/15 border-l-4 border-emerald-400 p-3.5 rounded-r-xl mb-4 text-sm text-slate-600 dark:text-[var(--text-muted)] line-clamp-2">
                {replyingTo.content}
              </div>
            )}
            <textarea
              ref={replyRef}
              value={replyContent}
              onChange={(e) => { setReplyContent(e.target.value); setReplyError(''); }}
              placeholder={replyingTo ? `Escribe tu respuesta a @${replyingTo.author_name}...` : 'Comparte tu opinión sobre este tema...'}
              className="w-full p-4 border border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none min-h-[120px] bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] transition resize-none"
            />
            {replyError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {replyError}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-emerald-50/30 dark:bg-black/10 border-t border-slate-100 dark:border-[var(--border-subtle)]">
            <div>
              {replyingTo && (
                <button
                  onClick={() => { setReplyingTo(null); setReplyContent(''); setReplyError(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-[var(--text-primary)] transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar respuesta
                </button>
              )}
            </div>
            <button
              onClick={handleReply}
              disabled={submitting || submitted || !replyContent.trim()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 transition-all hover:-translate-y-0.5"
            >
              {submitted ? (
                <><Check className="w-4 h-4" /> Enviado</>
              ) : submitting ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Enviando...</>
              ) : (
                <><Send className="w-4 h-4" /> Publicar Respuesta</>
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
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7 text-emerald-500" />
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
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition shadow-lg shadow-emerald-200/50"
                  >
                    Entendido, editaré
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
