'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { forumApi, ForumCategory } from '@/shared/lib/api/forum';

export default function CrearTemaPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [moderation, setModeration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await forumApi.getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const isModerationError = (err: unknown): string | null => {
    const msg = err instanceof Error ? err.message : '';
    if (/inapropiad|inadecuad|ofensiv|moderación|lenguaje|contenido inapropiado/i.test(msg)) return msg;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!formData.contenido.trim()) {
      setError('El contenido es requerido');
      return;
    }
    if (!formData.categoria) {
      setError('Selecciona una categoría');
      return;
    }
    if (formData.titulo.length > 180) {
      setError('El título no puede exceder 180 caracteres');
      return;
    }
    if (formData.contenido.length > 2000) {
      setError('El contenido no puede exceder 2000 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const result = await forumApi.createTopic({
        forumid: parseInt(formData.categoria),
        title: formData.titulo,
        content: formData.contenido,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/bioforo');
        }, 2000);
      }
    } catch (err: unknown) {
      const modMsg = isModerationError(err);
      if (modMsg) {
        setModeration({ show: true, message: modMsg });
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear el tema');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ModerationModal = () => (
    <AnimatePresence>
      {moderation.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setModeration({ show: false, message: '' })}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl border border-slate-100 dark:border-[var(--border-subtle)] w-full max-w-md mx-auto overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative px-6 pt-8 pb-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">
                Contenido no apto
              </h3>
              <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] leading-relaxed">
                {moderation.message}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setModeration({ show: false, message: '' })}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition shadow-lg shadow-sky-200/50"
                >
                  Entendido, editaré
                </button>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-teal-400" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl p-10 text-center border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">¡Tema creado exitosamente!</h2>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mb-6">Redirigiendo al BioForo...</p>
          <Link href="/bioforo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-lg shadow-sky-200/50">
            Ir al BioForo ahora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/30 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <Link
          href="/bioforo"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-[var(--text-muted)] hover:text-sky-600 dark:hover:text-sky-400 transition-colors group mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver al BioForo
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm overflow-hidden"
        >
          <div className="px-6 pt-6 pb-8 md:px-8 md:pt-8 md:pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-sky-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600 dark:text-sky-400"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)]">Crear Nuevo Tema</h1>
                <p className="text-sm text-slate-400 dark:text-[var(--text-muted)]">Comparte tus ideas con la comunidad</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/30 text-teal-700 dark:text-teal-400 text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1.5">
                  Categoría <span className="text-sky-500">*</span>
                </label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 outline-none transition-all"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1.5">
                  Título <span className="text-sky-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Escribe un título para tu tema"
                  maxLength={180}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-400 dark:text-[var(--text-muted)] mt-1 text-right">
                  {formData.titulo.length}/180 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="contenido" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-1.5">
                  Contenido <span className="text-sky-500">*</span>
                </label>
                <textarea
                  id="contenido"
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Escribe el contenido de tu tema..."
                  rows={8}
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 outline-none transition-all resize-none"
                  required
                />
                <p className="text-xs text-slate-400 dark:text-[var(--text-muted)] mt-1 text-right">
                  {formData.contenido.length}/2000 caracteres
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[var(--bg-muted)] rounded-xl p-4 text-sm text-slate-500 dark:text-[var(--text-muted)] flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p>Al crear un tema, aceptas nuestras normas de comunidad. El contenido inapropiado será eliminado.</p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Link
                  href="/bioforo"
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-[var(--text-primary)] font-medium hover:bg-slate-50 dark:hover:bg-[#182420] transition-colors text-sm"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-sky-200/50 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {submitting ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> Creando...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Publicar Tema</>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="h-1.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400" />
        </motion.div>
      </div>

      <ModerationModal />
    </div>
  );
}
