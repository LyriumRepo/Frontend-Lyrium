'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { useExpenses } from '@/features/admin/operations/hooks/usepenses';
import {
  StoreExpensePayload,
  UpdateExpensePayload,
} from '@/features/admin/operations/types/operations';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pagado: 'bg-emerald-50 text-emerald-600',
    Pendiente: 'bg-amber-50 text-amber-600',
    Anulado: 'bg-red-50 text-red-500',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-black text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}

export function ExpensesPageClient() {
  const { state, actions } = useExpenses();
  const { expenses, stats, suppliers, loading, error, filters, pagination } =
    state;

  // Simple inline form state (reemplazar con un Modal/BaseModal si ya tienes uno)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<StoreExpensePayload>>({
    status: 'Pendiente',
    issued_at: new Date().toISOString().slice(0, 10),
  });

  const handleCreate = async () => {
    if (!form.supplier_id || !form.concept || !form.amount || !form.issued_at)
      return;
    await actions.createExpense(form as StoreExpensePayload);
    setShowForm(false);
    setForm({
      status: 'Pendiente',
      issued_at: new Date().toISOString().slice(0, 10),
    });
  };

  const handleMarkPaid = async (id: number) => {
    if (!confirm('¿Marcar este recibo como Pagado?')) return;
    await actions.markAsPaid(id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Anular este recibo? Esta acción no se puede deshacer.'))
      return;
    await actions.deleteExpense(id);
  };

  return (
    <div className="space-y-8 animate-fadeIn font-industrial pb-20">
      <ModuleHeader
        title="Gastos Operativos"
        subtitle="Control de expenses y costos operativos"
        icon="Receipt"
        actions={
          <BaseButton
            variant="primary"
            leftIcon="Plus"
            size="md"
            onClick={() => setShowForm((v) => !v)}
          >
            Nuevo Gasto
          </BaseButton>
        }
      />

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Total invertido"
            value={`S/ ${stats.total_invertido.toLocaleString()}`}
          />
          <KpiCard
            label="Total pagado"
            value={`S/ ${stats.total_pagado.toLocaleString()}`}
          />
          <KpiCard
            label="Total pendiente"
            value={`S/ ${stats.total_pendiente.toLocaleString()}`}
          />
          <KpiCard
            label="Recibos pendientes"
            value={stats.recibos_pendientes}
          />
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por número o concepto..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64"
          value={filters.search ?? ''}
          onChange={(e) => actions.setFilters({ search: e.target.value })}
        />
        <select
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
          value={filters.status ?? ''}
          onChange={(e) =>
            actions.setFilters({
              status: e.target.value as UpdateExpensePayload['status'],
            })
          }
        >
          <option value="">Todos los estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Anulado">Anulado</option>
        </select>
        <input
          type="date"
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
          value={filters.from ?? ''}
          onChange={(e) => actions.setFilters({ from: e.target.value })}
        />
        <input
          type="date"
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
          value={filters.to ?? ''}
          onChange={(e) => actions.setFilters({ to: e.target.value })}
        />
      </div>

      {/* ── Inline form ───────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <p className="font-black text-gray-800">Nuevo recibo</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.supplier_id ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_id: Number(e.target.value) }))
              }
            >
              <option value="">Selecciona proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              placeholder="Concepto"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.concept ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, concept: e.target.value }))
              }
            />
            <input
              type="number"
              placeholder="Monto (S/)"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.amount ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: Number(e.target.value) }))
              }
            />
            <input
              type="date"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.issued_at ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, issued_at: e.target.value }))
              }
            />
            <input
              placeholder="Tipo de comprobante (Factura / Boleta)"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.voucher_type ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, voucher_type: e.target.value }))
              }
            />
            <input
              placeholder="Número de comprobante"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
              value={form.voucher_number ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, voucher_number: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 justify-end">
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear recibo'}
            </BaseButton>
          </div>
        </div>
      )}

      {/* ── Error / Loading ───────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Tabla ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full" aria-label="Tabla de gastos operativos">
          <thead>
            <tr className="border-b border-gray-100">
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                N° Recibo
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Concepto
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Proveedor
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Monto
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Estado
              </th>
              <th
                scope="col"
                className="p-6 text-left text-xs font-black text-gray-400 uppercase"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-400 text-sm"
                >
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && expenses.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-gray-400 text-sm"
                >
                  No hay recibos registrados.
                </td>
              </tr>
            )}
            {!loading &&
              expenses.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-6 font-mono text-xs text-gray-500">
                    {e.receipt_number}
                  </td>
                  <td className="p-6 font-bold text-gray-800">{e.concept}</td>
                  <td className="p-6 text-sm text-gray-600">
                    {e.supplier?.name ?? '—'}
                  </td>
                  <td className="p-6 font-black text-gray-900">
                    S/ {e.amount.toLocaleString()}
                  </td>
                  <td className="p-6 text-sm text-gray-500">{e.issued_at}</td>
                  <td className="p-6">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {e.status === 'Pendiente' && (
                        <button
                          onClick={() => handleMarkPaid(e.id)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Marcar pagado
                        </button>
                      )}
                      {e.status !== 'Anulado' && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-xs font-bold text-red-400 hover:underline"
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Página {pagination.page} de {pagination.totalPages} —{' '}
              {pagination.total} recibos
            </span>
            <div className="flex gap-2">
              <BaseButton
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => actions.goToPage(pagination.page - 1)}
              >
                Anterior
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                disabled={!pagination.hasMore}
                onClick={() => actions.goToPage(pagination.page + 1)}
              >
                Siguiente
              </BaseButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
