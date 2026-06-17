'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Search, Check, X, AlertCircle, BookOpen, Clock, FileText } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { glossaryApi, GlossaryEntry, PendingTerm } from '@/shared/lib/api/glossaryRepository';

export function GlossaryPageClient() {
    const [tab, setTab] = useState<'entries' | 'pending'>('entries');
    const [entries, setEntries] = useState<GlossaryEntry[]>([]);
    const [pendingTerms, setPendingTerms] = useState<PendingTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [entryCount, setEntryCount] = useState(0);

    // Editor modal state
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        key: '',
        description: '',
        search_patterns: [''],
        default_amount: '',
        account_reference: '',
        is_income: false,
    });
    const [saving, setSaving] = useState(false);

    // Approve modal state
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [approveForm, setApproveForm] = useState({ key: '', description: '', is_income: false });
    const [approving, setApproving] = useState(false);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await glossaryApi.list({ search, per_page: 200 });
            setEntries(res.data);
            setEntryCount(res.total);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [search]);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await glossaryApi.pendingTerms();
            setPendingTerms(res.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (tab === 'entries') fetchEntries();
        else fetchPending();
    }, [tab, fetchEntries, fetchPending]);

    // ─── Create / Edit ─────────────────────────────────────────────────────

    const openCreate = () => {
        setEditingId(null);
        setForm({ key: '', description: '', search_patterns: [''], default_amount: '', account_reference: '', is_income: false });
        setShowEditor(true);
    };

    const openEdit = (entry: GlossaryEntry) => {
        setEditingId(entry.id);
        setForm({
            key: entry.key,
            description: entry.description,
            search_patterns: entry.search_patterns.length ? entry.search_patterns : [''],
            default_amount: entry.default_amount ?? '',
            account_reference: entry.account_reference ?? '',
            is_income: entry.is_income,
        });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!form.key.trim() || !form.description.trim()) return;
        setSaving(true);
        try {
            const patterns = form.search_patterns.filter(p => p.trim());
            const payload = {
                key: form.key.trim(),
                description: form.description.trim(),
                search_patterns: patterns,
                default_amount: form.default_amount ? Number(form.default_amount) : null,
                account_reference: form.account_reference || null,
                is_income: form.is_income,
            };
            if (editingId) {
                await glossaryApi.update(editingId, payload);
            } else {
                await glossaryApi.create(payload as any);
            }
            setShowEditor(false);
            fetchEntries();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta entrada del glosario?')) return;
        try {
            await glossaryApi.delete(id);
            fetchEntries();
        } catch (e: any) {
            setError(e.message);
        }
    };

    // ─── Approve pending ───────────────────────────────────────────────────

    const openApprove = (term: PendingTerm) => {
        setApprovingId(term.id);
        setApproveForm({ key: term.term.replace(/\s+/g, '_').substring(0, 50), description: term.term, is_income: false });
    };

    const handleApprove = async () => {
        if (!approveForm.key.trim() || !approveForm.description.trim()) return;
        setApproving(true);
        try {
            await glossaryApi.approvePending(approvingId!, {
                key: approveForm.key.trim(),
                description: approveForm.description.trim(),
                is_income: approveForm.is_income,
            });
            setApprovingId(null);
            fetchPending();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setApproving(false);
        }
    };

    const handleDismiss = async (id: number) => {
        try {
            await glossaryApi.dismissPending(id);
            fetchPending();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleDismissAll = async () => {
        if (!confirm('¿Descartar todos los términos pendientes?')) return;
        try {
            await glossaryApi.dismissAllPending();
            fetchPending();
        } catch (e: any) {
            setError(e.message);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader
                title="Glosario"
                subtitle="Entradas de glosario para clasificación automática de transacciones"
                icon="BookOpen"
                actions={
                    <div className="flex gap-2">
                        {tab === 'pending' && pendingTerms.length > 0 && (
                            <BaseButton onClick={handleDismissAll} variant="outline" leftIcon="X" size="md">
                                Descartar todo
                            </BaseButton>
                        )}
                        <BaseButton onClick={() => { if (tab === 'entries') fetchEntries(); else fetchPending(); }} variant="outline" leftIcon="RefreshCw" size="md">
                            Refrescar
                        </BaseButton>
                        {tab === 'entries' && (
                            <BaseButton onClick={openCreate} variant="primary" leftIcon="Plus" size="md">
                                Nueva Entrada
                            </BaseButton>
                        )}
                    </div>
                }
            />

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setTab('entries')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${tab === 'entries' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <FileText className="w-4 h-4 inline mr-1.5" />
                    Entradas ({entryCount})
                </button>
                <button
                    onClick={() => setTab('pending')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${tab === 'pending' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    Pendientes ({pendingTerms.length})
                </button>
            </div>

            {/* Search bar */}
            {tab === 'entries' && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por clave o descripción..."
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Entries Table */}
            {tab === 'entries' && (
                <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {loading && entries.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">Cargando...</div>
                    ) : entries.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">
                            {search ? 'Sin resultados para esta búsqueda' : 'No hay entradas en el glosario'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-4">Clave</th>
                                        <th className="px-5 py-4">Descripción</th>
                                        <th className="px-5 py-4">Patrones</th>
                                        <th className="px-5 py-4">Monto</th>
                                        <th className="px-5 py-4">Tipo</th>
                                        <th className="px-5 py-4 w-24">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => (
                                        <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-sky-600 dark:text-sky-400">{entry.key}</td>
                                            <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">{entry.description}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {entry.search_patterns.map((p, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono text-gray-500">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{entry.default_amount ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.is_income ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    {entry.is_income ? 'Ingreso' : 'Gasto'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(entry)} className="text-xs px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 transition font-semibold">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(entry.id)} className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition font-semibold">
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Pending Terms */}
            {tab === 'pending' && (
                <div className="space-y-3">
                    {loading && pendingTerms.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">Cargando...</div>
                    ) : pendingTerms.length === 0 ? (
                        <div className="p-20 text-center text-gray-400">No hay términos pendientes</div>
                    ) : (
                        pendingTerms.map(term => (
                            <div key={term.id} className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{term.term}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {term.document_type && <span className="mr-3">{term.document_type}</span>}
                                        {term.source_field && <span>campo: {term.source_field}</span>}
                                        <span className="ml-3">{new Date(term.created_at).toLocaleString('es-PE')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => openApprove(term)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
                                        <Check className="w-4 h-4" />
                                        Aprobar
                                    </button>
                                    <button onClick={() => handleDismiss(term.id)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
                                        <X className="w-4 h-4" />
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ─── Create/Edit Modal ─────────────────────────────────────── */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowEditor(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {editingId ? 'Editar Entrada' : 'Nueva Entrada'}
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Clave (Key)</label>
                            <input type="text" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                                placeholder="EJ: TRANSFERENCIA_BANCARIA" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción</label>
                            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                                placeholder="Transferencia bancaria" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Patrones de búsqueda</label>
                            {form.search_patterns.map((p, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" value={p} onChange={e => {
                                        const sp = [...form.search_patterns];
                                        sp[i] = e.target.value;
                                        setForm(f => ({ ...f, search_patterns: sp }));
                                    }}
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                                        placeholder="TRANSF.*TERCEROS" />
                                    {form.search_patterns.length > 1 && (
                                        <button onClick={() => setForm(f => ({ ...f, search_patterns: f.search_patterns.filter((_, j) => j !== i) }))}
                                            className="px-3 text-red-400 hover:text-red-600 text-xs font-bold">X</button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setForm(f => ({ ...f, search_patterns: [...f.search_patterns, ''] }))}
                                className="text-xs text-sky-500 hover:text-sky-600 font-semibold">+ Agregar patrón</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Monto por defecto</label>
                                <input type="number" step="0.01" value={form.default_amount} onChange={e => setForm(f => ({ ...f, default_amount: e.target.value }))}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Ref. Contable</label>
                                <input type="text" value={form.account_reference} onChange={e => setForm(f => ({ ...f, account_reference: e.target.value }))}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                                    placeholder="6001" />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.is_income} onChange={e => setForm(f => ({ ...f, is_income: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Es ingreso</span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={saving || !form.key.trim() || !form.description.trim()}
                                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Approve Modal ────────────────────────────────────────── */}
            {approvingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setApprovingId(null)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md mx-4 p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Aprobar Término</h3>
                        <p className="text-sm text-gray-500">Crear una entrada de glosario para este término detectado automáticamente:</p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Clave (Key)</label>
                            <input type="text" value={approveForm.key} onChange={e => setApproveForm(f => ({ ...f, key: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción</label>
                            <input type="text" value={approveForm.description} onChange={e => setApproveForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={approveForm.is_income} onChange={e => setApproveForm(f => ({ ...f, is_income: e.target.checked }))}
                                className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Es ingreso</span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setApprovingId(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleApprove} disabled={approving || !approveForm.key.trim() || !approveForm.description.trim()}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                                {approving ? 'Aprobando...' : 'Aprobar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
