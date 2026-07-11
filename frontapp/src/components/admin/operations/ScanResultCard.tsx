'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Receipt,
  Building2,
  User,
} from 'lucide-react';
import type { ScannedDataResponse } from '@/features/admin/operations/types/scan';
import type { Expense } from '@/features/admin/operations/types/operations';

interface ScanResultCardProps {
  scan: ScannedDataResponse;
  expense: (Expense & { scan_data: Record<string, unknown> | null }) | null;
  fileUrl: string | null;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[12px] text-[var(--text-muted)] shrink-0">
        {label}
      </span>
      <span className="text-[12px] text-[var(--text-primary)] text-right font-medium">
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-subtle)]">
        <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="px-3 divide-y divide-[var(--border-subtle)]">
        {children}
      </div>
    </div>
  );
}

function AmountBadge({
  amount,
  currency = 'S/',
}: {
  amount: number | null | undefined;
  currency?: string;
}) {
  if (!amount && amount !== 0) return null;
  return (
    <span className="inline-block bg-[var(--color-success)]/10 text-[var(--color-success)] text-[11px] font-semibold px-2 py-0.5 rounded-full">
      {currency}{' '}
      {Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
    </span>
  );
}

// ── Honorarios Result ─────────────────────────────────────────────────────────
function HonorariosResult({
  scan,
}: {
  scan: Extract<
    ScannedDataResponse,
    { document_type: 'RECIBO_POR_HONORARIOS' }
  >;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[var(--color-info)]/10 rounded-lg">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[var(--color-info)]" />
          <span className="text-[12px] font-semibold text-[var(--color-info)]">
            Recibo por Honorarios
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] text-[var(--color-info)] font-mono">
            {scan.document_number ?? '—'}
          </span>
          <AmountBadge
            amount={scan.payment?.net_amount ?? scan.payment?.gross_amount}
          />
        </div>
      </div>

      {/* Emisor */}
      {scan.issuer && (
        <Section title="Emisor (trabajador)" icon={User}>
          <Row label="Nombre" value={scan.issuer.name} />
          <Row label="RUC / DNI" value={scan.issuer.ruc} />
          <Row label="Dirección" value={scan.issuer.address} />
        </Section>
      )}

      {/* Receptor */}
      {scan.customer && (
        <Section title="Receptor (empresa)" icon={Building2}>
          <Row label="Nombre" value={scan.customer.name} />
          <Row label="RUC" value={scan.customer.ruc} />
        </Section>
      )}

      {/* Servicio */}
      {scan.service?.description && (
        <Section title="Servicio prestado" icon={FileText}>
          <Row label="Descripción" value={scan.service.description} />
          <Row label="Fecha emisión" value={scan.issue_date} />
        </Section>
      )}

      {/* Pago */}
      {scan.payment && (
        <Section title="Detalle de pago" icon={Receipt}>
          <Row
            label="Importe bruto"
            value={<AmountBadge amount={scan.payment.gross_amount} />}
          />
          <Row
            label="Retención IR (8%)"
            value={
              scan.payment.retention_ir
                ? `S/ ${scan.payment.retention_ir}`
                : 'S/ 0.00'
            }
          />
          <Row
            label="Neto recibido"
            value={<AmountBadge amount={scan.payment.net_amount} />}
          />
          <Row label="Forma de pago" value={scan.payment.payment_method} />
          <Row label="Monto en letras" value={scan.payment.amount_words} />
        </Section>
      )}
    </div>
  );
}

// ── Factura Result ────────────────────────────────────────────────────────────
function FacturaResult({
  scan,
}: {
  scan: Extract<ScannedDataResponse, { document_type: 'FACTURA' }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[var(--color-warning)]/10 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--color-warning)]" />
          <span className="text-[12px] font-semibold text-[var(--color-warning)]">
            Factura Electrónica
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] text-[var(--color-warning)] font-mono">
            {scan.document_number ?? '—'}
          </span>
          <AmountBadge amount={scan.totals?.grand_total} />
        </div>
      </div>

      {/* Emisor */}
      {scan.issuer && (
        <Section title="Emisor (proveedor)" icon={Building2}>
          <Row label="Razón social" value={scan.issuer.name} />
          <Row label="RUC" value={scan.issuer.ruc} />
          <Row label="Dirección" value={scan.issuer.address} />
        </Section>
      )}

      {/* Receptor */}
      {scan.customer && (
        <Section title="Receptor (tu empresa)" icon={User}>
          <Row label="Nombre" value={scan.customer.name} />
          <Row label="RUC" value={scan.customer.ruc} />
        </Section>
      )}

      {/* Fechas */}
      <Section title="Información del documento" icon={FileText}>
        <Row label="Fecha emisión" value={scan.issue_date} />
        <Row label="Fecha vencimiento" value={scan.due_date} />
        <Row label="Moneda" value={scan.currency} />
        {scan.metadata.authorization_date && (
          <Row
            label="Fecha autorización"
            value={scan.metadata.authorization_date}
          />
        )}
      </Section>

      {/* Items */}
      {scan.items && scan.items.length > 0 && (
        <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-subtle)]">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Ítems
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left text-[11px] text-[var(--text-muted)] font-medium px-3 py-2">
                    Descripción
                  </th>
                  <th className="text-right text-[11px] text-[var(--text-muted)] font-medium px-3 py-2">
                    Cant.
                  </th>
                  <th className="text-right text-[11px] text-[var(--text-muted)] font-medium px-3 py-2">
                    P. Unit.
                  </th>
                  <th className="text-right text-[11px] text-[var(--text-muted)] font-medium px-3 py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {scan.items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <td className="px-3 py-2 text-[var(--text-primary)]">
                      {item.description}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text-secondary)]">
                      {item.quantity ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text-secondary)]">
                      {item.unit_price != null ? `S/ ${item.unit_price}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-[var(--text-primary)]">
                      {item.total != null ? `S/ ${item.total}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totales */}
      {scan.totals && (
        <Section title="Totales" icon={Receipt}>
          <Row
            label="Op. Inafectas"
            value={
              scan.totals.inafect_amount != null
                ? `S/ ${scan.totals.inafect_amount}`
                : null
            }
          />
          <Row
            label="Op. Gravadas"
            value={
              scan.totals.taxable_amount != null
                ? `S/ ${scan.totals.taxable_amount}`
                : null
            }
          />
          <Row
            label="IGV (18%)"
            value={scan.totals.igv != null ? `S/ ${scan.totals.igv}` : null}
          />
          <Row
            label="Total a pagar"
            value={<AmountBadge amount={scan.totals.grand_total} />}
          />
          {scan.amount_in_words && (
            <Row label="En letras" value={scan.amount_in_words} />
          )}
        </Section>
      )}
    </div>
  );
}

