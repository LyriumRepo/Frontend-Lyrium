'use client';

import React, { useState, useEffect } from 'react';
import { Branch } from '@/features/seller/store/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface BranchFormData {
    name: string;
    address: string;
    city: string;
    phone: string;
    hours: string;
    isPrincipal: boolean;
}

type BranchSaveHandler = (branch: unknown) => void;

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: BranchSaveHandler;
    branch?: Branch | null;
}

export default function BranchModal({ isOpen, onClose, onSave, branch }: BranchModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        hours: '',
        isPrincipal: false
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                city: branch.city,
                phone: branch.phone,
                hours: branch.hours,
                isPrincipal: branch.isPrincipal
            });
        } else {
            setFormData({
                name: '',
                address: '',
                city: '',
                phone: '',
                hours: '',
                isPrincipal: false
            });
        }
    }, [branch, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...branch, ...formData });
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={branch ? 'Sucursal Maestra' : 'Nueva Operación'}
            subtitle="Configuración de Puntos de Venta Físicos"
            size="2xl"
            accentColor="from-sky-500 to-indigo-600"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Essential Data */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="branch-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Identificador de Sede <span className="text-red-500">*</span></label>
                            <input
                                id="branch-name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Sede Central - Piura"
                                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 focus:bg-[var(--bg-card)] transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-address" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Ubicación Estratégica</label>
                            <input
                                id="branch-address"
                                type="text"
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle, Número, Urb..."
                                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 focus:bg-[var(--bg-card)] transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-city" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Región / Distrito</label>
                            <input
                                id="branch-city"
                                type="text"
                                required
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Ej. Piura, Perú"
                                className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 focus:bg-[var(--bg-card)] transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Right Column: Contact & Meta */}
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-inner space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="branch-phone" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Línea de Contacto</label>
                            <div className="relative group">
                                <Icon name="Phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5 font-bold" />
                                <input
                                    id="branch-phone"
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+51 ..."
                                    className="w-full pl-12 pr-5 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] shadow-lg shadow-black/5 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-hours" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Ventana de Atención</label>
                            <div className="relative group">
                                <Icon name="Clock" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5 font-bold" />
                                <input
                                    id="branch-hours"
                                    type="text"
                                    required
                                    value={formData.hours}
                                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                    placeholder="Ej. 08:00 - 20:00"
                                    className="w-full pl-12 pr-5 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] shadow-lg shadow-black/5 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-4 p-3 bg-[var(--bg-card)]/50 rounded-2xl border border-[var(--border-subtle)] cursor-pointer group active:scale-95 transition-all">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.isPrincipal}
                                    onChange={e => setFormData({ ...formData, isPrincipal: e.target.checked })}
                                    className="w-5 h-5 rounded-md text-sky-600 focus:ring-sky-500/20 border-[var(--border-subtle)] cursor-pointer"
                                />
                            </div>
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] group-hover:text-sky-600 transition-colors">Operación Principal</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md -mx-8 -mb-10 p-6 rounded-b-[2.5rem]">
                    <BaseButton
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1"
                    >
                        Descartar
                    </BaseButton>
                    <BaseButton
                        type="submit"
                        variant="primary"
                        className="flex-[2]"
                    >
                        Confirmar Sucursal
                    </BaseButton>
                </div>
            </form>
        </BaseModal>
    );
}
