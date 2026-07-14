'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CircleDollarSign,
  Receipt,
  Landmark,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import { exportExpensesToExcel, exportExpensesToPdf } from './export';
import { CVCard } from '@/components/admin/sellers/SharedCVUI';
import { ScanDropzone } from '@/components/admin/operations/ScanDropzone';
import { ScanResultCard } from '@/components/admin/operations/ScanResultCard';
import { ExpenseDetailModal } from '@/components/admin/operations/ExpenseDetailModal';
import { useScan } from './hooks/useScan';
import { useExpenses } from './hooks/usepenses';
import BaseModal from '@/components/ui/BaseModal';
import BaseDatePicker from '@/components/ui/BaseDatePicker';
import BaseSelectField from '@/components/ui/BaseSelectField';
import { BankStatementReviewModal } from '@/components/admin/operations/BankStatementReviewModal';
import type {
  Expense,
  Pagination,
  Supplier,
} from '@/features/admin/operations/types/operations';
import { GlossaryPageClient } from '@/features/admin/glossary/GlossaryPageClient';
import type {
  BatchStoreLine,
} from '@/features/admin/operations/types/scan';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  'Todos',
  'Honorarios',
  'Facturas',
  'Boletas',
  'Servicios',
  'Glosario',
] as const;
type Tab = (typeof TABS)[number];

