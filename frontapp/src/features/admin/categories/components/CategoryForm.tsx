'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import type { CategoryNode } from '../hooks/useCategories';

interface CategoryFormProps {
    category: CategoryNode | null;
    parentOptions: CategoryNode[];
    onSave: (id: number, data: { name?: string; description?: string; parent?: number; type?: string; sort_order?: number }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUploadImage: (id: number, file: File) => Promise<string | undefined>;
    loading: boolean;
}

export default function CategoryForm({
    category,
    parentOptions,
    onSave,
    onDelete,
    onUploadImage,
    loading,
}: CategoryFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number>(0);
    const [type, setType] = useState('product');
    const [sortOrder, setSortOrder] = useState(0);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (category) {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
            setName(category.name);
            setDescription(category.description || '');
            setParentId(category.parent || 0);
            setType(category.type || 'product');
            setSortOrder(category.sort_order || 0);
            setImagePreview(category.image?.src || null);
            setConfirmDelete(false);
        }
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [category]);

    if (!category) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm p-10">
                Selecciona una categoria del arbol para editarla
            </div>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(category.id, {
                name,
                description,
                parent: parentId || undefined,
                type,
                sort_order: sortOrder,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setDeleting(true);
        try {
            await onDelete(category.id);
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Preview local inmediato mientras sube
        setImagePreview(URL.createObjectURL(file));
        try {
            const serverUrl = await onUploadImage(category.id, file);
            // Reemplazar blob con URL real del servidor
            if (serverUrl) setImagePreview(serverUrl);
        } catch {
            // El toast de error ya lo maneja el hook
        }
    };

    const LEVEL_LABEL = category.level === 0 ? 'Nivel 1 - Categoria Global' : category.level === 1 ? 'Nivel 2 - Subcategoria' : 'Nivel 3 - Sub-subcategoria';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{category.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        category.level === 0
                            ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                            : category.level === 1
                            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                            : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                    }`}>
                        {LEVEL_LABEL}
                    </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">ID: {category.id}</span>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Nombre</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Descripcion</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition resize-none"
                />
            </div>

            {/* Parent + Type row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Padre</label>
                    <select
                        value={parentId}
                        onChange={(e) => setParentId(Number(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                    >
                        <option value={0}>Ninguno (Raiz)</option>
                        {parentOptions
                            .filter((p) => p.id !== category.id && p.type === type)
                            .map((p) => (
                                <option key={p.id} value={p.id}>
                                    {'─'.repeat(p.level)} {p.name}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Tipo</label>
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setParentId(0); }}
                        className="w-full px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                    >
                        <option value="product">Producto</option>
                        <option value="service">Servicio</option>
                    </select>
                </div>
            </div>

            {/* Sort order */}
            <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Orden</label>
                <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full sm:w-32 px-4 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] transition"
                />
            </div>

            {/* Image (relevant for level 2) */}
            <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">
                    Imagen {category.level === 1 && <span className="text-xs text-[var(--color-success)] font-normal">(visible en mega-menu)</span>}
                </label>
                <div className="flex items-center gap-4">
                    {imagePreview ? (
                        <div className="relative w-20 h-20 rounded-xl border-2 border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-muted)]">
                            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center bg-[var(--bg-muted)]">
                            <ImageIcon className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                    )}
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-muted)] hover:bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-secondary)] transition disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            Subir imagen
                        </button>
                        <p className="text-xs text-[var(--text-muted)] mt-1">WebP, PNG o JPG. Max 2MB.</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading || !name.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || loading}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                        confirmDelete
                            ? 'bg-[var(--color-error)] hover:bg-[var(--color-error)] text-white'
                            : 'bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/15 text-[var(--color-error)]'
                    }`}
                >
                    {confirmDelete ? (
                        <>
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Eliminando...' : 'Confirmar'}
                        </>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </>
                    )}
                </button>

                {confirmDelete && (
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex items-center gap-1 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
                    >
                        <X className="w-4 h-4" />
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}
