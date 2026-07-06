'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { Loader2, Lock, Mail, Phone, Building2, ArrowRight, CheckCircle, User, FileText, Globe, MapPin, File as FileIcon } from 'lucide-react';
import { SocialLoginButton } from '@/components/login/social/SocialLoginButton';
import type { RegisterFormData, UserType } from '../types/auth';

interface RegisterPanelProps {
    userType: UserType;
    error: string | null;
    success: string | null;
    isLoading: boolean;
    onSubmit: (data: RegisterFormData) => Promise<{ success: boolean }>;
    onClearError: () => void;
}

const LABELS: Record<UserType, { title: string; subtitle: string; buttonText: string }> = {
    vendedor: {
        title: 'Registro de Vendedor',
        subtitle: 'Completa tus datos para registrarte. El RPA evaluará tu solicitud automáticamente.',
        buttonText: 'Enviar Solicitud'
    },
    cliente: {
        title: 'Crea tu cuenta',
        subtitle: 'Ingresa tus datos para registrarte como cliente.',
        buttonText: 'Crear Cuenta'
    }
};

const CATEGORIAS = [
    { value: '', label: 'Selecciona una categoría' },
    { value: 'alimentos_saludables', label: 'Alimentos Saludables' },
    { value: 'suplementos', label: 'Suplementos Nutricionales' },
    { value: 'cosmetica_natural', label: 'Cosmética Natural' },
    { value: 'medicina_alternativa', label: 'Medicina Alternativa' },
    { value: 'equipos_medicos', label: 'Equipos Médicos' },
    { value: 'servicios_bienestar', label: 'Servicios de Bienestar' },
    { value: 'productos_organicos', label: 'Productos Orgánicos' },
    { value: 'otros', label: 'Otros' },
];

const TIPOS_EVIDENCIA: { value: RegisterFormData['tipoEvidencia']; label: string }[] = [
    { value: 'url', label: 'Sitio Web / Red Social' },
    { value: 'texto', label: 'Descripción del Negocio' },
    { value: 'catalogo', label: 'Catálogo de Productos (PDF)' },
    { value: 'ficha', label: 'Ficha Técnica (PDF)' },
    { value: 'boleta', label: 'Boleta de Venta (PDF)' },
    { value: 'factura', label: 'Factura (PDF)' },
];

const INITIAL_FORM: RegisterFormData = {
    storeName: '',
    email: '',
    phone: '',
    password: '',
    ruc: '',
    dni: '',
    categoria: '',
    descripcionActividad: '',
    tipoEvidencia: 'url',
    valorEvidencia: '',
    textoEvidencia: '',
    archivoPDF: null,
    contacto: '',
    domicilioLegal: '',
};

