'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Store as StoreIcon, ExternalLink, ShieldCheck, Lock, CheckCircle, XCircle, Clock, MoreVertical, Ban, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Seller } from '@/features/admin/sellers/types';
import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton';

interface SellerListProps {
    sellers: Seller[];
    loading?: boolean;
    onResetPassword?: (id: number) => void;
    onStatusChange?: (id: number, status: string, reason?: string) => Promise<void>;
}

function StatusDropdown({ vendor, onStatusChange }: { vendor: Seller; onStatusChange?: (id: number, status: string, reason?: string) => Promise<void> }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleAction = async (status: string, needsReason: boolean) => {
        let reason: string | undefined;
        if (needsReason) {
            const input = prompt('Ingrese el motivo:');
            if (!input) return;
            reason = input;
        } else {
            if (!confirm(`¿Estás seguro de cambiar el estado?`)) return;
        }
        setLoading(true);
        try {
            await onStatusChange?.(vendor.id, status, reason);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    const actions: { label: string; status: string; icon: React.ReactNode; color: string; needsReason: boolean }[] = [];

    if (vendor.status === 'PENDING') {
        actions.push(
            { label: 'Aprobar Tienda', status: 'ACTIVE', icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500', needsReason: false },
            { label: 'Rechazar Tienda', status: 'REJECTED', icon: <XCircle className="w-4 h-4" />, color: 'text-rose-500', needsReason: true },
        );
    }
    if (vendor.status === 'ACTIVE' || vendor.status === 'activa') {
        actions.push(
            { label: 'Suspender Cuenta', status: 'SUSPENDED', icon: <Ban className="w-4 h-4" />, color: 'text-amber-500', needsReason: true },
            { label: 'Dar de Baja', status: 'REJECTED', icon: <XCircle className="w-4 h-4" />, color: 'text-rose-500', needsReason: true },
        );
    }
    if (vendor.status === 'REJECTED' || vendor.status === 'SUSPENDED') {
        actions.push(
            { label: 'Reactivar Tienda', status: 'ACTIVE', icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-500', needsReason: false },
        );
    }

    if (actions.length === 0) return null;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all border border-transparent hover:border-[var(--border-subtle)]"
                aria-label="Acciones de estado"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/15 z-50 overflow-hidden animate-scaleUp origin-top-right">
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Cambiar Estado</p>
                    </div>
                    {actions.map((action) => (
                        <button
                            key={action.status + action.label}
                            onClick={() => handleAction(action.status, action.needsReason)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-secondary)] transition-colors group"
                        >
                            <span className={`${action.color} group-hover:scale-110 transition-transform`}>{action.icon}</span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SellerList({ sellers, loading = false, onResetPassword, onStatusChange }: SellerListProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                <div className="mb-8 flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-40 rounded-full" />
                </div>
                <div className="space-y-4">
                    <SkeletonRow count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden border border-[var(--border-subtle)] shadow-sm transition-all hover:shadow-md">
            <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 flex items-center justify-between">
                <div>
                    <h3 className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">Gestión Estratégica de Vendedores</h3>
                    <p className="text-[var(--text-secondary)] text-[10px] font-bold mt-1 uppercase">Control centralizado de cuentas</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-4 py-1.5 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-500/20">
                        {sellers.length} Vendedores
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" aria-label="Lista de vendedores">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50">
                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Vendedor / Contacto</th>
                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Tienda Registrada</th>
                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Estado</th>
                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Seguridad</th>
                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {sellers.map((vendor) => (
                            <tr key={vendor.id} className="group hover:bg-[var(--bg-secondary)]/30 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] group-hover:from-sky-500 group-hover:to-sky-600 group-hover:text-white transition-all shadow-sm">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                                                {vendor.name}
                                            </p>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase">
                                                    <Mail className="w-3 h-3 text-sky-500" />
                                                    {vendor.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3 bg-[var(--bg-secondary)]/30 group-hover:bg-[var(--bg-card)] p-3 rounded-2xl border border-transparent group-hover:border-[var(--border-subtle)] transition-all w-fit">
                                        <StoreIcon className="w-4 h-4 text-sky-500" />
                                        <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wide">
                                            {vendor.company}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {(vendor.status === 'ACTIVE' || vendor.status === 'activa') ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Aprobada</span>
                                            </span>
                                        ) : vendor.status === 'PENDING' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                                <Clock className="w-3 h-3 text-amber-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pendiente</span>
                                            </span>
                                        ) : vendor.status === 'SUSPENDED' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                                <Ban className="w-3 h-3 text-orange-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Suspendida</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                                <XCircle className="w-3 h-3 text-rose-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Rechazada</span>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Activo</span>
                                        </div>
                                        {vendor.contractStatus === 'VENCIDO' && (
                                            <p className="text-[8px] text-rose-500 font-black uppercase animate-pulse">Contrato Vencido</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <StatusDropdown vendor={vendor} onStatusChange={onStatusChange} />
                                        <button
                                            onClick={() => onResetPassword?.(vendor.id)}
                                            className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                            aria-label={`Forzar cambio de clave para ${vendor.name}`}
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/sellers/${vendor.id}`)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                                            aria-label={`Ver perfil de ${vendor.name}`}
                                        >
                                            Ver Perfil
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {sellers.length === 0 && (
                <div className="p-20 text-center">
                    <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px]">No se encontraron vendedores registrados</p>
                </div>
            )}
        </div>
    );
}
