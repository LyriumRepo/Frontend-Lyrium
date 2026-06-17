'use client';

import { FormEvent, useState, useEffect } from 'react';
import {
    Loader2, Lock, Mail, Phone, Building2, ArrowRight, CheckCircle,
    IdCard, Tag, FileText, Link as LinkIcon, Upload, User, MapPin,
    ScrollText, X, ExternalLink, ShieldCheck,
} from 'lucide-react';
import { SocialLoginButton } from '@/components/login/social/SocialLoginButton';
import type { RegisterFormData, UserType, TipoEvidencia, ContratoPreviewResponse } from '../types/auth';

// URL base de Laravel — misma convención que useAuthForm.ts
const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

// Rutas de los PDFs estáticos de T&C (deben estar en /public/docs/)
const TC_VENDEDOR_PDF = '/docs/terminos-vendedor.pdf';
const TC_CLIENTE_PDF  = '/docs/terminos-cliente.pdf';

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
        title: 'Crea tu tienda',
        subtitle: 'Ingresa los detalles para configurar tu perfil de vendedor.',
        buttonText: 'Crear Tienda'
    },
    cliente: {
        title: 'Crea tu cuenta',
        subtitle: 'Ingresa tus datos para registrarte como cliente.',
        buttonText: 'Crear Cuenta'
    }
};

// Categorías del marketplace — el `value` es el slug que usa el motor RPA
// (debe coincidir EXACTAMENTE con las claves de KEYWORDS_CATEGORIA en engine.js)
const CATEGORIAS: { value: string; label: string }[] = [
    { value: 'alimentos_saludables', label: 'Alimentos saludables / orgánicos' },
    { value: 'atencion_medica',      label: 'Atención médica' },
    { value: 'fitness_bienestar',    label: 'Fitness y bienestar físico' },
    { value: 'mascotas',             label: 'Mascotas' },
    { value: 'medicina_natural',     label: 'Medicina natural, suplementos y vitaminas' },
    { value: 'productos_ecologicos', label: 'Productos ecológicos' },
    { value: 'tecnologia_medica',    label: 'Tecnología médica' },
];

const EVIDENCIA_OPTIONS: { value: TipoEvidencia; label: string }[] = [
    { value: 'url',      label: 'Sitio web / red social (URL)' },
    { value: 'catalogo', label: 'Catálogo de productos (PDF)' },
    { value: 'ficha',    label: 'Ficha técnica de producto (PDF)' },
    { value: 'boleta',   label: 'Boleta de venta (PDF)' },
    { value: 'factura',  label: 'Factura (PDF)' },
];

const PDF_TIPOS: TipoEvidencia[] = ['catalogo', 'ficha', 'boleta', 'factura'];

const EMPTY_FORM: RegisterFormData = {
    storeName:            '',
    contacto:             '',
    domicilioLegal:       '',
    email:                '',
    phone:                '',
    password:             '',
    ruc:                  '',
    dni:                  '',
    categoria:            '',
    descripcionActividad: '',
    tipoEvidencia:        '',
    textoEvidencia:       '',
    valorEvidencia:       '',
    archivoPDF:           null,
};

