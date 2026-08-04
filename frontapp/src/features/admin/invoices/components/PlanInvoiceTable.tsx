'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { type PlanInvoiceRow } from '../hooks/usePlanInvoices';

const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    OBSERVED: 'bg-amber-50 text-amber-600 border-amber-100',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
    DRAFT:    'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    SENT_WAIT_CDR: 'bg-sky-50 text-sky-600 border-sky-100',
    ERROR: 'bg-rose-50 text-rose-600 border-rose-100',
};

const STATUS_ICONS: Record<string, string> = {
    ACCEPTED: 'CheckCircle',
    OBSERVED: 'AlertCircle',
    REJECTED: 'XCircle',
    DRAFT: 'FileText',
    SENT_WAIT_CDR: 'Clock',
    ERROR: 'XCircle',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT}`}>
            <Icon name={STATUS_ICONS[status] ?? 'Circle'} className="w-3 h-3" />
            {label}
        </span>
    );
}

interface Props {
    rows: PlanInvoiceRow[];
    onViewDetail?: (row: PlanInvoiceRow) => void;
}

// ─── Mobile accordion card ────────────────────────────────────────────────────

function MobilePlanCard({ row, onViewDetail }: { row: PlanInvoiceRow; onViewDetail?: (row: PlanInvoiceRow) => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden transition-colors ${
            expanded ? 'border-sky-400/40' : 'border-[var(--border-subtle)]'
        }`}>
            <button
                onClick={() => setExpanded(s => !s)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[var(--bg-secondary)]/60 transition-colors"
            >
                <div className="w-9 h-9 bg-[var(--color-info)]/10 rounded-xl flex items-center justify-center text-[var(--color-info)] flex-shrink-0 transition-transform ${expanded ? 'scale-110' : ''}">
                    <Icon name="CreditCard" className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight leading-tight">
                        {row.series}-{row.number}
                    </p>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {row.type}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={row.sunat_status} label={row.sunat_label} />
                    <span className="text-sm font-black text-[var(--text-primary)]">
                        S/ {row.total.toFixed(2)}
                    </span>
                </div>

                <Icon
                    name={expanded ? 'ChevronUp' : 'ChevronDown'}
                    className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)]"
                />
            </button>

            {expanded && (
                <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] pt-0.5 flex-shrink-0">Tienda</span>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{row.store_name}</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)]">{row.customer_ruc}</p>
                        </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] pt-0.5 flex-shrink-0">Plan</span>
                        <p className="text-[10px] font-bold text-[var(--text-primary)] text-right">
                            {row.plan_name}
                            {row.months > 0 && <span className="text-[var(--text-secondary)] ml-1">· {row.months} {row.months === 1 ? 'mes' : 'meses'}</span>}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Emisión</span>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                            {new Date(row.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Total</span>
                        <span className="text-sm font-black text-[var(--text-primary)]">
                            S/ {row.total.toFixed(2)}
                        </span>
                    </div>

                    {onViewDetail && (
                        <div className="pt-1">
                            <button
                                onClick={() => onViewDetail(row)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-black text-[var(--text-secondary)] hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30 transition-colors"
                            >
                                <Icon name="Eye" className="w-3.5 h-3.5" />
                                Ver comprobante
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── PlanInvoiceTable ────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function PlanInvoiceTable({ rows, onViewDetail }: Props) {
    const [page, setPage] = useState(1);

    useEffect(() => { setPage(1); }, [rows.length]);

    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (rows.length === 0) {
        return (
            <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-card)] rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-subtle)] shadow-sm">
                <div className="relative inline-block">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--bg-muted)] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <Icon name="Receipt" className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5px]" />
                    </div>
                </div>
                <div className="space-y-3 mt-6 sm:mt-8">
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                        Sin facturas de suscripción aún
                    </h3>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
                        Se generarán automáticamente cuando un vendedor compre un plan
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ══ MÓVIL: accordion cards (sm:hidden) ════════════════════════ */}
            <div className="sm:hidden space-y-2 animate-fadeIn">
                {pageRows.map((row) => (
                    <MobilePlanCard
                        key={row.id}
                        row={row}
                        onViewDetail={onViewDetail}
                    />
                ))}
            </div>

            {/* ══ DESKTOP: tabla completa (hidden sm:block) ════════════════ */}
            <div className="hidden sm:block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-visible animate-fadeIn">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap rounded-tl-2xl">Nº Factura</th>
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Tienda / RUC</th>
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Plan</th>
                                <th className="px-4 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Total</th>
                                <th className="px-4 py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Estado</th>
                                <th className="hidden md:table-cell px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Emisión</th>
                                <th className="px-4 py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap rounded-tr-2xl">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row) => (
                                <tr key={row.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group border-b border-[var(--border-subtle)] last:border-b-0">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{row.series}-{row.number}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{row.store_name}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">{row.customer_ruc}</p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{row.plan_name}</p>
                                        {row.months > 0 && (
                                            <p className="text-[10px] text-[var(--text-secondary)]">{row.months} {row.months === 1 ? 'mes' : 'meses'}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <p className="text-sm font-black text-[var(--text-primary)]">S/ {row.total.toFixed(2)}</p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <StatusBadge status={row.sunat_status} label={row.sunat_label} />
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                                        <p className="text-xs font-bold text-[var(--text-secondary)]">
                                            {new Date(row.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        {onViewDetail ? (
                                            <button
                                                onClick={() => onViewDetail(row)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center m-auto"
                                            >
                                                <Icon name="Eye" className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <a
                                                href={row.receipt_pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--icons-green)] hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center m-auto"
                                            >
                                                <Icon name="FileText" className="w-5 h-5" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
    );
}
