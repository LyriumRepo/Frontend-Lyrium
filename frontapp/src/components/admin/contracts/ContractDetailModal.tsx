import React, { useState } from 'react';
import { StatusBadge, AuditTimeline } from './ContractsUIComponents';
import { Contract } from '@/lib/types/admin/contracts';
import { FileText, FolderOpen, CheckCircle, XCircle, Landmark, Shield, Calendar, Users, Eye, HelpCircle, Building2, Phone, Mail, MapPin, User, FileDigit, CreditCard } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';

interface ContractDetailModalProps {
    contract: Contract;
    onClose: () => void;
    onValidate: (id: string, data: Partial<Contract>) => void;
    onInvalidate: (id: string, data: Partial<Contract>) => void;
    onUpdateStatus?: (id: string, status: any, data: Partial<Contract>) => void;
}

const inputClass = "w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--celeste-500)]/10 focus:border-[var(--celeste-500)] rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] transition-all outline-none";
const labelClass = "text-[9px] font-black text-[var(--text-muted)] uppercase ml-1";
const sectionClass = "bg-[var(--bg-secondary)]/40 rounded-2xl p-5 border border-[var(--border-subtle)] space-y-4";
const sectionTitleClass = "flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-4";

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ 
    contract, 
    onClose, 
    onValidate, 
    onInvalidate,
    onUpdateStatus
}) => {
    const [formState, setFormState] = useState<Partial<Contract>>(() => ({ ...contract }));

    const isNewContract = !contract.company && !contract.ruc;

    const isFormComplete = !!(
        formState.company?.trim() &&
        formState.ruc?.trim() &&
        formState.rep?.trim() &&
        formState.dni?.trim() &&
        formState.direccion?.trim() &&
        formState.admin_name?.trim() &&
        formState.admin_phone?.trim() &&
        formState.admin_email?.trim() &&
        formState.plan?.trim() &&
        formState.start &&
        formState.end &&
        formState.modality
    );

    const handleChange = (field: string, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateStatus = (status: 'ACTIVE' | 'PENDING' | 'EXPIRED') => {
        if (onUpdateStatus) {
            onUpdateStatus(contract.id, status, formState);
        } else {
            if (status === 'ACTIVE') onValidate(contract.id, formState);
            else if (status === 'EXPIRED') onInvalidate(contract.id, formState);
        }
        onClose();
    };

    return (
        <div className="bg-[var(--bg-card)] w-full max-w-4xl rounded-2xl sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-industrial animate-scaleUp text-left border border-[var(--border-subtle)]">

            {/* Header */}
            <div className="px-4 py-5 sm:px-10 sm:py-8 border-b border-[var(--border-subtle)] flex justify-between items-center gap-3 bg-gradient-to-r from-[var(--celeste-500)]/10 to-zinc-900/10">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-center text-[var(--celeste-500)] shrink-0">
                        <FileText className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm sm:text-xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none">
                            {isNewContract ? 'Registrar Nuevo Contrato' : 'Expediente Legal Vendedor'}
                        </h3>
                        <p className="text-[10px] font-black text-[var(--celeste-500)] uppercase tracking-[0.2em] mt-1 sm:mt-2 truncate">
                            ID Contrato: {contract.id}
                        </p>
                    </div>
                </div>
                <StatusBadge status={contract.status} large />
            </div>

            {/* Formulario — 3 secciones */}
            <div className="p-4 sm:p-10 overflow-y-auto custom-scrollbar max-h-[55vh] sm:max-h-[65vh] space-y-6 sm:space-y-8">

                {/* ═══ SECCIÓN 1: DATOS DEL VENDEDOR ═══ */}
                <div className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <Building2 className="w-4 h-4 text-[var(--celeste-500)]" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                            Datos del Vendedor
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Nombre / Razón Social</label>
                            <input type="text" value={formState.company || ''} onChange={(e) => handleChange('company', e.target.value)} className={inputClass} placeholder="Nombre comercial / Razón social" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>RUC Fiscal</label>
                            <input type="text" value={formState.ruc || ''} onChange={(e) => handleChange('ruc', e.target.value)} className={`${inputClass} font-mono`} placeholder="RUC de 11 dígitos" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>DNI</label>
                            <input type="text" value={formState.dni || ''} onChange={(e) => handleChange('dni', e.target.value)} className={inputClass} placeholder="DNI del representante" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Representante Legal</label>
                            <input type="text" value={formState.rep || ''} onChange={(e) => handleChange('rep', e.target.value)} className={inputClass} placeholder="Nombre completo" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className={labelClass}>Dirección</label>
                            <input type="text" value={formState.direccion || ''} onChange={(e) => handleChange('direccion', e.target.value)} className={inputClass} placeholder="Dirección fiscal / comercial" />
                        </div>
                    </div>
                </div>

                {/* ═══ SECCIÓN 2: DATOS DEL ADMINISTRADOR ═══ */}
                <div className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <User className="w-4 h-4 text-[var(--celeste-500)]" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                            Datos del Administrador del Contrato
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Nombre Completo</label>
                            <input type="text" value={formState.admin_name || ''} onChange={(e) => handleChange('admin_name', e.target.value)} className={inputClass} placeholder="Nombre del administrador" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Teléfono</label>
                            <input type="text" value={formState.admin_phone || ''} onChange={(e) => handleChange('admin_phone', e.target.value)} className={inputClass} placeholder="Número de contacto" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>E-mail</label>
                            <input type="email" value={formState.admin_email || ''} onChange={(e) => handleChange('admin_email', e.target.value)} className={inputClass} placeholder="Correo electrónico" />
                        </div>
                    </div>
                </div>

                {/* ═══ SECCIÓN 3: PLAN Y FECHAS ═══ */}
                <div className={sectionClass}>
                    <div className={sectionTitleClass}>
                        <CreditCard className="w-4 h-4 text-[var(--celeste-500)]" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                            Plan y Vigencia
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className={labelClass}>Modalidad</label>
                            <select value={formState.modality || ''} onChange={(e) => handleChange('modality', e.target.value)} className={`${inputClass} cursor-pointer`}>
                                <option value="VIRTUAL">VIRTUAL (DIGITAL)</option>
                                <option value="PHYSICAL">PRESENCIAL (FÍSICO)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Plan</label>
                            <select value={formState.plan || ''} onChange={(e) => handleChange('plan', e.target.value)} className={`${inputClass} cursor-pointer`}>
                                <option value="">Seleccione plan...</option>
                                <option value="Emprende">Emprende (5% comisión)</option>
                                <option value="Crece">Crece (10% comisión)</option>
                                <option value="Especial">Especial (15% comisión)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Fecha de Firma</label>
                            <input type="date" value={formState.start || ''} onChange={(e) => handleChange('start', e.target.value)} className={`${inputClass} uppercase`} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Vencimiento</label>
                            <input type="date" value={formState.end || ''} onChange={(e) => handleChange('end', e.target.value)} className={`${inputClass} uppercase`} />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelClass}>Ruta de Almacenamiento</label>
                            <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-xl px-4 py-3 border border-[var(--border-subtle)]">
                                <FolderOpen className="w-5 h-5 text-[var(--celeste-500)] shrink-0" />
                                <span className="text-[10px] font-mono font-black text-[var(--celeste-500)] truncate">
                                    {formState.storage_path || 'pendiente_de_carga.pdf'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="px-4 py-4 sm:px-10 sm:py-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {isNewContract ? (
                        <button onClick={() => handleUpdateStatus('ACTIVE')} disabled={!isFormComplete}
                            className="h-10 sm:h-12 rounded-xl flex items-center justify-center gap-2 px-4 sm:px-6 bg-[var(--icons-green)] hover:bg-[var(--icons-green)] active:bg-[var(--icons-green)] text-white border-0 shadow-lg shadow-[var(--icons-green)]/20 font-black text-xs uppercase tracking-widest disabled:opacity-45 disabled:cursor-not-allowed duration-300 transition-all active:scale-[0.97]">
                            <CheckCircle className="w-4 h-4 shrink-0" /> Validar y Activar
                        </button>
                    ) : (
                        <>
                            <button onClick={() => handleUpdateStatus('ACTIVE')}
                                className="h-10 sm:h-12 rounded-xl flex items-center justify-center gap-2 px-4 sm:px-6 bg-[var(--icons-green)] hover:bg-[var(--icons-green)] active:bg-[var(--icons-green)] text-white border-0 shadow-lg shadow-[var(--icons-green)]/20 font-black text-xs uppercase tracking-widest duration-300 transition-all active:scale-[0.97]">
                                <CheckCircle className="w-4 h-4 shrink-0" /> Validar y Activar
                            </button>
                            <button onClick={() => handleUpdateStatus('PENDING')}
                                className="h-10 sm:h-12 rounded-xl border border-[var(--icons-green)] text-[var(--icons-green)] hover:bg-[var(--icons-green)]/10 flex items-center justify-center gap-2 px-4 sm:px-6 font-black text-xs uppercase tracking-widest duration-300 transition-all active:scale-[0.97]">
                                <FileText className="w-4 h-4 shrink-0" /> En revisión
                            </button>
                            <button onClick={() => handleUpdateStatus('EXPIRED')}
                                className="h-10 sm:h-12 rounded-xl border border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 flex items-center justify-center gap-2 px-4 sm:px-6 font-black text-xs uppercase tracking-widest duration-300 transition-all active:scale-[0.97]">
                                <XCircle className="w-4 h-4 shrink-0" /> Rechazado
                            </button>
                        </>
                    )}
                </div>
                <button onClick={onClose} className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--celeste-500)] uppercase tracking-widest transition-all hover:translate-x-1 flex items-center gap-1.5 shrink-0">
                    Volver al Panel
                </button>
            </div>
        </div>
    );
};
