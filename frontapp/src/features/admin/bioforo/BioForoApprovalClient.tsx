'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessagesSquare, CheckCircle, XCircle, AlertCircle, RefreshCw, Store, Calendar, Search, X, Loader2, Eye } from 'lucide-react';
import { adminBioForoApi, AdminBioForoPendingItem, AdminBioForoStats } from '@/shared/lib/api/bioblogRepository';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import AdminIndicatorGrid from '@/components/admin/AdminIndicatorGrid';
import BaseButton from '@/components/ui/BaseButton';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

export function BioForoApprovalClient() {
    const [items, setItems] = useState<AdminBioForoPendingItem[]>([]);
    const [stats, setStats] = useState<AdminBioForoStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [rejectModal, setRejectModal] = useState<{ id: number; title: string } | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [previewItem, setPreviewItem] = useState<AdminBioForoPendingItem | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [pendingRes, statsRes] = await Promise.all([adminBioForoApi.pending(), adminBioForoApi.stats()]);
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

    const handleApprove = async (id: number) => {
        setActionLoading(`${id}-approve`);
        try {
            await adminBioForoApi.approve(id);
            showFeedback('success', 'Tema aprobado correctamente');
            load();
        } catch (e: any) {
            showFeedback('error', e.message || 'Error al aprobar');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectNote.trim()) return;
        const { id } = rejectModal;
        setActionLoading(`${id}-reject`);
        try {
            await adminBioForoApi.reject(id, rejectNote);
            setRejectModal(null);
            setRejectNote('');
            showFeedback('success', 'Tema rechazado - el vendedor será notificado');
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

    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => { setPage(1); }, [filtered.length, search]);

    const statCards = [
        { key: 'topics', icon: 'MessagesSquare', label: 'Temas pendientes', count: stats?.pending_topics ?? 0, color: 'turquesa' as const },
    ];

    return (
        <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
            <ModuleHeader
                title="BioForo"
                subtitle="Revisa y aprueba los temas del foro enviados por los vendedores"
                icon="MessagesSquare"
                actions={
                    <BaseButton
                        variant="action"
                        onClick={load}
                        disabled={loading}
                        leftIcon="RefreshCw"
                        className={`shadow-xl shadow-sky-500/40 ${loading ? 'animate-pulse' : ''}`}
                    >
                        Actualizar
                    </BaseButton>
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

            <AdminIndicatorGrid
                indicators={statCards.map(card => ({
                    label: card.label,
                    value: card.count,
                    icon: card.icon,
                    color: card.color,
                }))}
                columns={1}
                isLoading={loading && !stats}
            />

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
                        <p className="text-sm text-[var(--text-muted)] mt-1">No hay temas pendientes de revisión</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        <AnimatePresence>
                            {pageFiltered.map(item => (
                                <motion.div
                                    key={`topic-${item.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    layout
                                    className="p-5 flex items-center gap-4 hover:bg-[var(--bg-muted)] transition"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shrink-0">
                                        <MessagesSquare className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white bg-gradient-to-r from-sky-500 to-cyan-500">Tema</span>
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
                                            onClick={() => handleApprove(item.id)}
                                            disabled={actionLoading === `${item.id}-approve`}
                                            className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transition disabled:opacity-50 shadow-sm"
                                        >
                                            {actionLoading === `${item.id}-approve` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => setRejectModal({ id: item.id, title: item.title || 'Sin título' })}
                                            disabled={actionLoading === `${item.id}-reject`}
                                            className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase rounded-xl bg-[var(--bg-muted)] hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-500 transition disabled:opacity-50"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Rechazar
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Preview modal */}
            <AnimatePresence>
                {previewItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setPreviewItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-lg p-6 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white bg-gradient-to-r from-sky-500 to-cyan-500">Tema</span>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] truncate max-w-[300px]">{previewItem.title || 'Sin título'}</h3>
                                </div>
                                <button onClick={() => setPreviewItem(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition">
                                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {previewItem.image && (
                                    <img src={previewItem.image} alt="" className="w-full h-48 object-cover rounded-2xl border border-[var(--border-subtle)]" />
                                )}
                                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{previewItem.content}</p>
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
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
                                <button
                                    onClick={() => { setPreviewItem(null); setRejectModal({ id: previewItem.id, title: previewItem.title || 'Sin título' }); }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 rounded-xl transition shadow-sm"
                                >
                                    <XCircle className="w-4 h-4" /> Rechazar
                                </button>
                                <button
                                    onClick={() => { const item = previewItem; setPreviewItem(null); handleApprove(item.id); }}
                                    disabled={actionLoading === `${previewItem.id}-approve`}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition disabled:opacity-50 shadow-sm"
                                >
                                    {actionLoading === `${previewItem.id}-approve` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
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
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setRejectModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-md p-6 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Rechazar Tema</h3>
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
                                    disabled={actionLoading === `${rejectModal.id}-reject` || !rejectNote.trim()}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 rounded-xl transition disabled:opacity-50 shadow-sm"
                                >
                                    {actionLoading === `${rejectModal.id}-reject` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
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
