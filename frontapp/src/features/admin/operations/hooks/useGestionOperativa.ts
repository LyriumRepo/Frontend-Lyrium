'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import {
  operationsRepository,
  supplierRepository,
  expenseRepository,
  auditLogRepository,
  operationalRoleRepository,
} from '@/shared/lib/api/operationsRepository';
import {
  OperationsStats,
  Supplier,
  Expense,
  AuditLog,
  OperationalRole,
  SupplierFilters,
  ExpenseFilters,
  StoreSupplierPayload,
  UpdateSupplierPayload,
} from '../types/operations';

export type OperationalTab = 'proveedores' | 'gastos' | 'roles' | 'auditoria';

export interface OperationalKPI {
  label: string;
  val: string | number;
  icon: string;
  color: string;
}

// ─── Token Helper (Extrae token desde HttpOnly cookie en Next.js) ─────────────
let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

export function useGestionOperativa() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Dashboard stats ──
  const [stats, setStats] = useState<OperationsStats | null>(null);

  // ── Entities ──
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierFilters, setSupplierFiltersState] = useState<SupplierFilters>(
    {},
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseFilters, setExpenseFiltersState] = useState<ExpenseFilters>({});

  const [roles, setRoles] = useState<OperationalRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // ── UI state ──
  const [activeTab, setActiveTab] = useState<OperationalTab>('proveedores');
  const [selectedProvider, setSelectedProvider] = useState<Supplier | null>(
    null,
  );

  // ── 2FA Control ──
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(
    null,
  );
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [resendSuccessMessage, setResendSuccessMessage] = useState<
    string | null
  >(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, suppliersRes, expensesRes, rolesRes, auditRes] =
        await Promise.allSettled([
          operationsRepository.getStats(),
          supplierRepository.list({ per_page: 100 }),
          expenseRepository.list({ per_page: 100 }),
          operationalRoleRepository.list(),
          auditLogRepository.list({ per_page: 50 }),
        ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (suppliersRes.status === 'fulfilled')
        setSuppliers(suppliersRes.value.data);
      if (expensesRes.status === 'fulfilled')
        setExpenses(expensesRes.value.data);
      if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error de conexión al cargar datos',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── KPIs ──
  const kpis = useMemo((): OperationalKPI[] => {
    if (stats) {
      return [
        {
          label: 'Inversión Total',
          val: `S/ ${stats.inversion_total.toLocaleString()}`,
          icon: 'Coins',
          color: 'indigo',
        },
        {
          label: 'Proveedores Activos',
          val: stats.proveedores_activos,
          icon: 'UserCheck',
          color: 'emerald',
        },
        {
          label: 'En Pausa / Suspendidos',
          val: stats.proveedores_suspendidos,
          icon: 'UserMinus',
          color: 'orange',
        },
        {
          label: 'Recibos Pendientes',
          val: stats.recibos_pendientes,
          icon: 'Receipt',
          color: 'blue',
        },
      ];
    }
    return [
      { label: 'Inversión Total', val: '—', icon: 'Coins', color: 'indigo' },
      {
        label: 'Proveedores Activos',
        val: '—',
        icon: 'UserCheck',
        color: 'emerald',
      },
      {
        label: 'En Pausa / Suspendidos',
        val: '—',
        icon: 'UserMinus',
        color: 'orange',
      },
      { label: 'Recibos Pendientes', val: '—', icon: 'Receipt', color: 'blue' },
    ];
  }, [stats]);

  // ── Filtros Locales ──
  const filteredProviders = useMemo(() => {
    return suppliers.filter((p) => {
      const q = supplierFilters.search?.toLowerCase() ?? '';
      const matchQuery =
        !q || p.nombre.toLowerCase().includes(q) || (p.ruc ?? '').includes(q);
      const matchStatus =
        !supplierFilters.status ||
        supplierFilters.status === 'ALL' ||
        p.estado === supplierFilters.status;
      const matchType =
        !supplierFilters.type ||
        supplierFilters.type === 'ALL' ||
        p.tipo === supplierFilters.type;
      return matchQuery && matchStatus && matchType;
    });
  }, [suppliers, supplierFilters]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((g) => {
      const matchStatus =
        !expenseFilters.status || g.status === expenseFilters.status;
      const matchSupplier =
        !expenseFilters.supplier_id ||
        g.supplier?.id === expenseFilters.supplier_id;
      const matchFrom =
        !expenseFilters.from || g.issued_at >= expenseFilters.from;
      const matchTo = !expenseFilters.to || g.issued_at <= expenseFilters.to;
      return matchStatus && matchSupplier && matchFrom && matchTo;
    });
  }, [expenses, expenseFilters]);

  const totalInvestment = useMemo(
    () => filteredExpenses.reduce((acc, g) => acc + g.amount, 0),
    [filteredExpenses],
  );

  // ── 2FA helpers ──
  const request2FA = useCallback(async (onSuccess: () => void) => {
    setLoading(true);
    setError(null);
    setVerificationError(null);
    setResendSuccessMessage(null);
    try {
      const baseUrl = LARAVEL_API_URL.endsWith('/')
        ? LARAVEL_API_URL.slice(0, -1)
        : LARAVEL_API_URL;
      const token = await getToken();

      const response = await fetch(`${baseUrl}/operations/request-2fa`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Sesión no autorizada o expirada. Por favor, recarga la página.',
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'No se pudo enviar el código de seguridad.',
        );
      }

      setPending2FAAction(() => onSuccess);
      setShow2FAModal(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Error al solicitar el código 2FA';
      setError(msg);
      alert(`Acceso no autorizado: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const resend2FA = useCallback(async (): Promise<boolean> => {
    setVerificationError(null);
    setResendSuccessMessage(null);
    try {
      const baseUrl = LARAVEL_API_URL.endsWith('/')
        ? LARAVEL_API_URL.slice(0, -1)
        : LARAVEL_API_URL;
      const token = await getToken();

      const response = await fetch(`${baseUrl}/operations/request-2fa`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendSuccessMessage(
          data.message || 'Nuevo código enviado exitosamente.',
        );
        return true;
      } else {
        setVerificationError(data.error || 'No se pudo reenviar el código.');
        return false;
      }
    } catch (err) {
      console.error('Error al reenviar el código 2FA:', err);
      setVerificationError(
        'Error al intentar reenviar el código de seguridad.',
      );
      return false;
    }
  }, []);

  const verify2FA = useCallback(
    async (code: string): Promise<boolean> => {
      setVerificationError(null);
      setResendSuccessMessage(null);
      try {
        const baseUrl = LARAVEL_API_URL.endsWith('/')
          ? LARAVEL_API_URL.slice(0, -1)
          : LARAVEL_API_URL;
        const token = await getToken();

        const response = await fetch(`${baseUrl}/operations/verify-2fa`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setShow2FAModal(false);
          setVerificationError(null);
          setResendSuccessMessage(null);
          if (pending2FAAction) {
            pending2FAAction();
            setPending2FAAction(null);
          }
          return true;
        } else {
          setVerificationError(data.error || 'Código incorrecto.');
          return false;
        }
      } catch (err) {
        console.error('Error al verificar el código 2FA:', err);
        setVerificationError('Error de conexión con el servidor de seguridad.');
        return false;
      }
    },
    [pending2FAAction],
  );

  const close2FAModal = useCallback(() => {
    setShow2FAModal(false);
    setPending2FAAction(null);
    setVerificationError(null);
    setResendSuccessMessage(null);
  }, []);

  // ── Provider CRUD (Con manejo de errores avanzado) ──
  const saveProvider = useCallback(async (provider: Partial<Supplier>) => {
    setLoading(true);
    setError(null);
    try {
      if (provider.id) {
        const payload: UpdateSupplierPayload = {
          name: provider.nombre,
          ruc: provider.ruc,
          tipo: provider.tipo,
          especialidad: provider.especialidad,
          estado: provider.estado,
          fechaRenovacion: provider.fechaRenovacion ?? undefined,
          proyectos: provider.proyectos ?? undefined,
          certificaciones: provider.certificaciones ?? undefined,
        };

        // Ejecutamos Update (PUT)
        const response: any = await supplierRepository.update(
          provider.id,
          payload,
        );
        const updated = response?.data || response; // Compatibilidad con respuesta paginada o directa

        // Actualización optimista de la tabla
        setSuppliers((prev) =>
          prev.map((p) => {
            if (p.id === provider.id) {
              return { ...p, ...payload, ...updated };
            }
            return p;
          }),
        );
      } else {
        const payload: StoreSupplierPayload = {
          name: provider.nombre!,
          ruc: provider.ruc,
          tipo: provider.tipo,
          especialidad: provider.especialidad,
          fechaRenovacion: provider.fechaRenovacion ?? undefined,
          proyectos: provider.proyectos ?? undefined,
          certificaciones: provider.certificaciones ?? undefined,
        };
        // Ejecutamos Create (POST)
        const response: any = await supplierRepository.create(payload);
        const created = response?.data || response;
        setSuppliers((prev) => [created, ...prev]);
      }

      const newStats = await operationsRepository.getStats();
      setStats(newStats);

      // ✅ Éxito total: Cerramos el modal
      setSelectedProvider(null);
    } catch (err: any) {
      console.error('🚨 Backend rechazó la petición (saveProvider):', err);
      const msg = err.message || 'Error al conectar con el servidor';
      setError(msg);

      // ⚠️ Muestra alerta detallada con los errores de validación de Laravel (ej: RUC duplicado)
      alert(
        `⚠️ Laravel rechazó la operación:\n\n${msg}\n\nRevisa las validaciones de tu controlador (Ej: RUC duplicado en un PUT).`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProvider = useCallback(async (provider: Supplier) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar al proveedor "${provider.nombre}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    setLoading(true);
    try {
      await supplierRepository.delete(provider.id);
      setSuppliers((prev) => prev.filter((p) => p.id !== provider.id));
      const newStats = await operationsRepository.getStats();
      setStats(newStats);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar proveedor',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state: {
      suppliers,
      expenses,
      roles,
      auditLogs,
      stats,
      loading,
      error,
      activeTab,
      kpis,
      filteredProviders,
      filteredExpenses,
      totalInvestment,
      selectedProvider,
      show2FAModal,
      verificationError,
      resendSuccessMessage,
      providerFilters: supplierFilters,
      expenseFilters,
    },
    actions: {
      setActiveTab,
      setProviderFilters: (f: Partial<SupplierFilters>) =>
        setSupplierFiltersState((prev) => ({ ...prev, ...f })),
      setExpenseFilters: (f: Partial<ExpenseFilters>) =>
        setExpenseFiltersState((prev) => ({ ...prev, ...f })),
      setSelectedProvider,
      request2FA,
      resend2FA,
      verify2FA,
      close2FAModal,
      saveProvider,
      deleteProvider,
      refresh: fetchAll,
    },
  };
}
