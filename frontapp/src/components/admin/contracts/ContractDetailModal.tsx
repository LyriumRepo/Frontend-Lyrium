import React, { useState } from 'react';
import { StatusBadge, AuditTimeline } from './ContractsUIComponents';
import { Contract } from '@/lib/types/admin/contracts';
import { FileText, FolderOpen, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';

interface ContractDetailModalProps {
    contract: Contract;
    onClose: () => void;
    onValidate: (id: string, data: Partial<Contract>) => void;
    onInvalidate: (id: string, data: Partial<Contract>) => void;
    onDownload: (contract: Contract) => Promise<void> | void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ contract, onClose, onValidate, onInvalidate, onDownload }) => {
    const [formState, setFormState] = useState<Partial<Contract>>(() => ({ ...contract }));
    const [downloading, setDownloading]   = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleDownload = async () => {
        setDownloadError(null);
        setDownloading(true);
        try {
            await onDownload(contract);
        } catch {
            setDownloadError('No se pudo descargar el archivo.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col font-industrial animate-scaleUp">
            {/* Header */}
            <div className="px-10 py-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-secondary)]/30">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[1.5rem] shadow-sm flex items-center justify-center text-indigo-600">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Expediente Legal</h3>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Contrato Identificador: {contract.id}</p>
                    </div>
                </div>
                <StatusBadge status={contract.status} large />
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto custom-scrollbar max-h-[60vh]">
                {/* Info Legal */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">Metadata Estructural (RF-16)</h4>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="contract-company" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Razón Social</label>
                            <input
                                id="contract-company"
                                type="text"
                                value={formState.company || ''}
                                onChange={(e) => handleChange('company', e.target.value)}
                                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/10 transition-all font-industrial"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-ruc" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">RUC Fiscal</label>
                                <input
                                    id="contract-ruc"
                                    type="text"
                                    value={formState.ruc || ''}
                                    onChange={(e) => handleChange('ruc', e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/10 transition-all font-industrial"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-rep" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Representante</label>
                                <input
                                    id="contract-rep"
                                    type="text"
                                    value={formState.rep || ''}
                                    onChange={(e) => handleChange('rep', e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/10 transition-all font-industrial"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="contract-start" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Fecha de Firma</label>
                                <input
                                    id="contract-start"
                                    type="date"
                                    value={formState.start || ''}
                                    onChange={(e) => handleChange('start', e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/10 transition-all font-industrial uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="contract-end" className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Vencimiento</label>
                                <input
                                    id="contract-end"
                                    type="date"
                                    value={formState.end || ''}
                                    onChange={(e) => handleChange('end', e.target.value)}
                                    className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-3 text-xs font-black text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/10 transition-all font-industrial uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex gap-4 items-center justify-between">
                        <div className="flex gap-4 items-center min-w-0">
                            <FolderOpen className="w-8 h-8 text-indigo-500 opacity-40 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[8px] font-black text-indigo-400 uppercase mb-0.5">Ruta en Nodo de Almacenamiento</p>
                                <p className="text-[10px] font-black text-indigo-600 truncate max-w-[180px]">{formState.storage_path || 'pendiente_de_carga.docx'}</p>
                            </div>
                        </div>
                        {contract.storage_path && (
                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={downloading}
                                title="Descargar contrato (.docx)"
                                className="shrink-0 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Download className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    {downloadError && (
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider -mt-2">{downloadError}</p>
                    )}
                </div>

                {/* Acciones & Auditoría */}
                <div className="space-y-6 flex flex-col">
                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-3">Track de Auditoría</h4>

                    <div className="flex-1 min-h-[200px]">
                        <AuditTimeline events={contract.auditTrail} />
                    </div>

                    {contract.status === 'PENDING' && (
                        <div className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
                            <BaseButton
                                onClick={() => onValidate(contract.id, formState)}
                                variant="primary"
                                className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                            >
                                <CheckCircle className="w-5 h-5" /> Validar y Activar
                            </BaseButton>
                            <BaseButton
                                onClick={() => onInvalidate(contract.id, formState)}
                                variant="ghost"
                                className="w-full h-14 rounded-2xl border border-rose-200 text-rose-500 hover:bg-rose-500/10 flex items-center justify-center gap-3"
                            >
                                <XCircle className="w-5 h-5" /> Denegar / Expirar
                            </BaseButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Seguridad Criptográfica Lyrium © 2025</p>
                <button
                    onClick={onClose}
                    className="text-[10px] font-black text-[var(--text-muted)] hover:text-indigo-500 uppercase tracking-widest transition-all hover:translate-x-1"
                >
                    Volver al Panel
                </button>
            </div>
        </div>
    );
};