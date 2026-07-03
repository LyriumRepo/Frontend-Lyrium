'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { type PlanInvoiceRow } from '../hooks/usePlanInvoices';

const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    OBSERVED: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    REJECTED: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
    DRAFT: 'bg-[var(--border-subtle)]/40 text-[var(--text-secondary)] border-[var(--border-subtle)]',
    SENT_WAIT_CDR: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    ERROR: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT}`}>
            {label}
        </span>
    );
}

function PdfLink({ url }: { url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--icons-green)]/10 text-[var(--icons-green)] hover:bg-[var(--icons-green)]/20 transition-colors"
            title="Descargar recibo PDF"
        >
            <Icon name="FileText" className="w-4 h-4" />
        </a>
    );
}

interface Props {
    rows: PlanInvoiceRow[];
}

export default function PlanInvoiceTable({ rows }: Props) {
    if (rows.length === 0) {
        return (
            <div className="text-center py-20 text-[var(--text-secondary)]">
                <Icon name="Receipt" className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">Sin facturas de suscripción aún</p>
                <p className="text-sm mt-1 opacity-60">Se generarán automáticamente cuando un vendedor compre un plan</p>
            </div>
        );
    }

    return (
        <>
            {/* ── Tarjetas (móvil) ── */}
            <div className="flex flex-col gap-3 md:hidden">
                {rows.map(row => (
                    <div
                        key={row.id}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex flex-col gap-3"
                    >
                        {/* Encabezado de tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-mono text-xs font-bold text-[var(--text-primary)]">
                                    {row.series}-{row.number}
                                </p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                                    {new Date(row.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                            <StatusBadge status={row.sunat_status} label={row.sunat_label} />
                        </div>

                        {/* Tienda */}
                        <div className="flex items-center gap-2">
                            <Icon name="Store" className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                            <div>
                                <p className="font-semibold text-sm text-[var(--text-primary)] leading-tight">{row.store_name}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{row.customer_ruc}</p>
                            </div>
                        </div>

                        {/* Plan + Total + PDF */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                            <div>
                                <p className="text-xs text-[var(--text-secondary)]">Plan</p>
                                <p className="font-semibold text-sm text-[var(--text-primary)]">
                                    {row.plan_name}
                                    {row.months > 0 && (
                                        <span className="text-xs text-[var(--text-secondary)] ml-1 font-normal">
                                            · {row.months} {row.months === 1 ? 'mes' : 'meses'}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="font-bold text-[var(--text-primary)]">S/ {row.total.toFixed(2)}</p>
                                <PdfLink url={row.receipt_pdf_url} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabla (desktop) ── */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
                            <th className="text-left px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Nº Factura</th>
                            <th className="text-left px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Tienda / RUC</th>
                            <th className="text-left px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Plan</th>
                            <th className="text-right px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Total</th>
                            <th className="text-center px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Estado SUNAT</th>
                            <th className="text-left px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Emisión</th>
                            <th className="text-center px-4 py-3 font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">PDF</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {rows.map(row => (
                            <tr key={row.id} className="hover:bg-[var(--bg-card)] transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)] font-bold">
                                    {row.series}-{row.number}
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-[var(--text-primary)] leading-tight">{row.store_name}</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{row.customer_ruc}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-[var(--text-primary)]">{row.plan_name}</p>
                                    {row.months > 0 && (
                                        <p className="text-xs text-[var(--text-secondary)]">{row.months} {row.months === 1 ? 'mes' : 'meses'}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">
                                    S/ {row.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <StatusBadge status={row.sunat_status} label={row.sunat_label} />
                                </td>
                                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                                    {new Date(row.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <PdfLink url={row.receipt_pdf_url} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
