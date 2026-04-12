'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Specialist } from '@/features/seller/services/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';

interface SpecialistModalProps {
    specialist: Specialist | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (specialist: Partial<Specialist>) => void;
}
import Icon from '@/components/ui/Icon';

export default function SpecialistModal({ specialist, isOpen, onClose, onSave }: SpecialistModalProps) {
    const [formData, setFormData] = useState<Partial<Specialist>>({
        nombres: '',
        apellidos: '',
        especialidad: '',
        subespecialidad: '',
        dni: '',
        foto: null
    });

    useEffect(() => {
        if (specialist) {
            setFormData(specialist);
        } else {
            setFormData({ nombres: '', apellidos: '', especialidad: '', subespecialidad: '', dni: '', foto: null });
        }
    }, [specialist, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            avatar_chars: (formData.nombres?.charAt(0) || '') + (formData.apellidos?.charAt(0) || '').toUpperCase(),
            color: '#38bdf8' // Default sky-400
        });
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Ficha de Especialista"
            subtitle="Información profesional del equipo"
            size="xl"
            accentColor="from-sky-400 to-indigo-400"
        >
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Specialist Photo */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-[var(--bg-secondary)] rounded-[2rem] border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all hover:border-[var(--brand-sky)]/30">
                            {formData.foto ? (
                                <Image src={formData.foto} fill sizes="128px" className="object-cover" alt="Preview" />
                            ) : (
                                <div className="text-center group-hover:scale-110 transition-all">
                                    <Icon name="User" className="w-10 h-10 text-[var(--text-secondary)] inline-block" />
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mt-2">Foto</p>
                                </div>
                            )}
                        </div>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-3 tracking-widest text-center">Max 2MB • PNG/JPG</p>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="specialist-nombres" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombres <span className="text-[var(--text-danger)]">*</span></label>
                                <input
                                    id="specialist-nombres"
                                    type="text"
                                    required
                                    value={formData.nombres}
                                    onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl font-bold text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-sky)]/10 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="specialist-apellidos" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Apellidos <span className="text-[var(--text-danger)]">*</span></label>
                                <input
                                    id="specialist-apellidos"
                                    type="text"
                                    required
                                    value={formData.apellidos}
                                    onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl font-bold text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-sky)]/10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="specialist-dni" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">DNI / ID <span className="text-[var(--text-danger)]">*</span></label>
                                <input
                                    id="specialist-dni"
                                    type="text"
                                    maxLength={8}
                                    required
                                    value={formData.dni}
                                    onChange={e => setFormData({ ...formData, dni: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl font-bold text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-sky)]/10 transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label htmlFor="specialist-especialidad" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Especialidad <span className="text-[var(--text-danger)]">*</span></label>
                                <input
                                    id="specialist-especialidad"
                                    type="text"
                                    required
                                    value={formData.especialidad}
                                    onChange={e => setFormData({ ...formData, especialidad: e.target.value })}
                                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-none rounded-xl font-bold text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-sky)]/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
                    <BaseButton
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancelar
                    </BaseButton>
                    <BaseButton
                        type="submit"
                        variant="primary"
                        leftIcon="Save"
                    >
                        Guardar Especialista
                    </BaseButton>
                </div>
            </form>
        </BaseModal>
    );
}
