'use client';

import React, { useState } from 'react';
import { peruCoverage } from '@/shared/lib/data/coverageData';
import { CityRate } from '@/features/seller/logistics/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface AddCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rate: CityRate) => void;
}

export default function AddCityModal({ isOpen, onClose, onSave }: AddCityModalProps) {
    const [dept, setDept] = useState('');
    const [city, setCity] = useState('');
    const [rate, setRate] = useState(15.00);

    const departments = Object.keys(peruCoverage);
    const cities = dept ? (peruCoverage as Record<string, string[]>)[dept] : [];

    const handleSave = () => {
        if (!dept || !city) return;
        onSave({ department: dept, city, rate, agencies: [] });
        onClose();
        setDept('');
        setCity('');
        setRate(15.00);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Destino"
            subtitle="Configuración de Cobertura Geográfica"
            size="md"
            accentColor="from-emerald-400 to-sky-500"
        >
            <div className="p-8 space-y-8">
                <div className="bg-[var(--bg-secondary)]/50 p-8 rounded-[3rem] border border-[var(--border-subtle)] shadow-inner space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="city-dept" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Departamento Originario</label>
                        <div className="relative">
                            <select
                                id="city-dept"
                                value={dept}
                                onChange={(e) => { setDept(e.target.value); setCity(''); }}
                                className="w-full px-6 py-5 bg-[var(--bg-card)] border-none rounded-[1.75rem] font-black text-[var(--text-primary)] shadow-xl shadow-[var(--border-subtle)]/50 focus:ring-4 focus:ring-[var(--color-success)]/10 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Selecciona Jurisdicción</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <Icon name="ChevronDown" className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="city-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Ciudad / Distrito Destino</label>
                        <div className="relative">
                            <select
                                id="city-name"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                disabled={!dept}
                                className="w-full px-6 py-5 bg-[var(--bg-card)] border-none rounded-[1.75rem] font-black text-[var(--text-primary)] shadow-xl shadow-[var(--border-subtle)]/50 focus:ring-4 focus:ring-[var(--color-success)]/10 transition-all outline-none appearance-none cursor-pointer disabled:opacity-30 disabled:scale-[0.98]"
                            >
                                <option value="">{dept ? 'Selecciona Ciudad' : 'Esperando Departamento...'}</option>
                                {cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <Icon name="ChevronDown" className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="city-rate" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tarifa Logística Base (S/)</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[var(--brand-sky)] text-lg">S/</span>
                            <input
                                id="city-rate"
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                step="0.50"
                                className="w-full pl-16 pr-8 py-5 bg-[var(--bg-card)] border-none rounded-[1.75rem] font-black text-[var(--text-primary)] text-xl shadow-xl shadow-[var(--border-subtle)]/50 focus:ring-4 focus:ring-[var(--color-success)]/10 transition-all outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <BaseButton
                        onClick={handleSave}
                        disabled={!dept || !city}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="MapPin"
                    >
                        Habilitar Cobertura
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

                <p className="text-[9px] font-bold text-[var(--text-secondary)] leading-relaxed italic text-center px-4">
                    * La tarifa plana se aplicará a todos los envíos estándar. Las variaciones por peso se calculan al finalizar la compra.
                </p>
            </div>
        </BaseModal>
    );
}
