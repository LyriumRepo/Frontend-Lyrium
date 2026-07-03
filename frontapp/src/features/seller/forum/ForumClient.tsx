'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessagesSquare, Plus, Eye, MessageCircle, X, ChevronDown } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { forumApi, ForumTopic } from '@/shared/lib/api/bioblogRepository';
import Link from 'next/link';

export function ForumClient() {
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreator, setShowCreator] = useState(false);
    const [form, setForm] = useState({ forum_category_id: '1' as any, title: '', content: '', status: 'published' });
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetch = useCallback(async () => {
        setLoading(true);
        try { const res = await forumApi.topics.list({ per_page: 50 }); setTopics(res.data); }
        catch {} finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            await forumApi.topics.create({
                forum_category_id: Number(form.forum_category_id),
                title: form.title.trim(),
                content: form.content.trim(),
                status: form.status,
            });
            setShowCreator(false);
            setForm({ forum_category_id: '1', title: '', content: '', status: 'published' });
            fetch();
        } catch {} finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este tema?')) return;
        try { await forumApi.topics.delete(id); fetch(); } catch {}
    };

    const statusBadge = (s: string) => {
        const styles: Record<string, string> = { draft: 'bg-gray-100 text-gray-500', published: 'bg-emerald-100 text-emerald-600', closed: 'bg-red-100 text-red-500' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[s] || styles.draft}`}>{s}</span>;
    };

    const toggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="BioForo" subtitle="Foro de discusión con tu comunidad" icon="MessagesSquare" />

            <div className="bg-[var(--bg-card)] p-4 rounded-[2rem] shadow-sm border border-[var(--border-subtle)] flex justify-center">
                <BaseButton onClick={() => setShowCreator(true)} variant="primary" leftIcon="Plus" size="lg">Crear Tema</BaseButton>
            </div>

            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400">Cargando...</div>
                ) : topics.length === 0 ? (
                    <div className="p-20 text-center text-gray-400">Aún no hay temas de discusión</div>
                ) : (
                    <>
                        {/* ===== Vista Desktop: Tabla ===== */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-4">Título</th>
                                        <th className="px-5 py-4">Categoría</th>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4">Respuestas</th>
                                        <th className="px-5 py-4">Vistas</th>
                                        <th className="px-5 py-4">Fecha</th>
                                        <th className="px-5 py-4 w-24">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topics.map(t => (
                                        <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                            <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{t.title}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500">{t.category?.name || '—'}</td>
                                            <td className="px-5 py-4">{statusBadge(t.status)}</td>
                                            <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-gray-500"><MessageCircle className="w-3.5 h-3.5" />{t.reply_count}</div></td>
                                            <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-gray-500"><Eye className="w-3.5 h-3.5" />{t.views}</div></td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('es-PE')}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <Link href={`/seller/forum/${t.id}`} className="text-xs px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 transition font-semibold">Ver</Link>
                                                    <button onClick={() => handleDelete(t.id)} className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition font-semibold">Eliminar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ===== Vista Mobile: Acordeón ===== */}
                        <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800/50">
                            {topics.map(t => {
                                const isOpen = expandedId === t.id;
                                return (
                                    <div key={t.id} className="bg-white dark:bg-[var(--bg-secondary)]">
                                        {/* Fila resumen — siempre visible */}
                                        <button
                                            onClick={() => toggleExpand(t.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                                        >
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                <ChevronDown className="w-4 h-4 text-white" />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Título</p>
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{t.title}</p>
                                            </div>
                                        </button>

                                        {/* Detalle expandido */}
                                        {isOpen && (
                                            <div className="px-4 pb-4 pl-14 space-y-2.5 animate-fadeIn">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categoría</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium text-right">{t.category?.name || '—'}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado</span>
                                                    {statusBadge(t.status)}
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Respuestas</span>
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium"><MessageCircle className="w-3.5 h-3.5" />{t.reply_count}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vistas</span>
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium"><Eye className="w-3.5 h-3.5" />{t.views}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fecha</span>
                                                    <span className="text-xs text-gray-400 font-medium">{new Date(t.created_at).toLocaleDateString('es-PE')}</span>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acción</span>
                                                    <div className="flex gap-2">
                                                        <Link href={`/seller/forum/${t.id}`} className="text-xs px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 transition font-semibold">Ver</Link>
                                                        <button onClick={() => handleDelete(t.id)} className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition font-semibold">Eliminar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Create Topic Modal */}
            {showCreator && mounted && document.getElementById('modal-root') && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCreator(false)}>
                    <div className="relative bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        {/* Botón cerrar — visible en todas las vistas */}
                        <button
                            onClick={() => setShowCreator(false)}
                            aria-label="Cerrar"
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 pr-8">Crear Tema</h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
                            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="¿Qué deseas preguntar o compartir?" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                            <select value={form.forum_category_id} onChange={e => setForm(f => ({ ...f, forum_category_id: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                                <option value="1">General</option>
                                <option value="2">Nutrición</option>
                                <option value="3">Microbiota</option>
                                <option value="4">Fitness</option>
                                <option value="5">Salud Mental</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Contenido</label>
                            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Escribe tu contenido aquí..." />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                            <button onClick={() => setShowCreator(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.content.trim()} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">{saving ? 'Creando...' : 'Publicar Tema'}</button>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')!
            )}
        </div>
    );
}