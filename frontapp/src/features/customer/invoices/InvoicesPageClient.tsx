'use client';

import { useState, useEffect, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { BaseDatePicker } from '@/components/ui';
import { invoiceApi, type PaymentConfirmation } from '@/shared/lib/api/invoiceRepository';
import { downloadPdf, downloadPng, downloadJpg } from '@/shared/lib/api/boletaExport';

import { useToast } from '@/shared/lib/context/ToastContext';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
}

function PaymentCard({ confirmation }: { confirmation: PaymentConfirmation }) {
  const [loading, setLoading] = useState<'pdf' | 'png' | 'jpg' | null>(null);
  const { showToast } = useToast();

  const handleDownload = async (format: 'pdf' | 'png' | 'jpg') => {
    setLoading(format);
    try {
      const boletaOrder = {
        id: confirmation.orderNumber,
        orderNumber: confirmation.orderNumber,
        orderItems: confirmation.items?.map((item) => ({
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        subtotalAmount: confirmation.subtotal,
        shippingCost: confirmation.shippingCost,
        discountAmount: confirmation.discountAmount,
        total: confirmation.total,
      };
      if (format === 'pdf') {
        downloadPdf(boletaOrder);
      } else if (format === 'png') {
        await downloadPng(boletaOrder);
      } else {
        await downloadJpg(boletaOrder);
      }
    } catch {
      showToast('Error al descargar. Intenta de nuevo.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const itemCount = confirmation.items?.length ?? 0;

  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
          <Icon name="CheckCircle" className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 dark:text-[var(--text-primary)]">
            {confirmation.orderNumber}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-[var(--text-muted)]">
            <span>{formatDate(confirmation.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{itemCount} producto{itemCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(confirmation.total)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{confirmation.paymentMethod || '—'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
        <button
          onClick={() => handleDownload('pdf')}
          disabled={loading === 'pdf'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
        >
          {loading === 'pdf' ? <Icon name="Loader" className="w-3.5 h-3.5 animate-spin" /> : <Icon name="FileText" className="w-3.5 h-3.5" />}
          PDF
        </button>
        <button
          onClick={() => handleDownload('png')}
          disabled={loading === 'png'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors disabled:opacity-50"
        >
          {loading === 'png' ? <Icon name="Loader" className="w-3.5 h-3.5 animate-spin" /> : <Icon name="Image" className="w-3.5 h-3.5" />}
          PNG
        </button>
        <button
          onClick={() => handleDownload('jpg')}
          disabled={loading === 'jpg'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
        >
          {loading === 'jpg' ? <Icon name="Loader" className="w-3.5 h-3.5 animate-spin" /> : <Icon name="Image" className="w-3.5 h-3.5" />}
          JPG
        </button>
      </div>
    </div>
  );
}

export function InvoicesPageClient() {
  const [confirmations, setConfirmations] = useState<PaymentConfirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const loadConfirmations = useCallback(async (page = 1, fInicio?: string, fFin?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoiceApi.customerPaymentConfirmations({ page, fechaInicio: fInicio, fechaFin: fFin });
      setConfirmations(result.data);
      setPagination({ page: result.pagination.page, totalPages: result.pagination.totalPages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar confirmaciones de pago');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfirmations(1, fechaInicio, fechaFin);
  }, [loadConfirmations, fechaInicio, fechaFin]);

  if (isLoading && confirmations.length === 0) {
    return (
      <div className="flex flex-col min-h-[400px] animate-fadeIn">
        <ModuleHeader title="Mis Confirmaciones de Pago" subtitle="Historial de pagos realizados" icon="CheckCircle" />
        <div className="flex-1 flex items-center justify-center">
          <BaseLoading message="Cargando confirmaciones..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[400px] animate-fadeIn">
      <ModuleHeader
        title="Mis Confirmaciones de Pago"
        subtitle="Historial de pagos realizados en tus compras"
        icon="CheckCircle"
        actions={
          <button
            onClick={() => { setFechaInicio(''); setFechaFin(''); loadConfirmations(1); }}
            className="p-2.5 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl hover:bg-gray-50 dark:hover:bg-[var(--bg-card)] transition-colors"
            title="Actualizar"
          >
            <Icon name="RefreshCw" className="w-4 h-4 text-gray-500" />
          </button>
        }
      />

      <div className="px-4 sm:px-8 mb-6">
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-5 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Search" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
              Filtrar por fecha
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseDatePicker
              label="Desde"
              value={fechaInicio}
              onChange={(v) => { setFechaInicio(v); }}
              placeholder="Seleccionar fecha"
            />
            <BaseDatePicker
              label="Hasta"
              value={fechaFin}
              onChange={(v) => { setFechaFin(v); }}
              placeholder="Seleccionar fecha"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-8 mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <Icon name="AlertCircle" className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      <div className="flex-1 px-4 sm:px-8 pb-8">
        {confirmations.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[var(--bg-card)] flex items-center justify-center mb-6">
              <Icon name="CheckCircle" className="w-10 h-10 text-gray-300 dark:text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-[var(--text-primary)]">Sin confirmaciones de pago</h3>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-2 max-w-md">
              Aún no tienes pagos confirmados. Cuando realices una compra y el pago sea procesado, aparecerá aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {confirmations.map((conf) => (
              <PaymentCard key={conf.id} confirmation={conf} />
            ))}
          </div>
        )}

        {confirmations.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-8">
            <button
              onClick={() => loadConfirmations(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[var(--bg-card)]"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-[var(--text-muted)]">
              Pág. {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => loadConfirmations(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[var(--bg-card)]"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
