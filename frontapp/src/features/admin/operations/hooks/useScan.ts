'use client';

import { useState, useCallback } from 'react';
import { expenseRepository } from '@/shared/lib/api/operationsRepository';
import type { ScanApiResponse, ScannedDataResponse } from '../types/scan';
import type { Expense } from '../types/operations';

interface ScanState {
  loading: boolean;
  error: string | null;
  result: ScannedDataResponse | null;
  expense: (Expense & { scan_data: Record<string, unknown> | null }) | null;
  fileUrl: string | null;
}

interface UseScanReturn {
  state: ScanState;
  actions: {
    scan: (file: File) => Promise<void>;
    reset: () => void;
  };
}

export function useScan(): UseScanReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedDataResponse | null>(null);
  const [expense, setExpense] = useState<ScanState['expense']>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const scan = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setExpense(null);
    setFileUrl(null);

    try {
      const data: ScanApiResponse = await expenseRepository.scan(file);

      setResult(data.scan);
      setExpense(data.expense);
      setFileUrl(data.file_url);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al escanear el documento',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
    setExpense(null);
    setFileUrl(null);
  }, []);

  return {
    state: { loading, error, result, expense, fileUrl },
    actions: { scan, reset },
  };
}
