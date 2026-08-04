'use client';

import React, { useRef } from 'react';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useSellerContract } from '@/features/seller/profile/hooks/useSellerContract';
import type { ContractStatus } from '@/features/seller/profile/api/contractRepository';

// Mismas clases que usa ProfilePageClient para el resto de tarjetas —
// se mantienen aquí en sincronía manual para no romper el look del panel.
const cardCls = "overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] will-change-transform shadow-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)]";
const cardHeaderCls = "bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 flex items-center justify-between relative";

const STATUS_UI: Record<ContractStatus, { label: string; badgeCls: string; icon: string }> = {
    ACTIVE: { label: 'Activo', badgeCls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: 'ShieldCheck' },
    PENDING: { label: 'Pendiente de firma', badgeCls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: 'Clock' },
    EXPIRED: { label: 'Vencido', badgeCls: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30', icon: 'AlertTriangle' },
};

function formatDate(value: string | null): string {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return value;
    }
}

export default function DigitalAgreementCard() {
    const { contract, loading, error, downloading, uploading, renewing, download, uploadSigned, renew, reload } = useSellerContract();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownload = async () => {
        try {
            await download();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'No se pudo descargar el documento', 'error');
        }
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) {
            showToast('El archivo debe ser PDF o Word (.doc/.docx).', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast('El archivo no debe superar 10MB.', 'error');
            return;
        }

        try {
            await uploadSigned(file);
            showToast('Documento firmado enviado. Quedó pendiente de verificación.', 'success');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'No se pudo subir el documento firmado', 'error');
        }
    };

    const handleRenew = async () => {
        try {
            await renew();
            showToast('Se solicitó la renovación del convenio.', 'success');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'No se pudo solicitar la renovación', 'error');
        }
    };

    return (
        <div className={`xl:col-span-12 ${cardCls}`}>
            <div className={cardHeaderCls}>
                <div className="flex items-center gap-3 sm:gap-4 text-white relative z-10 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                        <Icon name="ShieldCheck" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-xl font-bold md:font-black tracking-tight leading-none text-white truncate">
                            Convenio Digital
                        </h3>
                        <p className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest mt-1">
                            Requisito para gestionar reservas y catálogo
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
                {loading && (
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <Icon name="Loader2" className="w-4 h-4 animate-spin" />
                        Cargando estado del convenio...
                    </div>
                )}

                {!loading && error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
                        <Icon name="AlertTriangle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold">{error}</p>
                            <button onClick={reload} className="mt-2 text-xs font-black uppercase tracking-wider underline">
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && !contract && (
                    <div className="flex items-start gap-3 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/30 rounded-2xl text-sm text-sky-700 dark:text-sky-400">
                        <Icon name="Info" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>
                            Aún no se ha generado tu convenio digital. Comunícate con administración (Soporte Lyrium)
                            para iniciar el proceso de contratación.
                        </span>
                    </div>
                )}

                {!loading && !error && contract && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${STATUS_UI[contract.status].badgeCls}`}>
                                <Icon name={STATUS_UI[contract.status].icon} className="w-3.5 h-3.5" />
                                {STATUS_UI[contract.status].label}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">
                                N.º {contract.id}
                            </span>
                            {contract.has_signed_doc && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                                    <Icon name="CheckCircle2" className="w-3 h-3" />
                                    Documento firmado enviado
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest">Inicio</p>
                                <p className="font-bold text-[var(--text-primary)] mt-0.5">{formatDate(contract.start)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-widest">Vencimiento</p>
                                <p className="font-bold text-[var(--text-primary)] mt-0.5">{formatDate(contract.end)}</p>
                            </div>
                        </div>

                        {contract.status === 'ACTIVE' && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                                Tu convenio está activo. Puedes gestionar reservas, productos y servicios sin restricciones.
                            </p>
                        )}

                        {contract.status === 'PENDING' && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <BaseButton
                                    onClick={handleDownload}
                                    isLoading={downloading}
                                    variant="secondary"
                                    leftIcon="Download"
                                    fullWidth
                                    className="sm:w-auto"
                                >
                                    Descargar documento
                                </BaseButton>
                                <BaseButton
                                    onClick={() => fileInputRef.current?.click()}
                                    isLoading={uploading}
                                    variant="action"
                                    leftIcon="CloudUpload"
                                    fullWidth
                                    className="sm:w-auto"
                                >
                                    {contract.has_signed_doc ? 'Reemplazar firmado' : 'Subir documento firmado'}
                                </BaseButton>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileSelected}
                                />
                            </div>
                        )}

                        {contract.status === 'EXPIRED' && (
                            <div className="space-y-3">
                                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                    Tu convenio venció. Solicita la renovación para volver a gestionar reservas, productos y servicios.
                                </p>
                                <BaseButton
                                    onClick={handleRenew}
                                    isLoading={renewing}
                                    variant="action"
                                    leftIcon="RefreshCw"
                                    className="sm:w-auto"
                                >
                                    Solicitar renovación
                                </BaseButton>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
