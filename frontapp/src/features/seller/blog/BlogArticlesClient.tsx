'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Eye, Send, Save, CheckCircle, Folder, Info, AlertCircle, BookOpen, Headphones, Video, Clapperboard } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { BlogEditor } from '@/components/ui/BlogEditor';
import { GooglePreview } from '@/components/ui/GooglePreview';
import { blogApi, BlogArticle } from '@/shared/lib/api/bioblogRepository';
import { blogApi as publicBlogApi } from '@/shared/lib/api/blog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BlogArticlesClient() {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
    const [form, setForm] = useState({ title: '', summary: '', content: '', main_image: '', blog_category_id: '' as any, is_featured: false, meta_title: '', meta_description: '', slug: '', keywords: [] as string[], status: 'draft' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();

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

    useEffect(() => {
        publicBlogApi.getCategories().then(setCategories).catch(() => {});
    }, []);

    const openCreate = () => {
        setEditingId(null); setError(null); setPreviewHtml(null);
        setForm({ title: '', summary: '', content: '', main_image: '', blog_category_id: '', is_featured: false, meta_title: '', meta_description: '', slug: '', keywords: [], status: 'draft' });
        setShowEditor(true);
    };

    const openEdit = (a: BlogArticle) => {
        setEditingId(a.id); setError(null); setPreviewHtml(null);
        setForm({ title: a.title, summary: a.summary || '', content: a.content || '', main_image: a.main_image || '', blog_category_id: a.blog_category_id ?? '', is_featured: a.is_featured ?? false, meta_title: a.meta_title || '', meta_description: a.meta_description || '', slug: a.slug || '', keywords: a.keywords || [], status: a.status });
        setShowEditor(true);
    };

    const saveWithStatus = async (status: string) => {
        if (!form.title.trim()) return;
        setSaving(true); setError(null);
        try {
            const payload = { ...form, is_featured: form.is_featured, status, blog_category_id: form.blog_category_id || null, slug: form.slug || undefined };
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
        try { await blogApi.articles.update(id, { status }); loadArticles(); }
        catch (e: any) { setError(e.message); }
    };

    const BLOG_TABS = [
        { label: 'Dashboard', href: '/seller/blog', icon: BookOpen },
        { label: 'Artículos', href: '/seller/blog/articles', icon: FileText },
        { label: 'Podcasts', href: '/seller/blog/podcasts', icon: Headphones },
        { label: 'Vídeos', href: '/seller/blog/videos', icon: Video },
        { label: 'Shorts', href: '/seller/blog/shorts', icon: Clapperboard },
    ];

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="BioBlog" subtitle="Artículos" icon="FileText"
                actions={<BaseButton onClick={openCreate} variant="primary" leftIcon="Plus" size="md">Nuevo Artículo</BaseButton>} />

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
                    <span className="text-xs text-teal-600/70 dark:text-teal-400/70">Crea un borrador, luego envíalo a revisión. Un administrador lo aprobará y podrás publicarlo.</span>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar artículos..." className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-teal-500 transition" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                    <option value="">Todos</option>
                    <option value="draft">Borrador</option>
                    <option value="pending_review">En revisión</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
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
                                    <td className="px-5 py-4"><div className="flex gap-1.5 items-center">
                                        {a.status === 'draft' && (
                                            <button onClick={() => updateStatus(a.id, 'pending_review')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition">
                                                <Send className="w-3 h-3 inline mr-1" />Enviar
                                            </button>
                                        )}
                                        {a.status === 'pending_review' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">En revisión</span>
                                        )}
                                        {a.status === 'approved' && (
                                            <>
                                                <button onClick={() => updateStatus(a.id, 'published')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition">
                                                    <CheckCircle className="w-3 h-3 inline mr-1" />Publicar
                                                </button>
                                                <button onClick={() => updateStatus(a.id, 'draft')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                                                    Borrador
                                                </button>
                                            </>
                                        )}
                                        {a.status === 'rejected' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500">Rechazado</span>
                                        )}
                                        {a.status === 'published' && (
                                            <button onClick={() => updateStatus(a.id, 'approved')} className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-700 dark:text-gray-300 transition">
                                                Ocultar
                                            </button>
                                        )}
                                        {a.status === 'archived' && (
                                            <span className="px-2.5 py-1.5 text-[11px] font-bold uppercase rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400">Archivado</span>
                                        )}
                                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-500 transition"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition"><Trash2 className="w-4 h-4" /></button>
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
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Título *
                                    <span title="Elige un título llamativo y descriptivo para captar la atención."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                </label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-base font-bold bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" placeholder="Título del artículo (máx 2 líneas)" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Imagen principal
                                    <span title="URL de la imagen que aparecerá en la portada del artículo. Recomendado: 1024x1024px."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                </label>
                                <div className="flex gap-2">
                                    <input type="text" value={form.main_image} onChange={e => setForm(f => ({ ...f, main_image: e.target.value }))} className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="URL 1024x1024" />
                                </div>
                                {form.main_image && <img src={form.main_image} alt="" className="mt-2 w-16 h-16 rounded-lg object-cover border border-gray-200" />}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Resumen</label>
                            <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={2} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition" placeholder="Resumen (máx 4 líneas)" />
                            <p className="text-[10px] text-gray-400 mt-1">Aparecerá en la vista previa del artículo en el listado del BioBlog.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <Folder className="w-3.5 h-3.5" /> Categoría
                                <span title="Agrupa tu artículo por tema para que los usuarios lo encuentren más fácilmente."><Info className="w-3.5 h-3.5 text-gray-300" /></span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, blog_category_id: '' }))}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                        !form.blog_category_id
                                            ? 'bg-teal-500 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    Sin categoría
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, blog_category_id: cat.id }))}
                                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                                            form.blog_category_id === cat.id
                                                ? 'bg-teal-500 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Destacado */}
                        <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl border border-teal-200/50 dark:border-teal-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-teal-800 dark:text-teal-300">Artículo Destacado</p>
                                    <p className="text-xs text-teal-600 dark:text-teal-400/70">Aparecerá en la sección Destacados del BioBlog</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                                    form.is_featured
                                        ? 'bg-teal-500 dark:bg-teal-600'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                        form.is_featured ? 'translate-x-7' : ''
                                    }`}
                                />
                            </button>
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
                            <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                                SEO
                                <span title="El SEO ayuda a que tu artículo aparezca en Google. Personaliza estos campos para mejorar el posicionamiento."><Info className="w-3.5 h-3.5 text-gray-300" /></span>
                            </h4>
                            <p className="text-[10px] text-gray-400 mb-3">Personaliza cómo aparece tu artículo en los resultados de búsqueda.</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Meta Title
                                        <span title="Título que aparece en los resultados de Google. Si lo dejas vacío, se usará el título del artículo. Máx 60 caracteres."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                    </label>
                                    <input type="text" value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder={form.title} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Slug
                                        <span title="URL amigable del artículo. Déjalo vacío para generarlo automáticamente desde el título. Ej: beneficios-de-la-miel"><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                    </label>
                                    <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="mi-articulo" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Meta Description
                                    <span title="Descripción corta que aparece en los resultados de búsqueda. Si la dejas vacía, se usará el resumen del artículo. Máx 160 caracteres."><Info className="w-3.5 h-3.5 inline ml-1 text-gray-300" /></span>
                                </label>
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
                            <button onClick={() => saveWithStatus(form.status)} disabled={saving || !form.title.trim()}
                                className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition disabled:opacity-50">
                                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Borrador')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
