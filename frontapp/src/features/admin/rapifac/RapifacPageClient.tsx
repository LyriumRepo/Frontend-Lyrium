'use client';

import React, { useState, useRef } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import {
    Receipt, Search, RefreshCw, Download, CheckCircle, Clock, XCircle, AlertCircle,
    FileText, TrendingUp, ExternalLink, Package, Store, Eye, FileSpreadsheet, Info,
} from 'lucide-react';
import { exportRapifacToExcel, exportRapifacToPdf } from './export';
import BaseButton from '@/components/ui/BaseButton';
import BaseDatePicker from '@/components/ui/BaseDatePicker';
import Skeleton from '@/components/ui/Skeleton';
import BaseModal from '@/components/ui/BaseModal';
import type { AdminInvoiceRow } from '@/features/admin/invoices/hooks/useAdminInvoices';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'amber', icon: <Clock className="w-3.5 h-3.5" /> },
    REJECTED: { label: 'Rechazado', color: 'rose', icon: <XCircle className="w-3.5 h-3.5" /> },
    OBSERVED: { label: 'Observado', color: 'orange', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    DRAFT: { label: 'Borrador', color: 'gray', icon: <FileText className="w-3.5 h-3.5" /> },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20',
    amber: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20',
    rose: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20',
    orange: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20',
    gray: 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
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

function DetailModal({ inv, isOpen, onClose }: { inv: AdminInvoiceRow | null; isOpen: boolean; onClose: () => void }) {
    if (!inv) return null;

    const documentTypeLabel = inv.type;
    const hasItems = (inv.items && inv.items.length > 0) || (inv.order?.items && inv.order.items.length > 0);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={`${documentTypeLabel} ${inv.series}-${inv.number}`}
            subtitle={`ID #${inv.id}${inv.order ? ` · ${inv.order.orderNumber}` : ''}`}
            size="2xl"
            accentColor="from-cyan-400 to-emerald-400"
        >
            <div className="space-y-5">
                {inv.order?.stores && inv.order.stores.length > 0 && (
                    <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-cyan-500/5 dark:to-emerald-500/5 rounded-2xl p-5 border border-cyan-100/50 dark:border-cyan-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Store className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Tiendas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {inv.order.stores.map(s => (
                                <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[var(--bg-card)] text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-sm border border-cyan-100 dark:border-emerald-500/10">
                                    <Store className="w-3.5 h-3.5 text-cyan-400" />
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-500/5 dark:to-cyan-500/5 rounded-2xl p-4 border border-sky-100/50 dark:border-sky-500/10">
                        <span className="text-[9px] font-black text-sky-500 dark:text-sky-400 uppercase tracking-widest">Cliente</span>
                        <p className="text-sm font-black text-[var(--text-primary)] mt-1 truncate">{inv.customer_name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)]">{inv.customer_ruc}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-2xl p-4 border border-emerald-100/50 dark:border-emerald-500/10">
                        <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Monto Total</span>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(inv.amount)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-500" />
                    <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Productos / Servicios</span>
                </div>

                {hasItems ? (
                    <div className="bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-500/3 dark:to-cyan-500/3 rounded-2xl border border-teal-100/30 dark:border-teal-500/10 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-teal-500/5 dark:bg-teal-500/5">
                                    <th className="px-5 py-3 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">Producto</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest text-center">Tienda</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest text-center">Cant.</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest text-right">P.Unit</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(inv.items && inv.items.length > 0 ? inv.items : []).map((item, idx) => (
                                    <tr key={`inv-${idx}`} className="border-t border-teal-100/30 dark:border-teal-500/10">
                                        <td className="px-5 py-3 text-xs font-bold text-[var(--text-primary)]">{item.descripcion}</td>
                                        <td className="px-5 py-3 text-[10px] font-bold text-[var(--text-secondary)] text-center">—</td>
                                        <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-secondary)] text-center font-mono">{item.cantidad}</td>
                                        <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-secondary)] text-right font-mono">{formatCurrency(item.precio_unitario)}</td>
                                        <td className="px-5 py-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-right font-mono">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                                {inv.order?.items && inv.order.items.length > 0 && (
                                    <>
                                        <tr className="border-t border-teal-100/30 dark:border-teal-500/10">
                                            <td colSpan={5} className="px-5 py-2">
                                                <span className="text-[9px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-widest">Items de la orden original</span>
                                            </td>
                                        </tr>
                                        {inv.order.items.map((item, idx) => (
                                            <tr key={`ord-${idx}`} className="border-t border-teal-100/20 dark:border-teal-500/5">
                                                <td className="px-5 py-3 text-xs font-bold text-[var(--text-primary)]">{item.productName}</td>
                                                <td className="px-5 py-3 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 text-center">{item.storeName ?? '—'}</td>
                                                <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-secondary)] text-center font-mono">{item.quantity}</td>
                                                <td className="px-5 py-3 text-[11px] font-bold text-[var(--text-secondary)] text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-5 py-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 text-right font-mono">{formatCurrency(item.lineTotal)}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-xs font-bold text-[var(--text-secondary)] p-4">Sin detalle de productos</p>
                )}

                <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-3">
                        {inv.pdf_url && (
                            <a
                                href={inv.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver PDF
                            </a>
                        )}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)]">
                        {new Date(inv.emission_date).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

export function RapifacPageClient() {
    const {
        invoices, kpis, isLoading, error,
        search, setSearch,
        storeFilter, setStoreFilter,
        typeFilter, setTypeFilter,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        allStores, allTypes,
        refresh,
    } = useAdminInvoices();
    const [detailInv, setDetailInv] = useState<AdminInvoiceRow | null>(null);
    const [montoTooltip, setMontoTooltip] = useState(false);
    const montoIconRef = useRef<HTMLSpanElement>(null);

    const handleExportCSV = () => {
        const headers = ['ID', 'Tipo', 'Serie', 'Nro', 'Cliente', 'RUC/DNI', 'Monto', 'Estado', 'Fecha'];
        const rows = invoices.map(i => [
            i.id, i.type, i.series, i.number, i.customer_name, i.customer_ruc,
            i.amount.toFixed(2), i.sunat_status,
            new Date(i.emission_date).toLocaleDateString('es-PE'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobantes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const openDetail = (inv: typeof invoices[number]) => {
        setDetailInv(inv);
    };

    const kpiCards = kpis
        ? [
              { label: 'Total Facturado (SUNAT)', value: formatCurrency(kpis.totalFacturado), icon: <TrendingUp className="w-5 h-5" />, color: 'emerald' },
              { label: 'Comprobantes Emitidos', value: kpis.totalComprobantes.toString(), icon: <Receipt className="w-5 h-5" />, color: 'indigo' },
              { label: 'Pendientes CDR', value: kpis.pendingCount.toString(), icon: <Clock className="w-5 h-5" />, color: 'amber' },
              { label: 'Rechazados / Observados', value: kpis.rejectedCount.toString(), icon: <XCircle className="w-5 h-5" />, color: 'rose' },
          ]
        : [];

    return (
        <>
            <DetailModal inv={detailInv} isOpen={detailInv !== null} onClose={() => setDetailInv(null)} />

            <main className="p-4 sm:p-8 space-y-8 animate-fadeIn">
                <ModuleHeader
                    title="Facturación Electrónica"
                    subtitle="Comprobantes electrónicos emitidos via Nubefact — SUNAT"
                    icon="Receipt"
                />

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 font-bold shadow-sm">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="text-xs uppercase tracking-widest text-rose-500 dark:text-rose-500 mb-1">Error de conexión</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={`kpi-skel-${i}`} className="h-28 rounded-[2rem]" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {kpiCards.map(card => (
                                <div
                                    key={card.label}
                                    className="bg-white dark:bg-[var(--bg-card)] p-6 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${kpiColorClasses[card.color] || 'bg-gray-50 dark:bg-gray-500/10'}`}
                                        >
                                            {card.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest truncate">
                                                {card.label}
                                            </p>
                                            <p className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tighter mt-0.5">
                                                {card.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-[var(--bg-card)] rounded-[2.5rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 sm:p-8 border-b border-gray-50 dark:border-[var(--border-subtle)] space-y-4 bg-gray-50/30 dark:bg-[var(--bg-muted)]/50">

                                {/* Título + búsqueda */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">
                                            Comprobantes Recientes
                                        </h3>
                                        <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                                            Emitidos via Nubefact
                                        </p>
                                    </div>
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[var(--bg-card)] border-gray-100 dark:border-[var(--border-subtle)] border rounded-2xl text-sm font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Filtros + acciones — todo en un recuadro en móvil */}
                                <div className="bg-white dark:bg-[var(--bg-secondary)]/60 border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl p-3 sm:p-0 sm:bg-transparent sm:border-0 sm:rounded-none space-y-3 sm:space-y-0">
                                    {/* Fila 1: selects + fechas */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-cyan-500 shrink-0" />
                                            <select
                                                value={storeFilter}
                                                onChange={e => setStoreFilter(e.target.value)}
                                                className="px-4 py-2.5 bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Todas las tiendas</option>
                                                {allStores.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <select
                                                value={typeFilter}
                                                onChange={e => setTypeFilter(e.target.value)}
                                                className="px-4 py-2.5 bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Todos los tipos</option>
                                                {allTypes.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <BaseDatePicker
                                            label="Desde"
                                            value={dateFrom}
                                            onChange={setDateFrom}
                                            placeholder="dd/mm/aaaa"
                                        />

                                        <BaseDatePicker
                                            label="Hasta"
                                            value={dateTo}
                                            onChange={setDateTo}
                                            placeholder="dd/mm/aaaa"
                                        />
                                    </div>

                                    {/* Fila 2: acciones + limpiar */}
                                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t border-gray-100 dark:border-[var(--border-subtle)] sm:border-0 mt-1 sm:mt-0">
                                        <BaseButton onClick={() => refresh()} variant="ghost" leftIcon="RefreshCw" size="sm">
                                            Sincronizar
                                        </BaseButton>
                                        <button
                                            onClick={() => exportRapifacToExcel(invoices, kpis).catch(console.error)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Excel
                                        </button>
                                        <button
                                            onClick={() => exportRapifacToPdf(invoices, kpis).catch(console.error)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            PDF
                                        </button>
                                        {(storeFilter || typeFilter || dateFrom || dateTo) && (
                                            <button
                                                onClick={() => {
                                                    setStoreFilter('');
                                                    setTypeFilter('');
                                                    setDateFrom('');
                                                    setDateTo('');
                                                }}
                                                className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                            >
                                                Limpiar filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── Vista mobile: cards ── */}
                            <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                                {invoices.length === 0 ? (
                                    <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)] py-16">
                                        <Receipt className="w-12 h-12 opacity-30" />
                                        <p className="text-sm font-bold">No hay comprobantes emitidos</p>
                                    </div>
                                ) : invoices.map(invoice => (
                                    <div key={invoice.id} className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-100 to-emerald-100 dark:from-cyan-500/10 dark:to-emerald-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-black text-[var(--text-primary)] truncate uppercase">{invoice.customer_name}</p>
                                                <StatusBadge status={invoice.sunat_status} />
                                            </div>
                                            <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">{invoice.customer_ruc}</p>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-tight">{invoice.type}</span>
                                                <span className="text-xs font-mono text-[var(--text-secondary)]">{invoice.series}-{invoice.number}</span>
                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.store_amount ?? invoice.amount)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-[var(--text-secondary)]">
                                                    {new Date(invoice.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <button
                                                    onClick={() => openDetail(invoice)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Detalle
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Vista desktop: tabla ── */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left border-collapse" aria-label="Tabla de comprobantes">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/30">
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Tipo</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Serie-Nro</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">Cliente</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)]">
                                                <span className="flex items-center gap-1.5">
                                                    Monto
                                                    <span ref={montoIconRef} onMouseEnter={() => setMontoTooltip(true)} onMouseLeave={() => setMontoTooltip(false)} className="cursor-help">
                                                        <Info className="w-3 h-3 opacity-60" />
                                                    </span>
                                                </span>
                                            </th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)] text-center">Estado</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)] text-right">Fecha</th>
                                            <th scope="col" className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest border-b border-gray-100 dark:border-[var(--border-subtle)] text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-16">
                                                    <Receipt className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
                                                    <p className="text-sm font-bold text-gray-400 dark:text-[var(--text-muted)]">No hay comprobantes emitidos</p>
                                                </td>
                                            </tr>
                                        )}
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-emerald-50/50 dark:hover:from-cyan-500/3 dark:hover:to-emerald-500/3 transition-colors group">
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 dark:from-cyan-500/10 dark:to-emerald-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:shadow-lg transition-all">
                                                            <Receipt className="w-5 h-5" />
                                                        </div>
                                                        <div className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-tight">{invoice.type}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)] font-black text-gray-700 dark:text-[var(--text-primary)] font-mono text-sm">{invoice.series}-{invoice.number}</td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)]">
                                                    <div className="text-[13px] font-black text-gray-900 dark:text-[var(--text-primary)] uppercase truncate max-w-xs">{invoice.customer_name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-muted)]">{invoice.customer_ruc}</div>
                                                </td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)] font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatCurrency(invoice.store_amount ?? invoice.amount)}</td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)] text-center"><StatusBadge status={invoice.sunat_status} /></td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)] text-right text-[11px] font-bold text-gray-400 dark:text-[var(--text-muted)] whitespace-nowrap">
                                                    {new Date(invoice.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-8 py-6 border-b border-gray-50 dark:border-[var(--border-subtle)] text-center">
                                                    <button onClick={() => openDetail(invoice)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600 transition-all text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/20">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {montoTooltip && montoIconRef.current && (() => {
                                    const r = montoIconRef.current!.getBoundingClientRect();
                                    return (
                                        <div style={{ position: 'fixed', top: r.bottom + 8, left: r.left + r.width / 2, transform: 'translateX(-50%)', zIndex: 9999 }} className="w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-2xl pointer-events-none">
                                            <p className="text-[11px] font-black text-[var(--text-primary)] mb-1">¿Qué es el Monto?</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">Total del comprobante electrónico (<span className="text-emerald-500 font-bold">productos/servicios con IGV</span>), emitido a SUNAT.</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">No incluye costos de envío ni cargos adicionales separados del pedido.</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}

const kpiColorClasses: Record<string, string> = {
    emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    indigo: 'bg-[var(--icons-green)]/10 text-[var(--icons-green)]',
    amber: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    rose: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
};