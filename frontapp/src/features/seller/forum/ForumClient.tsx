'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessagesSquare, Plus, Eye, MessageCircle, ThumbsUp, Pencil, Image as ImageIcon, X, Calendar, User, Hash, ChevronLeft, Heart } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { forumApi, ForumTopic } from '@/shared/lib/api/bioblogRepository';

const GRADIENTS = [
  'from-emerald-500 via-teal-500 to-sky-500',
  'from-sky-500 via-blue-500 to-indigo-500',
  'from-teal-400 via-emerald-400 to-green-400',
  'from-sky-400 via-cyan-400 to-teal-400',
];

function topicGradient(id: number): string {
  return GRADIENTS[id % GRADIENTS.length];
}

export function ForumClient() {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [form, setForm] = useState({ forum_category_id: '1' as any, title: '', content: '', status: 'published', image: '' });
  const [saving, setSaving] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ForumTopic | null>(null);
  const [editForm, setEditForm] = useState({ forum_category_id: '1' as any, title: '', content: '', status: 'published', image: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [viewingTopic, setViewingTopic] = useState<ForumTopic | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const res = await forumApi.topics.list({ per_page: 50 }); setTopics(res.data); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await forumApi.topics.create({
        forum_category_id: Number(form.forum_category_id),
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
        image: form.image.trim() || null,
      });
      if (res.success === false) { setErrorMsg('Error al crear el tema'); return; }
      setShowCreator(false);
      setForm({ forum_category_id: '1', title: '', content: '', status: 'published', image: '' });
      fetch();
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al crear el tema');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este tema?')) return;
    try { await forumApi.topics.delete(id); fetch(); } catch {}
  };

  const openEdit = (topic: ForumTopic) => {
    setEditingTopic(topic);
    setErrorMsg('');
    setEditForm({
      forum_category_id: String(topic.forum_category_id),
      title: topic.title,
      content: topic.content,
      status: topic.status,
      image: topic.image || '',
    });
  };

  const handleEdit = async () => {
    if (!editingTopic || !editForm.title.trim() || !editForm.content.trim()) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await forumApi.topics.update(editingTopic.id, {
        forum_category_id: Number(editForm.forum_category_id),
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        status: editForm.status,
        image: editForm.image.trim() || null,
      });
      if (res.success === false) { setErrorMsg('Error al guardar los cambios'); return; }
      setEditingTopic(null);
      fetch();
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al guardar los cambios');
    } finally { setSaving(false); }
  };

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = { draft: 'bg-gray-100 text-gray-500', published: 'bg-emerald-100 text-emerald-600', closed: 'bg-red-100 text-red-500' };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[s] || styles.draft}`}>{s}</span>;
  };

  function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label || 'Imagen (URL)'}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {value && (
            <button type="button" onClick={() => onChange('')} className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {value && (
          <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-[var(--bg-primary)]">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn font-industrial pb-20">
      <ModuleHeader title="BioForo" subtitle="Foro de discusión con tu comunidad" icon="MessagesSquare"
        actions={<BaseButton onClick={() => setShowCreator(true)} variant="primary" leftIcon="Plus" size="md">Crear Tema</BaseButton>} />

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div>
        : topics.length === 0 ? <div className="p-20 text-center text-gray-400">Aún no hay temas de discusión</div>
        : <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-4">Imagen</th>
                <th className="px-5 py-4">Título</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Respuestas</th>
                <th className="px-5 py-4">Vistas</th>
                <th className="px-5 py-4">Reacciones</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4 w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                  <td className="px-5 py-4">
                    {t.image ? (
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-[var(--bg-primary)]">
                        <img src={t.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{t.title}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{t.category?.name || '—'}</td>
                  <td className="px-5 py-4">{statusBadge(t.status)}</td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-gray-500"><MessageCircle className="w-3.5 h-3.5" />{t.reply_count}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-gray-500"><Eye className="w-3.5 h-3.5" />{t.views}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-gray-500"><ThumbsUp className="w-3.5 h-3.5" />{(t as any).total_reactions ?? 0}</div></td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('es-PE')}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setViewingTopic(t)} className="text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition font-semibold">Ver</button>
                      <button onClick={() => openEdit(t)} className="text-xs px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition font-semibold">Editar</button>
                      <button onClick={() => handleDelete(t.id)} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-semibold">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </div>

      {/* View Topic Modal */}
      {viewingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewingTopic(null)}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Hero */}
            <div className="relative h-48 md:h-56 rounded-t-3xl overflow-hidden">
              {viewingTopic.image ? (
                <>
                  <img src={viewingTopic.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
                </>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient(viewingTopic.id)}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <button
                onClick={() => setViewingTopic(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center text-white transition group z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {viewingTopic.category?.name || 'General'}
                  </span>
                  {statusBadge(viewingTopic.status)}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-lg pr-8">
                  {viewingTopic.title}
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6 space-y-5">
              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-[var(--text-muted)]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-900/30 dark:to-sky-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {(viewingTopic.user?.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-[var(--text-primary)] text-sm">
                      {viewingTopic.user?.name || 'Anónimo'}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(viewingTopic.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5" />
                  {(viewingTopic as any).total_reactions ?? 0} reacciones
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {viewingTopic.reply_count} respuestas
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-500 dark:text-[var(--text-muted)] text-xs font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  {viewingTopic.views} vistas
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[var(--bg-card)] text-slate-400 dark:text-[var(--text-muted)] text-xs font-semibold">
                  <Hash className="w-3.5 h-3.5" />
                  ID {viewingTopic.id}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-[var(--border-subtle)]" />

              {/* Content */}
              <div className="text-slate-700 dark:text-[var(--text-secondary)] leading-relaxed text-[15px] whitespace-pre-wrap">
                {viewingTopic.content}
              </div>
            </div>

            {/* Footer gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 rounded-b-3xl" />
          </div>
        </div>
      )}

      {showCreator && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-10 pb-10 overflow-y-auto" onClick={() => setShowCreator(false)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Crear Tema</h3>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Ej: Beneficios de la alimentación consciente" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                <select value={form.forum_category_id} onChange={e => setForm(f => ({ ...f, forum_category_id: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                  <option value="1">General</option>
                  <option value="2">Nutricion</option>
                  <option value="3">Microbiota</option>
                  <option value="4">Fitness</option>
                  <option value="5">Salud Mental</option>
                </select>
              </div>

              <ImageInput value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} label="Imagen (URL)" />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Contenido</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Escribe el contenido del tema aquí..." />
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[var(--bg-secondary)] rounded-b-3xl">
              <button type="button" onClick={() => { setShowCreator(false); setErrorMsg(''); }} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
              <button type="button" onClick={handleCreate} disabled={saving || !form.title.trim() || !form.content.trim()} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-lg shadow-emerald-200/50">{saving ? 'Creando...' : 'Publicar Tema'}</button>
            </div>
          </div>
        </div>
      )}

      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-10 pb-10 overflow-y-auto" onClick={() => setEditingTopic(null)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg mx-4 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Editar Tema</h3>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Ej: Beneficios de la alimentación consciente" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
                <select value={editForm.forum_category_id} onChange={e => setEditForm(f => ({ ...f, forum_category_id: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                  <option value="1">General</option>
                  <option value="2">Nutricion</option>
                  <option value="3">Microbiota</option>
                  <option value="4">Fitness</option>
                  <option value="5">Salud Mental</option>
                </select>
              </div>

              <ImageInput value={editForm.image} onChange={v => setEditForm(f => ({ ...f, image: v }))} label="Imagen (URL)" />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Contenido</label>
                <textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200" placeholder="Escribe el contenido del tema aquí..." />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[var(--bg-secondary)] rounded-b-3xl">
              <button type="button" onClick={() => { setEditingTopic(null); setErrorMsg(''); }} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition">Cancelar</button>
              <button type="button" onClick={handleEdit} disabled={saving || !editForm.title.trim() || !editForm.content.trim()} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-lg shadow-emerald-200/50">{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
