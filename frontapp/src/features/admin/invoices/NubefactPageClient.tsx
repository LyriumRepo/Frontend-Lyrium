'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { Receipt, Search, RefreshCw, Download, CheckCircle, Clock, XCircle, AlertCircle, User, TrendingUp, FileText, Building2 } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'amber', icon: <Clock className="w-3.5 h-3.5" /> },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: <XCircle className="w-3.5 h-3.5" /> },
    OBSERVED: { label: 'Observado', color: 'orange', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    DRAFT: { label: 'Borrador', color: 'gray', icon: <FileText className="w-3.5 h-3.5" /> },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30',
    amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30',
    rose: 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30',
    orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-500 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/30',
    gray: 'bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-500 dark:text-[var(--text-secondary)] border border-gray-100 dark:border-[var(--border-subtle)]',
};

const kpiColorClasses: Record<string, { bg: string; text: string; glow: string }> = {
    emerald: {
        bg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        text: 'text-emerald-500 dark:text-emerald-400',
        glow: 'bg-emerald-500/10 dark:bg-emerald-400/5'
    },
    indigo: {
        bg: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
        text: 'text-indigo-500 dark:text-indigo-400',
        glow: 'bg-indigo-500/10 dark:bg-indigo-400/5'
    },
    amber: {
        bg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
        text: 'text-amber-500 dark:text-amber-400',
        glow: 'bg-amber-500/10 dark:bg-amber-400/5'
    },
    rose: {
        bg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
        text: 'text-rose-500 dark:text-rose-400',
        glow: 'bg-rose-500/10 dark:bg-rose-400/5'
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const colorClasses = statusColorClasses[cfg.color] || statusColorClasses.gray;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClasses}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function getVoucherIcon(type: string) {
    const t = type?.toUpperCase() || '';
    if (t.includes('FACTURA')) {
        return {
            icon: <Building2 className="w-4 h-4 shrink-0" />,
            bg: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
            glow: 'group-hover:scale-110'
        };
    }
    if (t.includes('BOLETA')) {
        return {
            icon: <User className="w-4 h-4 shrink-0" />,
            bg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
            glow: 'group-hover:scale-110'
        };
    }
    if (t.includes('CREDITO') || t.includes('CRÉDITO') || t.includes('DEBITO') || t.includes('DÉBITO')) {
        return {
            icon: <FileText className="w-4 h-4 shrink-0" />,
            bg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
            glow: 'group-hover:scale-110'
        };
    }
    return {
        icon: <Receipt className="w-4 h-4 shrink-0" />,
        bg: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
        glow: 'group-hover:scale-110'
    };
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
            {isLoading && !kpis ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={`nubefact-skel-${i}`} className="h-28 rounded-[2rem]" />)}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-end items-center gap-3">
                        <button
                            onClick={() => refresh()}
                            className="h-11 rounded-xl flex items-center justify-center gap-2 px-5 border border-gray-200 dark:border-[var(--border-subtle)] text-gray-500 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[#1E3028]/30 hover:text-gray-700 dark:hover:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97] cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sincronizar
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="h-11 rounded-xl flex items-center justify-center gap-2 px-5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 dark:bg-brand-green dark:hover:bg-brand-green-hover text-white border-0 shadow-xl shadow-sky-500/20 dark:shadow-none font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.97] cursor-pointer"
                        >
                            <Download className="w-4 h-4" /> Exportar Reporte
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiCards.map((card) => {
                            const colors = kpiColorClasses[card.color] || kpiColorClasses.emerald;
                            return (
                                <div key={card.label} className="relative overflow-hidden bg-white dark:bg-[var(--bg-card)] p-6 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-sky-500/35 dark:hover:border-icons-green/30 transition-all duration-300 group">
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${colors.glow} rounded-full -mr-8 -mt-8 blur-2xl transition-all duration-500 group-hover:scale-125`}></div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${colors.bg}`}>
                                            {card.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest truncate">{card.label}</p>
                                            <p className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tighter mt-0.5">{card.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="relative overflow-hidden bg-white dark:bg-[var(--bg-card)] rounded-[2.5rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm transition-all duration-300 flex flex-col">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 dark:bg-brand-green/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
                        <div className="p-8 border-b border-gray-50 dark:border-[var(--border-subtle)]/50 space-y-6 bg-gray-50/30 dark:bg-[var(--bg-muted)]/20 relative z-10">
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
                                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-xs font-black focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 focus:border-sky-500 dark:focus:border-icons-green text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] transition-all outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por tienda..."
                                        className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-xs font-black focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 focus:border-sky-500 dark:focus:border-icons-green text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] transition-all outline-none"
                                        value={storeSearch}
                                        onChange={(e) => setStoreSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        className="w-full px-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-xs font-black focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 focus:border-sky-500 dark:focus:border-icons-green text-gray-900 dark:text-[var(--text-primary)] transition-all outline-none uppercase"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <select
                                        className="w-full px-6 py-4 bg-white dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-xs font-black focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 focus:border-sky-500 dark:focus:border-icons-green text-gray-900 dark:text-[var(--text-primary)] transition-all outline-none cursor-pointer"
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
                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse" aria-label="Tabla de comprobantes">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/40 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">
                                        <th scope="col" className="px-8 py-5">Documento / Tienda</th>
                                        <th scope="col" className="px-8 py-5">Serie - Nro</th>
                                        <th scope="col" className="px-8 py-5">Cliente</th>
                                        <th scope="col" className="px-8 py-5">Monto</th>
                                        <th scope="col" className="px-8 py-5 text-center">Estado SUNAT</th>
                                        <th scope="col" className="px-8 py-5 text-right">Fecha de Emisión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)]/40">
                                    {(invoices || []).map((invoice) => {
                                        const typeStyle = getVoucherIcon(invoice.type);
                                        return (
                                            <tr key={invoice.id} className="hover:bg-sky-500/5 dark:hover:bg-[var(--bg-hover)] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${typeStyle.bg} ${typeStyle.glow}`}>
                                                            {typeStyle.icon}
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-sky-500 dark:text-icons-green uppercase tracking-wider">{invoice.type}</div>
                                                            <div className="text-[13px] font-black text-gray-900 dark:text-[var(--text-primary)] mt-0.5">{getStoreName(invoice.store_id)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-gray-600 dark:text-[var(--text-secondary)] font-mono text-sm">{invoice.series}-{invoice.number}</td>
                                                <td className="px-8 py-6">
                                                    <div className="text-[13px] font-black text-gray-900 dark:text-[var(--text-primary)] uppercase truncate max-w-xs">{invoice.customer_name}</div>
                                                    <div className="text-[10px] font-black text-gray-500 dark:text-[var(--text-muted)] mt-0.5">{invoice.customer_ruc}</div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-gray-900 dark:text-[var(--text-primary)]">
                                                    {formatCurrency(invoice.amount)}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <StatusBadge status={invoice.sunat_status} />
                                                </td>
                                                <td className="px-8 py-6 text-right font-bold text-gray-600 dark:text-[var(--text-secondary)] text-[13px]">
                                                    {new Date(invoice.emission_date).toLocaleDateString('es-PE')}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
