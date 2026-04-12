'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { sellerNavigation } from '@/shared/lib/constants/seller-nav';
import { allowOnlyNumbers } from '@/shared/lib/utils/validation';

import BaseLoading from '@/components/ui/BaseLoading';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import { useSellerProfile } from '@/features/seller/profile/hooks/useSellerProfile';
import type { VendorProfileData } from '@/features/seller/profile/types';

interface ProfilePageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

export function ProfilePageClient(_props: ProfilePageClientProps) {
    const moduleConfig = sellerNavigation
        .flatMap(section => section.items)
        .find(item => item.id === 'mis-datos')!;

    const {
        data: hookData,
        loading,
        isSaving,
        updateProfile,
        error
    } = useSellerProfile();

    const [data, setData] = useState<VendorProfileData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const EDIT_FIELD_CLASSES = "bg-white dark:bg-[var(--bg-card)]/70 dark:bg-[var(--bg-card)] ring-sky-500/10 px-3 py-1 rounded-xl border-2 border-sky-100 dark:border-[var(--border-subtle)]";
    const READONLY_FIELD_CLASSES = "border-transparent px-3 py-1";

    useEffect(() => {
        if (hookData && !isEditMode) {
            setData(hookData);
        }
    }, [hookData, isEditMode]);

    if (loading) {
        return <BaseLoading message="Sincronizando con tu tienda en WordPress..." />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Error al cargar perfil</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return <BaseLoading message="Cargando datos del perfil..." />;

    const toggleEditMode = async () => {
        if (isEditMode) {
            await updateProfile(data);
            setIsEditMode(false);
        } else {
            setIsEditMode(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => {
            if (!prev) return null;
            const newData = { ...prev };
            if (name.startsWith('location_')) {
                const key = name.replace('location_', '') as keyof typeof prev.location;
                newData.location = { ...prev.location, [key]: value };
            } else if (name.startsWith('rrss_')) {
                const key = name.replace('rrss_', '') as keyof typeof prev.rrss;
                newData.rrss = { ...prev.rrss, [key]: value };
            } else {
                // @ts-ignore
                newData[name] = value;
            }
            return newData;
        });
    };

    const handlePhotoClick = () => {
        if (isEditMode && fileInputRef.current) fileInputRef.current.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result && data) setData({ ...data, rep_legal_foto: event.target.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const fieldCls = `w-full text-sm font-black text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-100 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 transition-all`;

    return (
        <div className="space-y-8 animate-fadeIn">
            <ModuleHeader
                title={moduleConfig.label}
                subtitle={moduleConfig.description || ''}
                icon={moduleConfig.icon || 'User'}
                actions={
                    <BaseButton
                        onClick={toggleEditMode}
                        isLoading={isSaving}
                        variant="action"
                        leftIcon={isEditMode ? "Save" : "Edit3"}
                    >
                        {isEditMode ? "Guardar Cambios" : "Editar Información"}
                    </BaseButton>
                }
            />

            <form id="form-mis-datos" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* 1. DATOS EMPRESARIALES */}
                <div className="md:col-span-8 overflow-hidden rounded-[2.5rem] shadow-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-6 flex items-center justify-between relative overflow-hidden">
                        <div className="flex items-center gap-5 text-white relative z-10">
                            <div className="w-12 h-12 bg-white dark:bg-[var(--bg-card)]/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="Building2" className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter leading-none text-gray-800 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">Datos Empresariales</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] opacity-80">Gestión de Entidad Legal</p>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-emerald-100 border border-emerald-500/30 flex items-center gap-1">
                                        Verificado <Icon name="BadgeCheck" className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <label htmlFor="razon_social" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Razón Social <span className="text-red-500">*</span></label>
                                <input id="razon_social" type="text" name="razon_social" required readOnly={!isEditMode} value={data.razon_social} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="ruc" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">RUC <span className="text-red-500">*</span></label>
                                <input id="ruc" type="text" name="ruc" required readOnly={!isEditMode} value={data.ruc} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} maxLength={11}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="nombre_comercial" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input id="nombre_comercial" type="text" name="nombre_comercial" readOnly={!isEditMode} value={data.nombre_comercial} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="rep_legal_nombre" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Representante Legal <span className="text-red-500">*</span></label>
                                <input id="rep_legal_nombre" type="text" name="rep_legal_nombre" required readOnly={!isEditMode} value={data.rep_legal_nombre} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="rep_legal_dni" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">DNI Representante <span className="text-red-500">*</span></label>
                                <input id="rep_legal_dni" type="text" name="rep_legal_dni" required readOnly={!isEditMode} value={data.rep_legal_dni} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} maxLength={8}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="experience_years" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Años de Experiencia</label>
                                <input id="experience_years" type="number" name="experience_years" readOnly={!isEditMode} value={data.experience_years} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="location_departamento" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Departamento / Provincia</label>
                                <div className="flex gap-2">
                                    <input id="location_departamento" type="text" name="location_departamento" readOnly={!isEditMode} value={data.location.departamento} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                    <input id="location_provincia" type="text" name="location_provincia" readOnly={!isEditMode} value={data.location.provincia} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="tax_condition" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Condición Tributaria</label>
                                <select id="tax_condition" name="tax_condition" disabled={!isEditMode} value={data.tax_condition} onChange={handleInputChange}
                                    className={`${fieldCls} cursor-pointer ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`}>
                                    <option value="">Seleccionar...</option>
                                    <option value="Régimen General">Régimen General</option>
                                    <option value="Régimen MYPE Tributario">Régimen MYPE Tributario</option>
                                    <option value="Régimen Especial de Renta">Régimen Especial de Renta (RER)</option>
                                    <option value="Nuevo RUS">Nuevo RUS</option>
                                    <option value="Agente de Retención">Agente de Retención</option>
                                    <option value="Agente de Percepción">Agente de Percepción</option>
                                    <option value="Buen Contribuyente">Buen Contribuyente</option>
                                </select>
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="pt-6 mt-8 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                            <span className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1 mb-4 block">Presencia en Redes</span>
                            {!isEditMode && (
                                <div className="flex flex-wrap gap-4">
                                    {data.rrss.instagram && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-pink-50 text-pink-600 border-pink-100 font-bold text-xs">
                                            <Icon name="Instagram" className="w-4 h-4" /> <span>{data.rrss.instagram}</span>
                                        </div>
                                    )}
                                    {data.rrss.facebook && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-sky-50 text-sky-600 border-sky-100 font-bold text-xs">
                                            <Icon name="Facebook" className="w-4 h-4" /> <span>{data.rrss.facebook}</span>
                                        </div>
                                    )}
                                    {data.rrss.tiktok && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-gray-50 dark:bg-[var(--bg-card)] text-gray-600 dark:text-[var(--text-secondary)] border-gray-100 dark:border-[var(--border-subtle)] font-bold text-xs">
                                            <Icon name="MonitorPlay" className="w-4 h-4" /> <span>{data.rrss.tiktok}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {isEditMode && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_instagram" className="text-xs font-black text-pink-500 uppercase tracking-widest ml-1">Instagram</label>
                                        <input id="rrss_instagram" type="text" name="rrss_instagram" placeholder="@usuario" value={data.rrss.instagram} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-pink-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_facebook" className="text-xs font-black text-sky-500 uppercase tracking-widest ml-1">Facebook</label>
                                        <input id="rrss_facebook" type="text" name="rrss_facebook" placeholder="/pagina" value={data.rrss.facebook} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_tiktok" className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">TikTok</label>
                                        <input id="rrss_tiktok" type="text" name="rrss_tiktok" placeholder="@usuario" value={data.rrss.tiktok} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-gray-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. ADMIN DEL PANEL */}
                <div className="md:col-span-4 h-full">
                    <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] h-full">
                        {/* Header Premium */}
                        <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-4 flex items-center justify-between relative overflow-hidden">
                            <div className="flex items-center gap-5 text-white relative z-10">
                            <div className="w-12 h-12 bg-white dark:bg-[var(--bg-card)]/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                    <Icon name="UserCog" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tighter leading-none">Admin del Panel</h3>
                                    <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">Contacto Directo</p>
                                </div>
                            </div>
                            <div className="relative group z-10" role="button" tabIndex={0} onClick={handlePhotoClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePhotoClick(); }}>
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl backdrop-blur-md group-hover:scale-110 transition-all duration-500 cursor-pointer">
                                    {data.rep_legal_foto ? (
                                        <Image src={data.rep_legal_foto} fill sizes="64px" alt="Representante Legal" className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <Icon name="User" className="w-8 h-8 text-gray-400 dark:text-[var(--text-secondary)]" />
                                        </div>
                                    )}
                                    {isEditMode && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Icon name="Camera" className="text-white w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <label htmlFor="admin_nombre" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Nombres y Apellidos <span className="text-red-500">*</span></label>
                                    <input id="admin_nombre" type="text" name="admin_nombre" required readOnly={!isEditMode} value={data.admin_nombre} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="admin_dni" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">DNI Administrador</label>
                                    <input id="admin_dni" type="text" name="admin_dni" readOnly={!isEditMode} maxLength={8} value={data.admin_dni} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} placeholder="8 dígitos"
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="admin_email" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email de Gestión <span className="text-red-500">*</span></label>
                                    <input id="admin_email" type="email" name="admin_email" required readOnly={!isEditMode} value={data.admin_email} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="admin_phone" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Teléfonos de contacto</label>
                                    <div className="flex flex-col gap-3">
                                        <input id="phone_1" type="text" name="phone_1" readOnly={!isEditMode} placeholder="Principal" value={data.phone_1} onChange={handleInputChange}
                                            className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                        <input id="phone_2" type="text" name="phone_2" readOnly={!isEditMode} placeholder="Secundario/WhatsApp" value={data.phone_2} onChange={handleInputChange}
                                            className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FINANZAS */}
                <div className="md:col-span-12 overflow-hidden rounded-[2.5rem] shadow-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-6 flex items-center justify-between relative overflow-hidden">
                        <div className="flex items-center gap-5 text-white relative z-10">
                            <div className="w-12 h-12 bg-white dark:bg-[var(--bg-card)]/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="Receipt" className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter leading-none">Finanzas</h3>
                                <p className="text-xs font-black text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">Configuración de Facturación y Cuentas</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            <div className="space-y-1 lg:col-span-3">
                                <label htmlFor="direccion_fiscal" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Dirección Fiscal <span className="text-red-500">*</span></label>
                                <textarea id="direccion_fiscal" name="direccion_fiscal" required readOnly={!isEditMode} rows={1} value={data.direccion_fiscal} onChange={handleInputChange}
                                    className={`w-full text-xs font-black text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-100 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 transition-all ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`}></textarea>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cuenta_bcp" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Cuenta BCP (Soles) <span className="text-red-500">*</span></label>
                                <input id="cuenta_bcp" type="text" name="cuenta_bcp" required readOnly={!isEditMode} maxLength={14} placeholder="14 dígitos" value={data.cuenta_bcp} onChange={handleInputChange} onKeyDown={allowOnlyNumbers}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cci" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">CCI <span className="text-red-500">*</span></label>
                                <input id="cci" type="text" name="cci" readOnly={!isEditMode} maxLength={20} placeholder="20 dígitos (CCI)" value={data.cci} onChange={handleInputChange} onKeyDown={allowOnlyNumbers}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="bank_secondary" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">Entidad Bancaria Interbancaria</label>
                                <input 
                                    id="bank_secondary" 
                                    type="text" 
                                    name="bank_secondary" 
                                    readOnly={!isEditMode} 
                                    placeholder="Entidad Bancaria" 
                                    value={
                                        typeof data.bank_secondary === 'object' 
                                            ? data.bank_secondary?.bank || ''
                                            : data.bank_secondary || ''
                                    } 
                                    onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
