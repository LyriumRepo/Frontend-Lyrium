'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Headphones, Video, Clapperboard, CheckCircle, XCircle, AlertCircle, RefreshCw, Store, Calendar, Search, X, Loader2, Eye, ExternalLink } from 'lucide-react';
import { adminBioBlogApi, AdminPendingItem, AdminStats } from '@/shared/lib/api/bioblogRepository';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
    article: { icon: FileText, label: 'Artículo', color: 'from-sky-500 to-cyan-500' },
    podcast: { icon: Headphones, label: 'Podcast', color: 'from-emerald-500 to-teal-500' },
    video: { icon: Video, label: 'Video', color: 'from-cyan-500 to-sky-500' },
    short: { icon: Clapperboard, label: 'Short', color: 'from-teal-500 to-emerald-500' },
};

export function BioBlogApprovalClient() {
    const [items, setItems] = useState<AdminPendingItem[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [rejectModal, setRejectModal] = useState<{ type: string; id: number; title: string } | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [previewItem, setPreviewItem] = useState<AdminPendingItem | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [pendingRes, statsRes] = await Promise.all([adminBioBlogApi.pending(), adminBioBlogApi.stats()]);
            setItems(pendingRes.data);
            setStats(statsRes.data);
        } catch (e: any) {
            setError(e.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleApprove = async (type: string, id: number) => {
        setActionLoading(`${type}-${id}-approve`);
        try {
            await adminBioBlogApi.approve(type, id);
            showFeedback('success', 'Contenido aprobado correctamente');
            load();
        } catch (e: any) {
            showFeedback('error', e.message || 'Error al aprobar');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectNote.trim()) return;
        const { type, id } = rejectModal;
        setActionLoading(`${type}-${id}-reject`);
        try {
            await adminBioBlogApi.reject(type, id, rejectNote);
            setRejectModal(null);
            setRejectNote('');
            showFeedback('success', 'Contenido rechazado - el vendedor será notificado');
            load();
        } catch (e: any) {
            showFeedback('error', e.message || 'Error al rechazar');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = search
        ? items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()) || i.store?.name?.toLowerCase().includes(search.toLowerCase()))
        : items;

    const statCards = [
        { key: 'articles', icon: FileText, label: 'Artículos', count: stats?.pending_articles ?? 0, color: 'from-sky-500 to-cyan-500' },
        { key: 'podcasts', icon: Headphones, label: 'Podcasts', count: stats?.pending_podcasts ?? 0, color: 'from-emerald-500 to-teal-500' },
        { key: 'videos', icon: Video, label: 'Videos', count: stats?.pending_videos ?? 0, color: 'from-cyan-500 to-sky-500' },
        { key: 'shorts', icon: Clapperboard, label: 'Shorts', count: stats?.pending_shorts ?? 0, color: 'from-teal-500 to-emerald-500' },
    ];

    return (
        <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
            <ModuleHeader
                title="Aprobación de BioBlog"
                subtitle="Revisa y aprueba el contenido enviado por los vendedores"
                icon="FileText"
                actions={
                    <button
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                }
            />

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-sm ${
                            feedback.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                        }`}
                    >
                        {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    <button onClick={load} className="ml-auto text-xs font-bold uppercase hover:underline">Reintentar</button>
                </div>
            )}

            {loading && !stats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(card => (
                        <motion.div
                            key={card.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${card.color} opacity-10 dark:opacity-20`} />
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{card.label}</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{card.count}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)]">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por título o tienda..."
                            className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-5 animate-pulse flex items-center gap-4">
                                <div className="w-20 h-5 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                                <div className="w-20 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-lg font-bold text-[var(--text-muted)]">Todo al día</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">No hay contenido pendiente de revisión</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        <AnimatePresence>
                            {filtered.map(item => {
                                const type = typeConfig[item.content_type] || { icon: FileText, label: item.content_type, color: 'from-gray-500 to-gray-600' };
                                const TypeIcon = type.icon;
                                return (
                                    <motion.div
                                        key={`${item.content_type}-${item.id}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        layout
                                        className="p-5 flex items-center gap-4 hover:bg-[var(--bg-muted)] transition"
                                    >
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shrink-0`}>
                                            <TypeIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white bg-gradient-to-r ${type.color}`}>{type.label}</span>
                                                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{item.title || 'Sin título'}</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                                                {item.store && (
                                                    <span className="flex items-center gap-1">
                                                        <Store className="w-3 h-3" /> {item.store.name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button
                                                onClick={() => setPreviewItem(item)}
                                                className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleApprove(item.content_type, item.id)}
                                                disabled={actionLoading === `${item.content_type}-${item.id}-approve`}
                                                className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition disabled:opacity-50 shadow-sm"
                                            >
                                                {actionLoading === `${item.content_type}-${item.id}-approve` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => setRejectModal({ type: item.content_type, id: item.id, title: item.title || 'Sin título' })}
                                                disabled={actionLoading === `${item.content_type}-${item.id}-reject`}
                                                className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase rounded-xl bg-[var(--bg-muted)] hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-500 transition disabled:opacity-50"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Rechazar
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Preview modal */}
            <AnimatePresence>
                {previewItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-lg p-6 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white bg-gradient-to-r ${typeConfig[previewItem.content_type]?.color || 'from-gray-500 to-gray-600'}`}>
                                        {typeConfig[previewItem.content_type]?.label || previewItem.content_type}
                                    </span>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] truncate max-w-[300px]">{previewItem.title || 'Sin título'}</h3>
                                </div>
                                <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition">
                                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {previewItem.main_image && (
                                    <img src={previewItem.main_image} alt="" className="w-full h-48 object-cover rounded-2xl border border-[var(--border-subtle)]" />
                                )}
                                {previewItem.thumbnail && (
                                    <img src={previewItem.thumbnail} alt="" className="w-full h-48 object-cover rounded-2xl border border-[var(--border-subtle)]" />
                                )}
                                {previewItem.summary && (
                                    <p className="text-sm text-[var(--text-secondary)]">{previewItem.summary}</p>
                                )}
                                {previewItem.description && (
                                    <p className="text-sm text-[var(--text-secondary)]">{previewItem.description}</p>
                                )}
                                {previewItem.url && (
                                    <a href={previewItem.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-600 font-semibold">
                                        <ExternalLink className="w-4 h-4" /> Ver contenido original
                                    </a>
                                )}
                                <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                                    {previewItem.store && (
                                        <div>
                                            <span className="font-semibold text-[var(--text-secondary)] block">Tienda</span>
                                            {previewItem.store.name}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold text-[var(--text-secondary)] block">Enviado</span>
                                        {new Date(previewItem.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {previewItem.platform && (
                                        <div>
                                            <span className="font-semibold text-[var(--text-secondary)] block">Plataforma</span>
                                            {previewItem.platform}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
                                <button
                                    onClick={() => { setPreviewItem(null); setRejectModal({ type: previewItem.content_type, id: previewItem.id, title: previewItem.title || 'Sin título' }); }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 rounded-xl transition shadow-sm"
                                >
                                    <XCircle className="w-4 h-4" /> Rechazar
                                </button>
                                <button
                                    onClick={() => { const item = previewItem; setPreviewItem(null); handleApprove(item.content_type, item.id); }}
                                    disabled={actionLoading === `${previewItem.content_type}-${previewItem.id}-approve`}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition disabled:opacity-50 shadow-sm"
                                >
                                    {actionLoading === `${previewItem.content_type}-${previewItem.id}-approve` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Aprobar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject modal */}
            <AnimatePresence>
                {rejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setRejectModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-md p-6 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Rechazar Contenido</h3>
                                <button onClick={() => { setRejectModal(null); setRejectNote(''); }} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition">
                                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Vas a rechazar <strong className="text-[var(--text-primary)]">{rejectModal.title}</strong>
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                                    Motivo del rechazo <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={rejectNote}
                                    onChange={e => setRejectNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition"
                                    placeholder="Indica al vendedor por qué se rechaza (requerido)..."
                                />
                                {!rejectNote.trim() && (
                                    <p className="text-[11px] text-[var(--text-muted)] mt-1">Debes escribir un motivo para rechazar</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setRejectModal(null); setRejectNote(''); }} className="px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading === `${rejectModal.type}-${rejectModal.id}-reject` || !rejectNote.trim()}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 rounded-xl transition disabled:opacity-50 shadow-sm"
                                >
                                    {actionLoading === `${rejectModal.type}-${rejectModal.id}-reject` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Rechazar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
