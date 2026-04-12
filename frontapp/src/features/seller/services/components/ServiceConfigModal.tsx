'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Service, Specialist, ServiceSticker } from '@/features/seller/services/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import { useToast } from '@/shared/lib/context/ToastContext';

interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
}

interface ServiceConfigModalProps {
    service: Service | null;
    specialists: Specialist[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Partial<Service>) => void;
}

const stickerOptions: { value: ServiceSticker; label: string; color: 'gray' | 'red' | 'amber' | 'sky' | 'purple' }[] = [
    { value: '', label: 'Ninguno', color: 'gray' },
    { value: 'liquidacion', label: 'Lote', color: 'red' },
    { value: 'oferta', label: 'Oferta', color: 'amber' },
    { value: 'nuevo', label: 'Nuevo', color: 'sky' },
    { value: 'bestseller', label: 'Top', color: 'purple' }
];

const daysOptions = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

import Icon from '@/components/ui/Icon';

export default function ServiceConfigModal({ service, specialists, isOpen, onClose, onSave }: ServiceConfigModalProps) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState<Partial<Service>>({
        nombre: '',
        especialistas_ids: [],
        sticker: '',
        category_id: null,
        config: {
            hora_inicio: '08:00',
            hora_fin: '20:00',
            duracion: 30,
            max_citas: 1,
            dias: []
        }
    });

    const { data: serviceCategories = [] } = useQuery<ServiceCategory[]>({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const res = await fetch(`${LARAVEL_API_URL}/categories?type=service&per_page=100`);
            const data = await res.json();
            return data.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (service) {
            setFormData(service);
        } else {
            setFormData({
                nombre: '',
                especialistas_ids: [],
                sticker: '',
                config: { hora_inicio: '08:00', hora_fin: '20:00', duracion: 30, max_citas: 1, dias: [] }
            });
        }
    }, [service, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones de negocio
        if (!formData.especialistas_ids || formData.especialistas_ids.length === 0) {
            showToast('Debes asignar al menos un especialista al servicio', 'error');
            return;
        }

        if (!formData.config?.dias || formData.config.dias.length === 0) {
            showToast('Selecciona al menos un día de atención', 'error');
            return;
        }

        const { hora_inicio, hora_fin } = formData.config!;
        if (hora_inicio >= hora_fin) {
            showToast('La hora de inicio debe ser anterior a la hora de fin', 'error');
            return;
        }

        const diasStr = formData.config?.dias?.join(', ') || '';
        const horario = `${diasStr} • ${formData.config?.hora_inicio} - ${formData.config?.hora_fin}`;
        onSave({ ...formData, horario, estado: 'disponible' });
        onClose();
    };

    const toggleDay = (day: string) => {
        const currentDays = formData.config?.dias || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        setFormData({ ...formData, config: { ...formData.config!, dias: newDays } });
    };

    const toggleSpecialist = (id: number) => {
        const currentIds = formData.especialistas_ids || [];
        const newIds = currentIds.includes(id)
            ? currentIds.filter(i => i !== id)
            : [...currentIds, id];
        setFormData({ ...formData, especialistas_ids: newIds });
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Configuración de Agenda"
            subtitle="Planificación de Disponibilidad Operativa"
            size="4xl"
            accentColor="from-emerald-400 to-sky-400"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna 1: Datos y Especialistas */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="service-nombre" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Denominación del Servicio <span className="text-[var(--text-danger)]">*</span></label>
                            <input
                                id="service-nombre"
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-5 py-3.5 bg-[var(--bg-secondary)] border-none rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--color-success)]/5 transition-all outline-none"
                                placeholder="Ej: Consulta Especializada"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="service-category" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-2">Categoría de Servicio</label>
                            <select
                                id="service-category"
                                value={formData.category_id ?? ''}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-5 py-3.5 bg-[var(--bg-secondary)] border-none rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--color-success)]/5 transition-all outline-none cursor-pointer"
                            >
                                <option value="">Sin categoría</option>
                                {serviceCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Team Asignado</span>
                                <span className="text-[8px] font-black text-[var(--brand-sky)] bg-[var(--brand-sky)]/10 px-2 py-0.5 rounded-lg border border-[var(--brand-sky)]/20 uppercase">{formData.especialistas_ids?.length || 0} IDs</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                                {specialists.map(esp => (
                                    <div key={esp.id} className={`flex items-center justify-between p-3 rounded-[1.25rem] border-2 transition-all cursor-pointer group active:scale-[0.98]
                                        ${formData.especialistas_ids?.includes(esp.id) ? 'bg-[var(--bg-card)] border-[var(--brand-sky)] shadow-md shadow-[var(--brand-sky)]/10' : 'bg-[var(--bg-secondary)]/50 border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card)]'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--brand-sky)]/10 border border-[var(--brand-sky)]/20 flex items-center justify-center text-[10px] font-black text-[var(--brand-sky)] overflow-hidden shadow-xs">
                                                {esp.foto ? <Image src={esp.foto} fill sizes="40px" className="object-cover" alt="" /> : esp.avatar_chars}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[var(--text-primary)] tracking-tight leading-tight">{esp.nombres}</p>
                                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">{esp.especialidad}</p>
                                            </div>
                                        </div>
                                        <input
                                            id={`specialist-${esp.id}`}
                                            type="checkbox"
                                            checked={formData.especialistas_ids?.includes(esp.id)}
                                            onChange={() => toggleSpecialist(esp.id)}
                                            className="w-5 h-5 rounded-md border-[var(--border-subtle)] text-[var(--brand-sky)] focus:ring-[var(--brand-sky)]/10 cursor-pointer shadow-inner"
                                        />
                                    </div>
                                ))}
                                {specialists.length === 0 && (
                                    <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[1.5rem] bg-[var(--bg-secondary)]/20">
                                        <Icon name="Users" className="w-8 h-8 text-[var(--text-secondary)] mb-2 inline-block" />
                                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Sin colaboradores</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna 2: Horarios */}
                    <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-[2.5rem] border border-[var(--border-subtle)]/50 shadow-inner flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--bg-card)] rounded-xl flex items-center justify-center shadow-sm border border-[var(--border-subtle)]">
                                    <Icon name="CalendarCheck" className="w-5 h-5 text-[var(--brand-sky)]" />
                                </div>
                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Horario Operativo</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="service-hora-inicio" className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 text-opacity-50">Inicio</label>
                                    <input
                                        id="service-hora-inicio"
                                        type="time"
                                        value={formData.config?.hora_inicio}
                                        onChange={e => setFormData({ ...formData, config: { ...formData.config!, hora_inicio: e.target.value } })}
                                        className="w-full px-4 py-3 bg-[var(--bg-card)] rounded-xl border-none font-bold text-[var(--text-primary)] shadow-xs focus:ring-4 focus:ring-[var(--brand-sky)]/10 transition-all font-mono text-sm outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="service-hora-fin" className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 text-opacity-50">Fin</label>
                                    <input
                                        id="service-hora-fin"
                                        type="time"
                                        value={formData.config?.hora_fin}
                                        onChange={e => setFormData({ ...formData, config: { ...formData.config!, hora_fin: e.target.value } })}
                                        className="w-full px-4 py-3 bg-[var(--bg-card)] rounded-xl border-none font-bold text-[var(--text-primary)] shadow-xs focus:ring-4 focus:ring-[var(--brand-sky)]/10 transition-all font-mono text-sm outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="service-duracion" className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 text-opacity-50">Frecuencia</label>
                                    <select
                                        id="service-duracion"
                                        value={formData.config?.duracion}
                                        onChange={e => setFormData({ ...formData, config: { ...formData.config!, duracion: parseInt(e.target.value) } })}
                                        className="w-full px-4 py-3 bg-[var(--bg-card)] rounded-xl border-none font-bold text-[var(--text-primary)] shadow-xs focus:ring-4 focus:ring-[var(--brand-sky)]/10 transition-all outline-none cursor-pointer text-sm"
                                    >
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">60 min</option>
                                        <option value="90">90 min</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="service-max-citas" className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 text-opacity-50">Cupos</label>
                                    <input
                                        id="service-max-citas"
                                        type="number"
                                        min="1"
                                        value={formData.config?.max_citas}
                                        onChange={e => setFormData({ ...formData, config: { ...formData.config!, max_citas: parseInt(e.target.value) } })}
                                        className="w-full px-4 py-3 bg-[var(--bg-card)] rounded-xl border-none font-bold text-[var(--text-primary)] shadow-xs focus:ring-4 focus:ring-[var(--brand-sky)]/10 transition-all outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block">Días de Atención</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {daysOptions.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-[9px] font-black uppercase transition-all shadow-xs
                                                ${formData.config?.dias?.includes(day)
                                                    ? 'bg-[var(--brand-sky)] text-white border-[var(--brand-sky)] shadow-inner'
                                                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-sky)]/30 hover:text-[var(--brand-sky)]'}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sticker / Promo area */}
                        <div className="mt-6 p-4 bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-subtle)] shadow-xs space-y-3">
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 block">Status de Vitrina</span>
                            <div className="flex flex-wrap gap-1.5">
                                {stickerOptions.map(opt => (
                                    <label key={opt.value} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="sticker"
                                            value={opt.value}
                                            checked={formData.sticker === opt.value}
                                            onChange={e => setFormData({ ...formData, sticker: e.target.value as ServiceSticker })}
                                            className="sr-only"
                                        />
                                        <div className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all
                                            ${formData.sticker === opt.value
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}`}>
                                            {opt.label}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-[var(--bg-card)]/90 backdrop-blur-md pt-5 flex justify-end gap-3 border-t border-[var(--border-subtle)] z-20 -mx-8 -mb-8 p-6">
                    <BaseButton
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancelar
                    </BaseButton>
                    <BaseButton
                        type="submit"
                        variant="secondary"
                        leftIcon="Save"
                        className="px-8"
                    >
                        Guardar Cambios
                    </BaseButton>
                </div>
            </form>
        </BaseModal>
    );
}
