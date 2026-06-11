'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { Receipt, Search, RefreshCw, Download, CheckCircle, Clock, XCircle, AlertCircle, User, TrendingUp, FileText } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';
import Skeleton from '@/components/ui/Skeleton';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'amber', icon: <Clock className="w-3.5 h-3.5" /> },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: <XCircle className="w-3.5 h-3.5" /> },
    OBSERVED: { label: 'Observado', color: 'orange', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    DRAFT: { label: 'Borrador', color: 'gray', icon: <FileText className="w-3.5 h-3.5" /> },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50',
    gray: 'bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-secondary)] border border-gray-100 dark:border-[var(--border-subtle)]',
};

const kpiColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const colorClasses = statusColorClasses[cfg.color] || statusColorClasses.gray;
    return (<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClasses}`}>{cfg.icon} {cfg.label}</span>);
}

interface NubefactPageClientProps { }
export function NubefactPageClient(_props: NubefactPageClientProps) {
    const {
        invoices,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        storeSearch,
        setStoreSearch,
        dateFilter,
        setDateFilter,
        typeFilter,
        setTypeFilter,
        getStoreName,
        refresh
    } = useAdminInvoices();

    const handleExportCSV = () => {
        const headers = ['ID', 'Tienda', 'Tipo', 'Serie', 'Número', 'Cliente', 'RUC', 'Monto', 'Estado', 'Fecha'];
        const rows = (invoices || []).map(i => [i.id, getStoreName(i.store_id), i.type, i.series, i.number, i.customer_name, i.customer_ruc, i.amount.toFixed(2), i.sunat_status, new Date(i.emission_date).toLocaleDateString('es-PE')]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `comprobantes-nubefact-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    };

    const kpiCards = kpis ? [
        { label: 'Total Facturado (SUNAT)', value: formatCurrency(kpis.totalFacturado), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
        { label: 'Comprobantes Emitidos', value: kpis.totalComprobantes.toString(), icon: <Receipt className="w-5 h-5" />, color: 'indigo' },
        { label: 'Pendientes CDR', value: kpis.pendingCount.toString(), icon: <Clock className="w-5 h-5" />, color: 'amber' },
        { label: 'Rechazados / Observados', value: kpis.rejectedCount.toString(), icon: <XCircle className="w-5 h-5" />, color: 'rose' },
    ] : [];

    return (
        <main className="p-8 space-y-8 animate-fadeIn">
            <ModuleHeader title="Facturación Electrónica NubeFact" subtitle="Registro centralizado de comprobantes electrónicos SUNAT" icon="Receipt" />
            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 font-bold shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-rose-500 dark:text-rose-400/80 mb-1">Error de Sincronización</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}
            {isLoading ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={`nubefact-skel-${i}`} className="h-28 rounded-[2rem]" />)}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-end items-center gap-3">
                        <BaseButton onClick={() => refresh()} variant="ghost" leftIcon="RefreshCw" size="md">Sincronizar</BaseButton>
                        <BaseButton onClick={handleExportCSV} variant="primary" leftIcon="Download" size="md" className="from-transparent to-transparent bg-[var(--brand-sky)] hover:bg-[var(--brand-sky-hover)] shadow-[var(--brand-sky)]/25 hover:shadow-[var(--brand-sky)]/30 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] dark:shadow-[var(--brand-green)]/20">Exportar Reporte</BaseButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiCards.map((card) => (
                            <div key={card.label} className="bg-white dark:bg-[var(--bg-card)] p-6 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/10 hover:shadow-gray-200/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${kpiColorClasses[card.color] || 'bg-gray-50'}`}>
                                        {card.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest truncate">{card.label}</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tighter mt-0.5">{card.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-[var(--bg-card)] rounded-[2.5rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-50 dark:border-[var(--border-subtle)]/50 space-y-6 bg-gray-50/30 dark:bg-[var(--bg-muted)]/20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">Comprobantes Recientes</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Sincronizado con NubeFact</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-[var(--brand-green)]/15 text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] transition-all outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por tienda..."
                                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-[var(--brand-green)]/15 text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] transition-all outline-none"
                                        value={storeSearch}
                                        onChange={(e) => setStoreSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-[var(--brand-green)]/15 text-gray-900 dark:text-[var(--text-primary)] transition-all outline-none"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <select
                                        className="w-full px-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-[var(--brand-green)]/15 text-gray-900 dark:text-[var(--text-primary)] transition-all outline-none cursor-pointer"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="ALL">Todos los tipos</option>
                                        <option value="FACTURA">Factura</option>
                                        <option value="BOLETA">Boleta</option>
                                        <option value="NOTA_CREDITO">Nota de Crédito</option>
                                        <option value="NOTA_DEBITO">Nota de Débito</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse" aria-label="Tabla de comprobantes">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/40">
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Documento</th>
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Serie-Nro</th>
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Cliente</th>
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Monto</th>
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)] text-center">Estado</th>
                                        <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)] text-right">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoices || []).map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-[var(--brand-sky)]/5 dark:hover:bg-[var(--bg-hover)] transition-colors group">
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] flex items-center justify-center text-gray-400 dark:text-[var(--text-muted)] group-hover:bg-white dark:group-hover:bg-[var(--bg-card)] group-hover:text-[var(--brand-sky)] dark:group-hover:text-[var(--brand-sky)] transition-all">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] font-black text-[var(--brand-sky)] uppercase tracking-tight">{invoice.type}</div>
                                                        <div className="text-[13px] font-black text-gray-900 dark:text-[var(--text-primary)] mt-0.5">{getStoreName(invoice.store_id)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55 font-black text-gray-600 dark:text-[var(--text-secondary)] font-mono text-sm">{invoice.series}-{invoice.number}</td>
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55">
                                                <div className="text-[13px] font-black text-gray-900 dark:text-[var(--text-primary)] uppercase truncate max-w-xs">{invoice.customer_name}</div>
                                                <div className="text-[10px] font-black text-gray-500 dark:text-[var(--text-muted)]">{invoice.customer_ruc}</div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55 font-black text-gray-900 dark:text-[var(--text-primary)]">
                                                {formatCurrency(invoice.amount)}
                                            </td>
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55 text-center">
                                                <StatusBadge status={invoice.sunat_status} />
                                            </td>
                                            <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]/55 text-right font-bold text-gray-600 dark:text-[var(--text-secondary)] text-[13px]">
                                                {new Date(invoice.emission_date).toLocaleDateString('es-PE')}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!invoices || invoices.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-12 text-center text-sm font-bold text-gray-400 dark:text-[var(--text-muted)]">
                                                No se encontraron comprobantes emitidos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
