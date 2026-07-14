'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5 animate-fadeIn">
                <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Icon name="XCircle" className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-base font-bold text-[var(--text-primary)] mb-1">Error al cargar capacitaciones</p>
                    <p className="text-sm text-[var(--text-secondary)]">{error}</p>
                </div>
                <BaseButton variant="primary" size="md" leftIcon="RefreshCw" onClick={() => window.location.reload()}>
                    Reintentar
                </BaseButton>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <ModuleHeader
                title="Capacitaciones"
                subtitle="Gestiona los videos de capacitación para vendedores (disponible desde Plan Crece)"
                icon="Video"
            />
            <div className="px-1">
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <BaseButton variant="secondary" size="md" leftIcon="BarChart" onClick={() => setComplianceOpen(true)} fullWidth>
                        Progreso
                    </BaseButton>
                    <BaseButton variant="primary" size="md" leftIcon="Plus" onClick={openCreate} fullWidth>
                        Nueva capacitación
                    </BaseButton>
                </div>
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
