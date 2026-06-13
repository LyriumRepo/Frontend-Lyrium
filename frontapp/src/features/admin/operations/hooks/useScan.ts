'use client';

import { useState, useCallback } from 'react';
import { expenseRepository } from '@/shared/lib/api/operationsRepository';
import type {
  ScannedDataResponse,
  ScanFileResponse,
  BankStatementLine,
  BatchStoreLine,
  ScanBatchStorePayload,
} from '../types/scan';
import type { Expense } from '../types/operations';

interface ScanState {
  loading: boolean;
  error: string | null;
  result: ScannedDataResponse | null;
  expense: (Expense & { scan_data: Record<string, unknown> | null }) | null;
  fileUrl: string | null;
  bankStatementData: {
    filePath: string;
    period: string | null;
    periodFull: string | null;
    openingBalance: number | null;
    closingBalance: number | null;
    lines: BankStatementLine[];
  } | null;
  batchLoading: boolean;
}

interface UseScanReturn {
  state: ScanState;
  actions: {
    scan: (file: File, password?: string) => Promise<void>;
    reset: () => void;
    batchStore: (payload: {
      file_path: string;
      supplier_id: number;
      lines: BatchStoreLine[];
    }) => Promise<void>;
    clearBankStatement: () => void;
  };
}

export function useScan(): UseScanReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedDataResponse | null>(null);
  const [expense, setExpense] = useState<ScanState['expense']>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [bankStatementData, setBankStatementData] =
    useState<ScanState['bankStatementData']>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const scan = useCallback(async (file: File, password?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setExpense(null);
    setFileUrl(null);
    setBankStatementData(null);

    try {
      const data: ScanFileResponse = await expenseRepository.scan(
        file,
        password,
      );

      if ('is_bank_statement' in data && data.is_bank_statement) {
        const scan = data.scan as Extract<
          ScanFileResponse['scan'],
          { lines: BankStatementLine[] }
        > & { period_full?: string | null; opening_balance?: number | null; closing_balance?: number | null };
        setBankStatementData({
          filePath: data.file_path,
          period: 'period' in scan ? scan.period ?? null : null,
          periodFull: scan.period_full ?? null,
          openingBalance: scan.opening_balance ?? null,
          closingBalance: scan.closing_balance ?? null,
          lines: scan.lines ?? [],
        });
      } else {
        const normal = data as Extract<
          ScanFileResponse,
          { is_bank_statement?: false }
        >;
        setResult(normal.scan);
        setExpense('expense' in normal ? normal.expense : null);
        setFileUrl(normal.file_url);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al escanear el documento',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const batchStore = useCallback(
    async (payload: {
      file_path: string;
      supplier_id: number;
      lines: BatchStoreLine[];
      period?: string;
      period_full?: string;
      opening_balance?: number;
      closing_balance?: number;
    }) => {
      setBatchLoading(true);
      setError(null);
      try {
        await expenseRepository.scanBatchStore(
          payload as ScanBatchStorePayload,
        );
        setBankStatementData(null);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al crear los gastos desde el estado de cuenta',
        );
      } finally {
        setBatchLoading(false);
      }
    },
    [],
  );

  const clearBankStatement = useCallback(() => {
    setBankStatementData(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
    setExpense(null);
    setFileUrl(null);
    setBankStatementData(null);
    setBatchLoading(false);
  }, []);

  return {
    state: {
      loading,
      error,
      result,
      expense,
      fileUrl,
      bankStatementData,
      batchLoading,
    },
    actions: { scan, reset, batchStore, clearBankStatement },
  };
}
