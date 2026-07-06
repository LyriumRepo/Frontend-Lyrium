'use client';

import React, { useState } from 'react';
import { Agency } from '@/features/seller/logistics/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface AddAgencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agency: Omit<Agency, 'id' | 'logo'>) => void;
}

export default function AddAgencyModal({ isOpen, onClose, onSave }: AddAgencyModalProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    const handleSave = () => {
        if (!name || !address) return;
        onSave({ name, address });
        setName('');
        setAddress('');
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Punto de Recojo"
            subtitle="Configuración de Red Logística"
            size="md"
            accentColor="from-sky-500 to-indigo-500"
        >
            <div className="p-8 space-y-8">
                <div className="space-y-6">
                    <div className="bg-[var(--bg-secondary)]/50 p-8 rounded-[2.5rem] border border-[var(--border-subtle)]/50 shadow-inner space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="agency-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Nombre de la Agencia <span className="text-[var(--text-danger)]">*</span></label>
                            <input
                                id="agency-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Shalom - Sede Central"
                                className="w-full px-6 py-5 bg-[var(--bg-card)] border-none rounded-[1.75rem] font-black text-[var(--text-primary)] shadow-xl shadow-[var(--border-subtle)]/50 focus:ring-4 focus:ring-[var(--brand-sky)]/5 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="agency-address" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Ubicación Geo-referencial <span className="text-[var(--text-danger)]">*</span></label>
                            <textarea
                                id="agency-address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Av. Principal 123, Distrito..."
                                rows={2}
                                className="w-full px-6 py-5 bg-[var(--bg-card)] border-none rounded-[2rem] font-black text-[var(--text-primary)] text-sm shadow-xl shadow-[var(--border-subtle)]/50 focus:ring-4 focus:ring-[var(--brand-sky)]/5 outline-none resize-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-[var(--brand-sky)]/5 rounded-3xl border border-[var(--brand-sky)]/10">
                        <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl shadow-sm flex items-center justify-center text-[var(--brand-sky)]">
                            <Icon name="Info" className="w-5 h-5 font-bold" />
                        </div>
                        <p className="text-[10px] font-black text-[var(--brand-sky)] uppercase tracking-tighter leading-relaxed">
                            El sistema asignará el distintivo visual automáticamente basado en el operador logístico identificado.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border-subtle)]">
                    <BaseButton
                        onClick={handleSave}
                        disabled={!name || !address}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="PlusCircle"
                    >
                        Consolidar Agencia
                    </BaseButton>
                    <BaseButton
                        onClick={onClose}
                        variant="ghost"
                        size="lg"
                        fullWidth
                    >
                        Descartar
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    );
}
