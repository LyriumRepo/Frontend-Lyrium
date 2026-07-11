'use client';

import React, { useEffect } from 'react';
import {
  X,
  FileText,
  Building2,
  User,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { Expense } from '@/features/admin/operations/types/operations';

interface ScanIssuer {
  name?: string | null;
  ruc?: string | null;
  address?: string | null;
}
interface ScanCustomer {
  name?: string | null;
  ruc?: string | null;
  address?: string | null;
}
interface ScanItem {
  description?: string;
  quantity?: number | null;
  unit_price?: number | null;
  total?: number | null;
}
interface ScanPayment {
  payment_method?: string | null;
  amount_words?: string | null;
  gross_amount?: number | null;
  retention_ir?: number | null;
  net_amount?: number | null;
  currency?: string | null;
}
interface ScanTotals {
  taxable_amount?: number | null;
  inafect_amount?: number | null;
  igv?: number | null;
  grand_total?: number | null;
  isc?: number | null;
  icbper?: number | null;
  other_taxes?: number | null;
  discounts?: number | null;
}
interface ScanData {
  document_type?: string;
  document_number?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  issuer?: ScanIssuer | null;
  customer?: ScanCustomer | null;
  payment?: ScanPayment | null;
  service_description?: string | null;
  items?: ScanItem[];
  totals?: ScanTotals | null;
  amount_in_words?: string | null;
  authorization_date?: string | null;
}

type ExpenseWithScan = Expense & { scan_data?: ScanData | null };

function fmt(n: number | null | undefined) {
  if (n == null) return null;
  return `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-6 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[12px] text-[var(--text-secondary)] shrink-0 font-medium">
        {label}
      </span>
      <span
        className={`text-[12px] text-[var(--text-primary)] text-right ${mono ? 'font-mono' : 'font-medium'}`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  accent = 'teal',
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: 'teal' | 'green' | 'mint';
}) {
  const styles = {
    teal: {
      header: 'bg-[var(--bg-card)] border-[var(--border-default)]',
      icon: 'text-[var(--text-secondary)]',
      title: 'text-[var(--text-primary)]',
    },
    green: {
      header: 'bg-[var(--bg-card)]/70 border-[var(--border-default)]/50',
      icon: 'text-[var(--text-secondary)]',
      title: 'text-[var(--text-primary)]',
    },
    mint: {
      header: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]',
      icon: 'text-[var(--text-secondary)]',
      title: 'text-[var(--text-secondary)]',
    },
  }[accent];
  return (
    <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 border-b ${styles.header}`}
      >
        <Icon className={`w-3.5 h-3.5 ${styles.icon}`} />
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${styles.title}`}
        >
          {title}
        </span>
      </div>
      <div className="px-4 bg-white/60 dark:bg-[var(--bg-card)]/40">{children}</div>
    </div>
  );
}

function AmountPill({
  amount,
  label,
}: {
  amount: number | null | undefined;
  label?: string;
}) {
  if (amount == null) return null;
  return (
    <div className="flex flex-col items-end gap-0.5">
      {label && (
        <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-medium">
          {label}
        </span>
      )}
      <span className="text-[15px] font-bold text-[var(--text-primary)] bg-[var(--bg-card)] px-3 py-1 rounded-full">
        S/{' '}
        {Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'Pagado')
    return <CheckCircle2 className="w-4 h-4 text-[var(--text-secondary)]" />;
  if (status === 'Anulado')
    return <XCircle className="w-4 h-4 text-[var(--color-error)]" />;
  return <Clock className="w-4 h-4 text-[var(--color-warning)]" />;
}

function HonorariosContent({
  expense,
  scan,
}: {
  expense: ExpenseWithScan;
  scan: ScanData;
}) {
  return (
    <div className="flex flex-col gap-4">
      {scan.issuer && (
        <Section title="Emisor — Trabajador" icon={User} accent="teal">
          <Row label="Nombre completo" value={scan.issuer.name} />
          <Row label="RUC / DNI" value={scan.issuer.ruc} mono />
          <Row label="Domicilio" value={scan.issuer.address} />
        </Section>
      )}
      {scan.customer && (
        <Section title="Receptor — Empresa" icon={Building2} accent="green">
          <Row label="Razón social" value={scan.customer.name} />
          <Row label="RUC" value={scan.customer.ruc} mono />
          <Row label="Dirección" value={scan.customer.address} />
        </Section>
      )}
      <Section title="Datos del recibo" icon={FileText} accent="mint">
        <Row
          label="Número de documento"
          value={scan.document_number ?? expense.voucher_number}
          mono
        />
        <Row
          label="Fecha de emisión"
          value={scan.issue_date ?? expense.issued_at}
        />
        <Row label="Moneda" value={scan.currency ?? 'SOLES'} />
        {scan.service_description && (
          <Row label="Servicio prestado" value={scan.service_description} />
        )}
      </Section>
      {scan.payment && (
        <Section title="Detalle de pago" icon={CreditCard} accent="teal">
          <Row label="Importe bruto" value={fmt(scan.payment.gross_amount)} />
          <Row
            label="Retención IR (8%)"
            value={fmt(scan.payment.retention_ir) ?? 'S/ 0.00'}
          />
          <Row
            label="Neto recibido"
            value={
              <span className="text-[13px] font-bold text-[var(--text-primary)]">
                {fmt(scan.payment.net_amount)}
              </span>
            }
          />
          <Row label="Forma de pago" value={scan.payment.payment_method} />
          <Row label="Monto en letras" value={scan.payment.amount_words} />
        </Section>
      )}
    </div>
  );
}

function FacturaContent({
  expense,
  scan,
}: {
  expense: ExpenseWithScan;
  scan: ScanData;
}) {
  return (
    <div className="flex flex-col gap-4">
      {scan.issuer && (
        <Section title="Emisor — Proveedor" icon={Building2} accent="teal">
          <Row label="Razón social" value={scan.issuer.name} />
          <Row label="RUC" value={scan.issuer.ruc} mono />
          <Row label="Dirección" value={scan.issuer.address} />
        </Section>
      )}
      {scan.customer && (
        <Section title="Receptor — Tu empresa" icon={User} accent="green">
          <Row label="Nombre" value={scan.customer.name} />
          <Row label="RUC" value={scan.customer.ruc} mono />
          <Row label="Dirección" value={scan.customer.address} />
        </Section>
      )}
      <Section title="Datos del documento" icon={FileText} accent="mint">
        <Row
          label="Número de documento"
          value={scan.document_number ?? expense.voucher_number}
          mono
        />
        <Row
          label="Fecha de emisión"
          value={scan.issue_date ?? expense.issued_at}
        />
        <Row label="Fecha de vencimiento" value={scan.due_date} />
        <Row label="Moneda" value={scan.currency ?? 'SOLES'} />
        {scan.authorization_date && (
          <Row label="Fecha de autorización" value={scan.authorization_date} />
        )}
      </Section>
      {scan.items && scan.items.length > 0 && (
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-default)]">
            <Receipt className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Ítems del comprobante
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-card)]/50">
                  <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-4 py-2.5">
                    Descripción
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--text-secondary)] px-4 py-2.5 w-16">
                    Cant.
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--text-secondary)] px-4 py-2.5 w-24">
                    P. Unit.
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--text-secondary)] px-4 py-2.5 w-24">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {scan.items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-[12px] text-[var(--text-primary)]">
                      {item.description}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)] text-right">
                      {item.quantity ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)] text-right font-mono">
                      {item.unit_price != null ? `S/ ${item.unit_price}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-bold text-[var(--text-primary)] text-right font-mono">
                      {item.total != null ? `S/ ${item.total}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {scan.totals && (
        <Section title="Totales" icon={CreditCard} accent="teal">
          {scan.totals.inafect_amount != null && (
            <Row
              label="Op. Inafectas"
              value={fmt(scan.totals.inafect_amount)}
            />
          )}
          {scan.totals.taxable_amount != null && (
            <Row label="Op. Gravadas" value={fmt(scan.totals.taxable_amount)} />
          )}
          {scan.totals.igv != null && (
            <Row label="IGV (18%)" value={fmt(scan.totals.igv)} />
          )}
          {scan.totals.discounts != null && scan.totals.discounts > 0 && (
            <Row label="Descuentos" value={fmt(scan.totals.discounts)} />
          )}
          <Row
            label="TOTAL A PAGAR"
            value={
              <span className="text-[14px] font-bold text-[var(--text-primary)]">
                {fmt(scan.totals.grand_total)}
              </span>
            }
          />
          {scan.amount_in_words && (
            <Row label="En letras" value={scan.amount_in_words} />
          )}
        </Section>
      )}
    </div>
  );
}

function GenericContent({ expense }: { expense: ExpenseWithScan }) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Datos del comprobante" icon={FileText} accent="teal">
        <Row
          label="Número"
          value={expense.voucher_number ?? expense.receipt_number}
          mono
        />
        <Row label="Tipo" value={expense.voucher_type} />
        <Row label="Fecha de emisión" value={expense.issued_at} />
        <Row label="Fecha de pago" value={expense.paid_at} />
        <Row label="Concepto" value={expense.concept} />
      </Section>
      {expense.supplier && (
        <Section title="Proveedor / Trabajador" icon={Building2} accent="green">
          <Row label="Nombre" value={expense.supplier.name} />
          <Row label="Especialidad" value={expense.supplier.especialidad} />
          <Row label="Tipo" value={expense.supplier.type} />
        </Section>
      )}
      <Section title="Monto" icon={CreditCard} accent="mint">
        <Row label="Monto total" value={fmt(expense.amount)} />
        <Row label="Estado" value={expense.status} />
      </Section>
      {expense.notes && (
        <Section title="Notas" icon={FileText} accent="mint">
          <div className="py-3 text-[12px] text-[var(--text-secondary)]">{expense.notes}</div>
        </Section>
      )}
    </div>
  );
}

interface BankStatementLineDisplay {
  date?: string;
  description?: string;
  amount?: number;
  glossary_description?: string;
  hour?: string;
  med?: string;
  tipo?: string;
  place?: string;
  balance?: number;
}

function formatVal(n: number | null | undefined) {
  if (n == null) return '—';
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
}

function BankStatementContent({ scan }: { scan: ScanData }) {
  const lines = (scan as Record<string, unknown>).lines as BankStatementLineDisplay[] | undefined;
  const periodFull = (scan as Record<string, unknown>).period_full as string | undefined;
  const openingBalance = (scan as Record<string, unknown>).opening_balance as number | undefined;
  const closingBalance = (scan as Record<string, unknown>).closing_balance as number | undefined;

  if (!lines || lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <Section title="Resumen del Estado de Cuenta" icon={FileText} accent="teal">
        <Row label="Período" value={periodFull ?? '—'} />
        <Row label="Saldo inicial" value={formatVal(openingBalance)} />
        <Row label="Saldo final" value={formatVal(closingBalance)} />
        <Row label="Movimientos" value={lines.length.toString()} />
      </Section>
      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-default)]">
          <Receipt className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Operaciones
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-card)]/50">
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Fecha</th>
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Descripción</th>
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Med</th>
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Hora</th>
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Tipo</th>
                <th className="text-right text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Monto</th>
                <th className="text-left text-[11px] font-semibold text-[var(--text-secondary)] px-3 py-2">Glosario</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/50 transition-colors">
                  <td className="px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono">{line.date ?? '—'}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-primary)] max-w-[180px] truncate" title={line.description}>{line.description ?? '—'}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)]">{line.med ?? '—'}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)] font-mono">{line.hour ?? '—'}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)] font-mono">{line.tipo ?? '—'}</td>
                  <td className="px-3 py-2 text-[12px] font-bold text-[var(--text-primary)] text-right">{formatVal(line.amount)}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)] max-w-[140px] truncate" title={line.glossary_description}>{line.glossary_description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface ExpenseDetailModalProps {
  expense: ExpenseWithScan | null;
  onClose: () => void;
}

export function ExpenseDetailModal({
  expense,
  onClose,
}: ExpenseDetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!expense) return null;

  const scan = expense.scan_data as ScanData | null | undefined;
  const docType = scan?.document_type ?? expense.voucher_type;
  const isBankStatement = docType === 'ESTADO_CUENTA_BCP';
  const isHonorarios =
    docType === 'RECIBO_POR_HONORARIOS' ||
    expense.voucher_type === 'Honorarios';
  const isFactura = docType === 'FACTURA' || expense.voucher_type === 'Factura';
  const isBoleta = docType === 'BOLETA' || expense.voucher_type === 'Boleta';

  const typeLabel = isBankStatement
    ? 'Estado de Cuenta'
    : isHonorarios
      ? 'Recibo por Honorarios'
      : isFactura
        ? 'Factura Electrónica'
        : isBoleta
          ? 'Boleta de Venta'
          : (expense.voucher_type ?? 'Comprobante');

  const mainAmount = isHonorarios
    ? (scan?.payment?.net_amount ??
      scan?.payment?.gross_amount ??
      expense.amount)
    : (scan?.totals?.grand_total ?? expense.amount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(4,52,44,0.45)] dark:bg-[rgba(0,0,0,0.7)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden border border-[var(--border-default)] shadow-[0_24px_64px_rgba(0,0,0,0.15)] bg-[var(--bg-card)]"
      >
        <div
          className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0 border-b border-[var(--border-default)]"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-card)] px-2.5 py-1 rounded-full self-start">
              {typeLabel}
            </span>
            <span className="text-[12px] font-mono text-[var(--text-secondary)]">
              {scan?.document_number ??
                expense.voucher_number ??
                expense.receipt_number ??
                '—'}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2 mr-8">
            <AmountPill amount={mainAmount} label="Total" />
            <div className="flex items-center gap-1.5">
              <StatusIcon status={expense.status} />
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                {expense.status}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 inline-flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-5 py-2.5 bg-[var(--bg-card)]/50 border-b border-[var(--border-default)]/50 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{scan?.issue_date ?? expense.issued_at ?? '—'}</span>
          </div>
          {expense.paid_at && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pagado {expense.paid_at}</span>
            </div>
          )}
          {expense.registered_by && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] ml-auto">
              <User className="w-3.5 h-3.5" />
              <span>{expense.registered_by.name}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {scan ? (
            <>
              {isBankStatement && (
                <BankStatementContent scan={scan} />
              )}
              {!isBankStatement && isHonorarios && (
                <HonorariosContent expense={expense} scan={scan} />
              )}
              {!isBankStatement && (isFactura || isBoleta) && (
                <FacturaContent expense={expense} scan={scan} />
              )}
              {!isBankStatement && !isHonorarios && !isFactura && !isBoleta && (
                <GenericContent expense={expense} />
              )}
            </>
          ) : (
            <GenericContent expense={expense} />
          )}
        </div>

        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0 border-t border-[var(--border-default)] bg-[var(--bg-card)]/50"
        >
          <span className="text-[11px] text-[var(--text-secondary)]">
            Registrado{' '}
            {new Date(expense.created_at).toLocaleDateString('es-PE')}
          </span>
          <div className="flex gap-2">
            {expense.file_url && (
              <a
                href={expense.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] px-3.5 py-1.5 rounded-lg transition-colors border border-[var(--border-default)]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver PDF original
              </a>
            )}
            <button
              onClick={onClose}
              className="text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] px-3.5 py-1.5 rounded-lg transition-colors border border-[var(--border-default)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
