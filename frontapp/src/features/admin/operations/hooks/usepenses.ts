'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  expenseRepository,
  supplierRepository,
} from '@/shared/lib/api/operationsRepository';
import {
  Expense,
  ExpenseStats,
  ExpenseFilters,
  StoreExpensePayload,
  UpdateExpensePayload,
  Supplier,
  Pagination,
} from '@/features/admin/operations/types/operations';
import type {
  ScanFileResponse,
  ScanBatchStorePayload,
} from '@/features/admin/operations/types/scan';

interface UseExpensesState {
  expenses: Expense[];
  stats: ExpenseStats | null;
  suppliers: Supplier[];
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pagination: Pagination | null;
}

interface UseExpensesActions {
  setFilters: (f: Partial<ExpenseFilters>) => void;
  goToPage: (page: number) => void;
  refresh: () => void;
  createExpense: (payload: StoreExpensePayload) => Promise<void>;
  updateExpense: (id: number, payload: UpdateExpensePayload) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  markAsPaid: (id: number) => Promise<void>;
  scanDocument: (file: File, password?: string) => Promise<ScanFileResponse>;
  scanBatchStore: (payload: ScanBatchStorePayload) => Promise<void>;
}

export function useExpenses(): {
  state: UseExpensesState;
  actions: UseExpensesActions;
} {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFiltersState] = useState<ExpenseFilters>({
    per_page: 15,
    page: 1,
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseRepository.list(filters);
      setExpenses(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const s = await expenseRepository.stats();
      setStats(s);
    } catch {
      // stats es no-crítico, no bloqueamos la página
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await supplierRepository.list({
        status: 'Activo',
        per_page: 100,
      });
      setSuppliers(res.data);
    } catch {
      // silencioso: sólo afecta al selector del form
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchStats();
    fetchSuppliers();
  }, [fetchStats, fetchSuppliers]);

  const setFilters = useCallback((partial: Partial<ExpenseFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const createExpense = useCallback(
    async (payload: StoreExpensePayload) => {
      await expenseRepository.create(payload);
      await Promise.all([fetchExpenses(), fetchStats()]);
    },
    [fetchExpenses, fetchStats],
  );

  const updateExpense = useCallback(
    async (id: number, payload: UpdateExpensePayload) => {
      await expenseRepository.update(id, payload);
      await Promise.all([fetchExpenses(), fetchStats()]);
    },
    [fetchExpenses, fetchStats],
  );

  const deleteExpense = useCallback(
    async (id: number) => {
      await expenseRepository.delete(id);
      await Promise.all([fetchExpenses(), fetchStats()]);
    },
    [fetchExpenses, fetchStats],
  );

  /** Shortcut: marcar como pagado con fecha de hoy */
  const markAsPaid = useCallback(
    async (id: number) => {
      await expenseRepository.update(id, { status: 'Pagado' });
      await Promise.all([fetchExpenses(), fetchStats()]);
    },
    [fetchExpenses, fetchStats],
  );

  const scanDocument = useCallback(
    async (file: File, password?: string): Promise<ScanFileResponse> => {
      return expenseRepository.scan(file, password);
    },
    [],
  );

  const scanBatchStore = useCallback(
    async (payload: ScanBatchStorePayload) => {
      await expenseRepository.scanBatchStore(payload);
      await Promise.all([fetchExpenses(), fetchStats()]);
    },
    [fetchExpenses, fetchStats],
  );

  return {
    state: {
      expenses,
      stats,
      suppliers,
      loading,
      statsLoading,
      error,
      filters,
      pagination,
    },
    actions: {
      setFilters,
      goToPage,
      refresh: fetchExpenses,
      createExpense,
      updateExpense,
      deleteExpense,
      markAsPaid,
      scanDocument,
      scanBatchStore,
    },
  };
}
