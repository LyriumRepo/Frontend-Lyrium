'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import HeroPill from '@/components/layout/public/HeroPill';
import { forumApi, ForumCategory } from '@/shared/lib/api/forum';

export default function CrearTemaPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setError(err instanceof Error ? err.message : 'Error al crear el tema');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <HeroPill icon="CheckCircle" text="Tema Creado" />
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-8 text-center border border-slate-200 dark:border-[var(--border-subtle)] mt-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Icon name="CheckCircle" className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2">¡Tema creado exitosamente!</h2>
          <p className="text-slate-600 dark:text-[var(--text-muted)] mb-4">Redirigiendo al BioForo...</p>
          <Link href="/bioforo" className="text-emerald-500 hover:underline">
            Ir al BioForo ahora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
      <Link
        href="/bioforo"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-[var(--text-muted)] hover:text-emerald-500 mb-4"
      >
        <Icon name="ArrowLeft" className="w-4 h-4" />
        Volver al BioForo
      </Link>

      <HeroPill icon="Pencil" text="Crear Nuevo Tema" />

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-[var(--border-subtle)] mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
              <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-white dark:bg-[var(--bg-card)]">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Escribe un título para tu tema"
              maxLength={180}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all"
              required
            />
            <p className="text-xs text-slate-500 dark:text-[var(--text-muted)] mt-1 text-right">
              {formData.titulo.length}/180 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="contenido" className="block text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] mb-2">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contenido"
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              placeholder="Escribe el contenido de tu tema..."
              rows={8}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-gray-600 bg-white dark:bg-[var(--bg-card)] text-slate-800 dark:text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[var(--text-muted)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition-all resize-none"
              required
            />
            <p className="text-xs text-slate-500 dark:text-[var(--text-muted)] mt-1 text-right">
              {formData.contenido.length}/2000 caracteres
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[var(--bg-muted)] rounded-xl p-4 text-sm text-slate-600 dark:text-[var(--text-muted)]">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="w-5 h-5 text-slate-500 dark:text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
              <p>Al crear un tema, aceptas nuestras normas de comunidad. El contenido inapropiado será eliminado.</p>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              href="/bioforo"
              className="px-6 py-3 rounded-full border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-[var(--text-primary)] font-medium hover:bg-slate-50 dark:hover:bg-[#182420] transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Icon name="PaperPlaneRight" className="w-5 h-5" />
                  Publicar Tema
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
