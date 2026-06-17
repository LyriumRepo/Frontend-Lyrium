'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Eye, Trash2, EyeOff } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { forumApi, ForumTopic, ForumPost } from '@/shared/lib/api/bioblogRepository';

export function ForumTopicClient() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [topic, setTopic] = useState<ForumTopic | null>(null);
    const [replies, setReplies] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            forumApi.topics.get(Number(id)).then(r => setTopic(r.data)),
            forumApi.topics.replies(Number(id)).then(r => setReplies(r.data)),
        ]).catch(() => {}).finally(() => setLoading(false));
    }, [id]);

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        setSending(true);
        try {
            await forumApi.topics.addReply(Number(id), { content: replyContent.trim() });
            setReplyContent('');
            const res = await forumApi.topics.replies(Number(id));
            setReplies(res.data);
        } catch {} finally { setSending(false); }
    };

    const handleHideReply = async (postId: number) => {
        try {
            await forumApi.topics.hideReply(Number(id), postId);
            setReplies(prev => prev.filter(p => p.id !== postId));
        } catch {}
    };

    const handleDeleteReply = async (postId: number) => {
        if (!confirm('¿Eliminar esta respuesta?')) return;
        try {
            await forumApi.topics.deleteReply(Number(id), postId);
            setReplies(prev => prev.filter(p => p.id !== postId));
        } catch {}
    };

    if (loading) return <div className="p-20 text-center text-gray-400">Cargando tema...</div>;
    if (!topic) return <div className="p-20 text-center text-gray-400">Tema no encontrado</div>;

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20 max-w-3xl">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition">
                <ArrowLeft className="w-4 h-4" /> Volver
            </button>

            {/* Topic */}
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-gray-800 dark:text-gray-200">{topic.title}</h1>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span>{topic.category?.name || 'General'}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{topic.views}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{topic.reply_count}</span>
                            <span>{new Date(topic.created_at).toLocaleDateString('es-PE')}</span>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${topic.status === 'published' ? 'bg-emerald-100 text-emerald-600' : topic.status === 'closed' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                        {topic.status}
                    </span>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{topic.content}</div>
            </div>

            {/* Replies */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400">Respuestas ({replies.length})</h2>

                {replies.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800">Sin respuestas aún</div>
                ) : (
                    replies.map(reply => (
                        <div key={reply.id} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-sky-500">{reply.user?.name?.charAt(0) || 'A'}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{reply.user?.name || 'Anónimo'}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(reply.created_at).toLocaleDateString('es-PE')}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleHideReply(reply.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-400 transition" title="Ocultar"><EyeOff className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteReply(reply.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Reply Form */}
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Responder</h3>
                <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                    placeholder="Escribe tu respuesta..." />
                <div className="flex justify-end mt-3">
                    <button onClick={handleReply} disabled={sending || !replyContent.trim()}
                        className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                        {sending ? 'Enviando...' : 'Publicar Respuesta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