export function RegisterPanel({ userType, error, success, isLoading, onSubmit, onClearError }: RegisterPanelProps) {
    const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM);
    const errorRef = useRef<HTMLDivElement | null>(null);

    const labels = LABELS[userType];
    const isVendedor = userType === 'vendedor';

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setFormData(INITIAL_FORM);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // El error se renderiza arriba del contenedor scrolleable; si el usuario está
    // abajo (en el botón de enviar), sin esto nunca lo vería.
    useEffect(() => {
        if (error) {
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'ruc' || name === 'dni') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        onClearError();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, archivoPDF: file }));
        onClearError();
    };

    const necesitaPDF = ['catalogo', 'ficha', 'boleta', 'factura'].includes(formData.tipoEvidencia);

    return (
        <div className="flex flex-col h-full" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="flex-1 w-[90%] mx-auto">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] shadow-[0_10px_20px_rgba(14,165,233,0.1)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)] flex-shrink-0">
                        {isVendedor ? <Building2 className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">
                            {labels.title}
                        </h3>
                        <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm">
                            {labels.subtitle}
                        </p>
                    </div>
                </div>

                {error && (
                    <div ref={errorRef} role="alert" aria-live="polite" className="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div role="status" aria-live="polite" className="success-message mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={`grid ${isVendedor ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`} noValidate>
                    {isVendedor && (
                        <>
                            <div className="col-span-full">
                                <label htmlFor="store-name" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Nombre Comercial <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="store-name"
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="Ej: Mi Dulce Hogar"
                                        autoComplete="organization"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@tienda.com"
                                        autoComplete="email"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Teléfono <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="999 000 000"
                                        maxLength={9}
                                        inputMode="tel"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-dni" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    DNI <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-dni"
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleChange}
                                        placeholder="8 dígitos"
                                        maxLength={8}
                                        inputMode="numeric"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-ruc" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    RUC <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-ruc"
                                        type="text"
                                        name="ruc"
                                        value={formData.ruc}
                                        onChange={handleChange}
                                        placeholder="11 dígitos"
                                        maxLength={11}
                                        inputMode="numeric"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Contraseña <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="reg-categoria" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Categoría <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="reg-categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    required
                                    className="w-full py-3 px-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                >
                                    {CATEGORIAS.map(cat => (
                                        <option key={cat.value} value={cat.value} disabled={!cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="reg-descripcion" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Descripción de la Actividad <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reg-descripcion"
                                    name="descripcionActividad"
                                    value={formData.descripcionActividad}
                                    onChange={handleChange}
                                    placeholder="Describe brevemente la actividad de tu negocio..."
                                    rows={3}
                                    required
                                    className="w-full py-3 px-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300 resize-none"
                                />
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="reg-evidencia-tipo" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Tipo de Evidencia <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="reg-evidencia-tipo"
                                    name="tipoEvidencia"
                                    value={formData.tipoEvidencia}
                                    onChange={handleChange}
                                    className="w-full py-3 px-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                >
                                    {TIPOS_EVIDENCIA.map(te => (
                                        <option key={te.value} value={te.value}>{te.label}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.tipoEvidencia === 'url' && (
                                <div className="col-span-full">
                                    <label htmlFor="reg-evidencia-url" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        URL de Evidencia <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-evidencia-url"
                                            type="url"
                                            name="valorEvidencia"
                                            value={formData.valorEvidencia}
                                            onChange={handleChange}
                                            placeholder="https://tutienda.com"
                                            required
                                            className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.tipoEvidencia === 'texto' && (
                                <div className="col-span-full">
                                    <label htmlFor="reg-evidencia-texto" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Descripción del Negocio <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="reg-evidencia-texto"
                                        name="textoEvidencia"
                                        value={formData.textoEvidencia}
                                        onChange={handleChange}
                                        placeholder="Describe tu negocio, productos, experiencia..."
                                        rows={3}
                                        required
                                        className="w-full py-3 px-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300 resize-none"
                                    />
                                </div>
                            )}

                            {necesitaPDF && (
                                <div className="col-span-full">
                                    <label htmlFor="reg-evidencia-pdf" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                        Archivo PDF <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FileIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                        <input
                                            id="reg-evidencia-pdf"
                                            type="file"
                                            name="archivoPDF"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            required
                                            className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-[var(--bg-primary)] file:text-sky-600 dark:file:text-[var(--icons-green)] hover:file:bg-sky-100 dark:hover:file:bg-[var(--bg-secondary)]"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="reg-contacto" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Contacto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-contacto"
                                        type="text"
                                        name="contacto"
                                        value={formData.contacto}
                                        onChange={handleChange}
                                        placeholder="Nombre de contacto"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-domicilio" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Domicilio Legal <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-domicilio"
                                        type="text"
                                        name="domicilioLegal"
                                        value={formData.domicilioLegal}
                                        onChange={handleChange}
                                        placeholder="Dirección completa"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {!isVendedor && (
                        <>
                            <div>
                                <label htmlFor="store-name" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Tu Nombre <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="store-name"
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Pérez"
                                        autoComplete="name"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        autoComplete="email"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                    Contraseña <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                    <input
                                        id="reg-password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        required
                                        className="w-full py-3 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className={isVendedor ? 'col-span-full' : ''}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] dark:hover:shadow-[0_15px_35px_rgba(74,124,89,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Enviando solicitud...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{labels.buttonText}</span>
                                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-10" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-[var(--border-subtle)]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-[var(--bg-secondary)] px-3 text-slate-500 dark:text-[var(--text-secondary)]">
                                    o regístrate con
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SocialLoginButton provider="google" />
                            <SocialLoginButton provider="facebook" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
