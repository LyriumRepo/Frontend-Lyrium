import React, { useState } from 'react';
import { StatusBadge, AuditTimeline } from './ContractsUIComponents';
import { Contract } from '@/lib/types/admin/contracts';
import { FileText, FolderOpen, CheckCircle, XCircle, Landmark, Shield, Calendar, Users, Eye, HelpCircle } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';

interface ContractDetailModalProps {
    contract: Contract;
    onClose: () => void;
    onValidate: (id: string, data: Partial<Contract>) => void;
    onInvalidate: (id: string, data: Partial<Contract>) => void;
    onUpdateStatus?: (id: string, status: any, data: Partial<Contract>) => void;
}

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
        formState.start &&
        formState.end &&
        formState.modality &&
        formState.plan &&
        formState.phone?.trim() &&
        formState.email?.trim() &&
        formState.address?.trim() &&
        formState.dni?.trim()
    );

    const handleChange = (field: string, value: string) => {
        setFormState(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'modality' && value === 'VIRTUAL') {
                next.plan = 'Plan emprende';
            }
            return next;
        });
    };
    const handleUpdateStatus = (status: 'ACTIVE' | 'PENDING' | 'EXPIRED') => {
        if (onUpdateStatus) {
            onUpdateStatus(contract.id, status, formState);
        } else {
            if (status === 'ACTIVE') onValidate(contract.id, formState);
            else if (status === 'EXPIRED') onInvalidate(contract.id, formState);
        }
    };

    return (
        <div 
            style={{
                ['--icons-green' as any]: '#8FC3A1',
                ['--brand-green' as any]: '#2A5A4D',
                ['--brand-green-hover' as any]: '#0F2A24',
            }}
            className="bg-[var(--bg-card)] w-full max-w-4xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-industrial animate-scaleUp text-left border border-[var(--border-subtle)]"
        >
            
            <div className="px-10 py-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--color-info)] dark:bg-[var(--brand-green-hover)]">
                <div className="flex items-center gap-5">
                    <div 
                        className="w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center shrink-0 bg-white/10 border border-white/20 dark:bg-[var(--bg-card)] dark:border-[var(--icon-secondary)] text-white dark:text-[var(--icon-primary)]"
                    >
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 
                            className="text-xl font-black tracking-tight uppercase leading-none text-white dark:text-[var(--icon-primary)]"
                        >
                            {isNewContract ? 'Registrar Nuevo Contrato' : 'Expediente Legal Vendedor'}
                        </h3>
                        <p 
                            className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-[#e0f2fe] dark:text-[var(--icon-secondary)]"
                        >
                            ID Contrato: {contract.id}
                        </p>
                    </div>
                </div>
                <StatusBadge status={contract.status} large />
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar max-h-[60vh]">
                <div className="md:col-span-7 space-y-6">
                    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                        <Shield className="w-4 h-4 text-[var(--icons-green)]" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                            Metadata Estructural (RF-16)
                        </h4>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="contract-company" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                Razón Social
                            </label>
                            <input
                                id="contract-company"
                                type="text"
                                value={formState.company || ''}
                                onChange={(e) => handleChange('company', e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                placeholder="Nombre comercial / Razón social"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-ruc" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    RUC Fiscal
                                </label>
                                <input
                                    id="contract-ruc"
                                    type="text"
                                    value={formState.ruc || ''}
                                    onChange={(e) => handleChange('ruc', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial font-mono"
                                    placeholder="RUC de 11 dígitos"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-rep" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Representante
                                </label>
                                <input
                                    id="contract-rep"
                                    type="text"
                                    value={formState.rep || ''}
                                    onChange={(e) => handleChange('rep', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                    placeholder="Nombre completo"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-phone" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Número de Teléfono
                                </label>
                                <input
                                    id="contract-phone"
                                    type="text"
                                    value={formState.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                    placeholder="Número de teléfono"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-email" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Correo
                                </label>
                                <input
                                    id="contract-email"
                                    type="email"
                                    value={formState.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                    placeholder="Correo electrónico"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-address" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Dirección
                                </label>
                                <input
                                    id="contract-address"
                                    type="text"
                                    value={formState.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                    placeholder="Dirección"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-dni" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    DNI
                                </label>
                                <input
                                    id="contract-dni"
                                    type="text"
                                    value={formState.dni || ''}
                                    onChange={(e) => handleChange('dni', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial font-mono"
                                    placeholder="DNI de 8 dígitos"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-modality" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Modalidad
                                </label>
                                <select
                                    id="contract-modality"
                                    value={formState.modality || ''}
                                    onChange={(e) => handleChange('modality', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial cursor-pointer"
                                >
                                    <option value="VIRTUAL">VIRTUAL (DIGITAL)</option>
                                    <option value="PHYSICAL">PRESENCIAL (FÍSICO)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-plan" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Plan
                                </label>
                                <select
                                    id="contract-plan"
                                    value={formState.plan || ''}
                                    onChange={(e) => handleChange('plan', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial cursor-pointer"
                                >
                                    <option value="">Seleccione plan...</option>
                                    <option value="Plan emprende">Plan emprende</option>
                                    <option value="plan crece">plan crece</option>
                                    <option value="plan especial">plan especial</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-start" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Fecha de Firma
                                </label>
                                <input
                                    id="contract-start"
                                    type="date"
                                    value={formState.start || ''}
                                    onChange={(e) => handleChange('start', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-end" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Vencimiento
                                </label>
                                <input
                                    id="contract-end"
                                    type="date"
                                    value={formState.end || ''}
                                    onChange={(e) => handleChange('end', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-[var(--brand-green)]/10 focus:border-[var(--brand-green)] rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[var(--brand-green)]/5 rounded-2xl border border-[var(--brand-green)]/10 flex gap-4 items-center mt-6">
                        <FolderOpen className="w-8 h-8 text-[var(--icons-green)] opacity-40 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-[var(--icons-green)] uppercase mb-0.5 tracking-wider">Nodo Criptográfico Legal</p>
                            <p className="text-[10px] font-black text-[var(--brand-green)] dark:text-[var(--icons-green)] truncate max-w-[200px] font-mono">
                                {formState.storage_path || 'pendiente_de_carga.pdf'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-6">
                            <Users className="w-4 h-4 text-[var(--icons-green)]" />
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                                Historial de Modificaciones
                            </h4>
                        </div>
                        <div className="flex-1 min-h-[180px]">
                            <AuditTimeline events={contract.auditTrail} />
                        </div>
                    </div>

                    {isNewContract ? (
                        <div className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
                            <BaseButton
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                variant="primary"
                                disabled={!isFormComplete}
                                className="w-full h-14 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl shadow-[var(--brand-green)]/20 !bg-[var(--brand-green)] hover:!bg-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-widest disabled:opacity-45 disabled:cursor-not-allowed duration-300"
                            >
                                <CheckCircle className="w-5 h-5 shrink-0" /> Validar y Activar
                            </BaseButton>
                            <BaseButton
                                onClick={() => handleUpdateStatus('PENDING')}
                                variant="outline"
                                disabled={!isFormComplete}
                                className="w-full h-14 rounded-[1.2rem] border border-[var(--icons-green)] text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest disabled:opacity-45 disabled:cursor-not-allowed duration-300"
                            >
                                <FileText className="w-5 h-5 shrink-0" /> En revisión
                            </BaseButton>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
                            <BaseButton
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                variant="primary"
                                className="w-full h-14 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl shadow-[var(--brand-green)]/20 !bg-[var(--brand-green)] hover:!bg-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-widest duration-300"
                            >
                                <CheckCircle className="w-5 h-5 shrink-0" /> Validar y Activar
                            </BaseButton>
                            <BaseButton
                                onClick={() => handleUpdateStatus('PENDING')}
                                variant="outline"
                                className="w-full h-14 rounded-[1.2rem] border border-[var(--icons-green)] text-[var(--brand-green)] hover:bg-[var(--brand-green)]/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest duration-300"
                            >
                                <FileText className="w-5 h-5 shrink-0" /> En revisión
                            </BaseButton>
                            <BaseButton
                                onClick={() => handleUpdateStatus('EXPIRED')}
                                variant="ghost"
                                className="w-full h-14 rounded-[1.2rem] border border-rose-200/50 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest duration-300"
                            >
                                <XCircle className="w-5 h-5 shrink-0" /> Denegar / Expirar
                            </BaseButton>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-10 py-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none mt-0.5">Seguridad Criptográfica Lyrium © 2025</p>
                <button
                    onClick={onClose}
                    className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--brand-green)] uppercase tracking-widest transition-all hover:translate-x-1 flex items-center gap-1.5"
                >
                    Volver al Panel
                </button>
            </div>
        </div>
    );
};
