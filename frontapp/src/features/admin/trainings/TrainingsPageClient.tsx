'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import { useAdminTrainings } from '@/features/admin/trainings/hooks/useAdminTrainings';
import TrainingsList from '@/features/admin/trainings/components/TrainingsList';
import TrainingEditorModal from '@/features/admin/trainings/components/TrainingEditorModal';
import TrainingComplianceModal from '@/features/admin/trainings/components/TrainingComplianceModal';

export function TrainingsPageClient() {
    const [complianceOpen, setComplianceOpen] = useState(false);
    const {
        trainings, loading, error,
        editorOpen, editing, form, saving,
        openCreate, openEdit, closeEditor, updateForm, save, remove, deletingId,
    } = useAdminTrainings();

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)]">Error al cargar capacitaciones</p>
                <p className="text-sm text-[var(--text-secondary)]">{error}</p>
                <button onClick={() => window.location.reload()}
                    className="px-6 py-3 rounded-xl text-white font-bold text-sm bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] hover:opacity-90 transition-all">
                    Reintentar
                </button>
            </div>
        );
    }

    const actionBtns = (
        <div className="flex flex-wrap gap-2">
            <button onClick={() => setComplianceOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-bold hover:border-[var(--brand-sky)] dark:hover:border-[var(--brand-teal)] hover:text-[var(--brand-sky)] dark:hover:text-[var(--brand-teal)] transition-all cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Progreso
            </button>
            <button onClick={openCreate}
                className="px-4 py-2 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white text-sm font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nueva capacitación
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <ModuleHeader
                title="Capacitaciones"
                subtitle="Gestiona los videos de capacitación para vendedores (disponible desde Plan Crece)"
                icon="Video"
            />
            <div className="px-1">
                {actionBtns}
            </div>

            {complianceOpen && (
                <TrainingComplianceModal
                    open={complianceOpen}
                    onClose={() => setComplianceOpen(false)}
                />
            )}

            <TrainingsList
                trainings={trainings}
                loading={loading}
                deletingId={deletingId}
                onEdit={openEdit}
                onDelete={remove}
            />

            <TrainingEditorModal
                open={editorOpen}
                editing={!!editing}
                form={form}
                saving={saving}
                onClose={closeEditor}
                onUpdate={updateForm}
                onSave={save}
            />
        </div>
    );
}