const TAB_TYPE: Record<Tab, string | null> = {
  Todos: null,
  Honorarios: 'Honorarios',
  Facturas: 'Factura',
  Boletas: 'Boleta',
  Servicios: 'Servicio',
  Glosario: '__glossary__',
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, string> = {
    Honorarios: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
    Factura: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    Boleta: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
    Servicio: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${map[tipo] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
    >
      {tipo || '—'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pagado: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    Pendiente: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    Anulado: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${map[status] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
    >
      {status}
    </span>
  );
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconBtn({
  onClick,
  title,
  variant = 'default',
  href,
  children,
}: {
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'green' | 'red' | 'teal';
  href?: string;
  children: React.ReactNode;
}) {
  const cls = {
    default:
      'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]',
    teal: 'border-[var(--icons-green)]/30 text-[var(--icons-green)] hover:bg-[var(--icons-green)]/10',
    green: 'border-[var(--icons-green)]/30 text-[var(--icons-green)] hover:bg-[var(--icons-green)]/10',
    red: 'border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
  }[variant];
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={`min-w-[36px] min-h-[36px] inline-flex items-center justify-center border rounded-[6px] transition-colors ${cls}`}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      title={title}
      className={`min-w-[36px] min-h-[36px] inline-flex items-center justify-center border rounded-[6px] transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] w-full';
const selectCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)]';

// ─── Shared action buttons per row ───────────────────────────────────────────

type ExpenseWithScan = Expense & { scan_data?: Record<string, unknown> | null };

function RowActions({
  expense,
  onDetail,
  onMarkPaid,
  onAnular,
}: {
  expense: ExpenseWithScan;
  onDetail: (e: ExpenseWithScan) => void;
  onMarkPaid: (id: number) => void;
  onAnular: (id: number) => void;
}) {
  return (
    <div className="flex gap-1 justify-end">
      {/* Ver detalle — siempre visible */}
      <IconBtn
        variant="teal"
        title="Ver detalle"
        onClick={() => onDetail(expense)}
      >
        <Eye className="w-3.5 h-3.5" />
      </IconBtn>
      {/* Descargar PDF — solo si tiene archivo */}
      {expense.file_url && (
        <IconBtn
          variant="default"
          title="Descargar PDF"
          href={expense.file_url}
        >
          <Download className="w-3.5 h-3.5" />
        </IconBtn>
      )}
      {expense.status === 'Pendiente' && (
        <IconBtn
          variant="green"
          title="Marcar como pagado"
          onClick={() => onMarkPaid(expense.id)}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </IconBtn>
      )}
      {expense.status !== 'Anulado' && (
        <IconBtn
          variant="red"
          title="Anular"
          onClick={() => onAnular(expense.id)}
        >
          <XCircle className="w-3.5 h-3.5" />
        </IconBtn>
      )}
    </div>
  );
}

// ─── Table: Honorarios ────────────────────────────────────────────────────────

function TableHonorarios({
  expenses,
  onDetail,
  onMarkPaid,
  onAnular,
}: {
  expenses: ExpenseWithScan[];
  onDetail: (e: ExpenseWithScan) => void;
  onMarkPaid: (id: number) => void;
  onAnular: (id: number) => void;
}) {
  const emptyMsg = <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay recibos por honorarios.</p>;

  return (
    <>
      {/* ── Vista mobile: cards ── */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
        {expenses.length === 0 ? emptyMsg : expenses.map((e) => {
          const issuer = e.scan_data?.issuer as { name?: string; ruc?: string } | null | undefined;
          const nombre = issuer?.name ?? e.supplier?.name ?? '—';
          return (
            <div key={e.id} className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm shrink-0">
                {nombre[0]?.toUpperCase() ?? 'H'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-[var(--text-primary)] truncate">{nombre}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">{issuer?.ruc ?? '—'}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <TipoBadge tipo={e.voucher_type ?? 'Honorarios'} />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">{e.voucher_number ?? e.receipt_number ?? '—'}</span>
                  <span className="text-xs font-black text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[var(--text-secondary)]">{e.issued_at}</span>
                  <RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              {['Nombre emisor','RUC emisor','Tipo documento','Nro. documento','Fecha emisión','Monto','Estado',''].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay recibos por honorarios.</td></tr>
            )}
            {expenses.map((e) => {
              const issuer = e.scan_data?.issuer as { name?: string; ruc?: string } | null | undefined;
              return (
                <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
                  <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">{issuer?.name ?? e.supplier?.name ?? '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">{issuer?.ruc ?? '—'}</td>
                  <td className="px-3 py-2.5"><TipoBadge tipo={e.voucher_type ?? 'Honorarios'} /></td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">{e.voucher_number ?? e.receipt_number ?? '—'}</td>
                  <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">{e.issued_at}</td>
                  <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                  <td className="px-3 py-2.5"><RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Table: Facturas / Boletas ────────────────────────────────────────────────

function TableFacturas({
  expenses,
  onDetail,
  onMarkPaid,
  onAnular,
}: {
  expenses: ExpenseWithScan[];
  onDetail: (e: ExpenseWithScan) => void;
  onMarkPaid: (id: number) => void;
  onAnular: (id: number) => void;
}) {
  const emptyMsg = <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay comprobantes para este filtro.</p>;

  return (
    <>
      {/* ── Vista mobile: cards ── */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
        {expenses.length === 0 ? emptyMsg : expenses.map((e) => {
          const issuer = e.scan_data?.issuer as { name?: string; ruc?: string } | null | undefined;
          const nombre = issuer?.name ?? e.supplier?.name ?? '—';
          return (
            <div key={e.id} className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm shrink-0">
                {nombre[0]?.toUpperCase() ?? 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-[var(--text-primary)] truncate">{nombre}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">{issuer?.ruc ?? '—'}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <TipoBadge tipo={e.voucher_type ?? ''} />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">{e.voucher_number ?? e.receipt_number ?? '—'}</span>
                  <span className="text-xs font-black text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[var(--text-secondary)]">{e.issued_at}</span>
                  <RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              {['Emisor (proveedor)','RUC emisor','Tipo documento','Nro. documento','Fecha emisión','Total','Estado',''].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay comprobantes para este filtro.</td></tr>
            )}
            {expenses.map((e) => {
              const issuer = e.scan_data?.issuer as { name?: string; ruc?: string } | null | undefined;
              return (
                <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
                  <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">{issuer?.name ?? e.supplier?.name ?? '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">{issuer?.ruc ?? '—'}</td>
                  <td className="px-3 py-2.5"><TipoBadge tipo={e.voucher_type ?? ''} /></td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">{e.voucher_number ?? e.receipt_number ?? '—'}</td>
                  <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">{e.issued_at}</td>
                  <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                  <td className="px-3 py-2.5"><RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Table: Generic (Todos / Servicios) ──────────────────────────────────────

function TableGeneric({
  expenses,
  onDetail,
  onMarkPaid,
  onAnular,
}: {
  expenses: ExpenseWithScan[];
  onDetail: (e: ExpenseWithScan) => void;
  onMarkPaid: (id: number) => void;
  onAnular: (id: number) => void;
}) {
  const emptyMsg = <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay comprobantes para este filtro.</p>;

  return (
    <>
      {/* ── Vista mobile: cards ── */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
        {expenses.length === 0 ? emptyMsg : expenses.map((e) => {
          const nombre = e.supplier?.name ?? '—';
          return (
            <div key={e.id} className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm shrink-0">
                {nombre[0]?.toUpperCase() ?? 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-[var(--text-primary)] truncate">{nombre}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{e.concept}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <TipoBadge tipo={e.voucher_type ?? ''} />
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">{e.receipt_number ?? '—'}</span>
                  <span className="text-xs font-black text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[var(--text-secondary)]">{e.issued_at}</span>
                  <RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr>
              {['Tipo','Nro. comprobante','Proveedor / Trabajador','Concepto','Fecha','Monto','Estado',''].map((h) => (
                <th key={h} className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-[13px] text-[var(--text-muted)]">No hay comprobantes para este filtro.</td></tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
                <td className="px-3 py-2.5"><TipoBadge tipo={e.voucher_type ?? ''} /></td>
                <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">{e.receipt_number ?? '—'}</td>
                <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">{e.supplier?.name ?? '—'}</td>
                <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">{e.concept}</td>
                <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">{e.issued_at}</td>
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">S/ {Number(e.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                <td className="px-3 py-2.5"><RowActions expense={e} onDetail={onDetail} onMarkPaid={onMarkPaid} onAnular={onAnular} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function PaginationBar({
  pagination,
  onPrev,
  onNext,
}: {
  pagination: Pagination;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
      <span className="text-[12px] text-[var(--text-muted)]">
        Página {pagination.page} de {pagination.totalPages} — {pagination.total}{' '}
        comprobantes
      </span>
      <div className="flex gap-2">
        <button
          disabled={pagination.page <= 1}
          onClick={onPrev}
          className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          disabled={!pagination.hasMore}
          onClick={onNext}
          className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OperationsPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>('Todos');
  const [showScanner, setShowScanner] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailExpense, setDetailExpense] = useState<ExpenseWithScan | null>(
    null,
  );
  const [password, setPassword] = useState('');

  const {
    state: { expenses, stats, suppliers, loading, error, pagination },
    actions: { setFilters, markAsPaid, updateExpense, goToPage, refresh },
  } = useExpenses();

  const {
    state: {
      loading: scanLoading,
      error: scanError,
      result: scanResult,
      expense: scanExpense,
      fileUrl: scanFileUrl,
      bankStatementData,
      batchLoading,
    },
    actions: { scan, reset: resetScan, batchStore, clearBankStatement },
  } = useScan();

  const handleScanFile = useCallback(
    async (file: File) => {
      const pwd = password.trim();
      await scan(file, pwd || undefined);
      setPassword('');
    },
    [scan, password],
  );

  const handleBatchConfirm = useCallback(
    async (payload: {
      file_path: string;
      supplier_id: number;
      lines: BatchStoreLine[];
      period?: string;
      period_full?: string;
      opening_balance?: number;
      closing_balance?: number;
    }) => {
      await batchStore(payload);
      await refresh();
    },
    [batchStore, refresh],
  );
  const handleMarkPaid = useCallback(
    async (id: number) => {
      if (!confirm('¿Marcar este recibo como Pagado?')) return;
      await markAsPaid(id);
    },
    [markAsPaid],
  );
  const handleAnular = useCallback(
    async (id: number) => {
      if (!confirm('¿Anular este recibo? Esta acción no se puede deshacer.'))
        return;
      await updateExpense(id, { status: 'Anulado' });
    },
    [updateExpense],
  );
  const handleDetail = useCallback(
    (e: ExpenseWithScan) => setDetailExpense(e),
    [],
  );

  useEffect(() => {
    setFilters({ from: dateFrom || undefined, to: dateTo || undefined });
  }, [dateFrom, dateTo, setFilters]);

  const filtered = useMemo(() => {
    let list = expenses as ExpenseWithScan[];
    if (activeTab !== 'Todos') {
      const type = TAB_TYPE[activeTab];
      if (type) list = list.filter((e) => e.voucher_type === type);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.concept.toLowerCase().includes(q) ||
          (e.supplier?.name ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter((e) => e.status === statusFilter);
    return list;
  }, [expenses, activeTab, search, statusFilter]);

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = pagination?.page ?? 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );
  const localPagination: Pagination = {
    page: safePage,
    perPage,
    total: filtered.length,
    totalPages,
    hasMore: safePage < totalPages,
  };

  const totalInvertido =
    stats?.total_invertido ?? expenses.reduce((s, e) => s + e.amount, 0);
  const totalPagado =
    stats?.total_pagado ??
    expenses
      .filter((e) => e.status === 'Pagado')
      .reduce((s, e) => s + e.amount, 0);
  const totalPendiente =
    stats?.total_pendiente ??
    expenses
      .filter((e) => e.status === 'Pendiente')
      .reduce((s, e) => s + e.amount, 0);
  const recibosPendientes =
    stats?.recibos_pendientes ??
    expenses.filter((e) => e.status === 'Pendiente').length;

  const tableProps = {
    expenses: paginated,
    onDetail: handleDetail,
    onMarkPaid: handleMarkPaid,
    onAnular: handleAnular,
  };

  return (
    <div className="px-4 sm:px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Gestión Operativa"
        subtitle="Recibos, honorarios y servicios"
        icon="Briefcase"
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CVCard className="p-6 border-l-4 border-[var(--icons-green)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-[var(--icons-green)]">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              S/{' '}
              {Number(totalInvertido).toLocaleString('es-PE', {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
            Total invertido
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            {expenses.length} comprobantes
          </p>
        </CVCard>
        <CVCard className="p-6 border-l-4 border-[var(--color-success)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-[var(--color-success)]">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              S/{' '}
              {Number(totalPagado).toLocaleString('es-PE', {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
            Pagado
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            {filtered.filter((e) => e.voucher_type === 'Honorarios').length}{' '}
            honorarios
          </p>
        </CVCard>
        <CVCard className="p-6 border-l-4 border-[var(--color-info)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-[var(--color-info)]">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              S/{' '}
              {Number(totalPendiente).toLocaleString('es-PE', {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
            Pendiente
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            {recibosPendientes} recibo(s)
          </p>
        </CVCard>
        <CVCard className="p-6 border-l-4 border-[var(--color-info)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-[var(--color-info)]">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {filtered.filter((e) => e.voucher_type === 'Factura').length}
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
            Facturas
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
            {filtered.filter((e) => e.voucher_type === 'Boleta').length}{' '}
            boleta(s)
          </p>
        </CVCard>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[13px] px-3.5 py-[5px] rounded-lg border-none transition-colors whitespace-nowrap shrink-0 ${activeTab === tab ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Filtros + acciones en card unificado ── */}
      <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] space-y-5 overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Icon name="Search" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              Filtros de Búsqueda
            </h3>
          </div>
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Icon name="RotateCcw" className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>

        {/* Fila 1: Búsqueda (ancho completo) */}
        <input
          type="text"
          placeholder="Buscar proveedor o concepto..."
          className={`${inputCls}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Fila 2: Estado + Desde + Hasta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSelectField
            name="status"
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'Pagado', label: 'Pagado' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Anulado', label: 'Anulado' },
            ]}
          />
          <BaseDatePicker
            label="Desde"
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="Sin fecha"
            buttonClassName="text-xs py-[7px]"
          />
          <BaseDatePicker
            label="Hasta"
            value={dateTo}
            onChange={setDateTo}
            placeholder="Sin fecha"
            buttonClassName="text-xs py-[7px]"
          />
        </div>

        {/* Fila 3: acciones en grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => { setShowScanner((v) => !v); if (showScanner) resetScan(); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--color-success)] hover:border-[var(--color-success)]/30 transition-all shadow-sm"
          >
            <Icon name={showScanner ? 'X' : 'ScanLine'} className="w-4 h-4" />
            {showScanner ? 'Cerrar' : 'Escanear PDF'}
          </button>
          <button
            onClick={() => exportExpensesToExcel(filtered).catch((err) => {
              console.error(err);
              alert(err instanceof Error ? err.message : 'Error al exportar a Excel');
            })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
          >
            <Icon name="FileSpreadsheet" className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => exportExpensesToPdf(filtered).catch((err) => {
              console.error(err);
              alert(err instanceof Error ? err.message : 'Error al exportar a PDF');
            })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
          >
            <Icon name="FileText" className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-[13px] text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* ── Scanner — anclado al contenido, debajo de filtros ── */}
      {showScanner && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Escanear comprobante PDF
          </p>
          <input
            type="password"
            placeholder="Contraseña del PDF (si aplica)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] w-full"
          />
          <ScanDropzone
            onFile={handleScanFile}
            loading={scanLoading}
            error={scanError}
            onReset={resetScan}
            hasResult={!!scanResult}
          />
          {scanResult && (
            <ScanResultCard
              scan={scanResult}
              expense={scanExpense}
              fileUrl={scanFileUrl}
            />
          )}
        </div>
      )}

      {/* ── Glosario ── */}
      {activeTab === 'Glosario' ? (
        <GlossaryPageClient />
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-[13px] text-[var(--text-muted)]">
              Cargando comprobantes...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {activeTab === 'Honorarios' && (
                  <TableHonorarios {...tableProps} />
                )}
                {(activeTab === 'Facturas' || activeTab === 'Boletas') && (
                  <TableFacturas {...tableProps} />
                )}
                {(activeTab === 'Todos' || activeTab === 'Servicios') && (
                  <TableGeneric {...tableProps} />
                )}
              </div>
              <PaginationBar
                pagination={localPagination}
                onPrev={() => goToPage(safePage - 1)}
                onNext={() => goToPage(safePage + 1)}
              />
            </>
          )}
        </div>
      )}

      {/* ── Modal detalle ── */}
      <ExpenseDetailModal
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
      />

      {/* ── Bank statement review modal ── */}
      <BaseModal
        isOpen={bankStatementData !== null}
        onClose={clearBankStatement}
        title="Revisar estado de cuenta"
        subtitle="Selecciona los movimientos que deseas registrar como gastos"
        size="2xl"
      >
        {bankStatementData && (
          <BankStatementReviewModal
            filePath={bankStatementData.filePath}
            period={bankStatementData.period}
            periodFull={bankStatementData.periodFull}
            openingBalance={bankStatementData.openingBalance}
            closingBalance={bankStatementData.closingBalance}
            lines={bankStatementData.lines}
            suppliers={suppliers as Supplier[]}
            loading={batchLoading}
            onConfirm={handleBatchConfirm}
            onCancel={clearBankStatement}
          />
        )}
      </BaseModal>
    </div>
  );
}
