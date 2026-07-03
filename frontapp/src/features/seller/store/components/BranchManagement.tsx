'use client';

import React, { useState } from 'react';
import { Branch } from '@/features/seller/store/types';
import BranchCard from './BranchCard';
import BranchModal from './BranchModal';
import { Plus, Store } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from './PlanUpgradeMessage';

interface BranchManagementProps {
    branches: Branch[];
    setBranches: (branches: Branch[]) => void;
}

export default function BranchManagement({ branches, setBranches }: BranchManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const { planSlug, limit } = usePlanCapabilities();
    const maxBranches = limit('max_branches');
    const atLimit = planSlug === 'emprende' && branches.length >= maxBranches;

    const handleOpenModal = (branch?: Branch) => {
        setEditingBranch(branch || null);
        setIsModalOpen(true);
    };

    const handleSave = (branchData: unknown) => {
        const data = branchData as Branch;
        if (editingBranch) {
            setBranches(branches.map(b =>
                b.id === editingBranch.id
                    ? { ...data, id: b.id }
                    : data.isPrincipal
                        ? { ...b, isPrincipal: false }
                        : b
            ));
        } else {
            const newBranch = { ...data, id: Math.random().toString(36).substr(2, 9) };
            setBranches([
                ...branches.map(b => data.isPrincipal ? { ...b, isPrincipal: false } : b),
                newBranch,
            ]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm(
            'Eliminar sucursal',
            '¿Estás seguro de eliminar esta sucursal estratégica?'
        );
        if (confirmed) {
            setBranches(branches.filter(b => b.id !== id));
        }
    };

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-4 sm:mb-6 md:mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex flex-wrap items-center justify-between gap-y-3 relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Sucursales</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-90">
                            Gestión de tus locales físicos y puntos de venta
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => !atLimit && handleOpenModal()}
                    disabled={atLimit}
                    className={`relative z-10 flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-md font-black text-xs border uppercase tracking-widest transition-all shadow-lg shadow-black/5 ${
                        atLimit
                            ? 'bg-[var(--lima-500)]/10 border-[var(--lima-500)]/20 text-[var(--lima-500)] cursor-not-allowed'
                            : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--bg-card)] hover:text-sky-500 dark:hover:text-[var(--icons-green)]'
                    }`}
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden xs:inline sm:inline">{atLimit ? 'Límite Alcanzado' : 'Agregar Sucursal'}</span>
                    <span className="xs:hidden sm:hidden">{atLimit ? 'Límite' : 'Agregar'}</span>
                </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {branches.map(branch => (
                        <BranchCard
                            key={branch.id}
                            branch={branch}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    ))}
                    {branches.length === 0 && (
                        <div className="col-span-full py-10 sm:py-12 text-center bg-[var(--bg-secondary)] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-[var(--border-subtle)]">
                            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">No hay sucursales registradas</p>
                        </div>
                    )}
                </div>
            </div>

            <BranchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                branch={editingBranch}
            />

            {atLimit && (
                <div className="px-8 pb-6">
                    <PlanUpgradeMessage
                        message="Has alcanzado el límite máximo de sucursales permitido por tu plan Emprende. Actualiza al plan Crece para administrar más sucursales."
                    />
                </div>
            )}

            <ConfirmDialog />
        </div>
    );
}
