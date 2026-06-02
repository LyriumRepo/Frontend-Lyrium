'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { invoiceApi } from '@/shared/lib/api/invoiceRepository';
import type { Voucher } from '@/shared/types/invoices';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: 'CheckCircle' },
    SENT_WAIT_CDR: { label: 'Pendiente', color: 'amber', icon: 'Clock' },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: 'XCircle' },
    OBSERVED: { label: 'Observado', color: 'orange', icon: 'AlertCircle' },
    DRAFT: { label: 'Borrador', color: 'gray', icon: 'FileText' },
};

const TYPE_LABELS: Record<string, string> = {
    FACTURA: 'Factura',
    BOLETA: 'Boleta',
    NOTA_CREDITO: 'Nota Crédito',
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
        amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
        orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colorMap[cfg.color] || colorMap.gray}`}>
            <Icon name={cfg.icon} className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

export function InvoicesPageClient() {
    const [invoices, setInvoices] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('ALL');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const loadInvoices = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await invoiceApi.customerList({ type: filterType, page });
            setInvoices(result.data);
            setPagination({ page: result.pagination.page, totalPages: result.pagination.totalPages });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar comprobantes');
        } finally {
            setIsLoading(false);
        }
    }, [filterType]);

    useEffect(() => {
        loadInvoices(1);
    }, [loadInvoices]);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-PE', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    if (isLoading && invoices.length === 0) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader title="Mis Comprobantes" subtitle="Facturas y boletas electrónicas" icon="Receipt" />
                <div className="flex-1 flex items-center justify-center">
                    <BaseLoading message="Cargando comprobantes..." />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Mis Comprobantes"
                subtitle="Facturas y boletas electrónicas"
                icon="Receipt"
                actions={
                    <div className="flex items-center gap-3">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
                        >
                            <option value="ALL">Todos</option>
                            <option value="FACTURA">Facturas</option>
                            <option value="BOLETA">Boletas</option>
                            <option value="NOTA_CREDITO">Notas Crédito</option>
                        </select>
                        <button
                            onClick={() => loadInvoices(1)}
                            className="p-2.5 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A3A32] transition-colors"
                        >
                            <Icon name="RefreshCw" className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                }
            />

            {error && (
                <div className="mx-8 mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                    <Icon name="AlertCircle" className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{error}</p>
                </div>
            )}

            <div className="flex-1 px-8 pb-8">
                {invoices.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1A3A32] flex items-center justify-center mb-6">
                            <Icon name="Receipt" className="w-10 h-10 text-gray-300 dark:text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-[var(--text-primary)]">Sin comprobantes</h3>
                        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-2 max-w-md">
                            Aún no tienes comprobantes electrónicos. Cuando realices compras, los comprobantes aparecerán aquí automáticamente.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invoices.map((inv) => {
                            const statusLabels: Record<string, string> = {
                                ACCEPTED: 'Compra confirmada — Tu comprobante electrónico ha sido aceptado por SUNAT',
                                SENT_WAIT_CDR: 'En proceso — Tu comprobante está siendo validado por SUNAT',
                                REJECTED: 'Comprobante rechazado — Contacta con soporte para más información',
                                OBSERVED: 'Comprobante observado — Contacta con soporte',
                                DRAFT: 'Comprobante en preparación',
                            };
                            return (
                                <div
                                    key={inv.id}
                                    className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-[#1A3A32] flex items-center justify-center shrink-0">
                                            <Icon name="FileText" className="w-6 h-6 text-sky-500 dark:text-[var(--icons-green)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-black text-gray-900 dark:text-[var(--text-primary)]">
                                                            {TYPE_LABELS[inv.type] || inv.type}
                                                        </h4>
                                                        <span className="text-sm font-mono font-bold text-gray-500 dark:text-[var(--text-muted)]">
                                                            {inv.series}-{inv.number}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-[var(--text-muted)]">
                                                        <span>{formatDate(inv.emission_date)}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">
                                                            {formatCurrency(inv.amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={inv.sunat_status} />
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-2 leading-relaxed">
                                                {statusLabels[inv.sunat_status] ?? 'Estado no disponible'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                <button
                                    onClick={() => loadInvoices(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#1A3A32]"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-[var(--text-muted)]">
                                    Pág. {pagination.page} de {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => loadInvoices(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#1A3A32]"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
