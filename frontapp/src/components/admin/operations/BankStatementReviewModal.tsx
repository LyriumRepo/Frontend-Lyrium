'use client';

import React, { useState } from 'react';
import type {
  BankStatementLine,
  BatchStoreLine,
} from '@/features/admin/operations/types/scan';
import type { Supplier } from '@/features/admin/operations/types/operations';

function formatAmount(n: number | null): string {
  if (n === null) return '—';
  return `S/ ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

interface BankStatementReviewModalProps {
  filePath: string
  period: string | null
  periodFull: string | null
  openingBalance: number | null
  closingBalance: number | null
  lines: BankStatementLine[]
  suppliers: Supplier[]
  loading: boolean
  onConfirm: (payload: {
    file_path: string
    supplier_id: number
    lines: BatchStoreLine[]
    period?: string
    period_full?: string
    opening_balance?: number
    closing_balance?: number
  }) => void
  onCancel: () => void
}

function MedBadge({ med }: { med: string | null }) {
  if (!med) return <span className="text-[var(--text-muted)]">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    BPI: { label: 'B. Internet', cls: 'bg-[var(--color-info)]/10 text-[var(--color-info)]' },
    CAJ: { label: 'Cajero', cls: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' },
    INT: { label: 'Interno', cls: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' },
    VEN: { label: 'Vent.', cls: 'bg-[var(--color-success)]/10 text-[var(--color-success)]' },
    POS: { label: 'POS', cls: 'bg-[var(--color-error)]/10 text-[var(--color-error)]' },
    TLC: { label: 'TeleC.', cls: 'bg-[var(--color-info)]/10 text-[var(--color-info)]' },
    BPT: { label: 'B. Tel.', cls: 'bg-[var(--color-info)]/10 text-[var(--color-info)]' },
  };
  const entry = map[med];
  return (
    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded ${entry?.cls ?? 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'}`}>
      {entry?.label ?? med}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: string | null }) {
  if (!tipo) return <span className="text-[var(--text-muted)]">—</span>;
  const map: Record<string, string> = {
    '4701': 'Transf.',
    '1201': 'Depósito',
    '4936': 'Mant.',
    '4991': 'Envío',
    '2202': 'Transf. Rec.',
    '0101': 'Comisión',
  };
  return (
    <span className="text-[11px] font-mono text-[var(--text-secondary)]" title={map[tipo] ?? 'Tipo ' + tipo}>
      {tipo}
    </span>
  );
}

