'use client';

import React, { useState, useCallback } from 'react';
import { Plus, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useCategories } from '@/features/admin/categories/hooks/useCategories';
import CategoryTree from './components/CategoryTree';
import CategoryForm from './components/CategoryForm';

export function CategoriesPageClient() {
    const {
        categoryTree,
        flatCategories,
        loading,
        error,
        selectedCategory,
        selectedCategoryId,
        setSelectedCategoryId,
        parentOptions,
        refresh,
        addCategory,
        editCategory,
        removeCategory,
        uploadImage,
    } = useCategories();

    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newParent, setNewParent] = useState<number>(0);
    const [newType, setNewType] = useState('product');
    const [creating, setCreating] = useState(false);

    const handleCreate = useCallback(async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await addCategory({
                name: newName.trim(),
                parent: newParent || undefined,
                type: newType,
            });
            setNewName('');
            setNewParent(0);
            setShowNewForm(false);
        } finally {
            setCreating(false);
        }
    }, [newName, newParent, newType, addCategory]);

    const handleSave = useCallback(
        async (id: number, data: Parameters<typeof editCategory>[1]) => {
            await editCategory(id, data);
        },
        [editCategory]
    );

    const handleDelete = useCallback(
        async (id: number) => {
            await removeCategory(id);
        },
        [removeCategory]
    );

    const handleUploadImage = useCallback(
        async (id: number, file: File): Promise<string | undefined> => {
            await uploadImage(id, file);
            return undefined;
        },
        [uploadImage]
    );

    // Stats
    const level1Count = categoryTree.length;
    const level2Count = categoryTree.reduce((sum, c) => sum + c.children.length, 0);
    const level3Count = categoryTree.reduce(
        (sum, c) => sum + c.children.reduce((s2, c2) => s2 + c2.children.length, 0),
        0
    );
    const totalCount = level1Count + level2Count + level3Count;

    return (
        <div className="space-y-6 animate-fadeIn font-industrial pb-20">
            <ModuleHeader
                title="Gestion de Categorias"
                subtitle="Estructura y taxonomia del marketplace (3 niveles)"
                icon="Layers"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: totalCount, color: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]' },
                    { label: 'Nivel 1', value: level1Count, color: 'bg-[var(--color-info)]/10 text-[var(--color-info)]' },
                    { label: 'Nivel 2', value: level2Count, color: 'bg-[var(--color-success)]/10 text-[var(--color-success)]' },
                    { label: 'Nivel 3', value: level3Count, color: 'bg-[var(--icons-green)]/10 text-[var(--icons-green)]' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-2xl text-[var(--color-error)] text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Card unificada: filtros + nueva categoría + acciones */}
            <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black text-[var(--text-primary)]">
                            Nueva Categoría
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowNewForm(!showNewForm)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{showNewForm ? 'Cancelar' : 'Mostrar formulario'}</span>
                    </button>
                </div>

                {/* Formulario colapsable */}
                {showNewForm && (
                    <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nombre de la categoría"
                                    className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-2xl text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--icons-green)]/20 focus:border-[var(--border-focus)] transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Padre</label>
                                <select
                                    value={newParent}
                                    onChange={(e) => setNewParent(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-2xl text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--icons-green)]/20 focus:border-[var(--border-focus)] transition"
                                >
                                    <option value={0}>Ninguno (Raíz - N1)</option>
                                    {parentOptions.filter((p) => p.type === newType).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {'─'.repeat(p.level)} {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo</label>
                                <select
                                    value={newType}
                                    onChange={(e) => { setNewType(e.target.value); setNewParent(0); }}
                                    className="w-full px-4 py-3 border border-[var(--border-subtle)] rounded-2xl text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--icons-green)]/20 focus:border-[var(--border-focus)] transition"
                                >
                                    <option value="product">Producto</option>
                                    <option value="service">Servicio</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={creating || !newName.trim()}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            <Plus className="w-4 h-4" />
                            {creating ? 'Creando...' : 'Crear Categoría'}
                        </button>
                    </div>
                )}

                {/* Acciones: Refrescar */}
                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => refresh()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refrescar categorías
                    </button>
                </div>
            </div>

            {/* Main content: Tree + Form */}
            {loading && categoryTree.length === 0 ? (
                <div className="p-20 text-center text-[var(--text-muted)]">Cargando categorias...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    {/* Tree */}
                    <div className="lg:col-span-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[var(--icons-green)]" />
                                <span className="text-sm font-bold text-[var(--text-secondary)]">Arbol de Categorias</span>
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">{totalCount} categorias</span>
                        </div>
                        <div className="p-3 max-h-[40vh] sm:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto">
                            <CategoryTree
                                tree={categoryTree}
                                selectedId={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-7 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] shadow-sm p-6">
                        <CategoryForm
                            category={selectedCategory}
                            parentOptions={parentOptions}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            onUploadImage={handleUploadImage}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
