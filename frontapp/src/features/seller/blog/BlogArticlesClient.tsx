'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Eye, Send, Save, CheckCircle } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { BlogEditor } from '@/components/ui/BlogEditor';
import { GooglePreview } from '@/components/ui/GooglePreview';
import { blogApi, BlogArticle } from '@/shared/lib/api/bioblogRepository';

export function BlogArticlesClient() {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ title: '', summary: '', content: '', main_image: '', blog_category_id: '' as any, meta_title: '', meta_description: '', slug: '', keywords: [] as string[], status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const loadArticles = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const params: any = { per_page: 50 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await blogApi.articles.list(params);
            setArticles(res.data);
        } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    }, [search, statusFilter]);

    useEffect(() => { loadArticles(); }, [loadArticles]);

    const openCreate = () => {
        setEditingId(null); setError(null); setPreviewHtml(null);
        setForm({ title: '', summary: '', content: '', main_image: '', blog_category_id: '', meta_title: '', meta_description: '', slug: '', keywords: [], status: 'draft' });
        setShowEditor(true);
    };

    const openEdit = (a: BlogArticle) => {
        setEditingId(a.id); setError(null); setPreviewHtml(null);
        setForm({ title: a.title, summary: a.summary || '', content: a.content || '', main_image: a.main_image || '', blog_category_id: a.blog_category_id ?? '', meta_title: a.meta_title || '', meta_description: a.meta_description || '', slug: a.slug || '', keywords: a.keywords || [], status: a.status });
        setShowEditor(true);
    };

    const saveWithStatus = async (status: string) => {
        if (!form.title.trim()) return;
        setSaving(true); setError(null);
        try {
            const payload = { ...form, status, blog_category_id: form.blog_category_id || null, slug: form.slug || undefined };
            if (editingId) await blogApi.articles.update(editingId, payload);
            else await blogApi.articles.create(payload);
            setShowEditor(false); loadArticles();
        } catch (e: any) { setError(e.message); } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este artículo?')) return;
        try { await blogApi.articles.delete(id); loadArticles(); } catch (e: any) { setError(e.message); }
    };

    const handleUploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/blog/media/upload', { method: 'POST', body: formData });
            const json = await res.json();
            return json.data?.url || URL.createObjectURL(file);
        } catch {
            return URL.createObjectURL(file);
        }
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500', review: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', archived: 'bg-red-100 dark:bg-red-900/30 text-red-500' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[s] || map.draft}`}>{s}</span>;
    };

    const actions = [
        { key: 'draft', label: 'Guardar Borrador', icon: Save, className: 'bg-gray-500 hover:bg-gray-600' },
        { key: 'review', label: 'Enviar Revisión', icon: Send, className: 'bg-amber-500 hover:bg-amber-600' },
        { key: 'published', label: 'Publicar', icon: CheckCircle, className: 'bg-emerald-500 hover:bg-emerald-600' },
    ];

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="Artículos" subtitle="Gestiona tus artículos de blog" icon="FileText"
                actions={<BaseButton onClick={openCreate} variant="primary" leftIcon="Plus" size="md">Nuevo Artículo</BaseButton>} />

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar artículos..." className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                    <option value="">Todos</option>
                    <option value="draft">Borrador</option>
                    <option value="review">Revisión</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                </select>
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">{error}</div>}

            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div>
                : articles.length === 0 ? <div className="p-20 text-center text-gray-400">Sin artículos</div>
                : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-5 py-4">Título</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4">Vistas</th>
                                <th className="px-5 py-4">Fecha</th>
                                <th className="px-5 py-4 w-28">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(a => (
                                <tr key={a.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                    <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 max-w-xs truncate">{a.title}</td>
                                    <td className="px-5 py-4">{statusBadge(a.status)}</td>
                                    <td className="px-5 py-4 text-gray-500">{a.views_count}</td>
                                    <td className="px-5 py-4 text-xs text-gray-400">{a.published_at ? new Date(a.published_at).toLocaleDateString('es-PE') : new Date(a.created_at).toLocaleDateString('es-PE')}</td>
                                    <td className="px-5 py-4"><div className="flex gap-2">
                                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>

            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10" onClick={() => setShowEditor(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-4xl mx-4 p-6 space-y-5" onClick={e => e.stopPropagation()} ref={editorRef}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{editingId ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>

                        {/* Encabezado */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Título *</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-base font-bold bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" placeholder="Título del artículo (máx 2 líneas)" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Imagen principal</label>
                                <div className="flex gap-2">
                                    <input type="text" value={form.main_image} onChange={e => setForm(f => ({ ...f, main_image: e.target.value }))} className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="URL 1024x1024" />
                                </div>
                                {form.main_image && <img src={form.main_image} alt="" className="mt-2 w-16 h-16 rounded-lg object-cover border border-gray-200" />}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Resumen</label>
                            <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={2} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" placeholder="Resumen (máx 4 líneas)" />
                        </div>

                        {/* Editor visual */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Contenido</label>
                            <div className="text-[10px] text-gray-400 mb-1">Drag & drop imágenes, auto upload, hasta 4 páginas</div>
                            <BlogEditor
                                content={form.content}
                                onChange={html => setForm(f => ({ ...f, content: html }))}
                                onUploadImage={handleUploadImage}
                                placeholder="Comienza a escribir tu artículo..."
                            />
                        </div>

                        {/* SEO */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                            <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">SEO</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Title</label>
                                    <input type="text" value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder={form.title} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Slug</label>
                                    <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="mi-articulo" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Description</label>
                                <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} rows={2} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder={form.summary} />
                            </div>
                            <GooglePreview
                                title={form.meta_title || form.title}
                                description={form.meta_description || form.summary}
                                slug={form.slug || form.title.toLowerCase().replace(/\s+/g, '-')}
                            />
                        </div>

                        {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</div>}

                        {/* Action buttons */}
                        <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => setShowEditor(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
                            <button onClick={() => { setPreviewHtml(form.content); window.open('', 'preview')?.document.write(form.content); }} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition">
                                <Eye className="w-4 h-4" /> Vista Previa
                            </button>
                            {actions.map(action => (
                                <button key={action.key} onClick={() => saveWithStatus(action.key)} disabled={saving || !form.title.trim()}
                                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-50 ${action.className}`}>
                                    <action.icon className="w-4 h-4" /> {saving ? 'Guardando...' : action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