// ── Boleta Result ─────────────────────────────────────────────────────────────
function BoletaResult({
  scan,
}: {
  scan: Extract<ScannedDataResponse, { document_type: 'BOLETA' }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between p-3 bg-[var(--color-info)]/10 rounded-lg">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[var(--color-info)]" />
          <span className="text-[12px] font-semibold text-[var(--color-info)]">
            Boleta de Venta
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[11px] text-[var(--color-info)] font-mono">
            {scan.document_number ?? '—'}
          </span>
          <AmountBadge amount={scan.totals?.grand_total} />
        </div>
      </div>
      {scan.issuer && (
        <Section title="Emisor" icon={Building2}>
          <Row label="Nombre" value={scan.issuer.name} />
          <Row label="RUC" value={scan.issuer.ruc} />
          <Row label="Dirección" value={scan.issuer.address} />
        </Section>
      )}
      <Section title="Documento" icon={FileText}>
        <Row label="Fecha emisión" value={scan.issue_date} />
        <Row label="Moneda" value={scan.currency} />
      </Section>
      {scan.items && scan.items.length > 0 && (
        <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-subtle)]">
            <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Ítems
            </span>
          </div>
          <div className="px-3 divide-y divide-[var(--border-subtle)]">
            {scan.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <span className="text-[12px] text-[var(--text-primary)]">
                  {item.description}
                </span>
                <span className="text-[12px] font-medium text-[var(--text-primary)]">
                  {item.total != null ? `S/ ${item.total}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {scan.totals && (
        <Section title="Totales" icon={Receipt}>
          <Row
            label="IGV"
            value={scan.totals.igv != null ? `S/ ${scan.totals.igv}` : null}
          />
          <Row
            label="Total"
            value={<AmountBadge amount={scan.totals.grand_total} />}
          />
        </Section>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ScanResultCard({
  scan,
  expense,
  fileUrl,
}: ScanResultCardProps) {
  const [expanded, setExpanded] = useState(true);

  const typeLabel =
    scan.document_type === 'RECIBO_POR_HONORARIOS'
      ? 'Recibo por Honorarios'
      : scan.document_type === 'FACTURA'
        ? 'Factura'
        : 'Boleta';

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-muted)] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            Resultado del escaneo — {typeLabel}
          </span>
          {expense && (
            <span className="text-[11px] text-[var(--text-muted)] font-mono ml-1">
              #{expense.receipt_number}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {fileUrl && fileUrl !== '#' && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] text-[var(--text-secondary)] hover:underline"
            >
              Ver PDF
            </a>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4">
          {scan.document_type === 'RECIBO_POR_HONORARIOS' && (
            <HonorariosResult
              scan={
                scan as Extract<
                  ScannedDataResponse,
                  { document_type: 'RECIBO_POR_HONORARIOS' }
                >
              }
            />
          )}
          {scan.document_type === 'FACTURA' && (
            <FacturaResult
              scan={
                scan as Extract<
                  ScannedDataResponse,
                  { document_type: 'FACTURA' }
                >
              }
            />
          )}
          {scan.document_type === 'BOLETA' && (
            <BoletaResult
              scan={
                scan as Extract<
                  ScannedDataResponse,
                  { document_type: 'BOLETA' }
                >
              }
            />
          )}

          {expense && (
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">
                Guardado como gasto — estado:{' '}
                <span className="font-medium text-[var(--text-secondary)]">
                  {expense.status}
                </span>
              </span>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                S/{' '}
                {Number(expense.amount).toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
