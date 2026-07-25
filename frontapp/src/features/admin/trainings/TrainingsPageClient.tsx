'use client';

import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { useAdminTrainings } from '@/features/admin/trainings/hooks/useAdminTrainings';
import TrainingsList from '@/features/admin/trainings/components/TrainingsList';
import TrainingEditorModal from '@/features/admin/trainings/components/TrainingEditorModal';
import TrainingComplianceModal from '@/features/admin/trainings/components/TrainingComplianceModal';

const PAGE_SIZE = 10;

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

    const [page, setPage] = useState(1);
    useEffect(() => { setPage(1); }, [trainings.length]);

    const totalPages = Math.ceil(trainings.length / PAGE_SIZE);
    const pageTrainings = trainings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <ModuleHeader
                title="Capacitaciones"
                subtitle="Gestiona los videos de capacitación para vendedores (disponible desde Plan Crece)"
                icon="Video"
            />
            <div className="px-1">
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <BaseButton variant="secondary" size="sm" leftIcon="BarChart" onClick={() => setComplianceOpen(true)} className="w-full sm:w-auto">
                        Progreso
                    </BaseButton>
                    <BaseButton variant="primary" size="sm" leftIcon="Plus" onClick={openCreate} className="w-full sm:w-auto">
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
                trainings={pageTrainings}
                loading={loading}
                deletingId={deletingId}
                onEdit={openEdit}
                onDelete={remove}
            />

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
