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
import { useToast } from '@/shared/lib/context/ToastContext';

interface ProfilePageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

/**
 * Máscaras de formato para campos numéricos con guiones automáticos.
 * '#' representa un dígito. Cualquier otro carácter en la máscara es literal (ej. '-').
 */
const FIELD_MASKS: Record<string, string> = {
    cuenta_bcp: '###-########-#-##', // 14 dígitos -> xxx-xxxxxxxx-x-xx
    cci: '###-###-############-##', // 20 dígitos -> xxx-xxx-xxxxxxxxxxxx-xx
};

/**
 * Toma el valor crudo de un input, extrae solo los dígitos y reconstruye
 * el string aplicando los guiones según la máscara correspondiente.
 * Usar SOLO para mostrar el valor en pantalla, nunca para lo que se guarda.
 */
function applyMask(rawValue: string, mask: string): string {
    const digits = rawValue.replace(/\D/g, '');
    let result = '';
    let digitIndex = 0;

    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
        if (mask[i] === '#') {
            result += digits[digitIndex];
            digitIndex++;
        } else {
            result += mask[i];
        }
    }

    return result;
}

/** Cantidad real de dígitos (sin guiones) que admite cada campo enmascarado. */
const MASK_DIGIT_LENGTHS: Record<string, number> = Object.fromEntries(
    Object.entries(FIELD_MASKS).map(([key, mask]) => [key, (mask.match(/#/g) || []).length])
);

/** Deja solo dígitos y recorta al largo permitido. Esto es lo que se guarda en el estado. */
function extractDigits(rawValue: string, maxDigits: number): string {
    return rawValue.replace(/\D/g, '').slice(0, maxDigits);
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
    const [photoError, setPhotoError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const EDIT_FIELD_CLASSES = "bg-white dark:bg-[var(--bg-card)] ring-sky-500/10 px-3 py-1 rounded-xl border-2 border-sky-100 dark:border-[var(--border-subtle)]";
    const READONLY_FIELD_CLASSES = "px-3 py-1";

    useEffect(() => {
        if (hookData && !isEditMode) setData(hookData);
    }, [hookData, isEditMode]);

    const requiredFields = [
        { key: 'razon_social', label: 'Razón Social' },
        { key: 'ruc', label: 'RUC' },
        { key: 'rep_legal_nombre', label: 'Representante Legal' },
        { key: 'rep_legal_dni', label: 'DNI Representante' },
        { key: 'admin_nombre', label: 'Nombres y Apellidos' },
        { key: 'admin_email', label: 'Email de Gestión' },
        { key: 'direccion_fiscal', label: 'Dirección Fiscal' },
        { key: 'cuenta_bcp', label: 'Cuenta BCP' },
        { key: 'cci', label: 'CCI' },
    ];

    const validateForm = () => {
        if (!data) return false;
        const newErrors: Record<string, string> = {};
        requiredFields.forEach(({ key, label }) => {
            const value = (data as any)[key];
            if (!String(value ?? '').trim()) {
                newErrors[key] = `El campo ${label} es obligatorio.`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (loading) return <BaseLoading message="Sincronizando con tu tienda en WordPress..." />;

    if (error) {
        return (
            <div className="p-4 sm:p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-5 sm:p-6 max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Error al cargar perfil</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return <BaseLoading message="Cargando datos del perfil..." />;

    const toggleEditMode = async () => {
        if (isEditMode) {
            if (!validateForm()) return;
            try {
                await updateProfile(data);
                setIsEditMode(false);
                setErrors({});
                showToast('Cambios guardados correctamente.', 'success');
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'No se pudo guardar el perfil. Intenta nuevamente.',
                    'error',
                );
            }
        } else {
            setIsEditMode(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const value = FIELD_MASKS[name]
            ? extractDigits(e.target.value, MASK_DIGIT_LENGTHS[name])
            : e.target.value;
        setErrors(prev => ({ ...prev, [name]: '' }));
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
            reader.onload = (ev) => {
                if (ev.target?.result && data) setData({ ...data, rep_legal_foto: ev.target.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const fieldCls = `w-full text-sm font-black text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 transition-all`;

    const getInputClassName = (fieldName: string) =>
        `${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES} ${
            errors[fieldName]
                ? '!border-red-500 focus:!border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
                : ''
        }`;

    // Reutilizado en ambos botones (móvil + desktop)
    const editBtn = (
        <BaseButton
            onClick={toggleEditMode}
            isLoading={isSaving}
            variant="action"
            leftIcon={isEditMode ? "Save" : "Edit3"}
            size="lg"
            fullWidth
        >
            {isEditMode ? "Guardar Cambios" : "Editar Información"}
        </BaseButton>
    );

    // overflow-hidden es lo que recorta las esquinas del header interno.
    // rounded-[1.5rem] (24px) en móvil es suficientemente visible incluso en DevTools
    // a 42% zoom. sm:rounded-[2.5rem] (40px) mantiene el look premium en desktop.
    // will-change-transform fuerza un compositing layer en Chrome Android para que
    // overflow-hidden + border-radius recorte correctamente los hijos.
    const cardCls = "overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] will-change-transform shadow-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)]";

    const cardHeaderCls = "bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 flex items-center justify-between relative";

    return (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">

            <ModuleHeader
                title={moduleConfig.label}
                subtitle={moduleConfig.description || ''}
                icon={moduleConfig.icon || 'User'}
            />

            <div className="w-full sm:max-w-xs mx-auto xl:mx-0 xl:ml-auto">
                {editBtn}
            </div>

            <form id="form-mis-datos" className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">

                {/* ── 1. DATOS EMPRESARIALES ── */}
                <div className={`xl:col-span-8 ${cardCls}`}>

                    <div className={cardHeaderCls}>
                        <div className="flex items-center gap-3 sm:gap-4 text-white relative z-10 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="Building2" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-xl font-black tracking-tight leading-none text-white truncate">
                                    Datos Empresariales
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <p className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">
                                        Gestión de Entidad Legal
                                    </p>
                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-100 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                                        Verificado <Icon name="BadgeCheck" className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            <div className="space-y-1">
                                <label htmlFor="razon_social" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Razón Social <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="razon_social" type="text" name="razon_social" required readOnly={!isEditMode}
                                    value={data.razon_social} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.razon_social}
                                    aria-describedby={errors.razon_social ? 'razon_social-error' : undefined}
                                    className={getInputClassName('razon_social')} />
                                {errors.razon_social && (
                                    <p id="razon_social-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.razon_social}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="ruc" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    RUC <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="ruc" type="text" name="ruc" required readOnly={!isEditMode}
                                    value={data.ruc} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} maxLength={11}
                                    aria-required="true"
                                    aria-invalid={!!errors.ruc}
                                    aria-describedby={errors.ruc ? 'ruc-error' : undefined}
                                    className={getInputClassName('ruc')} />
                                {errors.ruc && (
                                    <p id="ruc-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.ruc}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="nombre_comercial" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Nombre Comercial
                                </label>
                                <input id="nombre_comercial" type="text" name="nombre_comercial" readOnly={!isEditMode}
                                    value={data.nombre_comercial} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="rep_legal_nombre" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Representante Legal <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="rep_legal_nombre" type="text" name="rep_legal_nombre" required readOnly={!isEditMode}
                                    value={data.rep_legal_nombre} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.rep_legal_nombre}
                                    aria-describedby={errors.rep_legal_nombre ? 'rep_legal_nombre-error' : undefined}
                                    className={getInputClassName('rep_legal_nombre')} />
                                {errors.rep_legal_nombre && (
                                    <p id="rep_legal_nombre-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.rep_legal_nombre}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="rep_legal_dni" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    DNI Representante <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="rep_legal_dni" type="text" name="rep_legal_dni" required readOnly={!isEditMode}
                                    value={data.rep_legal_dni} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} maxLength={8}
                                    aria-required="true"
                                    aria-invalid={!!errors.rep_legal_dni}
                                    aria-describedby={errors.rep_legal_dni ? 'rep_legal_dni-error' : undefined}
                                    className={getInputClassName('rep_legal_dni')} />
                                {errors.rep_legal_dni && (
                                    <p id="rep_legal_dni-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.rep_legal_dni}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="experience_years" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Años de Experiencia
                                </label>
                                <input id="experience_years" type="number" name="experience_years" readOnly={!isEditMode}
                                    value={data.experience_years} onChange={handleInputChange}
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>

                            {/* Departamento / Provincia — apilados en móvil */}
                            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                                <label htmlFor="location_departamento" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Departamento / Provincia
                                </label>
                                <div className="flex flex-col xs:flex-row gap-2">
                                    <input id="location_departamento" type="text" name="location_departamento" readOnly={!isEditMode}
                                        value={data.location.departamento} onChange={handleInputChange} placeholder="Dpto."
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                    <input id="location_provincia" type="text" name="location_provincia" readOnly={!isEditMode}
                                        value={data.location.provincia} onChange={handleInputChange} placeholder="Prov."
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="tax_condition" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Condición Tributaria
                                </label>
                                <select id="tax_condition" name="tax_condition" disabled={!isEditMode}
                                    value={data.tax_condition} onChange={handleInputChange}
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
                        <div className="pt-5 mt-5 sm:pt-6 sm:mt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                            <span className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1 mb-3 block">
                                Presencia en Redes
                            </span>
                            {!isEditMode && (
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {data.rrss.instagram && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-pink-50 text-pink-600 border-pink-100 font-bold text-xs">
                                            <Icon name="Instagram" className="w-3.5 h-3.5" />
                                            <span>{data.rrss.instagram}</span>
                                        </div>
                                    )}
                                    {data.rrss.facebook && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-sky-50 text-sky-600 border-sky-100 font-bold text-xs">
                                            <Icon name="Facebook" className="w-3.5 h-3.5" />
                                            <span>{data.rrss.facebook}</span>
                                        </div>
                                    )}
                                    {data.rrss.tiktok && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-gray-50 dark:bg-[var(--bg-card)] text-gray-600 dark:text-[var(--text-secondary)] border-gray-100 dark:border-[var(--border-subtle)] font-bold text-xs">
                                            <Icon name="MonitorPlay" className="w-3.5 h-3.5" />
                                            <span>{data.rrss.tiktok}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {isEditMode && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3">
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_instagram" className="text-xs font-black text-pink-500 uppercase tracking-widest ml-1">Instagram</label>
                                        <input id="rrss_instagram" type="text" name="rrss_instagram" placeholder="@usuario"
                                            value={data.rrss.instagram} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-pink-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_facebook" className="text-xs font-black text-sky-500 uppercase tracking-widest ml-1">Facebook</label>
                                        <input id="rrss_facebook" type="text" name="rrss_facebook" placeholder="/pagina"
                                            value={data.rrss.facebook} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="rrss_tiktok" className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">TikTok</label>
                                        <input id="rrss_tiktok" type="text" name="rrss_tiktok" placeholder="@usuario"
                                            value={data.rrss.tiktok} onChange={handleInputChange}
                                            className={`w-full text-xs font-bold p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-gray-400 transition-all ${EDIT_FIELD_CLASSES}`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 2. ADMIN DEL PANEL ── */}
                <div className={`xl:col-span-4 ${cardCls}`}>

                    <div className={cardHeaderCls}>
                        <div className="flex items-center gap-3 text-white relative z-10 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="UserCog" className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-black tracking-tight leading-none text-white truncate">Admin del Panel</h3>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1 whitespace-nowrap truncate">Contacto Directo</p>
                            </div>
                        </div>

                        {/* Foto del representante */}
                        <div
                            className="relative group z-10 flex-shrink-0 ml-2"
                            role="button" tabIndex={0}
                            onClick={handlePhotoClick}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePhotoClick(); }}
                        >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer">
                                {data.rep_legal_foto && !photoError ? (
                                    <Image src={data.rep_legal_foto} fill sizes="64px" alt="Representante Legal" className="object-cover" onError={() => setPhotoError(true)} />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <Icon name="User" className="w-7 h-7 text-white/60" />
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Icon name="Camera" className="text-white w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            <div className="space-y-1">
                                <label htmlFor="admin_nombre" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Nombres y Apellidos <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="admin_nombre" type="text" name="admin_nombre" required readOnly={!isEditMode}
                                    value={data.admin_nombre} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.admin_nombre}
                                    aria-describedby={errors.admin_nombre ? 'admin_nombre-error' : undefined}
                                    className={getInputClassName('admin_nombre')} />
                                {errors.admin_nombre && (
                                    <p id="admin_nombre-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.admin_nombre}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="admin_dni" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    DNI Administrador
                                </label>
                                <input id="admin_dni" type="text" name="admin_dni" readOnly={!isEditMode} maxLength={8}
                                    value={data.admin_dni} onChange={handleInputChange} onKeyDown={allowOnlyNumbers} placeholder="8 dígitos"
                                    className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="admin_email" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Email de Gestión <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="admin_email" type="email" name="admin_email" required readOnly={!isEditMode}
                                    value={data.admin_email} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.admin_email}
                                    aria-describedby={errors.admin_email ? 'admin_email-error' : undefined}
                                    className={getInputClassName('admin_email')} />
                                {errors.admin_email && (
                                    <p id="admin_email-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.admin_email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Teléfonos de contacto
                                </label>
                                <div className="flex flex-col gap-3">
                                    <input id="phone_1" type="text" name="phone_1" readOnly={!isEditMode} placeholder="Principal"
                                        value={data.phone_1} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                    <input id="phone_2" type="text" name="phone_2" readOnly={!isEditMode} placeholder="Secundario / WhatsApp"
                                        value={data.phone_2} onChange={handleInputChange}
                                        className={`${fieldCls} ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 3. FINANZAS ── */}
                <div className={`xl:col-span-12 ${cardCls}`}>

                    <div className={cardHeaderCls}>
                        <div className="flex items-center gap-3 sm:gap-4 text-white relative z-10">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="Receipt" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-xl font-black tracking-tight leading-none text-white">Finanzas</h3>
                                <p className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest mt-1">
                                    Facturación y Cuentas
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 items-start">
                            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                                <label htmlFor="direccion_fiscal" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Dirección Fiscal <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <textarea id="direccion_fiscal" name="direccion_fiscal" required readOnly={!isEditMode} rows={1}
                                    value={data.direccion_fiscal} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.direccion_fiscal}
                                    aria-describedby={errors.direccion_fiscal ? 'direccion_fiscal-error' : undefined}
                                    className={`w-full text-xs font-black text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 rounded-xl outline-none transition-all duration-300 ${isEditMode ? EDIT_FIELD_CLASSES : READONLY_FIELD_CLASSES} ${
                                        errors.direccion_fiscal
                                            ? '!border-red-500 focus:!border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
                                            : 'border-gray-100 dark:border-[var(--border-subtle)] focus:border-sky-500'
                                    }`} />
                                {errors.direccion_fiscal && (
                                    <p id="direccion_fiscal-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.direccion_fiscal}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cuenta_bcp" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Cuenta BCP (Soles) <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="cuenta_bcp" type="text" name="cuenta_bcp" required readOnly={!isEditMode}
                                    maxLength={FIELD_MASKS.cuenta_bcp.length}
                                    inputMode="numeric" placeholder="xxx-xxxxxxxx-x-xx"
                                    value={applyMask(data.cuenta_bcp, FIELD_MASKS.cuenta_bcp)} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.cuenta_bcp}
                                    aria-describedby={errors.cuenta_bcp ? 'cuenta_bcp-error' : undefined}
                                    className={getInputClassName('cuenta_bcp')} />
                                {errors.cuenta_bcp && (
                                    <p id="cuenta_bcp-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.cuenta_bcp}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="cci" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    CCI <span className="text-red-500" aria-hidden="true">*</span>
                                    <span className="sr-only"> (obligatorio)</span>
                                </label>
                                <input id="cci" type="text" name="cci" required readOnly={!isEditMode}
                                    maxLength={FIELD_MASKS.cci.length}
                                    inputMode="numeric" placeholder="xxx-xxx-xxxxxxxxxxxx-xx"
                                    value={applyMask(data.cci, FIELD_MASKS.cci)} onChange={handleInputChange}
                                    aria-required="true"
                                    aria-invalid={!!errors.cci}
                                    aria-describedby={errors.cci ? 'cci-error' : undefined}
                                    className={getInputClassName('cci')} />
                                {errors.cci && (
                                    <p id="cci-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 font-semibold ml-1">
                                        <Icon name="AlertCircle" className="w-3.5 h-3.5 flex-shrink-0" />
                                        {errors.cci}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="bank_secondary" className="text-xs font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest ml-1">
                                    Entidad Bancaria Interbancaria
                                </label>
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