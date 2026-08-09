'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Video, Plus, Globe, Clock, User, Save, Info, FileText, BookOpen, Headphones, Clapperboard, X, ArrowRight } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Pagination from '@/components/ui/Pagination';
import { LyriumSelect } from '@/components/ui';
import { blogApi, BlogVideo } from '@/shared/lib/api/bioblogRepository';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import { BlogContentMobileCard } from './components/BlogContentMobileCard';
import { ContentStatusActions } from './components/ContentStatusActions';

export function BlogVideosClient() {
    const { can, capabilitiesLoading } = usePlanCapabilities();
    const hasAccess = can('can_bioblog');
    const [items, setItems] = useState<BlogVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ platform: 'youtube', url: '', title: '', description: '', thumbnail: '', duration: '' as any, status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ title?: string; thumbnail?: string; duration?: number; channel?: string } | null>(null);
    const [fetchingPreview, setFetchingPreview] = useState(false);
    const [page, setPage] = useState(1);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

    const updateStatus = async (id: number, status: string) => {
        try { await blogApi.videos.update(id, { status }); fetch(); }
        catch (e: any) { setError(e.message); }
    };

    const fmtDuration = (d: number | null) => {
        if (!d) return null;
        const m = Math.floor(d / 60);
        const s = d % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const statusBadge = (s: string) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            s === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
            s === 'approved' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
            s === 'pending_review' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' :
            s === 'rejected' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' :
            'bg-gray-100 dark:bg-gray-800 text-gray-500'
        }`}>{{
            draft: 'Borrador', pending_review: 'En revisión', approved: 'Aprobado',
            rejected: 'Rechazado', published: 'Publicado', archived: 'Archivado',
        }[s] || s}</span>
    );

    const pathname = usePathname();

    const BLOG_TABS = [
        { label: 'Dashboard', href: '/seller/blog', icon: BookOpen },
        { label: 'Artículos', href: '/seller/blog/articles', icon: FileText },
        { label: 'Podcasts', href: '/seller/blog/podcasts', icon: Headphones },
        { label: 'Vídeos', href: '/seller/blog/videos', icon: Video },
        { label: 'Shorts', href: '/seller/blog/shorts', icon: Clapperboard },
    ];

    if (capabilitiesLoading) return <div className="p-20 text-center text-gray-400">Verificando acceso...</div>;

    if (!hasAccess) {
        return (
            <div className="relative space-y-6 animate-fadeIn font-industrial pb-20">
                <div className="blur-sm pointer-events-none select-none">
                    <ModuleHeader title="BioBlog" subtitle="Vídeos" icon="Video" />
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl overflow-x-auto mt-6">
                        {BLOG_TABS.map(tab => (
                            <div key={tab.href} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap text-gray-400 dark:text-[var(--text-muted)]">
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </div>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-6 p-6 space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        ))}
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                        <div className="w-16 h-16 mx-auto mb-4">
                            <img src="/img/LyriumEspecial.png" alt="Lyrium" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Contenido bloqueado</p>
                        <p className="text-xs text-[var(--text-secondary)] mb-4">El BioBlog está disponible desde el plan CRECE. Actualiza tu plan para acceder.</p>
                        <a href="/seller/planes"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all">
                            Actualizar Plan
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="BioBlog" subtitle="Vídeos" icon="Video"
                actions={
                    <BaseButton onClick={openCreate} variant="action" leftIcon="Plus" size="sm">
                        <span className="hidden sm:inline">Nuevo Video</span>
                        <span className="sm:hidden">Video</span>
                    </BaseButton>
                } />

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
                    <span className="text-xs text-teal-600/70 dark:text-teal-400/70">Pega la URL del video, completa los datos y envía a revisión para publicarlo.</span>
                </div>
            </div>

            {error && !showEditor && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">{error}</div>}
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div>
                : items.length === 0 ? <div className="p-20 text-center text-gray-400">Sin videos</div>
                : <>
                    {/* MÓVIL */}
                    <div className="sm:hidden p-3 space-y-2">
                        {pageItems.map(v => (
                            <BlogContentMobileCard
                                key={v.id}
                                title={v.title}
                                statusBadge={statusBadge(v.status)}
                                thumbnailIcon={<Video className="w-5 h-5 text-gray-400" />}
                                metaFields={[
                                    { label: 'Plataforma', value: <span className="uppercase">{v.platform}</span> },
                                    { label: 'Duración', value: fmtDuration(v.duration) || '—' },
                                ]}
                                status={v.status}
                                onUpdateStatus={(status) => updateStatus(v.id, status)}
                                onEdit={() => openEdit(v)}
                                onDelete={() => handleDelete(v.id)}
                            />
                        ))}
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-5 py-4 whitespace-nowrap">Título</th>
                                <th className="px-5 py-4 whitespace-nowrap">Plataforma</th>
                                <th className="px-5 py-4 whitespace-nowrap">Duración</th>
                                <th className="px-5 py-4 whitespace-nowrap">Estado</th>
                                <th className="px-5 py-4 whitespace-nowrap w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map(v => (
                                <tr key={v.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{v.title}</td>
                                    <td className="px-5 py-4 text-xs text-gray-500 uppercase">{v.platform}</td>
                                    <td className="px-5 py-4 text-gray-500">{fmtDuration(v.duration) || '—'}</td>
                                    <td className="px-5 py-4">{statusBadge(v.status)}</td>
                                    <td className="px-5 py-4">
                                        <ContentStatusActions status={v.status} onUpdateStatus={(status) => updateStatus(v.id, status)} onEdit={() => openEdit(v)} onDelete={() => handleDelete(v.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </>}
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={items.length} itemLabel="videos" />
            </div>

            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowEditor(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="relative px-6 py-5 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] rounded-t-3xl flex-shrink-0">
                            <button onClick={() => setShowEditor(false)} className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-bold text-white pr-12">{editingId ? 'Editar Video' : 'Nuevo Video'}</h3>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto green-scrollbar">
                        <div>
                            <LyriumSelect
                                label="Plataforma"
                                value={form.platform}
                                onChange={(v) => setForm(f => ({ ...f, platform: v }))}
                                options={[
                                    { value: 'youtube', label: 'YouTube' },
                                    { value: 'vimeo', label: 'Vimeo' },
                                    { value: 'tiktok', label: 'TikTok' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
                            <input type="text" value={form.url} onChange={e => handleUrlChange(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="https://youtube.com/..." />
                            {fetchingPreview && <div className="text-xs text-gray-400 mt-1">Extrayendo metadata...</div>}
                            <p className="text-[10px] text-gray-400 mt-1">La información del video se extraerá automáticamente al pegar la URL.</p>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Duración (segundos)</label>
                                <input type="number" min="1" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Ej: 360" />
                                <p className="text-[10px] text-gray-400 mt-1">Indica la duración en segundos. Ej: 360 = 6 min, 180 = 3 min.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Descripción
                                <span title="Una buena descripción ayuda a los usuarios a entender de qué trata el video antes de verlo."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                            </label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" />
                        </div>
                        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.url.trim()} className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] hover:from-emerald-500 hover:to-sky-500 dark:hover:from-[var(--brand-green)] dark:hover:to-[var(--icons-green)] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-lg shadow-sky-500/25 dark:shadow-[#8FC3A1]/70">
                                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Borrador')}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}