export function BankStatementReviewModal({
  filePath,
  period,
  periodFull,
  openingBalance,
  closingBalance,
  lines,
  suppliers,
  loading,
  onConfirm,
  onCancel,
}: BankStatementReviewModalProps) {
  const [selected, setSelected] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    lines.forEach((line, i) => {
      if (line.charge !== null && line.charge > 0) {
        initial.add(i);
      }
    });
    return initial;
  });
  const [supplierId, setSupplierId] = useState<number>(
    suppliers.length > 0 ? suppliers[0].id : 0,
  );

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(lines.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelected(new Set<number>());
  };

  const totalCharges = [...selected].reduce(
    (sum, idx) => sum + (lines[idx].charge ?? lines[idx].deposit ?? 0), 0,
  );

  const handleConfirm = () => {
    if (!supplierId || selected.size === 0) return;

    const batchLines: BatchStoreLine[] = [];
    for (const idx of selected) {
      const line = lines[idx];
      batchLines.push({
        date: line.date,
        description: line.description,
        reference: line.reference ?? undefined,
        amount: line.charge ?? line.deposit ?? 0,
        glossary_key: line.glossary_key ?? undefined,
        glossary_description: line.glossary_description ?? undefined,
        hour: line.hour ?? undefined,
        med: line.med ?? undefined,
        tipo: line.tipo ?? undefined,
        place: line.place ?? undefined,
        balance: line.balance ?? undefined,
      });
    }

    onConfirm({
      file_path: filePath,
      supplier_id: supplierId,
      lines: batchLines,
      period: period ?? undefined,
      period_full: periodFull ?? undefined,
      opening_balance: openingBalance ?? undefined,
      closing_balance: closingBalance ?? undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Period Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--bg-muted)] rounded-xl p-3">
          <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wide">Período</p>
          <p className="text-[13px] text-[var(--text-primary)] font-medium mt-0.5">{periodFull ?? period ?? '—'}</p>
        </div>
        <div className="bg-[var(--bg-muted)] rounded-xl p-3">
          <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wide">Saldo Inicial</p>
          <p className="text-[13px] text-[var(--text-primary)] font-medium mt-0.5">{formatAmount(openingBalance)}</p>
        </div>
        <div className="bg-[var(--bg-muted)] rounded-xl p-3">
          <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wide">Saldo Final</p>
          <p className="text-[13px] text-[var(--text-primary)] font-medium mt-0.5">{formatAmount(closingBalance)}</p>
        </div>
        <div className="bg-[var(--bg-muted)] rounded-xl p-3">
          <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wide">Movimientos</p>
          <p className="text-[13px] text-[var(--text-primary)] font-medium mt-0.5">{lines.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-[12px] px-2.5 py-1 border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            Seleccionar todo
          </button>
          <button
            onClick={deselectAll}
            className="text-[12px] px-2.5 py-1 border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            Deseleccionar
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[13px] text-[var(--text-secondary)] shrink-0">
          Proveedor:
        </label>
        <select
          className="text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-secondary)] flex-1"
          value={supplierId}
          onChange={(e) => setSupplierId(Number(e.target.value))}
        >
          <option value={0}>Selecciona un proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[360px] overflow-y-auto border border-[var(--border-subtle)] rounded-xl">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--bg-muted)] sticky top-0">
              <th className="w-[36px] px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === lines.length}
                  onChange={selectAll}
                  className="accent-[var(--text-primary)]"
                />
              </th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Fecha</th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Descripción</th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Med</th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Hora</th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Tipo</th>
              <th className="text-right px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Cargo</th>
              <th className="text-right px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Abono</th>
              <th className="text-left px-2 py-2 text-[11px] font-medium text-[var(--text-muted)]">Glosario</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => {
              const isCharge = line.charge !== null && line.charge > 0;
              const isDeposit = line.deposit !== null && line.deposit > 0;
              const isSelected = selected.has(i);
              return (
                <tr
                  key={i}
                  onClick={() => toggle(i)}
                  className={`border-t border-[var(--border-subtle)] cursor-pointer transition-colors hover:bg-[var(--bg-muted)] ${
                    isSelected ? 'bg-[var(--color-info)]/5' : ''
                  }`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(i)}
                      className="accent-[var(--text-primary)]"
                    />
                  </td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] font-mono">{line.date}</td>
                  <td className="px-2 py-2 text-[var(--text-primary)] truncate max-w-[200px]" title={line.description}>
                    {line.description}
                  </td>
                  <td className="px-2 py-2"><MedBadge med={line.med} /></td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] font-mono text-[12px]">{line.hour ?? '—'}</td>
                  <td className="px-2 py-2"><TipoBadge tipo={line.tipo} /></td>
                  <td className="px-2 py-2 text-right text-[var(--text-primary)] font-medium">
                    {isCharge ? formatAmount(line.charge) : '—'}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--text-primary)] font-medium">
                    {isDeposit ? formatAmount(line.deposit) : '—'}
                  </td>
                  <td className="px-2 py-2">
                    {line.glossary_description ? (
                      <span className="inline-block text-[11px] bg-[var(--bg-muted)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full truncate max-w-[160px]">
                        {line.glossary_description}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[13px] text-[var(--text-secondary)]">
        <span>
          {selected.size} de {lines.length} movimiento(s) seleccionado(s)
        </span>
        {selected.size > 0 && (
          <span className="font-medium text-[var(--text-primary)]">
            Total:{' '}
            {formatAmount(totalCharges)}
          </span>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1 border-t border-[var(--border-subtle)]">
        <button
          onClick={onCancel}
          className="text-[13px] px-3.5 py-[6px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || !supplierId || selected.size === 0}
          className="text-[13px] px-3.5 py-[6px] border border-[var(--border-subtle)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-colors"
        >
          {loading
            ? 'Creando gasto...'
            : `Crear gasto resumen (${formatAmount(totalCharges)})`}
        </button>
      </div>
    </div>
  );
}