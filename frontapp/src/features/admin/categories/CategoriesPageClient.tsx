'use client';

import React, { useState, useCallback } from 'react';
import { Plus, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
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
        async (id: number, file: File) => {
            await uploadImage(id, file);
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
                actions={
                    <div className="flex gap-2">
                        <BaseButton onClick={() => refresh()} variant="outline" leftIcon="RefreshCw" size="md">
                            Refrescar
                        </BaseButton>
                        <BaseButton onClick={() => setShowNewForm(!showNewForm)} variant="primary" leftIcon="Plus" size="md">
                            Nueva Categoria
                        </BaseButton>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: totalCount, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
                    { label: 'Nivel 1', value: level1Count, color: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' },
                    { label: 'Nivel 2', value: level2Count, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
                    { label: 'Nivel 3', value: level3Count, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-4 text-center`}>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* New category form */}
            {showNewForm && (
                <div className="bg-white dark:bg-[var(--bg-secondary)] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">Nueva Categoria</h3>
                    <div className="grid grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nombre de la categoria"
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Padre</label>
                            <select
                                value={newParent}
                                onChange={(e) => setNewParent(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                            >
                                <option value={0}>Ninguno (Raiz - N1)</option>
                                {parentOptions.filter((p) => p.type === newType).map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {'─'.repeat(p.level)} {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
                            <select
                                value={newType}
                                onChange={(e) => { setNewType(e.target.value); setNewParent(0); }}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-primary)] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-sky-500 transition"
                            >
                                <option value="product">Producto</option>
                                <option value="service">Servicio</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating || !newName.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                {creating ? 'Creando...' : 'Crear'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowNewForm(false); setNewName(''); }}
                                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content: Tree + Form */}
            {loading && categoryTree.length === 0 ? (
                <div className="p-20 text-center text-gray-400">Cargando categorias...</div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Tree */}
                    <div className="col-span-5 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-sky-500" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Arbol de Categorias</span>
                            </div>
                            <span className="text-xs text-gray-400">{totalCount} categorias</span>
                        </div>
                        <div className="p-3 max-h-[calc(100vh-380px)] overflow-y-auto">
                            <CategoryTree
                                tree={categoryTree}
                                selectedId={selectedCategoryId}
                                onSelect={setSelectedCategoryId}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <div className="col-span-7 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
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
