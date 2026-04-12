'use client';

import React, { useState } from 'react';
import { Branch } from '@/features/seller/store/types';
import BranchCard from './BranchCard';
import BranchModal from './BranchModal';
import { Plus, Store } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface BranchManagementProps {
    branches: Branch[];
    setBranches: (branches: Branch[]) => void;
}

export default function BranchManagement({ branches, setBranches }: BranchManagementProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const handleOpenModal = (branch?: Branch) => {
        setEditingBranch(branch || null);
        setIsModalOpen(true);
    };

    const handleSave = (branchData: unknown) => {
        const data = branchData as Branch;
        if (editingBranch) {
            setBranches(branches.map(b => b.id === editingBranch.id ? { ...data, id: b.id } : b));
        } else {
            setBranches([...branches, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
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
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-8">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Sucursales</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-90">
                            Gestión de tus locales físicos y puntos de venta
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-card)] backdrop-blur-md text-[var(--text-primary)] font-black text-xs border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] hover:text-sky-500 transition-all shadow-lg shadow-black/5 uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" /> Agregar Sucursal
                </button>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map(branch => (
                        <BranchCard
                            key={branch.id}
                            branch={branch}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    ))}
                    {branches.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-[var(--bg-secondary)] rounded-[2rem] border-2 border-dashed border-[var(--border-subtle)]">
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

            <ConfirmDialog />
        </div>
    );
}
