'use client';

import React from 'react';
import Modal from '@/features/seller/plans/shared/Modal';
import type { AdminTrainingForm } from '../types';
import { trainingApi } from '@/shared/lib/api/trainingRepository';

function extractThumbnailUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    return null;
}

interface Props {
    open: boolean;
    editing: boolean;
    form: AdminTrainingForm;
    saving: boolean;
    onClose: () => void;
    onUpdate: (patch: Partial<AdminTrainingForm>) => void;
    onSave: () => Promise<void>;
}

export default function TrainingEditorModal({ open, editing, form, saving, onClose, onUpdate, onSave }: Props) {
    const [error, setError] = React.useState<string | null>(null);
    const [thumbnailMode, setThumbnailMode] = React.useState<'url' | 'file'>('url');
    const [uploading, setUploading] = React.useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => {
        if (!editing && form.url && !form.thumbnail) {
            const auto = extractThumbnailUrl(form.url);
            if (auto) onUpdate({ thumbnail: auto });
        }
    }, [form.url]);

    React.useEffect(() => {
        setImgError(false);
    }, [form.thumbnail]);

    const handleSave = async () => {
        if (!form.title.trim()) { setError('El título es obligatorio'); return; }
        if (!form.url.trim()) { setError('La URL es obligatoria'); return; }
        setError(null);
        try {
            await onSave();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al guardar');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const result = await trainingApi.uploadThumbnail(file);
            onUpdate({ thumbnail: result.url });
        } catch {
            setError('No se pudo subir la imagen. Usa el modo URL o intenta con otro archivo.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <Modal open={open} onClose={onClose} className="w-full max-w-2xl">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-3">
                {editing ? 'Editar capacitación' : 'Nueva capacitación'}
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-2.5">
                <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Título *</label>
                    <input type="text" value={form.title} onChange={e => onUpdate({ title: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
                        placeholder="Ej: Atención al cliente en postventa" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Descripción</label>
                    <textarea value={form.description} onChange={e => onUpdate({ description: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)] resize-none"
                        rows={2} placeholder="Descripción de la capacitación" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">URL del video *</label>
                    <input type="url" value={form.url} onChange={e => onUpdate({ url: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
                        placeholder="https://youtube.com/watch?v=... o https://drive.google.com/..." />
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">YouTube, Google Drive, Vimeo — se auto-detecta la portada</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Plataforma</label>
                        <input type="text" value={form.platform} onChange={e => onUpdate({ platform: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
                            placeholder="youtube, drive, vimeo..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Categoría</label>
                        <input type="text" value={form.category} onChange={e => onUpdate({ category: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
                            placeholder="Ej: Atención al cliente, Postventa" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Thumbnail</label>
                        <div className="flex gap-1">
                            <button type="button" onClick={() => setThumbnailMode('url')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    thumbnailMode === 'url'
                                        ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white'
                                        : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}>URL</button>
                            <button type="button" onClick={() => setThumbnailMode('file')}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    thumbnailMode === 'file'
                                        ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white'
                                        : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}>Subir</button>
                        </div>
                    </div>
                    {thumbnailMode === 'url' ? (
                        <input type="url" value={form.thumbnail} onChange={e => onUpdate({ thumbnail: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
                            placeholder="URL de la imagen de portada" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect}
                                className="flex-1 text-sm text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border-subtle)] file:bg-[var(--bg-card)] file:text-xs file:font-bold file:text-[var(--text-primary)] file:cursor-pointer hover:file:border-[var(--brand-sky)] dark:hover:file:border-[var(--brand-teal)] transition-all" />
                            {uploading && (
                                <span className="inline-block w-4 h-4 border-2 border-[var(--brand-sky)] dark:border-[var(--brand-teal)] border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                    )}
                    {form.thumbnail && !imgError && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-muted)]">
                            <img ref={imgRef} src={form.thumbnail} alt="Preview"
                                className="w-full h-28 object-cover"
                                onError={() => setImgError(true)} />
                        </div>
                    )}
                    {form.thumbnail && imgError && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-subtle)]">
                            <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                            </svg>
                            <span className="text-xs text-[var(--text-secondary)]">No se pudo cargar la vista previa. La URL podría no ser accesible.</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Orden</label>
                        <input type="number" min={0} value={form.sort_order} onChange={e => onUpdate({ sort_order: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border-2 border-[var(--border-subtle)] rounded-lg text-sm transition-all focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] bg-[var(--bg-muted)] text-[var(--text-primary)]" />
                    </div>
                    <div className="flex items-end pb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_required} onChange={e => onUpdate({ is_required: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--brand-sky)] dark:accent-[var(--brand-teal)]" />
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Obligatorio</span>
                        </label>
                    </div>
                    <div className="flex items-end pb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_published} onChange={e => onUpdate({ is_published: e.target.checked })}
                                className="w-4 h-4 rounded border-[var(--border-subtle)] accent-[var(--brand-sky)] dark:accent-[var(--brand-teal)]" />
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Publicado</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-[var(--border-subtle)]">
                <button onClick={onClose}
                    className="flex-1 px-5 py-2.5 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-bold cursor-pointer hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all">
                    Cancelar
                </button>
                <button onClick={handleSave} disabled={saving || uploading}
                    className="flex-1 px-5 py-2.5 border-none bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear capacitación'}
                </button>
            </div>
        </Modal>
    );
}
