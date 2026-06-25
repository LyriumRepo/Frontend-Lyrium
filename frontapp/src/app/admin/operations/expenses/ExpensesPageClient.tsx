'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '@/features/admin/operations/hooks/usepenses';
import type { StoreExpensePayload } from '@/features/admin/operations/types/operations';
import type {
  BankStatementLine,
  ScanFileResponse,
  BatchStoreLine,
} from '@/features/admin/operations/types/scan';
import BaseModal from '@/components/ui/BaseModal';
import { BankStatementReviewModal } from '@/components/admin/operations/BankStatementReviewModal';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Todos', 'Honorarios', 'Facturas', 'Servicios'] as const;
type Tab = (typeof TABS)[number];
const TAB_TYPE: Record<Tab, string | null> = {
  Todos: null,
  Honorarios: 'Honorarios',
  Facturas: 'Factura',
  Servicios: 'Servicio',
};

// ─── Badges ───────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, string> = {
    Honorarios: 'bg-[#E6F1FB] text-[#0C447C]',
    Factura: 'bg-[#FAEEDA] text-[#633806]',
    Boleta: 'bg-[#EEEDFE] text-[#3C3489]',
    Servicio: 'bg-[#EAF3DE] text-[#27500A]',
  };
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${map[tipo] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}>
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
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}>
      {status}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--bg-muted)] rounded-[10px] p-4">
      <p className="text-[12px] text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-[22px] font-medium text-[var(--text-primary)] leading-tight">
        {value}
      </p>
      {sub && <p className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconBtn({ onClick, title, variant = 'default', children }: { onClick?: () => void; title?: string; variant?: 'default' | 'green' | 'red'; children: React.ReactNode }) {
  const cls = {
    default: 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]',
    green: 'border-[#9FE1CB] text-[#085041] hover:bg-[#E1F5EE]',
    red: 'border-[#F7C1C1] text-[#791F1F] hover:bg-[#FCEBEB]',
  }[variant];
  return (
    <button onClick={onClick} title={title} className={`w-7 h-7 inline-flex items-center justify-center border rounded-[6px] text-[14px] transition-colors ${cls}`}>
      {children}
    </button>
  );
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const IconPlus = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const IconEye = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconDown = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconCheck = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconUpload = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const IconInvoice = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
  </svg>
);
const IconReceipt = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconBank = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1" />
  </svg>
);

// ─── Input / Select shared styles ─────────────────────────────────────────────

