'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Headphones, Plus, Edit, Trash2, Music, Video, Globe, Clock, User, Send, CheckCircle, Save, Info, FileText, BookOpen, Clapperboard } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { blogApi, BlogPodcast } from '@/shared/lib/api/bioblogRepository';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BlogPodcastsClient() {
    const [items, setItems] = useState<BlogPodcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ type: 'audio', platform: '', url: '', title: '', description: '', cover_image: '', duration: '' as any, status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ title?: string; thumbnail?: string; duration?: number; channel?: string; type?: string } | null>(null);
    const [fetchingPreview, setFetchingPreview] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try { const res = await blogApi.podcasts.list({ per_page: 50 }); setItems(res.data); }
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
                    platform: f.platform || md.platform || '',
                    type: f.type || md.type || 'audio',
                    cover_image: f.cover_image || md.thumbnail || '',
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
        setForm({ type: 'audio', platform: '', url: '', title: '', description: '', cover_image: '', duration: '', status: 'draft' });
        setShowEditor(true);
    };
    const openEdit = (p: BlogPodcast) => {
        setEditingId(p.id); setError(null); setPreview(null);
        setForm({ type: p.type, platform: p.platform, url: p.url, title: p.title, description: p.description || '', cover_image: p.cover_image || '', duration: p.duration || '', status: p.status });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.url.trim()) return;
        setSaving(true); setError(null);
        const payload = { ...form, duration: form.duration ? Number(form.duration) : null };
        try {
            if (editingId) await blogApi.podcasts.update(editingId, payload);
            else await blogApi.podcasts.create(payload);
            setShowEditor(false); fetch();
        } catch (e: any) { setError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar?')) return;
        try { await blogApi.podcasts.delete(id); fetch(); } catch (e: any) { setError(e.message); }
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = {
            draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
            pending_review: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            approved: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
            rejected: 'bg-gray-200 dark:bg-gray-700 text-gray-400',
            published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
            archived: 'bg-gray-200 dark:bg-gray-700 text-gray-400',
        };
        const labels: Record<string, string> = {
            draft: 'Borrador', pending_review: 'En revisión', approved: 'Aprobado',
            rejected: 'Rechazado', published: 'Publicado', archived: 'Archivado',
        };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[s] || map.draft}`}>{labels[s] || s}</span>;
    };

    const updateStatus = async (id: number, status: string) => {
        try { await blogApi.podcasts.update(id, { status }); fetch(); }
        catch (e: any) { setError(e.message); }
    };

    const platformIcon = (p: string) => {
        const icons: Record<string, any> = { spotify: Music, youtube: Video, tiktok: Globe, apple_podcasts: Music };
        const Icon = icons[p] || Headphones;
        return <Icon className="w-4 h-4" />;
    };

    const fmtDuration = (d: number | null) => {
        if (!d) return null;
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const pathname = usePathname();

    const BLOG_TABS = [
        { label: 'Dashboard', href: '/seller/blog', icon: BookOpen },
        { label: 'Artículos', href: '/seller/blog/articles', icon: FileText },
        { label: 'Podcasts', href: '/seller/blog/podcasts', icon: Headphones },
        { label: 'Vídeos', href: '/seller/blog/videos', icon: Video },
        { label: 'Shorts', href: '/seller/blog/shorts', icon: Clapperboard },
    ];

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="BioBlog" subtitle="Podcasts" icon="Headphones"
                actions={<BaseButton onClick={openCreate} variant="primary" leftIcon="Plus" size="md">Nuevo Podcast</BaseButton>} />

            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl overflow-x-auto">
                {BLOG_TABS.map(tab => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-white dark:bg-[var(--bg-card)] text-teal-600 dark:text-teal-400 shadow-sm border border-gray-200/50 dark:border-teal-500/20'
                                    : 'text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            {/* Workflow guide */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/20 rounded-2xl border border-teal-200/50 dark:border-teal-800/30 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">
                    <span className="font-bold">Flujo de contenido:</span>{' '}
                    <span className="inline-flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold">Borrador</span>
                        <span className="text-teal-400">→</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">En revisión</span>
                        <span className="text-teal-400">→</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">Publicado</span>
                    </span>
                    <br />
                    <span className="text-xs text-teal-600/70 dark:text-teal-400/70">Selecciona el tipo y plataforma, pega la URL del podcast y completa los datos. Luego envía a revisión.</span>
                </div>
            </div>

            {error && !showEditor && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">{error}</div>}
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div>
                : items.length === 0 ? <div className="p-20 text-center text-gray-400">Sin podcasts</div>
                : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-5 py-4">Portada</th>
                                <th className="px-5 py-4">Título</th>
                                <th className="px-5 py-4">Plataforma</th>
                                <th className="px-5 py-4">Duración</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4 w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-4">{p.cover_image ? <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Headphones className="w-5 h-5 text-gray-400" /></div>}</td>
                                    <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{p.title}</td>
                                    <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase">{platformIcon(p.platform)}{p.platform}</div></td>
                                    <td className="px-5 py-4 text-gray-500">{fmtDuration(p.duration) || '—'}</td>
                                    <td className="px-5 py-4">{statusBadge(p.status)}</td>
                                    <td className="px-5 py-4"><div className="flex gap-1.5 items-center">
                                        {p.status === 'draft' && (
                                            <button onClick={() => updateStatus(p.id, 'pending_review')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition">
                                                <Send className="w-3 h-3 inline mr-1" />Enviar
                                            </button>
                                        )}
                                        {p.status === 'pending_review' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">En revisión</span>
                                        )}
                                        {p.status === 'approved' && (
                                            <>
                                                <button onClick={() => updateStatus(p.id, 'published')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition">
                                                    <CheckCircle className="w-3 h-3 inline mr-1" />Publicar
                                                </button>
                                                <button onClick={() => updateStatus(p.id, 'draft')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                                                    Borrador
                                                </button>
                                            </>
                                        )}
                                        {p.status === 'rejected' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500">Rechazado</span>
                                        )}
                                        {p.status === 'published' && (
                                            <button onClick={() => updateStatus(p.id, 'approved')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                                                Ocultar
                                            </button>
                                        )}
                                        {p.status === 'archived' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400">Archivado</span>
                                        )}
                                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-500 transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"><Trash2 className="w-4 h-4" /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>

            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" onClick={() => setShowEditor(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{editingId ? 'Editar Podcast' : 'Nuevo Podcast'}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo
                                    <span title="Selecciona 'Audio' para podcasts solo de sonido o 'Video' si incluye imagen."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                </label>
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                                    <option value="audio">Audio</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Plataforma</label>
                                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                                    <option value="">Seleccionar</option>
                                    <option value="spotify">Spotify</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="apple_podcasts">Apple Podcasts</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
                            <input type="text" value={form.url} onChange={e => handleUrlChange(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="https://spotify.com/..." />
                            {fetchingPreview && <div className="text-xs text-gray-400 mt-1">Extrayendo metadata...</div>}
                            <p className="text-[10px] text-gray-400 mt-1">La información del podcast se extraerá automáticamente al pegar la URL.</p>
                        </div>

                        {preview && (
                            <div className="bg-gray-50 dark:bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex gap-4">
                                {preview.thumbnail && (
                                    <img src={preview.thumbnail} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{preview.title || form.title}</div>
                                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
                                        {preview.channel && <span className="flex items-center gap-1"><User className="w-3 h-3" />{preview.channel}</span>}
                                        {preview.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(preview.duration / 60)}:{String(preview.duration % 60).padStart(2, '0')}</span>}
                                        {form.platform && <span className="flex items-center gap-1 uppercase">{platformIcon(form.platform)}{form.platform}</span>}
                                        <span className="flex items-center gap-1">{form.type === 'audio' ? 'Audio' : 'Video'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Duración (segundos)</label>
                                <input type="number" min="1" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Ej: 360" />
                                <p className="text-[10px] text-gray-400 mt-1">Duración total en segundos. Ej: 1800 = 30 min, 3600 = 60 min.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción
                                <span title="Describe el contenido del podcast para atraer a los oyentes."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                            </label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Portada (URL)
                                <span title="URL de la imagen de portada del podcast. Se usará como thumbnail si no hay portada disponible."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                            </label>
                            <input type="text" value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                        </div>

                        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.url.trim()} className="flex items-center gap-1.5 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Borrador')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
