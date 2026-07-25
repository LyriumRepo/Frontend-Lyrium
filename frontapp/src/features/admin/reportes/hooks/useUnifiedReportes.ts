'use client';

import { useEffect, useMemo } from 'react';
import { useAdminInvoices } from '@/features/admin/invoices/hooks/useAdminInvoices';
import { useControlVendedores } from '@/features/admin/sellers/hooks/useControlVendedores';
import { useTransactions } from '@/features/admin/payments/hooks/useTransactions';
import { useExpenses } from '@/features/admin/operations/hooks/usepenses';

export interface UnifiedReportesDateRange {
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Reportes Detallados por Módulo comparte un único rango de fechas (Centro
 * de Reportes) que se reenvía a cada hook de módulo con su propio mecanismo
 * de filtrado: invoices filtra client-side, payments/operations filtran
 * server-side, sellers filtra client-side por fecha de registro (no hay
 * filtro de fecha server-side en ese endpoint).
 */
export function useUnifiedReportes({ dateFrom, dateTo }: UnifiedReportesDateRange = {}) {
  const invoices = useAdminInvoices();
  const sellers = useControlVendedores();
  const payments = useTransactions({ date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const expenses = useExpenses();

  useEffect(() => {
    invoices.setDateFrom(dateFrom ?? '');
    invoices.setDateTo(dateTo ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  useEffect(() => {
    expenses.actions.setFilters({ from: dateFrom || undefined, to: dateTo || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const filteredSellers = useMemo(() => {
    if (!dateFrom && !dateTo) return sellers.filteredSellers;
    const endOfDay = dateTo ? `${dateTo}T23:59:59` : null;
    return sellers.filteredSellers.filter((s) => {
      if (!s.createdAt) return true;
      if (dateFrom && s.createdAt < dateFrom) return false;
      if (endOfDay && s.createdAt > endOfDay) return false;
      return true;
    });
  }, [sellers.filteredSellers, dateFrom, dateTo]);

  return {
    invoices: {
      data: invoices.invoices,
      kpis: invoices.kpis,
      loading: invoices.isLoading,
      error: invoices.error,
    },
    sellers: {
      data: filteredSellers,
      loading: sellers.loading,
      error: sellers.error,
    },
    payments: {
      data: payments.data,
      loading: payments.loading,
      error: payments.error,
    },
    operations: {
      data: expenses.state.expenses,
      loading: expenses.state.loading,
      error: expenses.state.error,
    },
  };
}