export function RegisterPanel({
    userType,
    error,
    success,
    isLoading,
    onSubmit,
    onClearError
}: RegisterPanelProps) {
    const [formData, setFormData]             = useState<RegisterFormData>(EMPTY_FORM);
    const [fileError, setFileError]           = useState<string | null>(null);

    // ── Estado del flujo de acuerdo comercial ─────────────────────────────────
    const [showTCModal, setShowTCModal]           = useState(false);  // modal T&C (2 PDFs)
    const [showAcuerdoModal, setShowAcuerdoModal] = useState(false);  // modal acuerdo pre-llenado
    const [acuerdoHtml, setAcuerdoHtml]           = useState('');     // HTML devuelto por Laravel
    const [contratoAceptado, setContratoAceptado] = useState(false);  // usuario aceptó el acuerdo
    const [loadingPreview, setLoadingPreview]     = useState(false);  // cargando preview
    const [previewError, setPreviewError]         = useState<string | null>(null);

    const labels     = LABELS[userType];
    const isVendedor = userType === 'vendedor';
    const requiresPDF = PDF_TIPOS.includes(formData.tipoEvidencia);

    // ── El checkbox de acuerdo se habilita solo cuando todos los campos ────────
    // requeridos del vendedor están completos.
    const isFormComplete = isVendedor && (
        formData.storeName.trim()            !== '' &&
        formData.contacto.trim()             !== '' &&
        formData.domicilioLegal.trim()       !== '' &&
        formData.email.trim()                !== '' &&
        formData.phone.trim()                !== '' &&
        formData.password.trim()             !== '' &&
        formData.ruc.length                  === 11 &&
        formData.dni.length                  === 8  &&
        formData.categoria                   !== '' &&
        formData.descripcionActividad.trim() !== '' &&
        formData.tipoEvidencia               !== '' &&
        (
            formData.tipoEvidencia === 'url'    ? formData.valorEvidencia.trim() !== '' :
            formData.tipoEvidencia === 'texto'  ? formData.textoEvidencia.trim() !== '' :
            requiresPDF                         ? formData.archivoPDF !== null
                                                : true
        )
    );

    // ── Resetear aceptación si el usuario modifica el formulario ──────────────
    // (el HTML del acuerdo ya no reflejaría los datos actuales)
    const resetContrato = () => {
        setContratoAceptado(false);
        setAcuerdoHtml('');
        setPreviewError(null);
    };

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setFormData(EMPTY_FORM);
                setFileError(null);
                resetContrato();
            }, 3000);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success]);

    // ── Handlers del formulario ───────────────────────────────────────────────

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isVendedor && requiresPDF && !formData.archivoPDF) {
            setFileError('Debes adjuntar un archivo PDF para este tipo de evidencia.');
            return;
        }

        // El vendedor debe haber aceptado el acuerdo antes de enviar
        if (isVendedor && !contratoAceptado) {
            setPreviewError('Debes leer y aceptar el Acuerdo Comercial para continuar.');
            return;
        }

        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'phone' || name === 'ruc' || name === 'dni') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Si ya había aceptado el acuerdo y cambia un dato, necesita re-aceptar
        if (contratoAceptado) resetContrato();
        onClearError();
    };

    const handleTipoEvidenciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tipo = e.target.value as TipoEvidencia;
        setFormData(prev => ({
            ...prev,
            tipoEvidencia: tipo,
            textoEvidencia: '',
            valorEvidencia: '',
            archivoPDF: null,
        }));
        setFileError(null);
        if (contratoAceptado) resetContrato();
        onClearError();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file && file.type !== 'application/pdf') {
            setFileError('Solo se permiten archivos PDF.');
            setFormData(prev => ({ ...prev, archivoPDF: null }));
            return;
        }
        if (file && file.size > 10 * 1024 * 1024) {
            setFileError('El archivo no debe superar los 10 MB.');
            setFormData(prev => ({ ...prev, archivoPDF: null }));
            return;
        }

        setFileError(null);
        setFormData(prev => ({ ...prev, archivoPDF: file }));
        if (contratoAceptado) resetContrato();
    };

    // ── Handler del checkbox de acuerdo ───────────────────────────────────────
    // Si ya estaba aceptado → desmarca.
    // Si no → llama a Laravel para obtener el HTML del acuerdo pre-llenado
    // y abre el modal de previsualización.
    const handleCheckboxAcuerdo = async () => {
        if (contratoAceptado) {
            resetContrato();
            return;
        }

        setPreviewError(null);
        setLoadingPreview(true);

        try {
            const resp = await fetch(`${LARAVEL_API}/contracts/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    storeName:       formData.storeName,
                    contacto:        formData.contacto,
                    domicilio_legal: formData.domicilioLegal,
                    ruc:             formData.ruc,
                    dni:             formData.dni,
                    phone:           formData.phone,
                    email:           formData.email,
                }),
            });

            if (!resp.ok) throw new Error('El servidor no pudo generar el acuerdo.');

            const data: ContratoPreviewResponse = await resp.json();
            setAcuerdoHtml(data.html);
            setShowAcuerdoModal(true);

        } catch {
            setPreviewError('No se pudo cargar el acuerdo. Verifica tu conexión e intenta de nuevo.');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleAceptarAcuerdo = () => {
        setContratoAceptado(true);
        setShowAcuerdoModal(false);
    };

    const handleRechazarAcuerdo = () => {
        setContratoAceptado(false);
        setShowAcuerdoModal(false);
    };

    // ── Clases reutilizables ──────────────────────────────────────────────────
    const inputClass  = "w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300";
    const labelClass  = "block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2";
    const iconClass   = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none";

    return (
        <>
        <div className="flex flex-col h-full">
            <div className="flex-1 w-[90%] mx-auto">
                {/* Encabezado del panel */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] shadow-[0_10px_20px_rgba(14,165,233,0.1)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)] flex-shrink-0">
                        {userType === 'vendedor' ? <Building2 className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
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

                {/* Alertas globales */}
                {error && (
                    <div role="alert" aria-live="polite" className="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm whitespace-pre-line">
                        {error}
                    </div>
                )}
                {success && (
                    <div role="status" aria-live="polite" className="success-message mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={`grid ${isVendedor ? 'grid-cols-2' : 'grid-cols-1'} gap-5`} noValidate>

                    {/* ── Nombre Comercial + Contacto (fila 1, vendedor) ─────── */}
                    {isVendedor ? (
                        <>
                            {/* Nombre Comercial — col 1 */}
                            <div>
                                <label htmlFor="store-name" className={labelClass}>
                                    Nombre Comercial <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className={iconClass} aria-hidden="true" />
                                    <input
                                        id="store-name"
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="¿Cómo te conocen tus clientes?"
                                        autoComplete="organization"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Contacto (nombre del representante) — col 2 */}
                            <div>
                                <label htmlFor="reg-contacto" className={labelClass}>
                                    Contacto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className={iconClass} aria-hidden="true" />
                                    <input
                                        id="reg-contacto"
                                        type="text"
                                        name="contacto"
                                        value={formData.contacto}
                                        onChange={handleChange}
                                        placeholder="Nombre para contacto"
                                        autoComplete="name"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Domicilio Legal — col-span-2 */}
                            <div className="col-span-2">
                                <label htmlFor="reg-domicilio" className={labelClass}>
                                    Domicilio Legal <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className={iconClass} aria-hidden="true" />
                                    <input
                                        id="reg-domicilio"
                                        type="text"
                                        name="domicilioLegal"
                                        value={formData.domicilioLegal}
                                        onChange={handleChange}
                                        placeholder="Dirección legal registrada de tu empresa"
                                        autoComplete="street-address"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Cliente: solo Nombre (col-span-1, grid de 1 col) */
                        <div>
                            <label htmlFor="store-name" className={labelClass}>
                                Tu Nombre <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Building2 className={iconClass} aria-hidden="true" />
                                <input
                                    id="store-name"
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    placeholder="Ej: Juan Pérez"
                                    autoComplete="name"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Email ────────────────────────────────────────────────── */}
                    <div>
                        <label htmlFor="reg-email" className={labelClass}>
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className={iconClass} aria-hidden="true" />
                            <input
                                id="reg-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={isVendedor ? 'email@tienda.com' : 'tu@email.com'}
                                autoComplete="email"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* ── Teléfono (solo vendedor) ─────────────────────────────── */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-phone" className={labelClass}>
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className={iconClass} aria-hidden="true" />
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
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Contraseña ───────────────────────────────────────────── */}
                    <div>
                        <label htmlFor="reg-password" className={labelClass}>
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className={iconClass} aria-hidden="true" />
                            <input
                                id="reg-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* ── RUC (solo vendedor) ──────────────────────────────────── */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-ruc" className={labelClass}>
                                RUC <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <CheckCircle className={iconClass} aria-hidden="true" />
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
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── DNI Representante Legal (solo vendedor) ──────────────── */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-dni" className={labelClass}>
                                DNI Representante Legal <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <IdCard className={iconClass} aria-hidden="true" />
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
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Categoría (solo vendedor) ────────────────────────────── */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-categoria" className={labelClass}>
                                Categoría del negocio <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Tag className={iconClass} aria-hidden="true" />
                                <select
                                    id="reg-categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    required
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Selecciona una categoría</option>
                                    {CATEGORIAS.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Descripción del negocio (solo vendedor) ─────────────── */}
                    {/* No se guarda en BD — solo lo usa el RPA para la evaluación */}
                    {isVendedor && (
                        <div className="col-span-2">
                            <label htmlFor="reg-descripcion-actividad" className={labelClass}>
                                Describe brevemente a qué se dedica tu negocio <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reg-descripcion-actividad"
                                name="descripcionActividad"
                                value={formData.descripcionActividad}
                                onChange={handleChange}
                                placeholder="Ej: Vendemos suplementos naturales y vitaminas a base de hierbas andinas..."
                                required
                                rows={3}
                                className="w-full p-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300 resize-none"
                            />
                        </div>
                    )}

                    {/* ── Tipo de evidencia (solo vendedor) ───────────────────── */}
                    {isVendedor && (
                        <div className="col-span-2">
                            <label htmlFor="reg-tipo-evidencia" className={labelClass}>
                                ¿Cómo deseas evidenciar tu actividad comercial? <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText className={iconClass} aria-hidden="true" />
                                <select
                                    id="reg-tipo-evidencia"
                                    name="tipoEvidencia"
                                    value={formData.tipoEvidencia}
                                    onChange={handleTipoEvidenciaChange}
                                    required
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Selecciona una opción</option>
                                    {EVIDENCIA_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Evidencia URL (condicional) ──────────────────────────── */}
                    {isVendedor && formData.tipoEvidencia === 'url' && (
                        <div className="col-span-2">
                            <label htmlFor="reg-url-evidencia" className={labelClass}>
                                URL de tu sitio web o red social <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LinkIcon className={iconClass} aria-hidden="true" />
                                <input
                                    id="reg-url-evidencia"
                                    type="url"
                                    name="valorEvidencia"
                                    value={formData.valorEvidencia}
                                    onChange={handleChange}
                                    placeholder="https://www.mitienda.com"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Evidencia PDF (condicional) ──────────────────────────── */}
                    {isVendedor && requiresPDF && (
                        <div className="col-span-2">
                            <label htmlFor="reg-archivo-pdf" className={labelClass}>
                                Adjunta el documento (PDF) <span className="text-red-500">*</span>
                            </label>
                            <label
                                htmlFor="reg-archivo-pdf"
                                className="flex items-center gap-3 w-full py-3.5 px-4 border-2 border-dashed border-slate-300 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-500 dark:text-[var(--text-secondary)] bg-slate-50 dark:bg-[var(--bg-primary)] hover:border-sky-500 dark:hover:border-[var(--icons-green)] cursor-pointer transition-all duration-300"
                            >
                                <Upload className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">
                                    {formData.archivoPDF ? formData.archivoPDF.name : 'Seleccionar archivo PDF (máx. 10MB)'}
                                </span>
                            </label>
                            <input
                                id="reg-archivo-pdf"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                            {fileError && (
                                <p className="mt-2 text-xs text-red-500 font-medium">{fileError}</p>
                            )}
                        </div>
                    )}

                    {/* ── Sección T&C y Acuerdo Comercial (solo vendedor) ──────── */}
                    {isVendedor && (
                        <div className="col-span-2 border-t border-slate-100 dark:border-[var(--border-subtle)] pt-5 space-y-3">

                            {/* Link para ver los Términos y Condiciones */}
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[var(--text-secondary)]">
                                <ScrollText className="w-4 h-4 flex-shrink-0 text-sky-400 dark:text-[var(--icons-green)]" />
                                <span>Antes de continuar, revisa nuestros</span>
                                <button
                                    type="button"
                                    onClick={() => setShowTCModal(true)}
                                    className="text-sky-500 dark:text-[var(--icons-green)] font-semibold underline underline-offset-2 hover:text-sky-600 transition-colors"
                                >
                                    Términos y Condiciones
                                </button>
                            </div>

                            {/* Checkbox del Acuerdo Comercial */}
                            <div className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-300 ${
                                contratoAceptado
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                                    : isFormComplete
                                        ? 'border-sky-200 dark:border-[var(--border-subtle)] bg-sky-50/50 dark:bg-[var(--bg-primary)]'
                                        : 'border-slate-200 dark:border-[var(--border-subtle)] bg-slate-50 dark:bg-[var(--bg-primary)] opacity-60'
                            }`}>
                                <div className="relative mt-0.5 flex-shrink-0">
                                    {loadingPreview ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-sky-500 dark:text-[var(--icons-green)]" />
                                    ) : (
                                        <input
                                            id="check-acuerdo"
                                            type="checkbox"
                                            checked={contratoAceptado}
                                            disabled={!isFormComplete || loadingPreview}
                                            onChange={handleCheckboxAcuerdo}
                                            className="w-5 h-5 rounded border-2 border-slate-300 dark:border-[var(--border-subtle)] text-sky-500 dark:text-[var(--icons-green)] cursor-pointer disabled:cursor-not-allowed accent-sky-500"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label
                                        htmlFor="check-acuerdo"
                                        className={`text-sm font-semibold leading-tight ${
                                            isFormComplete
                                                ? 'text-slate-700 dark:text-[var(--text-primary)] cursor-pointer'
                                                : 'text-slate-400 dark:text-[var(--text-secondary)] cursor-not-allowed'
                                        }`}
                                    >
                                        He leído y acepto el{' '}
                                        <span className="text-sky-500 dark:text-[var(--icons-green)]">
                                            Acuerdo Comercial de Prestación de Servicios
                                        </span>{' '}
                                        de Lyrium Biomarketplace
                                        <span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    {!isFormComplete && (
                                        <p className="mt-1 text-xs text-slate-400 dark:text-[var(--text-secondary)]">
                                            Completa todos los campos del formulario para acceder al acuerdo.
                                        </p>
                                    )}
                                    {contratoAceptado && (
                                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Acuerdo revisado y aceptado
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Error al cargar el preview */}
                            {previewError && (
                                <p className="text-xs text-red-500 font-medium">{previewError}</p>
                            )}
                        </div>
                    )}

                    {/* ── Botón de submit + social login ───────────────────────── */}
                    <div className={isVendedor ? 'col-span-2' : ''}>
                        <button
                            type="submit"
                            disabled={isLoading || (isVendedor && !contratoAceptado)}
                            className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] dark:hover:shadow-[0_15px_35px_rgba(74,124,89,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{isVendedor ? 'Evaluando solicitud...' : 'Registrando...'}</span>
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

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* Modal 1 — Términos y Condiciones (2 PDFs estáticos)               */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {showTCModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
                    onClick={() => setShowTCModal(false)}
                    role="presentation"
                    aria-hidden="true"
                />

                {/* Panel */}
                <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <ScrollText className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                            <h2 className="text-base font-bold text-slate-800 dark:text-[var(--text-primary)]">
                                Términos y Condiciones
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTCModal(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--bg-primary)] transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
                            Revisa los documentos antes de aceptar el Acuerdo Comercial:
                        </p>

                        {/* Documento 1 */}
                        <a
                            href={TC_VENDEDOR_PDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-[var(--border-subtle)] hover:border-sky-400 dark:hover:border-[var(--icons-green)] bg-slate-50 dark:bg-[var(--bg-primary)] transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)]">
                                    Términos y Condiciones del Vendedor
                                </p>
                                <p className="text-xs text-slate-400 dark:text-[var(--text-secondary)] mt-0.5">
                                    Condiciones aplicables a sellers de Lyrium Biomarketplace
                                </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-[var(--icons-green)] transition-colors flex-shrink-0" />
                        </a>

                        {/* Documento 2 */}
                        <a
                            href={TC_CLIENTE_PDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-[var(--border-subtle)] hover:border-sky-400 dark:hover:border-[var(--icons-green)] bg-slate-50 dark:bg-[var(--bg-primary)] transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)]">
                                    Términos y Condiciones del Cliente
                                </p>
                                <p className="text-xs text-slate-400 dark:text-[var(--text-secondary)] mt-0.5">
                                    Condiciones generales para compradores en la plataforma
                                </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-[var(--icons-green)] transition-colors flex-shrink-0" />
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <button
                            type="button"
                            onClick={() => setShowTCModal(false)}
                            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[var(--bg-primary)] text-slate-600 dark:text-[var(--text-primary)] text-sm font-semibold hover:bg-slate-200 dark:hover:bg-[var(--bg-primary)]/80 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* Modal 2 — Previsualización del Acuerdo Comercial pre-llenado       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {showAcuerdoModal && acuerdoHtml && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop — no cierra al hacer clic: el usuario debe decidir */}
                <div className="absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md" aria-hidden="true" />

                {/* Panel */}
                <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[var(--border-subtle)] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                            <h2 className="text-base font-bold text-slate-800 dark:text-[var(--text-primary)]">
                                Acuerdo Comercial — solo lectura
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleRechazarAcuerdo}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[var(--bg-primary)] transition-colors"
                            aria-label="Cerrar sin aceptar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Aviso de solo lectura */}
                    <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/40 flex-shrink-0">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            Este documento ha sido generado con tus datos. Léelo detenidamente antes de aceptar.
                            No podrás descargarlo desde aquí — estará disponible para el administrador una vez procesada tu solicitud.
                        </p>
                    </div>

                    {/* Contenido del acuerdo (HTML desde Laravel) */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div
                            className="prose prose-sm max-w-none text-slate-700 dark:text-[var(--text-primary)]
                                       prose-headings:text-slate-900 dark:prose-headings:text-[var(--text-primary)]
                                       prose-strong:text-slate-800 dark:prose-strong:text-[var(--text-primary)]"
                            dangerouslySetInnerHTML={{ __html: acuerdoHtml }}
                        />
                    </div>

                    {/* Acciones */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-[var(--border-subtle)] flex gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={handleRechazarAcuerdo}
                            className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-primary)] text-sm font-semibold hover:bg-slate-50 dark:hover:bg-[var(--bg-primary)] transition-colors"
                        >
                            No acepto — Volver
                        </button>
                        <button
                            type="button"
                            onClick={handleAceptarAcuerdo}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white text-sm font-bold shadow-[0_8px_20px_rgba(14,165,233,0.3)] hover:shadow-[0_12px_25px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Acepto el Acuerdo Comercial
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}