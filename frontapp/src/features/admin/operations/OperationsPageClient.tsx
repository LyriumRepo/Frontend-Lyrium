'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { ScanDropzone } from '@/components/admin/operations/ScanDropzone';
import { ScanResultCard } from '@/components/admin/operations/ScanResultCard';
import { ExpenseDetailModal } from '@/components/admin/operations/ExpenseDetailModal';
import { useScan } from './hooks/useScan';
import { useExpenses } from './hooks/usepenses';
import BaseModal from '@/components/ui/BaseModal';
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
    Honorarios: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
    Factura: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
    Boleta: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    Servicio: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
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
    Pagado: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    Pendiente: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300',
    Anulado: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
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
    teal: 'border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20',
    green: 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    red: 'border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20',
  }[variant];
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={`w-7 h-7 inline-flex items-center justify-center border rounded-[6px] transition-colors ${cls}`}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 inline-flex items-center justify-center border rounded-[6px] transition-colors ${cls}`}
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
  return (
    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '180px' }} />
        <col style={{ width: '120px' }} />
        <col style={{ width: '130px' }} />
        <col style={{ width: '130px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '90px' }} />
        <col style={{ width: '85px' }} />
        <col style={{ width: '100px' }} />
      </colgroup>
      <thead>
        <tr>
          {[
            'Nombre emisor',
            'RUC emisor',
            'Tipo documento',
            'Nro. documento',
            'Fecha emisión',
            'Monto',
            'Estado',
            '',
          ].map((h) => (
            <th
              key={h}
              className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {expenses.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="py-10 text-center text-[13px] text-[var(--text-muted)]"
            >
              No hay recibos por honorarios.
            </td>
          </tr>
        )}
        {expenses.map((e) => {
          const issuer = e.scan_data?.issuer as
            | { name?: string; ruc?: string }
            | null
            | undefined;
          return (
            <tr
              key={e.id}
              className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <td
                className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate"
                title={issuer?.name ?? e.supplier?.name}
              >
                {issuer?.name ?? e.supplier?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">
                {issuer?.ruc ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <TipoBadge tipo={e.voucher_type ?? 'Honorarios'} />
              </td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">
                {e.voucher_number ?? e.receipt_number ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">
                {e.issued_at}
              </td>
              <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">
                S/{' '}
                {Number(e.amount).toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-3 py-2.5">
                <RowActions
                  expense={e}
                  onDetail={onDetail}
                  onMarkPaid={onMarkPaid}
                  onAnular={onAnular}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
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
  return (
    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '200px' }} />
        <col style={{ width: '120px' }} />
        <col style={{ width: '120px' }} />
        <col style={{ width: '140px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '90px' }} />
        <col style={{ width: '85px' }} />
        <col style={{ width: '100px' }} />
      </colgroup>
      <thead>
        <tr>
          {[
            'Emisor (proveedor)',
            'RUC emisor',
            'Tipo documento',
            'Nro. documento',
            'Fecha emisión',
            'Total',
            'Estado',
            '',
          ].map((h) => (
            <th
              key={h}
              className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {expenses.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="py-10 text-center text-[13px] text-[var(--text-muted)]"
            >
              No hay comprobantes para este filtro.
            </td>
          </tr>
        )}
        {expenses.map((e) => {
          const issuer = e.scan_data?.issuer as
            | { name?: string; ruc?: string }
            | null
            | undefined;
          return (
            <tr
              key={e.id}
              className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <td
                className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate"
                title={issuer?.name ?? e.supplier?.name}
              >
                {issuer?.name ?? e.supplier?.name ?? '—'}
              </td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">
                {issuer?.ruc ?? '—'}
              </td>
              <td className="px-3 py-2.5">
                <TipoBadge tipo={e.voucher_type ?? ''} />
              </td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">
                {e.voucher_number ?? e.receipt_number ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">
                {e.issued_at}
              </td>
              <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">
                S/{' '}
                {Number(e.amount).toLocaleString('es-PE', {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-3 py-2.5">
                <RowActions
                  expense={e}
                  onDetail={onDetail}
                  onMarkPaid={onMarkPaid}
                  onAnular={onAnular}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
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
  return (
    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '110px' }} />
        <col style={{ width: '130px' }} />
        <col style={{ width: '160px' }} />
        <col style={{ width: '150px' }} />
        <col style={{ width: '100px' }} />
        <col style={{ width: '90px' }} />
        <col style={{ width: '85px' }} />
        <col style={{ width: '100px' }} />
      </colgroup>
      <thead>
        <tr>
          {[
            'Tipo',
            'Nro. comprobante',
            'Proveedor / Trabajador',
            'Concepto',
            'Fecha',
            'Monto',
            'Estado',
            '',
          ].map((h) => (
            <th
              key={h}
              className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {expenses.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="py-10 text-center text-[13px] text-[var(--text-muted)]"
            >
              No hay comprobantes para este filtro.
            </td>
          </tr>
        )}
        {expenses.map((e) => (
          <tr
            key={e.id}
            className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <td className="px-3 py-2.5">
              <TipoBadge tipo={e.voucher_type ?? ''} />
            </td>
            <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] truncate">
              {e.receipt_number ?? '—'}
            </td>
            <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">
              {e.supplier?.name ?? '—'}
            </td>
            <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] truncate">
              {e.concept}
            </td>
            <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)]">
              {e.issued_at}
            </td>
            <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">
              S/{' '}
              {Number(e.amount).toLocaleString('es-PE', {
                minimumFractionDigits: 2,
              })}
            </td>
            <td className="px-3 py-2.5">
              <StatusBadge status={e.status} />
            </td>
            <td className="px-3 py-2.5">
              <RowActions
                expense={e}
                onDetail={onDetail}
                onMarkPaid={onMarkPaid}
                onAnular={onAnular}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
    actions: { markAsPaid, updateExpense, goToPage, refresh },
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
    if (dateFrom) list = list.filter((e) => e.issued_at >= dateFrom);
    if (dateTo) list = list.filter((e) => e.issued_at <= dateTo);
    return list;
  }, [expenses, activeTab, search, statusFilter, dateFrom, dateTo]);

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

  const isGlossary = activeTab === 'Glosario';

  return (
    <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title={isGlossary ? 'Glosario' : 'Gestión Operativa'}
        subtitle={isGlossary ? 'Entradas de glosario para clasificación automática de transacciones' : 'Recibos, honorarios y servicios'}
        icon={isGlossary ? 'BookOpen' : 'Briefcase'}
        actions={
          <button
            onClick={() => {
              setShowScanner((v) => !v);
              if (showScanner) resetScan();
            }}
            className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors shrink-0"
          >
            {showScanner ? '✕ Cerrar scanner' : '+ Escanear PDF'}
          </button>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 opacity-10 dark:opacity-20" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
              <CircleDollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total invertido</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                S/{' '}
                {Number(totalInvertido).toLocaleString('es-PE', {
                  minimumFractionDigits: 0,
                })}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                {expenses.length} comprobantes
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 dark:opacity-20" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Pagado</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                S/{' '}
                {Number(totalPagado).toLocaleString('es-PE', {
                  minimumFractionDigits: 0,
                })}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                {filtered.filter((e) => e.voucher_type === 'Honorarios').length}{' '}
                honorarios
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 opacity-10 dark:opacity-20" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-sm">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Pendiente</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                S/{' '}
                {Number(totalPendiente).toLocaleString('es-PE', {
                  minimumFractionDigits: 0,
                })}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                {recibosPendientes} recibo(s)
              </p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 opacity-10 dark:opacity-20" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Facturas</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {filtered.filter((e) => e.voucher_type === 'Factura').length}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                {filtered.filter((e) => e.voucher_type === 'Boleta').length}{' '}
                boleta(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scanner ── */}
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

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 border-b border-[var(--border-subtle)] pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[13px] px-4 py-2 rounded-lg border-none transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-teal-500/10 to-sky-500/10 text-teal-600 dark:text-teal-400 font-semibold shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] bg-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar proveedor o concepto..."
          className={`${inputCls} flex-1 min-w-[160px]`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={selectCls}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Anulado">Anulado</option>
        </select>
        <input
          type="date"
          className={`${selectCls} w-[140px]`}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className={`${selectCls} w-[140px]`}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-5 py-4 text-[13px] text-teal-700 dark:text-teal-300 flex items-center gap-3 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* ── Glosario ── */}
      {activeTab === 'Glosario' ? (
        <GlossaryPageClient />
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-28 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-36 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="w-14 h-4 rounded bg-gray-200 dark:bg-gray-700 ml-auto" />
                </div>
              ))}
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