const inputCls = 'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] w-full';
const selectCls = 'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)]';

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ExpensesPageClient() {
  const { state, actions } = useExpenses();
  const { expenses, stats, suppliers, loading, error, pagination } = state;

  const [activeTab, setActiveTab] = useState<Tab>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const emptyForm = {
    supplier_id: 0,
    concept: '',
    amount: 0,
    issued_at: new Date().toISOString().slice(0, 10),
    voucher_type: '',
    voucher_number: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanPassword, setScanPassword] = useState('');
  const [bankStatementData, setBankStatementData] = useState<{
    filePath: string
    period: string | null
    periodFull: string | null
    openingBalance: number | null
    closingBalance: number | null
    lines: BankStatementLine[]
  } | null>(null);

  // Sync local filters → API (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      actions.setFilters({
        search: search || undefined,
        status: (statusFilter || undefined) as 'Pagado' | 'Pendiente' | 'Anulado' | undefined,
        voucher_type: activeTab !== 'Todos' ? (TAB_TYPE[activeTab] ?? undefined) : undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, statusFilter, dateFrom, dateTo, activeTab, actions]);

  const handleCreate = async () => {
    if (!form.supplier_id || !form.concept || !form.amount) return;
    setSubmitting(true);
    try {
      await actions.createExpense({
        supplier_id: form.supplier_id,
        concept: form.concept,
        amount: form.amount,
        issued_at: form.issued_at,
        voucher_type: form.voucher_type || undefined,
        voucher_number: form.voucher_number || undefined,
        status: 'Pendiente',
      } satisfies StoreExpensePayload);
      setShowForm(false);
      setForm(emptyForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = (id: number) => {
    if (!confirm('¿Marcar este recibo como Pagado?')) return;
    actions.markAsPaid(id);
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Anular este recibo? Esta acción no se puede deshacer.')) return;
    actions.deleteExpense(id);
  };

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanError(null);

    try {
      const pwd = scanPassword.trim();
      const res: ScanFileResponse = await actions.scanDocument(file, pwd || undefined);
      setScanPassword('');

      if ('is_bank_statement' in res && res.is_bank_statement) {
        const scan = res.scan as Extract<
          ScanFileResponse['scan'],
          { lines: BankStatementLine[] }
        >;
        const scanExt = scan as typeof scan & { period_full?: string | null; opening_balance?: number | null; closing_balance?: number | null };
        setBankStatementData({
          filePath: res.file_path,
          period: 'period' in scan ? scan.period ?? null : null,
          periodFull: scanExt.period_full ?? null,
          openingBalance: scanExt.opening_balance ?? null,
          closingBalance: scanExt.closing_balance ?? null,
          lines: scan.lines ?? [],
        });
      } else {
        await actions.refresh();
      }
    } catch (err: unknown) {
      setScanError(
        err instanceof Error ? err.message : 'Error al escanear el documento',
      );
    } finally {
      setScanning(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleBatchConfirm = async (payload: {
    file_path: string
    supplier_id: number
    lines: BatchStoreLine[]
    period?: string
    period_full?: string
    opening_balance?: number
    closing_balance?: number
  }) => {
    setBatchLoading(true);
    try {
      await actions.scanBatchStore(payload);
      setBankStatementData(null);
    } catch (err: unknown) {
      setScanError(
        err instanceof Error
          ? err.message
          : 'Error al crear los gastos desde el estado de cuenta',
      );
    } finally {
      setBatchLoading(false);
    }
  };

  const safePage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const hasMore = pagination?.hasMore ?? false;

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
            Gestión operativa
          </h2>
          <p className="text-[13px] text-[var(--text-muted)]">
            Recibos, honorarios y servicios
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="password"
            placeholder="Contraseña PDF"
            value={scanPassword}
            onChange={(e) => setScanPassword(e.target.value)}
            className="text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-secondary)] w-full sm:w-[140px]"
          />
          <button
            onClick={() => scanInputRef.current?.click()}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-colors shrink-0"
          >
            {scanning ? 'Escaneando...' : 'Scan estado de cuenta'}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors shrink-0"
          >
            <IconPlus /> Nuevo comprobante
          </button>
          <input
            ref={scanInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleScanFile}
          />
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        <StatCard icon={<IconInvoice />} label="Total del mes" value={stats ? `S/ ${stats.total_invertido.toLocaleString()}` : '—'} sub={stats ? `${stats.total_recibos} comprobantes` : undefined} />
        <StatCard icon={<IconReceipt />} label="Honorarios" value={stats ? `S/ ${stats.total_pagado.toLocaleString()}` : '—'} sub={stats ? `${expenses.filter((e) => e.voucher_type === 'Honorarios').length} recibo(s)` : undefined} />
        <StatCard icon={<IconBank />} label="Servicios / banco" value={stats ? `S/ ${stats.total_pendiente.toLocaleString()}` : '—'} sub={stats ? `${stats.recibos_pendientes} pendiente(s)` : undefined} />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); }}
            className={`text-[13px] px-3.5 py-[5px] rounded-lg border-none transition-colors ${
              activeTab === tab
                ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Filtros + drop zone ─────────────────────────────────────── */}
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
          className={`${selectCls} w-full sm:w-[140px]`}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className={`${selectCls} w-full sm:w-[140px]`}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <label className="flex-1 min-w-[180px] flex items-center justify-center gap-2 border border-dashed border-[var(--border-subtle)] rounded-lg px-4 py-[7px] text-[13px] text-[var(--text-muted)] cursor-pointer hover:bg-[var(--bg-muted)] transition-colors">
          <IconUpload />
          Subir PDF (arrastra o haz clic)
          <input type="file" accept="application/pdf" className="hidden" />
        </label>
      </div>

      {/* ── Formulario ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            Nuevo comprobante
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <select
              className={selectCls + ' w-full'}
              value={form.supplier_id}
              onChange={(e) => setForm((f) => ({ ...f, supplier_id: Number(e.target.value) }))}
            >
              <option value={0}>Selecciona proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <input placeholder="Concepto" className={inputCls} value={form.concept} onChange={(e) => setForm((f) => ({ ...f, concept: e.target.value }))} />
            <input type="number" placeholder="Monto (S/)" className={inputCls} value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
            <input type="date" className={inputCls} value={form.issued_at} onChange={(e) => setForm((f) => ({ ...f, issued_at: e.target.value }))} />
            <select className={selectCls + ' w-full'} value={form.voucher_type} onChange={(e) => setForm((f) => ({ ...f, voucher_type: e.target.value }))}>
              <option value="">Tipo de comprobante</option>
              <option value="Honorarios">Recibo por honorarios</option>
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
              <option value="Servicio">Servicio</option>
            </select>
            <input placeholder="Número de comprobante" className={inputCls} value={form.voucher_number} onChange={(e) => setForm((f) => ({ ...f, voucher_number: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="text-[13px] px-3.5 py-[6px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="text-[13px] px-3.5 py-[6px] border border-[var(--border-subtle)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Creando...' : 'Crear comprobante'}
            </button>
          </div>
        </div>
      )}

      {/* ── Scan error ────────────────────────────────────────────────── */}
      {scanError && (
        <div className="bg-[#FCEBEB] border border-[#F7C1C1] rounded-xl p-4 text-[13px] text-[#791F1F] flex items-center justify-between">
          <span>{scanError}</span>
          <button
            onClick={() => setScanError(null)}
            className="underline text-gray-500 shrink-0 ml-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ── Bank statement review modal ──────────────────────────────── */}
      <BaseModal
        isOpen={bankStatementData !== null}
        onClose={() => setBankStatementData(null)}
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
            suppliers={suppliers}
            loading={batchLoading}
            onConfirm={handleBatchConfirm}
            onCancel={() => setBankStatementData(null)}
          />
        )}
      </BaseModal>

      {/* ── Estado cargando / error ──────────────────────────────────── */}
      {loading && (
        <div className="py-10 text-center text-[13px] text-[var(--text-muted)]">Cargando...</div>
      )}
      {error && !loading && (
        <div className="py-10 text-center text-[13px] text-[#791F1F]">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* ── Cards móvil (< sm) ──────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {expenses.length === 0 && (
              <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
                No hay comprobantes para este filtro.
              </p>
            )}
            {expenses.map((e) => (
              <div key={e.id} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <TipoBadge tipo={e.voucher_type ?? ''} />
                  <StatusBadge status={e.status} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{e.supplier?.name ?? '—'}</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{e.concept}</p>
                </div>
                <div className="flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                  <span className="font-mono">{e.receipt_number ?? '—'}</span>
                  <span>{e.issued_at}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[var(--text-primary)]">S/ {e.amount.toLocaleString()}</span>
                  <div className="flex gap-1">
                    {e.file_url && (
                      <IconBtn title="Ver PDF" onClick={() => e.file_url && window.open(e.file_url, '_blank')}><IconEye /></IconBtn>
                    )}
                    {e.file_url && (
                      <IconBtn title="Descargar PDF"><a href={e.file_url} download className="flex items-center"><IconDown /></a></IconBtn>
                    )}
                    {e.status === 'Pendiente' && (
                      <IconBtn variant="green" title="Marcar como pagado" onClick={() => handleMarkPaid(e.id)}><IconCheck /></IconBtn>
                    )}
                    {e.status !== 'Anulado' && (
                      <IconBtn variant="red" title="Anular" onClick={() => handleDelete(e.id)}><IconX /></IconBtn>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabla desktop (≥ sm) ─────────────────────────────────── */}
          <div className="hidden sm:block bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  {['Tipo', 'Nro. comprobante', 'Proveedor / Trabajador', 'Concepto', 'Fecha', 'Monto', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[13px] text-[var(--text-muted)]">
                      No hay comprobantes para este filtro.
                    </td>
                  </tr>
                )}
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
                    <td className="px-3 py-2.5"><TipoBadge tipo={e.voucher_type ?? ''} /></td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-secondary)] max-w-[130px] truncate">{e.receipt_number ?? '—'}</td>
                    <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] max-w-[160px] truncate">{e.supplier?.name ?? '—'}</td>
                    <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] max-w-[150px] truncate">{e.concept}</td>
                    <td className="px-3 py-2.5 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">{e.issued_at}</td>
                    <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] whitespace-nowrap">S/ {e.amount.toLocaleString()}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={e.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end">
                        {e.file_url && (
                          <IconBtn title="Ver PDF" onClick={() => e.file_url && window.open(e.file_url, '_blank')}><IconEye /></IconBtn>
                        )}
                        {e.file_url && (
                          <IconBtn title="Descargar PDF"><a href={e.file_url} download className="flex items-center"><IconDown /></a></IconBtn>
                        )}
                        {e.status === 'Pendiente' && (
                          <IconBtn variant="green" title="Marcar como pagado" onClick={() => handleMarkPaid(e.id)}><IconCheck /></IconBtn>
                        )}
                        {e.status !== 'Anulado' && (
                          <IconBtn variant="red" title="Anular" onClick={() => handleDelete(e.id)}><IconX /></IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
                <span className="text-[12px] text-[var(--text-muted)]">
                  Página {safePage} de {totalPages} — {pagination?.total ?? 0} comprobantes
                </span>
                <div className="flex gap-2">
                  <button disabled={safePage <= 1} onClick={() => actions.goToPage(safePage - 1)} className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                  <button disabled={!hasMore} onClick={() => actions.goToPage(safePage + 1)} className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente</button>
                </div>
              </div>
            )}
          </div>

          {/* Paginación móvil */}
          {totalPages > 1 && (
            <div className="flex sm:hidden items-center justify-between px-1 py-2">
              <span className="text-[12px] text-[var(--text-muted)]">
                Pág. {safePage}/{totalPages}
              </span>
              <div className="flex gap-2">
                <button disabled={safePage <= 1} onClick={() => actions.goToPage(safePage - 1)} className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Ant.</button>
                <button disabled={!hasMore} onClick={() => actions.goToPage(safePage + 1)} className="text-[13px] px-3 py-[5px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sig. →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
