'use client';

import React, { useState, useEffect } from 'react';
import { Branch } from '@/features/seller/store/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import { MapPin, ExternalLink } from 'lucide-react';
import {peruLocations} from '@/data/peruLocations';

interface BranchFormData {
    name: string;
    address: string;
    department: string;
    province: string;
    district: string;
    phone: string;
    hours: string;
    isPrincipal: boolean;
    mapsUrl: string;
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
        department: '',
        province: '',
        district: '',
        phone: '',
        hours: '',
        isPrincipal: false,
        mapsUrl: ''
    });

    const selectedDepartment = peruLocations.find(
    d => d.department === formData.department
    );

    const provinces = selectedDepartment?.provinces || [];

    const selectedProvince = provinces.find(
    p => p.province === formData.province
    );

    const districts = selectedProvince?.districts || [];

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name,
                address: branch.address,
                department: branch.department,
                province: branch.province,
                district: branch.district,
                phone: branch.phone,
                hours: branch.hours,
                isPrincipal: branch.isPrincipal,
                mapsUrl: branch.mapsUrl || ''
            });
            console.log('BRANCH MODAL:', branch);
        } else {
            setFormData({
                name: '',
                address: '',
                department: '',
                province: '',
                district: '',
                phone: '',
                hours: '',
                isPrincipal: false,
                mapsUrl: ''
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
            accentColor="from-sky-500 to-indigo-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)]"
        >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column: Essential Data */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="branch-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                Identificador de Sede <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="branch-name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Sede Central - Piura"
                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 focus:bg-[var(--bg-card)] transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-address" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                Ubicación Estratégica
                            </label>
                            <input
                                id="branch-address"
                                type="text"
                                required
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle, Número, Urb..."
                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/5 focus:bg-[var(--bg-card)] transition-all outline-none"
                            />
                        </div>

                        {/* Departamento / Provincia / Distrito */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {/* Departamento */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Dpto.
                                </label>
                                <select
                                    value={formData.department || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            department: e.target.value,
                                            province: '',
                                            district: '',
                                        })
                                    }
                                    className="w-full px-2 sm:px-3 py-2.5 sm:py-3 text-[11px] sm:text-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl sm:rounded-2xl font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-sky-500/10 transition-all"
                                >
                                    <option value="">Departamento</option>
                                    {peruLocations.map((dep) => (
                                        <option key={dep.department} value={dep.department}>
                                            {dep.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Provincia */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Prov.
                                </label>
                                <select
                                    value={formData.province || ''}
                                    disabled={!formData.department}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            province: e.target.value,
                                            district: '',
                                        })
                                    }
                                    className="w-full px-2 sm:px-3 py-2.5 sm:py-3 text-[11px] sm:text-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl sm:rounded-2xl font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-sky-500/10 transition-all disabled:opacity-50"
                                >
                                    <option value="">Provincia</option>
                                    {provinces.map((prov) => (
                                        <option key={prov.province} value={prov.province}>
                                            {prov.province}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Distrito */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Dist.
                                </label>
                                <select
                                    value={formData.district || ''}
                                    disabled={!formData.province}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            district: e.target.value,
                                        })
                                    }
                                    className="w-full px-2 sm:px-3 py-2.5 sm:py-3 text-[11px] sm:text-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl sm:rounded-2xl font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-sky-500/10 transition-all disabled:opacity-50"
                                >
                                    <option value="">Distrito</option>
                                    {districts.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact & Meta */}
                    <div className="bg-[var(--bg-secondary)]/50 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-subtle)] shadow-inner space-y-4 sm:space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="branch-phone" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                Línea de Contacto
                            </label>
                            <div className="relative group">
                                <Icon name="Phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 dark:text-[var(--icons-green)] w-5 h-5 font-bold" />
                                <input
                                    id="branch-phone"
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+51 ..."
                                    className="w-full pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] shadow-lg shadow-black/5 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-hours" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                Ventana de Atención
                            </label>
                            <div className="relative group">
                                <Icon name="Clock" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 dark:text-[var(--icons-green)] w-5 h-5 font-bold" />
                                <input
                                    id="branch-hours"
                                    type="text"
                                    required
                                    value={formData.hours}
                                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                                    placeholder="Ej. 08:00 - 20:00"
                                    className="w-full pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] shadow-lg shadow-black/5 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="branch-maps-url" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                Ubicación en Maps
                            </label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 dark:text-[var(--icons-green)] w-5 h-5 font-bold" />
                                <input
                                    id="branch-maps-url"
                                    type="url"
                                    value={formData.mapsUrl}
                                    onChange={e => setFormData({ ...formData, mapsUrl: e.target.value })}
                                    placeholder="Pega el link de Google Maps..."
                                    className="w-full pl-12 pr-4 sm:pr-5 py-3 sm:py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] font-bold text-[var(--text-primary)] shadow-lg shadow-black/5 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                />
                            </div>
                            <p className="text-[9px] text-[var(--text-muted)] ml-1 flex items-center gap-1">
                                <ExternalLink className="w-2.5 h-2.5" />
                                Abre Google Maps, busca tu sucursal y copia el link
                            </p>
                        </div>

                        <label className="flex items-center gap-3 sm:gap-4 p-3 bg-[var(--bg-card)]/50 rounded-2xl border border-[var(--border-subtle)] cursor-pointer group active:scale-95 transition-all">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.isPrincipal}
                                    onChange={e => setFormData({ ...formData, isPrincipal: e.target.checked })}
                                    className="w-5 h-5 rounded-md accent-sky-600 dark:accent-[var(--icons-green)] border-[var(--border-subtle)] cursor-pointer"
                                />
                            </div>
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] group-hover:text-sky-600 dark:group-hover:text-[var(--icons-green)] transition-colors">
                                Operación Principal
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-5 border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md -mx-6 sm:-mx-8 -mb-8 sm:-mb-10 p-4 sm:p-6 rounded-b-[2rem] sm:rounded-b-[2.5rem]">
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
