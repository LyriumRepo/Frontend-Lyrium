'use client';

import React, { useState, useEffect } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { 
    Receipt, Search, RefreshCw, Download, CheckCircle, Clock, 
    XCircle, AlertCircle, User, TrendingUp, FileText, Building2,
    Calendar, ArrowRight, Eye, Mail, FileDown, ShieldAlert
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: <CheckCircle className="w-3 h-3" /> },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'amber', icon: <Clock className="w-3 h-3" /> },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: <XCircle className="w-3 h-3" /> },
    OBSERVED: { label: 'Observado', color: 'orange', icon: <AlertCircle className="w-3 h-3" /> },
    DRAFT: { label: 'Borrador', color: 'gray', icon: <FileText className="w-3 h-3" /> },
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${colorClasses}`}>
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
        };
    }
    if (t.includes('BOLETA')) {
        return {
            icon: <User className="w-4 h-4 shrink-0" />,
            bg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        };
    }
    return {
        icon: <FileText className="w-4 h-4 shrink-0" />,
        bg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    };
}

export function NubefactPageClient() {
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

    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (invoices.length > 0 && !selectedId) {
            setSelectedId(invoices[0].id);
        }
    }, [invoices, selectedId]);

    const handleExportCSV = () => {
        const headers = ['ID', 'Tienda', 'Tipo', 'Serie', 'Número', 'Cliente', 'RUC', 'Monto', 'Estado', 'Fecha'];
        const rows = (invoices || []).map(i => [
            i.id, 
            getStoreName(i.store_id), 
            i.type, 
            i.series, 
            i.number, 
            i.customer_name, 
            i.customer_ruc, 
            i.amount.toFixed(2), 
            i.sunat_status, 
            new Date(i.emission_date).toLocaleDateString('es-PE')
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = `comprobantes-nubefact-${new Date().toISOString().split('T')[0]}.csv`; 
        a.click(); 
        URL.revokeObjectURL(url);
    };

    const kpiCards = kpis ? [
        { label: 'Total Facturado (SUNAT)', value: formatCurrency(kpis.totalFacturado), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
        { label: 'Comprobantes Emitidos', value: kpis.totalComprobantes.toString(), icon: <Receipt className="w-5 h-5" />, color: 'indigo' },
        { label: 'Pendientes CDR', value: kpis.pendingCount.toString(), icon: <Clock className="w-5 h-5" />, color: 'amber' },
        { label: 'Rechazados / Observados', value: kpis.rejectedCount.toString(), icon: <XCircle className="w-5 h-5" />, color: 'rose' },
    ] : [];

    const activeInvoice = invoices.find(i => i.id === selectedId) || invoices[0];

    return (
        <main className="p-8 space-y-8 animate-fadeIn">
            <ModuleHeader title="Facturación Electrónica" subtitle="Gestión y emisión descentralizada de comprobantes SUNAT" icon="Receipt" />
            
            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 font-bold shadow-sm">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-rose-500 dark:text-rose-400/80 mb-1">Error de Conexión</p>
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                </div>
            )}

            {isLoading && !kpis ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={`nubefact-skel-${i}`} className="h-28 rounded-[2rem]" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 space-y-4">
                            <Skeleton className="h-14 rounded-2xl" />
                            <Skeleton className="h-96 rounded-2xl" />
                        </div>
                        <div className="lg:col-span-7">
                            <Skeleton className="h-[500px] rounded-2xl" />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-xs font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-wider">SUNAT Online</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 space-y-4 shadow-sm">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente, RUC, serie..."
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 focus:border-sky-500 dark:focus:border-icons-green text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-muted)] transition-all outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Tienda..."
                                            className="w-full px-3 py-2.5 bg-gray-50/50 dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 text-gray-900 dark:text-[var(--text-primary)] transition-all outline-none"
                                            value={storeSearch}
                                            onChange={(e) => setStoreSearch(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2.5 bg-gray-50/50 dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-xl text-[11px] font-bold text-gray-600 dark:text-[var(--text-secondary)] focus:ring-2 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 transition-all outline-none"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <select
                                            className="w-full px-3 py-2.5 bg-gray-50/50 dark:bg-[var(--bg-input)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-xl text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] focus:ring-2 focus:ring-sky-500/10 dark:focus:ring-brand-green/15 transition-all outline-none cursor-pointer"
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="ALL">Tipos</option>
                                            <option value="FACTURA">Factura</option>
                                            <option value="BOLETA">Boleta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                                {(invoices || []).map((invoice) => {
                                    const typeStyle = getVoucherIcon(invoice.type);
                                    const isActive = selectedId === invoice.id;
                                    return (
                                        <div
                                            key={invoice.id}
                                            onClick={() => setSelectedId(invoice.id)}
                                            className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col gap-3 ${
                                                isActive 
                                                    ? 'bg-sky-500/5 dark:bg-[#1E3028]/20 border-sky-500 dark:border-brand-green shadow-sm ring-1 ring-sky-500/15 dark:ring-brand-green/20' 
                                                    : 'bg-white dark:bg-[var(--bg-card)] border-gray-100 dark:border-[var(--border-subtle)] hover:bg-gray-50/50 dark:hover:bg-[var(--bg-hover)]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-gray-800 dark:text-[var(--text-primary)] font-mono">{invoice.series}-{invoice.number}</span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-secondary)]">{new Date(invoice.emission_date).toLocaleDateString('es-PE')}</span>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 dark:text-[var(--text-secondary)] truncate uppercase">{invoice.customer_name}</p>
                                                <p className="text-[12px] font-black text-slate-800 dark:text-[var(--text-primary)] mt-1 truncate">{getStoreName(invoice.store_id)}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50 dark:border-[var(--border-subtle)]/30">
                                                <span className="text-sm font-black text-sky-600 dark:text-[var(--brand-green)]">{formatCurrency(invoice.amount)}</span>
                                                <StatusBadge status={invoice.sunat_status} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!invoices || invoices.length === 0) && (
                                    <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] p-8 rounded-2xl text-center text-xs font-bold text-gray-400 dark:text-[var(--text-muted)]">
                                        No se encontraron comprobantes emitidos.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            {activeInvoice ? (
                                <div className="bg-white dark:bg-[var(--bg-card)] rounded-[2.5rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-xl p-8 relative flex flex-col gap-6 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 dark:bg-brand-green/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10 border-b border-gray-100 dark:border-[var(--border-subtle)]/50 pb-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="w-6 h-6 text-sky-500 dark:text-icons-green" />
                                                <h2 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">Comprobante de Pago</h2>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] font-black uppercase tracking-wider">{getStoreName(activeInvoice.store_id)}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 border border-gray-100 dark:border-[var(--border-subtle)] flex flex-col gap-1 items-end min-w-[200px]">
                                            <span className="text-[10px] font-black text-sky-500 dark:text-icons-green tracking-wider uppercase">{activeInvoice.type} ELECTRÓNICA</span>
                                            <span className="text-base font-black text-gray-900 dark:text-[var(--text-primary)] font-mono">{activeInvoice.series}-{activeInvoice.number}</span>
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-[var(--text-muted)] mt-1">R.U.C. 20601234567</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-xs">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-wider block">Datos del Adquirente</span>
                                            <div className="space-y-1">
                                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)] uppercase">{activeInvoice.customer_name}</p>
                                                <p className="font-bold text-gray-500 dark:text-[var(--text-secondary)]">RUC/DNI: {activeInvoice.customer_ruc}</p>
                                                <p className="font-bold text-gray-400 dark:text-[var(--text-muted)]">Dirección: Lima, Perú</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 sm:text-right">
                                            <span className="text-[9px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-wider block">Detalles de la Transacción</span>
                                            <div className="space-y-1 font-bold text-gray-600 dark:text-[var(--text-secondary)]">
                                                <p>Fecha Emisión: <span className="font-black text-gray-800 dark:text-[var(--text-primary)]">{new Date(activeInvoice.emission_date).toLocaleDateString('es-PE')}</span></p>
                                                <p>Moneda: <span className="font-black text-gray-800 dark:text-[var(--text-primary)]">Soles (PEN)</span></p>
                                                <p>Orden Compra: <span className="font-black text-gray-800 dark:text-[var(--text-primary)]">{activeInvoice.order_id || 'N/A'}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 border border-gray-100 dark:border-[var(--border-subtle)]/50 rounded-2xl overflow-hidden mt-2">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/40 text-[9px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]/50">
                                                    <th className="px-6 py-4 w-12 text-center">Cant</th>
                                                    <th className="px-6 py-4">Descripción</th>
                                                    <th className="px-6 py-4 text-right">P. Unit</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)]/30 font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
                                                {activeInvoice.items && activeInvoice.items.length > 0 ? (
                                                    activeInvoice.items.map((item, idx) => (
                                                        <tr key={`item-${idx}`} className="hover:bg-gray-50/30 dark:hover:bg-[var(--bg-hover)]/10">
                                                            <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                            <td className="px-6 py-4">{item.product_name || item.service_name || 'Item de Marketplace'}</td>
                                                            <td className="px-6 py-4 text-right">{formatCurrency(item.line_total / item.quantity)}</td>
                                                            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-[var(--text-primary)]">{formatCurrency(item.line_total)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr className="hover:bg-gray-50/30 dark:hover:bg-[var(--bg-hover)]/10">
                                                        <td className="px-6 py-4 text-center">1</td>
                                                        <td className="px-6 py-4">Servicios/Productos especializados Marketplace</td>
                                                        <td className="px-6 py-4 text-right">{formatCurrency(activeInvoice.amount)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-[var(--text-primary)]">{formatCurrency(activeInvoice.amount)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10 border-t border-gray-100 dark:border-[var(--border-subtle)]/50 pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-xl flex items-center justify-center p-2.5">
                                                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800 dark:text-slate-200" fill="currentColor">
                                                    <path d="M2 2h6v6H2V2zm1 1v4h4V3H3zm11-1h6v6h-6V2zm1 1v4h4V3h-4zM2 14h6v6H2v-6zm1 1v4h4v-4H3zm11 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v4h-2v-4zm-4 2h2v2h-2v-2zm-2 0h2v2h-2v-2zm6-3v1h-1v-1h1zm-5-3h1v1h-1v-1zm4 1h1v1h-1v-1zm-6-2h1v1h-1v-1zm3 0h1v1h-1v-1zm-3-3h1v1h-1v-1zm6 0h1v1h-1v-1z"/>
                                                </svg>
                                            </div>
                                            <div className="space-y-1.5 text-[10px] text-gray-400 dark:text-[var(--text-muted)] font-bold">
                                                <p>Código Hash: mock_hash_nubefact_{activeInvoice.id}</p>
                                                <p>Representación impresa autorizada por SUNAT</p>
                                                <div className="h-6 w-32 flex items-end gap-[1px] pt-1">
                                                    {[2,1,3,1,2,1,4,1,2,3,1,2,1,3,1,4,2,1,3,1].map((w, idx) => (
                                                        <span key={`barcode-bar-${idx}`} className="h-full bg-slate-300 dark:bg-slate-700" style={{ width: `${w}px` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto min-w-[180px] space-y-2 text-right">
                                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)]">
                                                <span>Op. Gravada:</span>
                                                <span className="font-bold text-gray-700 dark:text-[var(--text-primary)]">{formatCurrency(activeInvoice.amount / 1.18)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-[var(--text-secondary)]">
                                                <span>I.G.V. (18%):</span>
                                                <span className="font-bold text-gray-700 dark:text-[var(--text-primary)]">{formatCurrency((activeInvoice.amount / 1.18) * 0.18)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-black text-gray-900 dark:text-[var(--text-primary)] border-t border-gray-50 dark:border-[var(--border-subtle)]/30 pt-2">
                                                <span>Importe Total:</span>
                                                <span className="text-base text-sky-600 dark:text-[var(--brand-green)]">{formatCurrency(activeInvoice.amount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-between items-center gap-4 mt-2 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]/50 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={activeInvoice.sunat_status} />
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <a
                                                href={activeInvoice.pdf_url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`h-9 rounded-xl flex items-center justify-center gap-1.5 px-4 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                    activeInvoice.pdf_url 
                                                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/10 dark:bg-brand-green dark:hover:bg-brand-green-hover dark:shadow-none' 
                                                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-400 dark:text-[var(--text-muted)] cursor-not-allowed border border-gray-200 dark:border-[var(--border-subtle)]'
                                                }`}
                                            >
                                                <FileDown className="w-3.5 h-3.5" /> PDF
                                            </a>
                                            <a
                                                href={activeInvoice.xml_url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`h-9 rounded-xl flex items-center justify-center gap-1.5 px-4 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                    activeInvoice.xml_url 
                                                        ? 'bg-gray-100 hover:bg-gray-200 dark:bg-[var(--bg-muted)] dark:hover:bg-[var(--bg-hover)] text-gray-600 dark:text-[var(--text-primary)] border border-gray-200 dark:border-[var(--border-subtle)]' 
                                                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-400 dark:text-[var(--text-muted)] cursor-not-allowed border border-gray-200 dark:border-[var(--border-subtle)]'
                                                }`}
                                            >
                                                <FileText className="w-3.5 h-3.5" /> XML
                                            </a>
                                            <a
                                                href={activeInvoice.cdr_url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`h-9 rounded-xl flex items-center justify-center gap-1.5 px-4 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                                    activeInvoice.cdr_url 
                                                        ? 'bg-gray-100 hover:bg-gray-200 dark:bg-[var(--bg-muted)] dark:hover:bg-[var(--bg-hover)] text-gray-600 dark:text-[var(--text-primary)] border border-gray-200 dark:border-[var(--border-subtle)]' 
                                                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-400 dark:text-[var(--text-muted)] cursor-not-allowed border border-gray-200 dark:border-[var(--border-subtle)]'
                                                }`}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> CDR
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[var(--bg-card)] rounded-[2.5rem] border border-gray-100 dark:border-[var(--border-subtle)] p-12 text-center text-sm font-bold text-gray-400 dark:text-[var(--text-muted)] flex flex-col items-center justify-center gap-3 h-96 shadow-sm">
                                    <ShieldAlert className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                    Selecciona un comprobante de la lista para ver su vista detallada
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}
