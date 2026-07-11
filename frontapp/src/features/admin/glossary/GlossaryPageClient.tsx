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
            <div className="flex gap-4 border-b border-[var(--border-subtle)]">
                <button
                    onClick={() => setTab('entries')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${tab === 'entries' ? 'border-[var(--icons-green)] text-[var(--icons-green)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                    <FileText className="w-4 h-4 inline mr-1.5" />
                    Entradas ({entryCount})
                </button>
                <button
                    onClick={() => setTab('pending')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${tab === 'pending' ? 'border-[var(--icons-green)] text-[var(--icons-green)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                    <Clock className="w-4 h-4 inline mr-1.5" />
                    Pendientes ({pendingTerms.length})
                </button>
            </div>

            {/* Search bar */}
            {tab === 'entries' && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por clave o descripción..."
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-2xl text-[var(--color-error)] text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Entries Table */}
            {tab === 'entries' && (
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                    {loading && entries.length === 0 ? (
                        <div className="p-20 text-center text-[var(--text-muted)]">Cargando...</div>
                    ) : entries.length === 0 ? (
                        <div className="p-20 text-center text-[var(--text-muted)]">
                            {search ? 'Sin resultados para esta búsqueda' : 'No hay entradas en el glosario'}
                        </div>
                    ) : (
                        <>
                        {/* ── Vista mobile: cards ── */}
                        <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                            {entries.map(entry => (
                                <div key={entry.id} className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--icons-green)] font-black text-sm shrink-0">
                                        {entry.key?.[0]?.toUpperCase() ?? '#'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono truncate">{entry.key}</span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${entry.is_income ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${entry.is_income ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`} />
                                                {entry.is_income ? 'Ingreso' : 'Gasto'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{entry.description}</p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {entry.search_patterns.map((p, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-md text-[10px] font-mono text-[var(--text-secondary)]">{p}</span>
                                            ))}
                                            {entry.default_amount != null && (
                                                <span className="text-[10px] font-bold text-[var(--text-secondary)] ml-1">{entry.default_amount}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => openEdit(entry)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--icons-green)]/10 text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--icons-green)]/20">Editar</button>
                                            <button onClick={() => handleDelete(entry.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-[10px] font-black transition-colors border border-[var(--color-error)]/20">Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Vista desktop: tabla ── */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border-subtle)] text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
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
                                        <tr key={entry.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition">
                                            <td className="px-5 py-4 font-mono text-xs font-bold text-[var(--icons-green)]">{entry.key}</td>
                                            <td className="px-5 py-4 text-[var(--text-secondary)] max-w-xs truncate">{entry.description}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {entry.search_patterns.map((p, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-[var(--bg-muted)] rounded-md text-xs font-mono text-[var(--text-secondary)]">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[var(--text-secondary)]">{entry.default_amount ?? '—'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.is_income ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--color-error)]/15 text-[var(--color-error)]'}`}>
                                                    {entry.is_income ? 'Ingreso' : 'Gasto'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(entry)} className="text-xs px-3 py-1.5 bg-[var(--icons-green)]/10 text-[var(--icons-green)] rounded-lg hover:bg-[var(--icons-green)]/20 transition font-semibold">Editar</button>
                                                    <button onClick={() => handleDelete(entry.id)} className="text-xs px-3 py-1.5 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-lg hover:bg-[var(--color-error)]/20 transition font-semibold">Eliminar</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </div>
            )}

            {/* Pending Terms */}
            {tab === 'pending' && (
                <div className="space-y-3">
                    {loading && pendingTerms.length === 0 ? (
                        <div className="p-20 text-center text-[var(--text-muted)]">Cargando...</div>
                    ) : pendingTerms.length === 0 ? (
                        <div className="p-20 text-center text-[var(--text-muted)]">No hay términos pendientes</div>
                    ) : (
                        pendingTerms.map(term => (
                            <div key={term.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-5 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-mono text-sm font-bold text-[var(--text-primary)] truncate">{term.term}</div>
                                    <div className="text-xs text-[var(--text-muted)] mt-1">
                                        {term.document_type && <span className="mr-3">{term.document_type}</span>}
                                        {term.source_field && <span>campo: {term.source_field}</span>}
                                        <span className="ml-3">{new Date(term.created_at).toLocaleString('es-PE')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => openApprove(term)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl text-sm font-semibold hover:bg-[var(--color-success)]/20 transition">
                                        <Check className="w-4 h-4" />
                                        Aprobar
                                    </button>
                                    <button onClick={() => handleDismiss(term.id)} className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold hover:bg-[var(--bg-secondary)] transition">
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
                    <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-lg mx-4 p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {editingId ? 'Editar Entrada' : 'Nueva Entrada'}
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Clave (Key)</label>
                            <input type="text" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                                placeholder="EJ: TRANSFERENCIA_BANCARIA" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Descripción</label>
                            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                                placeholder="Transferencia bancaria" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Patrones de búsqueda</label>
                            {form.search_patterns.map((p, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input type="text" value={p} onChange={e => {
                                        const sp = [...form.search_patterns];
                                        sp[i] = e.target.value;
                                        setForm(f => ({ ...f, search_patterns: sp }));
                                    }}
                                        className="flex-1 px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm font-mono bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                                        placeholder="TRANSF.*TERCEROS" />
                                    {form.search_patterns.length > 1 && (
                                        <button onClick={() => setForm(f => ({ ...f, search_patterns: f.search_patterns.filter((_, j) => j !== i) }))}
                                            className="px-3 text-[var(--color-error)] hover:text-[var(--color-error)] text-xs font-bold">X</button>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => setForm(f => ({ ...f, search_patterns: [...f.search_patterns, ''] }))}
                                className="text-xs text-[var(--icons-green)] hover:text-[var(--icons-green)] font-semibold">+ Agregar patrón</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Monto por defecto</label>
                                <input type="number" step="0.01" value={form.default_amount} onChange={e => setForm(f => ({ ...f, default_amount: e.target.value }))}
                                    className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                                    placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Ref. Contable</label>
                                <input type="text" value={form.account_reference} onChange={e => setForm(f => ({ ...f, account_reference: e.target.value }))}
                                    className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                                    placeholder="6001" />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.is_income} onChange={e => setForm(f => ({ ...f, is_income: e.target.checked }))}
                                className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--icons-green)] focus:ring-[var(--icons-green)]" />
                            <span className="text-sm font-semibold text-[var(--text-secondary)]">Es ingreso</span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Cancelar</button>
                            <button onClick={handleSave} disabled={saving || !form.key.trim() || !form.description.trim()}
                                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Approve Modal ────────────────────────────────────────── */}
            {approvingId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setApprovingId(null)}>
                    <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-md mx-4 p-6 space-y-5" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Aprobar Término</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Crear una entrada de glosario para este término detectado automáticamente:</p>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Clave (Key)</label>
                            <input type="text" value={approveForm.key} onChange={e => setApproveForm(f => ({ ...f, key: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Descripción</label>
                            <input type="text" value={approveForm.description} onChange={e => setApproveForm(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition" />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={approveForm.is_income} onChange={e => setApproveForm(f => ({ ...f, is_income: e.target.checked }))}
                                className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--icons-green)] focus:ring-[var(--icons-green)]" />
                            <span className="text-sm font-semibold text-[var(--text-secondary)]">Es ingreso</span>
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setApprovingId(null)} className="px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Cancelar</button>
                            <button onClick={handleApprove} disabled={approving || !approveForm.key.trim() || !approveForm.description.trim()}
                                className="px-6 py-2.5 bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                                {approving ? 'Aprobando...' : 'Aprobar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
