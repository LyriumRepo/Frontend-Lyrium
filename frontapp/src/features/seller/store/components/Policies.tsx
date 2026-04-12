'use client';

import React, { useState } from 'react';
import { ShopConfig } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';

type PolicyType = 'shipping' | 'return' | 'privacy';

interface PolicyRowProps {
    label: string;
    icon: string;
    color: string;
    type: PolicyType;
    value?: string;
    isUploading: boolean;
    onUpload: (type: PolicyType, file: File) => Promise<void>;
    onDelete: (type: PolicyType) => Promise<void>;
}

function PolicyRow({ label, icon, color, type, value, isUploading, onUpload, onDelete }: PolicyRowProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar los 5 MB');
            return;
        }

        setUploading(true);
        try {
            await onUpload(type, file);
        } catch (error) {
            console.error('[Policies] Upload error:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error al subir el archivo: ${message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar ${label}?`)) return;
        
        setUploading(true);
        try {
            await onDelete(type);
        } catch (error) {
            console.error('Error deleting policy:', error);
            alert('Error al eliminar el archivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-1">
                    <Icon name={icon} className={`w-3 h-3 ${color}`} /> {label}
                </span>
                <input
                    type="file"
                    id={`input-${type}`}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={uploading || isUploading}
                />
                <button
                    type="button"
                    onClick={() => document.getElementById(`input-${type}`)?.click()}
                    disabled={uploading || isUploading}
                    className={`flex items-center gap-1 text-[9px] font-black ${color} hover:opacity-80 uppercase disabled:opacity-50`}
                >
                    <Icon name="Upload" className="w-3 h-3" /> {uploading || isUploading ? 'Subiendo...' : 'PDF'}
                </button>
            </div>
            <div className={`flex items-center justify-between px-3 py-2 ${value ? 'bg-sky-500/10 border-sky-500/20' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)]'} rounded-xl border`}>
                <span className={`text-[9px] font-black ${value ? 'text-sky-500' : 'text-[var(--text-secondary)]'} truncate`}>
                    <Icon name="FileText" className="w-3 h-3 inline mr-1" /> {value ? value.split('/').pop() : 'No cargado'}
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={uploading || isUploading}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                        <Icon name="Trash2" className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface PoliciesProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
    uploadPolicy: (type: PolicyType, file: File) => Promise<any>;
    deletePolicy: (type: PolicyType) => Promise<any>;
    isUploading: boolean;
}

export default function Policies({ config, uploadPolicy, deletePolicy, isUploading }: PoliciesProps) {
    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-8">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Icon name="FileText" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Políticas y Términos</h3>
                        <p className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Resúmenes legales, envíos, devoluciones y privacidad
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-6 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name="Info" className="text-sky-500 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">Tamaño Máximo de Archivo</p>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                            Los archivos PDF no deben superar los <span className="font-black">5 MB</span>.
                            Formatos permitidos: <span className="font-black">PDF</span> únicamente.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PolicyRow
                        label="Política de Envío"
                        icon="Truck"
                        color="text-sky-600"
                        type="shipping"
                        value={config.policies.shippingPdf}
                        isUploading={isUploading}
                        onUpload={uploadPolicy}
                        onDelete={deletePolicy}
                    />
                    <PolicyRow
                        label="Devoluciones"
                        icon="RotateCcw"
                        color="text-sky-600"
                        type="return"
                        value={config.policies.returnPdf}
                        isUploading={isUploading}
                        onUpload={uploadPolicy}
                        onDelete={deletePolicy}
                    />
                    <PolicyRow
                        label="Privacidad"
                        icon="ShieldCheck"
                        color="text-emerald-600"
                        type="privacy"
                        value={config.policies.privacyPdf}
                        isUploading={isUploading}
                        onUpload={uploadPolicy}
                        onDelete={deletePolicy}
                    />
                </div>
            </div>
        </div>
    );
}
