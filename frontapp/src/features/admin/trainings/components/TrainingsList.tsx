'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import type { AdminTraining } from '../types';

interface Props {
    trainings: AdminTraining[];
    loading: boolean;
    deletingId: number | null;
    onEdit: (t: AdminTraining) => void;
    onDelete: (id: number) => void;
}

function getPlatformBadgeStyle(platform: string): string {
    switch (platform) {
        case 'youtube': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'vimeo': return 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] border-[var(--brand-sky)]/20';
        case 'drive': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        default: return 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }
}

const TrainingThumbnail = ({ t }: { t: AdminTraining }) => (
    <div className="w-full sm:w-10 h-32 sm:h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 overflow-hidden">
        {t.thumbnail && (
            <img src={t.thumbnail} alt="" className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <Icon name="Video" className="w-5 h-5 text-[var(--text-muted)]" />
    </div>
);

const CapacitacionCell = ({ t }: { t: AdminTraining }) => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0">
            <TrainingThumbnail t={t} />
        </div>
        <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[var(--text-primary)] truncate">{t.title}</span>
                {t.is_required && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20">
                        Requerido
                    </span>
                )}
                {!t.is_published && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        Borrador
                    </span>
                )}
            </div>
        </div>
    </div>
);

const CategoriaCell = ({ t }: { t: AdminTraining }) => (
    <div className="flex items-center gap-2">
        {t.category && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                <Icon name="FolderOpen" className="w-2.5 h-2.5" /> {t.category}
            </span>
        )}
        {t.category && t.platform && <span className="text-[10px] text-[var(--text-muted)]">·</span>}
        {t.platform && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${getPlatformBadgeStyle(t.platform)}`}>
                {t.platform}
            </span>
        )}
    </div>
);

const AccionesCell = ({ t, deletingId, onEdit, onDelete }: { t: AdminTraining; deletingId: number | null; onEdit: (t: AdminTraining) => void; onDelete: (id: number) => void }) => (
    <div className="flex items-center gap-1 justify-end">
        <BaseButton variant="ghost" size="sm" leftIcon="Pencil" onClick={() => onEdit(t)}>
            <span className="hidden sm:inline">Editar</span>
        </BaseButton>
        <BaseButton variant="ghost" size="sm" leftIcon="Trash2" onClick={() => onDelete(t.id)} isLoading={deletingId === t.id} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <span className="hidden sm:inline">Eliminar</span>
        </BaseButton>
    </div>
);

const TrainingMobileCard = ({ t, deletingId, onEdit, onDelete }: { t: AdminTraining; deletingId: number | null; onEdit: (t: AdminTraining) => void; onDelete: (id: number) => void }) => (
    <div className="flex flex-col gap-3 p-4">
        <TrainingThumbnail t={t} />
        <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[var(--text-primary)] truncate">{t.title}</span>
                {t.is_required && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20">
                        Requerido
                    </span>
                )}
                {!t.is_published && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        Borrador
                    </span>
                )}
            </div>
            <div className="mt-1">
                <CategoriaCell t={t} />
            </div>
        </div>
        <div className="flex items-center gap-1">
            <BaseButton variant="ghost" size="sm" leftIcon="Pencil" onClick={() => onEdit(t)}>
                Editar
            </BaseButton>
            <BaseButton variant="ghost" size="sm" leftIcon="Trash2" onClick={() => onDelete(t.id)} isLoading={deletingId === t.id} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                Eliminar
            </BaseButton>
        </div>
    </div>
);

export default function TrainingsList({ trainings, loading, deletingId, onEdit, onDelete }: Props) {
    const columns: Column<AdminTraining>[] = [
        { key: 'capacitacion', header: 'Capacitación', render: (t) => <CapacitacionCell t={t} /> },
        { key: 'categoria', header: 'Categoría / Plataforma', hideMobile: true, render: (t) => <CategoriaCell t={t} /> },
        {
            key: 'acciones',
            header: 'Acciones',
            align: 'right',
            render: (t) => <AccionesCell t={t} deletingId={deletingId} onEdit={onEdit} onDelete={onDelete} />,
        },
    ];

    return (
        <AdminTable
            data={trainings}
            columns={columns}
            loading={loading}
            emptyIcon="Video"
            emptyTitle="No hay capacitaciones aún"
            emptyDescription="Crea la primera capacitación para tus vendedores"
            mobileCardRender={(t) => (
                <TrainingMobileCard t={t} deletingId={deletingId} onEdit={onEdit} onDelete={onDelete} />
            )}
        />
    );
}
