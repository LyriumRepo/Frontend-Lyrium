'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '@/shared/lib/api/trainingRepository';
import type { AdminTraining, AdminTrainingForm } from '../types';

const EMPTY_FORM: AdminTrainingForm = {
    title: '',
    description: '',
    url: '',
    platform: '',
    thumbnail: '',
    category: '',
    sort_order: 0,
    is_required: false,
    is_published: true,
};

export function useAdminTrainings() {
    const [trainings, setTrainings] = useState<AdminTraining[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<AdminTraining | null>(null);
    const [form, setForm] = useState<AdminTrainingForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await trainingApi.getAdminTrainings({ per_page: 100 });
            setTrainings(res.data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error al cargar capacitaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setEditorOpen(true);
    };

    const openEdit = (training: AdminTraining) => {
        setEditing(training);
        setForm({
            title: training.title,
            description: training.description ?? '',
            url: training.url,
            platform: training.platform ?? '',
            thumbnail: training.thumbnail ?? '',
            category: training.category ?? '',
            sort_order: training.sort_order,
            is_required: training.is_required,
            is_published: training.is_published,
        });
        setEditorOpen(true);
    };

    const closeEditor = () => {
        setEditorOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM);
    };

    const updateForm = (patch: Partial<AdminTrainingForm>) => {
        setForm(f => ({ ...f, ...patch }));
    };

    const save = async () => {
        setSaving(true);
        try {
            if (editing) {
                await trainingApi.updateTraining(editing.id, form);
            } else {
                await trainingApi.createTraining(form);
            }
            closeEditor();
            await load();
        } catch (e) {
            throw e;
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id: number) => {
        setDeletingId(id);
        try {
            await trainingApi.deleteTraining(id);
            await load();
        } finally {
            setDeletingId(null);
        }
    };

    return {
        trainings,
        loading,
        error,
        editorOpen,
        editing,
        form,
        saving,
        deletingId,
        openCreate,
        openEdit,
        closeEditor,
        updateForm,
        save,
        remove,
        reload: load,
    };
}
