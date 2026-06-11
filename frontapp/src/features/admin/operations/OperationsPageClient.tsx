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
import { CVCard } from '@/components/admin/sellers/SharedCVUI';
import { ScanDropzone } from '@/components/admin/operations/ScanDropzone';
import { ScanResultCard } from '@/components/admin/operations/ScanResultCard';
import { ExpenseDetailModal } from '@/components/admin/operations/ExpenseDetailModal';
import { useScan } from './hooks/useScan';
import { useExpenses } from './hooks/usepenses';
import type {
  Expense,
  Pagination,
} from '@/features/admin/operations/types/operations';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  'Todos',
  'Honorarios',
  'Facturas',
  'Boletas',
  'Servicios',
] as const;
type Tab = (typeof TABS)[number];

const TAB_TYPE: Record<Tab, string | null> = {
  Todos: null,
  Honorarios: 'Honorarios',
  Facturas: 'Factura',
  Boletas: 'Boleta',
  Servicios: 'Servicio',
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, string> = {
    Honorarios: 'bg-[#EEEDFE] text-[#3C3489]',
    Factura: 'bg-[#FAEEDA] text-[#633806]',
    Boleta: 'bg-[#E6F1FB] text-[#0C447C]',
    Servicio: 'bg-[#EAF3DE] text-[#27500A]',
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
    Pagado: 'bg-[#E1F5EE] text-[#085041]',
    Pendiente: 'bg-[#FAEEDA] text-[#633806]',
    Anulado: 'bg-[#FCEBEB] text-[#791F1F]',
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
    teal: 'border-[#9FE1CB] text-[#0F6E56] hover:bg-[#E1F5EE]',
    green: 'border-[#9FE1CB] text-[#085041] hover:bg-[#E1F5EE]',
    red: 'border-[#F7C1C1] text-[#791F1F] hover:bg-[#FCEBEB]',
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

  const {
    state: { expenses, stats, loading, error, pagination },
    actions: { markAsPaid, updateExpense, goToPage, refresh },
  } = useExpenses();

  const {
    state: {
      loading: scanLoading,
      error: scanError,
      result: scanResult,
      expense: scanExpense,
      fileUrl: scanFileUrl,
    },
    actions: { scan, reset: resetScan },
  } = useScan();

  const handleScanFile = useCallback(
    async (file: File) => {
      await scan(file);
      await refresh();
    },
    [scan, refresh],
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

  return (
    <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Gestión Operativa"
        subtitle="Recibos, honorarios y servicios"
        icon="Briefcase"
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
        <CVCard className="p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-blue-500">
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
        <CVCard className="p-6 border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-emerald-400">
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
        <CVCard className="p-6 border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-amber-400">
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
        <CVCard className="p-6 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-[var(--bg-secondary)] rounded-xl text-purple-400">
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

      {/* ── Scanner ── */}
      {showScanner && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Escanear comprobante PDF
          </p>
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
            className={`text-[13px] px-3.5 py-[5px] rounded-lg border-none transition-colors ${activeTab === tab ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent'}`}
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
        <div className="rounded-lg border border-[#F7C1C1] bg-[#FCEBEB] px-4 py-3 text-[13px] text-[#791F1F]">
          {error}
        </div>
      )}

      {/* ── Tabla ── */}
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

      {/* ── Modal detalle ── */}
      <ExpenseDetailModal
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
      />
    </div>
  );
}
