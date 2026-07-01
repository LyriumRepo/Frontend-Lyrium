'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Video, Plus, Edit, Trash2, Globe, Clock, User } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { blogApi, BlogVideo } from '@/shared/lib/api/bioblogRepository';

// ─── Mobile accordion card ────────────────────────────────────────────────────

function MobileVideoCard({ item: v, fmtDuration, onEdit, onDelete }: { item: any; fmtDuration: (d: number | null) => string | null; onEdit: (v: any) => void; onDelete: (id: number) => void }) {
    const [expanded, setExpanded] = useState(false);
    const statusClass = v.status === 'published' ? 'bg-emerald-100 text-emerald-600' : v.status === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500';
    return (
        <div>
            <button onClick={() => setExpanded(s => !s)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 active:bg-gray-100 transition-colors">
                <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{v.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${statusClass}`}>{v.status}</span>
                <svg className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expanded && (
                <div className="px-4 pb-3.5 grid grid-cols-3 gap-3 border-t border-gray-50 dark:border-gray-800/50">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Plataforma</p>
                        <span className="text-xs text-gray-500 uppercase">{v.platform}</span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Duración</p>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{fmtDuration(v.duration) || '—'}</span>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Acciones</p>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(v)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-500 transition"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export function BlogVideosClient() {
    const [items, setItems] = useState<BlogVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ platform: 'youtube', url: '', title: '', description: '', thumbnail: '', duration: '' as any, status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ title?: string; thumbnail?: string; duration?: number; channel?: string } | null>(null);
    const [fetchingPreview, setFetchingPreview] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try { const res = await blogApi.videos.list({ per_page: 50 }); setItems(res.data); }
        catch (e: any) { setError(e.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const fetchPreview = useCallback(async (url: string) => {
        if (!url || !url.startsWith('http')) return;
        setFetchingPreview(true);
        try {
            const res = await blogApi.urlMetadata(url);
            if (res.success && res.data) {
                const md = res.data;
                setPreview(md);
                setForm(f => ({
                    ...f,
                    title: f.title || md.title || '',
                    platform: f.platform || md.platform || 'youtube',
                    thumbnail: f.thumbnail || md.thumbnail || '',
                    description: f.description || md.description || '',
                    duration: f.duration || md.duration || '',
                }));
            }
        } catch {} finally { setFetchingPreview(false); }
    }, []);

    const handleUrlChange = (url: string) => {
        setForm(f => ({ ...f, url }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchPreview(url), 800);
    };

    const openCreate = () => {
        setEditingId(null); setError(null); setPreview(null);
        setForm({ platform: 'youtube', url: '', title: '', description: '', thumbnail: '', duration: '', status: 'draft' });
        setShowEditor(true);
    };
    const openEdit = (v: BlogVideo) => {
        setEditingId(v.id); setError(null); setPreview(null);
        setForm({ platform: v.platform, url: v.url, title: v.title, description: v.description || '', thumbnail: v.thumbnail || '', duration: v.duration || '', status: v.status });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.url.trim()) return;
        setSaving(true); setError(null);
        const payload = { ...form, duration: form.duration ? Number(form.duration) : null };
        try {
            if (editingId) await blogApi.videos.update(editingId, payload);
            else await blogApi.videos.create(payload);
            setShowEditor(false); fetch();
        } catch (e: any) { setError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar?')) return;
        try { await blogApi.videos.delete(id); fetch(); } catch (e: any) { setError(e.message); }
    };

    const fmtDuration = (d: number | null) => {
        if (!d) return null;
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <div className="[&_h1]:!whitespace-normal [&_h1]:!break-words [&_h2]:!whitespace-normal [&_h2]:!break-words [&_p]:!whitespace-normal">
                <ModuleHeader title="Videos" subtitle="Gestiona tus videos" icon="Video"
                    actions={
                        <>
                            <span className="hidden sm:block"><BaseButton onClick={openCreate} variant="primary" leftIcon="Plus" size="md">Nuevo Video</BaseButton></span>
                            <button onClick={openCreate} className="sm:hidden w-9 h-9 rounded-xl bg-sky-500 dark:bg-[#8FC3A1] flex items-center justify-center text-white dark:text-[#0d1a12] active:scale-95 shadow-md"><Plus className="w-4 h-4" /></button>
                        </>
                    } />
            </div>

            {error && !showEditor && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">{error}</div>}

            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div>
                : items.length === 0 ? <div className="p-20 text-center text-gray-400">Sin videos</div>
                : (
                    <>
                        {/* ══ MÓVIL: accordion (sm:hidden) ══ */}
                        <div className="sm:hidden divide-y divide-gray-50 dark:divide-gray-800/50">
                            {items.map(v => <MobileVideoCard key={v.id} item={v} fmtDuration={fmtDuration} onEdit={openEdit} onDelete={handleDelete} />)}
                        </div>

                        {/* ══ DESKTOP: tabla (hidden sm:block) ══ */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="px-5 py-4">Título</th>
                                        <th className="px-5 py-4">Plataforma</th>
                                        <th className="px-5 py-4">Duración</th>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4 w-24">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(v => (
                                        <tr key={v.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                            <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[250px]">{v.title}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 uppercase">{v.platform}</td>
                                            <td className="px-5 py-4 text-gray-500">{fmtDuration(v.duration) || '—'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.status === 'published' ? 'bg-emerald-100 text-emerald-600' : v.status === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>{v.status}</span>
                                            </td>
                                            <td className="px-5 py-4"><div className="flex gap-2">
                                                <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-500 transition"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                            </div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {showEditor && mounted && document.getElementById('modal-root') && createPortal(
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" onClick={() => setShowEditor(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{editingId ? 'Editar Video' : 'Nuevo Video'}</h3>
                            <button onClick={() => setShowEditor(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Plataforma</label>
                                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                                    <option value="youtube">YouTube</option>
                                    <option value="vimeo">Vimeo</option>
                                    <option value="tiktok">TikTok</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                                    <option value="draft">Borrador</option>
                                    <option value="review">Revisión</option>
                                    <option value="published">Publicado</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
                            <input type="text" value={form.url} onChange={e => handleUrlChange(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="https://youtube.com/..." />
                            {fetchingPreview && <div className="text-xs text-gray-400 mt-1">Extrayendo metadata...</div>}
                        </div>

                        {preview && (
                            <div className="bg-gray-50 dark:bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex gap-4">
                                {preview.thumbnail && <img src={preview.thumbnail} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{preview.title || form.title}</div>
                                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                                        {preview.channel && <span className="flex items-center gap-1"><User className="w-3 h-3" />{preview.channel}</span>}
                                        {preview.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(preview.duration / 60)}:{String(preview.duration % 60).padStart(2, '0')}</span>}
                                        {form.platform && <span className="flex items-center gap-1 uppercase"><Globe className="w-3 h-3" />{form.platform}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Duración (segundos)</label>
                                <input type="number" min="1" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Ej: 360" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                        </div>
                        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.url.trim()} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')!
            )}
        </div>
    );
}