'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
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

  useEffect(() => {
    loadTopic();
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
      console.error('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      await forumApi.createPost({
        topicid: topicId,
        content: replyContent,
      });
      setReplyContent('');
      loadTopic();
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Para responder necesitas iniciar sesión en WordPress');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold text-slate-700 dark:text-[var(--text-primary)] mb-4">Tema no encontrado</h2>
        <Link href="/bioforo" className="text-emerald-500 hover:underline">
          Volver al BioForo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
      <Link
        href="/bioforo"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-[var(--text-muted)] hover:text-emerald-500 mb-4"
      >
        <Icon name="ArrowLeft" className="w-4 h-4" />
        Volver al BioForo
      </Link>

      <div className="bg-white dark:bg-[var(--bg-secondary)] border-[3px] border-[#009a6279] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-lime-100 dark:to-emerald-100 flex items-center justify-center text-blue-700 dark:text-lime-600 font-bold text-lg md:text-xl flex-shrink-0">
            {getInitial(topic.author_name)}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)] text-lg">
              {topic.author_name || 'Anónimo'}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Icon name="Clock" className="w-3 h-3" />
                {formatDate(topic.created)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {topic.forum_name || 'General'}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-[#333333] dark:text-[var(--text-primary)] font-bold text-xl md:text-2xl underline decoration-dashed decoration-[#8db701] decoration-3 underline-offset-[9px] mb-4">
          {topic.title}
        </h1>

        <div
          className="text-[#00866d] dark:text-[#00a87e] font-semibold leading-relaxed mb-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(topic.content || '') }}
        />

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t border-slate-100 dark:border-[var(--border-subtle)] pt-4">
          <button
            onClick={() => handleVote(topic.id, 'up')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-[var(--bg-card)] text-slate-700 dark:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-[#182420] transition-all"
          >
            <span className="text-lg">👍</span>
            <span className="font-medium text-sm">{topic.votes_up || 0}</span>
          </button>
          <button
            onClick={() => handleVote(topic.id, 'down')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-[var(--bg-card)] text-slate-700 dark:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-[#182420] transition-all"
          >
            <span className="text-lg">👎</span>
            <span className="font-medium text-sm">{topic.votes_down || 0}</span>
          </button>
          <span className="text-sm text-slate-500 dark:text-[var(--text-muted)]">
            {topic.views || 0} vistas
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Icon name="MessageCircle" className="text-emerald-600" />
          Respuestas ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-8 text-center border border-slate-200 dark:border-[var(--border-subtle)]">
            <p className="text-slate-500 dark:text-[var(--text-secondary)]">No hay respuestas aún. ¡Sé el primero en responder!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-[var(--bg-secondary)] border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl p-4 md:p-6"
              >
                {post.reply_to && (
                  <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-l-4 border-sky-500 dark:border-sky-400 p-3 rounded-r-lg mb-4">
                    <p className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1 mb-1">
                      <Icon name="MessageCircle" className="w-3 h-3" />
                      {post.reply_to_name || 'Cita'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-[var(--text-muted)] line-clamp-2">
                      {post.reply_to_content}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-lime-100 dark:to-emerald-100 flex items-center justify-center text-blue-700 dark:text-lime-600 font-bold">
                    {getInitial(post.author_name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-[var(--text-primary)]">{post.author_name || 'Anónimo'}</p>
                    <p className="text-xs text-slate-500 dark:text-[var(--text-muted)]">{formatDate(post.created)}</p>
                  </div>
                </div>

                <div
                  className="text-slate-700 dark:text-[var(--text-primary)] leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '') }}
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVote(post.id, 'up')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] text-sm"
                  >
                    👍 {post.votes_up || 0}
                  </button>
                  <button
                    onClick={() => handleVote(post.id, 'down')}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-[#182420] text-slate-700 dark:text-[var(--text-primary)] text-sm"
                  >
                    👎 {post.votes_down || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl p-4 md:p-6">
        <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)] mb-4">Responder al tema</h4>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Escribe tu respuesta..."
          className="w-full p-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl focus:border-emerald-500 focus:outline-none min-h-[120px] mb-4 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)]"
        />
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-[var(--text-secondary)]">
            Para responder necesitas{' '}
            <a
              href="https://lyriumbiomarketplace.com/community/?wpforo=login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:underline"
            >
              iniciar sesión
            </a>
          </p>
          <button
            onClick={handleReply}
            disabled={submitting || !replyContent.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
          >
            {submitting ? 'Enviando...' : 'Publicar Respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}
