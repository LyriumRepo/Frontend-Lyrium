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

    // Detectar si es un contrato nuevo (borrador inicial sin Razón Social ni RUC)
    const isNewContract = !contract.company && !contract.ruc;

    // Verificar si todos los campos requeridos están completos
    const isFormComplete = !!(
        formState.company?.trim() &&
        formState.ruc?.trim() &&
        formState.rep?.trim() &&
        formState.start &&
        formState.end &&
        formState.modality &&
        formState.type
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
    };

    return (
        <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-industrial animate-scaleUp text-left border border-[var(--border-subtle)]">
            
            {/* Header - Rediseño Premium */}
            <div className="px-10 py-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-gradient-to-r from-indigo-950/20 to-zinc-900/10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none">
                            {isNewContract ? 'Registrar Nuevo Contrato' : 'Expediente Legal Vendedor'}
                        </h3>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2">
                            ID Contrato: {contract.id}
                        </p>
                    </div>
                </div>
                <StatusBadge status={contract.status} large />
            </div>

            {/* Formulario y Contenido */}
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto custom-scrollbar max-h-[60vh]">
                
                {/* Info Legal */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                            Metadata Estructural (RF-16)
                        </h4>
                    </div>

                    <div className="space-y-5">
                        {/* Razón Social */}
                        <div className="space-y-1.5">
                            <label htmlFor="contract-company" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                Razón Social
                            </label>
                            <input
                                id="contract-company"
                                type="text"
                                value={formState.company || ''}
                                onChange={(e) => handleChange('company', e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                placeholder="Nombre comercial / Razón social"
                            />
                        </div>

                        {/* RUC / Representante */}
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
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial font-mono"
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
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial"
                                    placeholder="Nombre completo"
                                />
                            </div>
                        </div>

                        {/* Modalidad y Tipo de Contrato */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-modality" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Modalidad
                                </label>
                                <select
                                    id="contract-modality"
                                    value={formState.modality || ''}
                                    onChange={(e) => handleChange('modality', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial cursor-pointer"
                                >
                                    <option value="VIRTUAL">VIRTUAL (DIGITAL)</option>
                                    <option value="PHYSICAL">PRESENCIAL (FÍSICO)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-type" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">
                                    Tipo de Contrato
                                </label>
                                <select
                                    id="contract-type"
                                    value={formState.type || ''}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial cursor-pointer"
                                >
                                    <option value="">Seleccione tipo...</option>
                                    <option value="Comisión Mercantil">Comisión Mercantil</option>
                                    <option value="Alquiler de Espacio">Alquiler de Espacio</option>
                                    <option value="Soporte Técnico">Soporte Técnico</option>
                                    <option value="Servicios de Logística">Servicios de Logística</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>

                        {/* Vigencia */}
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
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial uppercase"
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
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl px-5 py-4 text-xs font-black text-[var(--text-primary)] transition-all outline-none font-industrial uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ruta de Almacenamiento */}
                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-4 items-center mt-6">
                        <FolderOpen className="w-8 h-8 text-indigo-500 opacity-40 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-indigo-400 uppercase mb-0.5 tracking-wider">Nodo Criptográfico Legal</p>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 truncate max-w-[200px] font-mono">
                                {formState.storage_path || 'pendiente_de_carga.pdf'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Acciones & Auditoría */}
                <div className="space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-6">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-0.5">
                                Historial de Modificaciones
                            </h4>
                        </div>
                        <div className="flex-1 min-h-[180px]">
                            <AuditTimeline events={contract.auditTrail} />
                        </div>
                    </div>

                    {/* Botones de acción dinámicos */}
                    {isNewContract ? (
                        /* Flujo para un Contrato Nuevo */
                        <div className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
                            <BaseButton
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                variant="primary"
                                disabled={!isFormComplete}
                                className="w-full h-14 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 font-black text-xs uppercase tracking-widest disabled:opacity-45 disabled:cursor-not-allowed duration-300"
                            >
                                <CheckCircle className="w-5 h-5 shrink-0" /> Validar y Activar
                            </BaseButton>
                            <BaseButton
                                onClick={() => handleUpdateStatus('PENDING')}
                                variant="outline"
                                disabled={!isFormComplete}
                                className="w-full h-14 rounded-[1.2rem] border border-indigo-200 text-indigo-500 hover:bg-indigo-500/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest disabled:opacity-45 disabled:cursor-not-allowed duration-300"
                            >
                                <FileText className="w-5 h-5 shrink-0" /> En revisión
                            </BaseButton>
                        </div>
                    ) : (
                        /* Flujo de moderación para un Contrato Existente */
                        <div className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
                            <BaseButton
                                onClick={() => handleUpdateStatus('ACTIVE')}
                                variant="primary"
                                className="w-full h-14 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 font-black text-xs uppercase tracking-widest duration-300"
                            >
                                <CheckCircle className="w-5 h-5 shrink-0" /> Validar y Activar
                            </BaseButton>
                            <BaseButton
                                onClick={() => handleUpdateStatus('PENDING')}
                                variant="outline"
                                className="w-full h-14 rounded-[1.2rem] border border-indigo-200 text-indigo-500 hover:bg-indigo-500/10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest duration-300"
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

            {/* Footer */}
            <div className="px-10 py-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic leading-none mt-0.5">Seguridad Criptográfica Lyrium © 2025</p>
                <button
                    onClick={onClose}
                    className="text-[10px] font-black text-[var(--text-muted)] hover:text-indigo-500 uppercase tracking-widest transition-all hover:translate-x-1 flex items-center gap-1.5"
                >
                    Volver al Panel
                </button>
            </div>
        </div>
    );
};
