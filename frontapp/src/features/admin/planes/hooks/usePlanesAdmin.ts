'use client';

import { useState, useCallback, useRef } from 'react';
import * as api from '@/features/admin/planes/api/planesAdminApi';
import type {
  PlanFromApi,
  ButtonColors,
} from '@/features/admin/planes/api/planesAdminApi';
import type {
  PlansMap,
  PlanData,
  AdminRequest,
  Vendedor,
  DetailedBenefit,
  PlanFeature,
} from '@/features/seller/plans/types';

export type AdminTab =
  | 'requests'
  | 'plans'
  | 'timeline'
  | 'uisettings'
  | 'payment'
  | 'vendedores';
export type RequestFilter = 'all' | 'approved' | 'pending' | 'rejected';
export type PlanStatusFilter = 'all' | 'active' | 'inactive';
export type PaymentFilter = 'all' | 'paid' | 'failed' | 'pending';
export type VendedorFilter =
  | 'all'
  | 'activo'
  | 'por_vencer'
  | 'vencido'
  | 'indefinido';

export interface PaymentTotals {
  total_monto: number;
  pagos_exitosos: number;
  pagos_fallidos: number;
  pagos_pendientes: number;
}

export interface Transaccion {
  id: number;
  orderId?: string;
  estado: string;
  monto: number;
  meses: number;
  fecha: string;
  procesadoEn?: string;
  transactionId?: string;
  metodoPago?: string;
  planId: string;
  planNombre?: string;
  planColor?: string;
}

export interface VendedorPago {
  usuario_id: string;
  username: string;
  email?: string;
  correo?: string;
  plan_actual?: string;
  total_monto: number;
  pagos_exitosos: number;
  transacciones: Transaccion[];
  historial: Record<string, unknown>[];
}

export interface PaymentNotif {
  id: string;
  type: 'success' | 'error';
  title: string;
  body: string;
}

export interface AdminState {
  activeTab: AdminTab;
  plansData: PlansMap;
  requests: AdminRequest[];
  requestFilter: RequestFilter;
  planStatusFilter: PlanStatusFilter;
  vendedores: Vendedor[];
  vendedorFilter: VendedorFilter;
  vendedorSearch: string;
  buttonColors: ButtonColors;
  vendedorPagos: VendedorPago[];
  paymentTotals: PaymentTotals;
  paymentFilter: PaymentFilter;
  paymentNotifs: PaymentNotif[];
  editorOpen: boolean;
  editorPlanId: string | null;
  editorTitle: string;
  editorTab: string;
  editingPlan: Partial<PlanData>;
  editFeatures: PlanFeature[];
  editDetailedBenefits: DetailedBenefit[];
  modals: {
    deleteConfirm: boolean;
    restoreConfirm: boolean;
    deactivateConfirm: boolean;
    imageError: boolean;
    vendedorHistorial: boolean;
  };
  confirmTargetPlan: string | null;
  restoreConfirmText: string;
  imageErrorMsg: string;
  imageErrorSuggestion: string;
  selectedVendedor: Vendedor | null;
  isLoaded: boolean;
  vendedoresLoading: boolean;
  approvingRequestId: number | null;
  rejectingRequestId: number | null;
}

type ModalKey = keyof AdminState['modals'];

const defaultBtnColors: ButtonColors = {
  subscribeBg: '#3b82f6',
  subscribeColor: '#ffffff',
  currentBg: '#e5e7eb',
  currentColor: '#9ca3af',
  lockedBg: '#9ca3af',
  lockedColor: '#e5e7eb',
  warningColor: '#ef4444',
};

const initialEdit: Partial<PlanData> = {
  id: '',
  name: '',
  badge: '',
  description: '',
  price: 0,
  priceAnnual: 0,
  currency: 'S/',
  period: '/mes',
  periodAnnual: '/año',
  usePriceMode: true,
  priceText: '',
  priceSubtext: '',
  cssColor: '#3b82f6',
  accentColor: '#2563eb',
  bgImage: '',
  bgImageFit: 'cover',
  bgImagePosition: 'center',
  showBgInCard: false,
  requiresPayment: false,
  enableClaimLock: false,
  claimMonths: 1,
  subscribeButtonText: 'Suscribirse',
  trialSuccessTitle: '',
  trialSuccessMessage: '',
  trialWaitMessage: '',
  claimedButtonText: '',
  claimedWarningText: '',
  compactVisibleCount: 5,
  isActive: true,
  timelineIcon: 'star',
};

const initialState: AdminState = {
  activeTab: 'requests',
  plansData: {},
  requests: [],
  requestFilter: 'all',
  planStatusFilter: 'all',
  vendedores: [],
  vendedorFilter: 'all',
  vendedorSearch: '',
  buttonColors: defaultBtnColors,
  vendedorPagos: [],
  paymentTotals: {
    total_monto: 0,
    pagos_exitosos: 0,
    pagos_fallidos: 0,
    pagos_pendientes: 0,
  },
  paymentFilter: 'all',
  paymentNotifs: [],
  editorOpen: false,
  editorPlanId: null,
  editorTitle: 'Editar Plan',
  editorTab: 'basic',
  editingPlan: { ...initialEdit },
  editFeatures: [],
  editDetailedBenefits: [],
  modals: {
    deleteConfirm: false,
    restoreConfirm: false,
    deactivateConfirm: false,
    imageError: false,
    vendedorHistorial: false,
  },
  confirmTargetPlan: null,
  restoreConfirmText: '',
  imageErrorMsg: '',
  imageErrorSuggestion: '',
  selectedVendedor: null,
  isLoaded: false,
  vendedoresLoading: false,
  approvingRequestId: null,
  rejectingRequestId: null,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapPlanToPlansMap(plans: api.PlanFromApi[]): PlansMap {
  const map: PlansMap = {};
  for (const p of plans) {
    map[p.slug] = {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.monthly_fee),
      // FIX #4: no sobreescribir price_text con fallback incorrecto
      priceAnnual: p.price_annual
        ? parseFloat(p.price_annual)
        : parseFloat(p.monthly_fee) * 12,
      currency: p.currency ?? 'S/',
      period: p.period ?? '/mes',
      periodAnnual: '/año',
      usePriceMode: p.use_price_mode ?? true,
      priceText: p.price_text ?? '',
      priceSubtext: p.price_subtext ?? '/mes',
      description: p.description ?? '',
      badge: p.badge ?? '',
      cssColor: p.css_color ?? '#3b82f6',
      accentColor: p.accent_color ?? '#2563eb',
      requiresPayment: p.requires_payment ?? parseFloat(p.monthly_fee) > 0,
      isActive: p.is_active ?? true,
      timelineIcon: p.timeline_icon ?? 'star',
      features: (p.features ?? []) as PlanFeature[],
      detailedBenefits: (p.detailed_benefits ?? []) as DetailedBenefit[],
      subscribeButtonText: p.subscribe_button_text ?? 'Suscribirse',
      enableClaimLock: p.enable_claim_lock ?? false,
      claimMonths: p.claim_months ?? 1,
      compactVisibleCount: p.compact_visible_count ?? 5,
      trialSuccessTitle: p.trial_success_title ?? '',
      trialSuccessMessage: p.trial_success_message ?? '',
      trialWaitMessage: p.trial_wait_message ?? '',
      claimedButtonText: p.claimed_button_text ?? '',
      claimedWarningText: p.claimed_warning_text ?? '',
    };
  }
  return map;
}

function mapRequests(
  data: api.PlanRequestFromApi[],
  plansData: PlansMap,
): AdminRequest[] {
  return data.map((r: api.PlanRequestFromApi) => {
    // FIX #1: fromPlan usa current_plan_slug del backend (añadir al resource de Laravel)
    const fromSlug = (r as any).current_plan_slug ?? '';
    const toSlug = r.plan?.id
      ? (Object.values(plansData).find((p) => (p as any).dbId === r.plan.id)
          ?.slug ?? '')
      : '';

    return {
      id: r.id,
      usuario_id: String(r.store_id),
      userName: r.seller_name || r.store_name || '—',
      fromPlan: fromSlug,
      toPlan: r.plan?.name ?? '',
      planName: r.plan?.name ?? '',
      status: r.status as AdminRequest['status'],
      date: r.created_at,
      amount: Number(r.total_amount) || 0,
      months: r.months ?? 1,
      paymentMethod: r.payment_method === 'trial' ? 'trial' : 'izipay',
      type: r.payment_method === 'trial' ? 'trial' : 'upgrade',
      duration:
        r.months === 1
          ? '1 mes'
          : r.months === 12
            ? '1 año'
            : `${r.months} meses`,
    };
  });
}

function broadcast(event: string): void {
  if (typeof BroadcastChannel !== 'undefined') {
    new BroadcastChannel('lyrium-planes').postMessage({ event });
  }
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useAdmin() {
  const [state, _setState] = useState<AdminState>(initialState);
  const stateRef = useRef(state);

  const setState = useCallback(
    (updater: AdminState | ((prev: AdminState) => AdminState)) => {
      _setState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        stateRef.current = next;
        return next;
      });
    },
    [],
  );

  const update = useCallback(
    (patch: Partial<AdminState>) => {
      setState((prev) => ({ ...prev, ...patch }));
    },
    [setState],
  );

  const setModal = useCallback(
    (key: ModalKey, open: boolean) => {
      setState((prev) => ({
        ...prev,
        modals: { ...prev.modals, [key]: open },
      }));
    },
    [setState],
  );

  // ── Inicialización ──────────────────────────────────────────────────────────

  const initialize = useCallback(async () => {
    try {
      const [planes, requestsRes, colors] = await Promise.all([
        api.fetchPlans(),
        api.fetchPlanRequests(),
        api.fetchColors().catch(() => defaultBtnColors),
      ]);

      const plansData = mapPlanToPlansMap(planes);
      const requests = mapRequests(requestsRes.data ?? [], plansData);

      update({
        plansData,
        requests,
        buttonColors: colors ?? defaultBtnColors,
        isLoaded: true,
      });
    } catch (err) {
      console.error('Error initializing admin:', err);
      update({ isLoaded: true });
    }
  }, [update]);

  // ── Tabs ────────────────────────────────────────────────────────────────────

  const switchTab = useCallback(
    async (tab: AdminTab) => {
      update({ activeTab: tab });

      if (tab === 'vendedores') {
        update({ vendedoresLoading: true });
        try {
          const res = await api.fetchVendedores({ per_page: 100 });
          const vendedores: Vendedor[] = (res.data ?? []).map(
            (v: api.VendedorFromApi) => ({
              usuario_id: String(v.store_id),
              store_id: v.store_id,
              username: v.trade_name || v.seller?.name || '—',
              email: v.seller?.email,
              correo: v.seller?.email,
              plan_actual: v.subscription?.plan_slug ?? '',
              nombre_plan: v.subscription?.plan_name ?? '',
              css_color: v.subscription?.plan_color ?? '',
              fecha_expiracion: v.subscription?.ends_at ?? '',
              historial: [],
            }),
          );
          update({ vendedores, vendedoresLoading: false });
        } catch {
          update({ vendedores: [], vendedoresLoading: false });
        }
      }

      if (tab === 'uisettings') {
        try {
          const colors = await api.fetchColors();
          update({ buttonColors: colors });
        } catch {
          /* mantener actuales */
        }
      }

      if (tab === 'payment') {
        await loadPaymentHistory(stateRef.current.paymentFilter);
      }
    },
    [update],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Payment History ─────────────────────────────────────────────────────────

  const loadPaymentHistory = useCallback(
    async (filter: PaymentFilter) => {
      update({ paymentFilter: filter });
      try {
        const res = await api.fetchPagos({
          estado: filter === 'all' ? undefined : filter,
          per_page: 100,
        });

        const vendedorPagos: VendedorPago[] = (res.data ?? []).map(
          (p: api.PagoFromApi) => ({
            usuario_id: String(p.store_id),
            username: p.store_name || p.seller_name || '—',
            email: p.seller_email,
            correo: p.seller_email,
            plan_actual: p.plan?.slug ?? '',
            total_monto: Number(p.amount) || 0,
            pagos_exitosos: p.payment_status === 'paid' ? 1 : 0,
            transacciones: [
              {
                id: p.id,
                estado: p.payment_status,
                monto: Number(p.amount) || 0,
                meses: p.months ?? 1,
                fecha: p.created_at,
                procesadoEn: p.procesado_en,
                metodoPago:
                  p.payment_method === 'izipay' ? 'Izipay' : p.payment_method,
                planId: p.plan?.slug ?? '',
                planNombre: p.plan?.name ?? '',
                planColor: p.plan?.color ?? '',
              },
            ],
            historial: [],
          }),
        );

        const totals: PaymentTotals = res.totales ?? {
          total_monto: 0,
          pagos_exitosos: 0,
          pagos_fallidos: 0,
          pagos_pendientes: 0,
        };

        update({ vendedorPagos, paymentTotals: totals });
      } catch {
        update({
          vendedorPagos: [],
          paymentTotals: {
            total_monto: 0,
            pagos_exitosos: 0,
            pagos_fallidos: 0,
            pagos_pendientes: 0,
          },
        });
      }
    },
    [update],
  );

  // ── Plan Editor ─────────────────────────────────────────────────────────────

  const openPlanEditor = useCallback(
    (planId: string) => {
      if (planId === 'new') {
        update({
          editorOpen: true,
          editorPlanId: 'new',
          editorTitle: 'Crear Nuevo Plan',
          editorTab: 'basic',
          editingPlan: { ...initialEdit },
          editFeatures: [],
          editDetailedBenefits: [],
        });
      } else {
        setState((prev) => {
          const plan = prev.plansData[planId];
          if (!plan) return prev;
          return {
            ...prev,
            editorOpen: true,
            editorPlanId: planId, // slug original guardado aquí
            editorTitle: 'Editar Plan',
            editorTab: 'basic',
            editingPlan: { ...plan },
            editFeatures: plan.features ? [...plan.features] : [],
            editDetailedBenefits: plan.detailedBenefits?.length
              ? [...plan.detailedBenefits]
              : [],
          };
        });
      }
    },
    [update, setState],
  );

  const closePlanEditor = useCallback(() => {
    update({ editorOpen: false, editorPlanId: null });
  }, [update]);

  const updateEditingPlan = useCallback(
    (patch: Partial<PlanData>) => {
      setState((prev) => ({
        ...prev,
        editingPlan: { ...prev.editingPlan, ...patch },
      }));
    },
    [setState],
  );

  const setEditorTab = useCallback(
    (tab: string) => update({ editorTab: tab }),
    [update],
  );

  const addFeature = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editFeatures: [...prev.editFeatures, { text: '', active: true }],
    }));
  }, [setState]);

  const updateFeature = useCallback(
    (idx: number, patch: Partial<PlanFeature>) => {
      setState((prev) => {
        const arr = [...prev.editFeatures];
        arr[idx] = { ...arr[idx], ...patch };
        return { ...prev, editFeatures: arr };
      });
    },
    [setState],
  );

  const removeFeature = useCallback(
    (idx: number) => {
      setState((prev) => ({
        ...prev,
        editFeatures: prev.editFeatures.filter((_, i) => i !== idx),
      }));
    },
    [setState],
  );

  const addDetailedBenefit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      editDetailedBenefits: [
        ...prev.editDetailedBenefits,
        { emoji: '', title: '', description: '', color: '#3b82f6' },
      ],
    }));
  }, [setState]);

  const updateDetailedBenefit = useCallback(
    (idx: number, patch: Partial<DetailedBenefit>) => {
      setState((prev) => {
        const arr = [...prev.editDetailedBenefits];
        arr[idx] = { ...arr[idx], ...patch };
        return { ...prev, editDetailedBenefits: arr };
      });
    },
    [setState],
  );

  const removeDetailedBenefit = useCallback(
    (idx: number) => {
      setState((prev) => ({
        ...prev,
        editDetailedBenefits: prev.editDetailedBenefits.filter(
          (_, i) => i !== idx,
        ),
      }));
    },
    [setState],
  );

  // ── Save Plan ───────────────────────────────────────────────────────────────

  const savePlan = useCallback(async () => {
    const {
      editingPlan: ep,
      editFeatures,
      editDetailedBenefits,
      plansData,
      editorPlanId,
    } = stateRef.current;
    if (!ep.name?.trim()) {
      alert('El nombre del plan es obligatorio');
      return;
    }

    const features = editFeatures.filter((f) => f.text?.trim());
    const detailedBenefits = editDetailedBenefits.filter((b) =>
      b.title?.trim(),
    );

    // FIX #3: diferenciar slug de URL (original) vs slug del payload
    const isNew = editorPlanId === 'new';
    const originalSlug = isNew ? null : editorPlanId!; // slug para la URL del endpoint
    const newSlug =
      ep.slug?.trim() ||
      ep.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') ||
      'plan_' + Date.now();

    const payload: Record<string, unknown> = {
      name: ep.name.trim(),
      slug: isNew ? newSlug : originalSlug, // en update no cambiar slug
      monthly_fee: ep.price ?? 0,
      commission_rate: (ep as any).commission_rate ?? 0.05,
      has_membership_fee: (ep.price ?? 0) > 0,
      features,
      detailed_benefits: detailedBenefits,
      is_active: ep.isActive ?? true,
      timeline_icon: ep.timelineIcon ?? 'star',
      badge: ep.badge ?? '',
      description: ep.description ?? '',
      css_color: ep.cssColor ?? '#3b82f6',
      accent_color: ep.accentColor ?? '#2563eb',
      requires_payment: !!ep.requiresPayment,
      enable_claim_lock: !!ep.enableClaimLock,
      claim_months: ep.claimMonths ?? 1,
      subscribe_button_text: ep.subscribeButtonText ?? 'Suscribirse',
      currency: ep.currency ?? 'S/',
      period: ep.period ?? '/mes',
      price_annual: ep.priceAnnual ?? null,
      price_text: ep.priceText || null,
      price_subtext: ep.priceSubtext ?? '/mes',
      use_price_mode: ep.usePriceMode ?? true,
      compact_visible_count: ep.compactVisibleCount ?? 5,
      trial_success_title: ep.trialSuccessTitle ?? '',
      trial_success_message: ep.trialSuccessMessage ?? '',
      trial_wait_message: ep.trialWaitMessage ?? '',
      claimed_button_text: ep.claimedButtonText ?? '',
      claimed_warning_text: ep.claimedWarningText ?? '',
    };

    try {
      const saved = isNew
        ? await api.createPlan(payload)
        : await api.updatePlan(originalSlug!, payload);

      // ← NUEVO: refrescar todos los planes desde la API
      const planesActualizados = await api.fetchPlans();
      setState((prev) => ({
        ...prev,
        plansData: mapPlanToPlansMap(planesActualizados),
        editorOpen: false,
        editorPlanId: null,
      }));

      broadcast('planes_actualizados');
      alert('Plan guardado correctamente');
    } catch (err) {
      alert(
        'Error al guardar: ' + (err instanceof Error ? err.message : 'Error'),
      );
    }
  }, [setState]);

  // ── Toggle Active ───────────────────────────────────────────────────────────

  // FIX #2: activar directo sin modal, desactivar con confirmación
  const togglePlanActive = useCallback(
    (planId: string) => {
      const plan = stateRef.current.plansData[planId];
      if (!plan) return;

      if (plan.isActive !== false) {
        // Desactivar → pedir confirmación primero
        setState((prev) => ({
          ...prev,
          confirmTargetPlan: planId,
          modals: { ...prev.modals, deactivateConfirm: true },
        }));
      } else {
        // Activar → llamar API directo sin modal
        setState((prev) => ({ ...prev, confirmTargetPlan: planId }));
        api
          .togglePlanActive(planId)
          .then((saved) => {
            setState((prev) => ({
              ...prev,
              plansData: {
                ...prev.plansData,
                [planId]: {
                  ...prev.plansData[planId],
                  isActive: saved.is_active,
                },
              },
              confirmTargetPlan: null,
            }));
            broadcast('planes_actualizados');
          })
          .catch((err) =>
            alert(
              'Error al activar plan: ' +
                (err instanceof Error ? err.message : 'Error'),
            ),
          );
      }
    },
    [setState],
  );

  const confirmDeactivate = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan;
    if (!planId) return;

    try {
      const saved = await api.togglePlanActive(planId);
      setState((prev) => ({
        ...prev,
        plansData: {
          ...prev.plansData,
          [planId]: { ...prev.plansData[planId], isActive: saved.is_active },
        },
        modals: { ...prev.modals, deactivateConfirm: false },
        confirmTargetPlan: null,
      }));
      broadcast('planes_actualizados');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error'));
    }
  }, [setState]);

  // ── Delete ──────────────────────────────────────────────────────────────────

  const openDeleteConfirm = useCallback(
    (planId: string) => {
      update({ confirmTargetPlan: planId });
      setModal('deleteConfirm', true);
    },
    [update, setModal],
  );

  const confirmDelete = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan;
    if (!planId) return;

    try {
      await api.deletePlan(planId);
      setState((prev) => {
        const plans = { ...prev.plansData };
        delete plans[planId];
        return {
          ...prev,
          plansData: plans,
          modals: { ...prev.modals, deleteConfirm: false },
          confirmTargetPlan: null,
        };
      });
      broadcast('planes_actualizados');
      alert('Plan eliminado correctamente');
    } catch (err) {
      alert(
        'Error al eliminar: ' + (err instanceof Error ? err.message : 'Error'),
      );
    }
  }, [setState]);

  // ── Restore ─────────────────────────────────────────────────────────────────

  const openRestoreConfirm = useCallback(
    async (planId: string) => {
      const plan = stateRef.current.plansData[planId];
      update({
        confirmTargetPlan: planId,
        restoreConfirmText: `El plan "${plan?.name ?? planId}" volverá a su configuración original por defecto.`,
      });
      setModal('restoreConfirm', true);
    },
    [update, setModal],
  );

  const confirmRestore = useCallback(async () => {
    setModal('restoreConfirm', false);
    const slug = stateRef.current.confirmTargetPlan;
    if (!slug) return;
    try {
      await api.togglePlanActive(slug);
      broadcast('planes_actualizados');
      setState((prev) => {
        const plan = prev.plansData[slug];
        if (!plan) return prev;
        return {
          ...prev,
          plansData: {
            ...prev.plansData,
            [slug]: { ...plan, isActive: true },
          },
        };
      });
    } catch {
      alert('No se pudo restaurar el plan.');
    }
  }, [setModal, setState]);

  // ── Timeline Icon ────────────────────────────────────────────────────────────

  const selectTimelineIcon = useCallback(
    async (planId: string, iconKey: string) => {
      if (!stateRef.current.plansData[planId]) return;

      // Actualizar UI inmediatamente (optimistic)
      setState((prev) => ({
        ...prev,
        plansData: {
          ...prev.plansData,
          [planId]: { ...prev.plansData[planId], timelineIcon: iconKey },
        },
      }));

      try {
        await api.updatePlanIcon(planId, iconKey);
        broadcast('planes_actualizados');
      } catch (err) {
        console.error('Error updating icon:', err);
        // Revertir en caso de error
        const planes = await api.fetchPlans().catch(() => null);
        if (planes)
          setState((prev) => ({
            ...prev,
            plansData: mapPlanToPlansMap(planes),
          }));
      }
    },
    [setState],
  );

  // ── Colors ───────────────────────────────────────────────────────────────────

  const saveBtnColors = useCallback(async () => {
    const colors = stateRef.current.buttonColors;
    try {
      await api.saveColors(colors);
      broadcast('colores_actualizados');
      alert('Colores guardados correctamente');
    } catch {
      alert('Error al guardar colores');
    }
  }, []);

  const resetBtnColors = useCallback(async () => {
    try {
      const colors = await api.resetColors();
      update({ buttonColors: colors });
      broadcast('colores_actualizados');
    } catch {
      update({ buttonColors: { ...defaultBtnColors } });
    }
  }, [update]);

  const updateBtnColor = useCallback(
    (key: keyof ButtonColors, value: string) => {
      setState((prev) => ({
        ...prev,
        buttonColors: { ...prev.buttonColors, [key]: value },
      }));
    },
    [setState],
  );

  // ── Payment Notifications ────────────────────────────────────────────────────

  const addPaymentNotif = useCallback(
    (type: 'success' | 'error', title: string, body: string) => {
      const notif: PaymentNotif = { id: 'pn-' + Date.now(), type, title, body };
      setState((prev) => ({
        ...prev,
        paymentNotifs: [notif, ...prev.paymentNotifs],
      }));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          paymentNotifs: prev.paymentNotifs.filter((n) => n.id !== notif.id),
        }));
      }, 12000);
    },
    [setState],
  );

  const dismissNotif = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        paymentNotifs: prev.paymentNotifs.filter((n) => n.id !== id),
      }));
    },
    [setState],
  );

  // ── Vendedores ───────────────────────────────────────────────────────────────

  // FIX #5: cargar historial real desde /admin/vendedores/{id}
  const openVendedorModal = useCallback(
    async (uid: string) => {
      // 1. Abrir modal con datos básicos ya disponibles
      setState((prev) => {
        const v =
          prev.vendedores.find(
            (x) => String((x as any).store_id ?? x.usuario_id) === String(uid),
          ) ?? null;
        return {
          ...prev,
          selectedVendedor: v,
          modals: { ...prev.modals, vendedorHistorial: true },
        };
      });

      // 2. Enriquecer con detalle completo de la API
      try {
        const detail = await api.fetchVendedorDetail(Number(uid));

        const historial = (detail.data ?? []).map((r: any) => ({
          plan_desde: '',
          plan_hasta: r.plan_name ?? '—',
          nombre_desde: '—',
          nombre_hasta: r.plan_name ?? '—',
          motivo: r.status ?? 'activo',
          cambiado_en: r.starts_at,
          monto: r.monthly_fee,
          metodo: '—',
        }));

        setState((prev) => {
          if (!prev.modals.vendedorHistorial) return prev; // modal ya cerrado
          return {
            ...prev,
            selectedVendedor: prev.selectedVendedor
              ? { ...prev.selectedVendedor, historial }
              : prev.selectedVendedor,
          };
        });
      } catch (err) {
        console.error('Error loading vendedor detail:', err);
        // mantener datos básicos sin historial
      }
    },
    [setState],
  );

  // ── Image Upload ─────────────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    (file: File) => {
      const isImage =
        file.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|heic|heif|tiff)$/i.test(
          file.name,
        );
      if (!isImage) {
        update({
          imageErrorMsg: `El archivo "${file.name}" no parece ser una imagen.`,
          imageErrorSuggestion:
            'Intente con PNG, JPG, WebP, SVG, AVIF u otro formato de imagen.',
        });
        setModal('imageError', true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        // SVG → usar directo sin reescalar
        if (
          file.type === 'image/svg+xml' ||
          file.name.toLowerCase().endsWith('.svg')
        ) {
          updateEditingPlan({ bgImage: base64 });
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          const { width: w, height: h } = img;
          if (w <= maxDim && h <= maxDim) {
            updateEditingPlan({ bgImage: base64 });
            return;
          }
          const ratio = Math.min(maxDim / w, maxDim / h);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(w * ratio);
          canvas.height = Math.round(h * ratio);
          canvas
            .getContext('2d')!
            .drawImage(img, 0, 0, canvas.width, canvas.height);
          updateEditingPlan({ bgImage: canvas.toDataURL('image/jpeg', 0.7) });
        };
        img.onerror = () => {
          update({
            imageErrorMsg: `No se pudo procesar "${file.name}".`,
            imageErrorSuggestion:
              'El archivo puede estar corrupto. Intente con otro.',
          });
          setModal('imageError', true);
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    },
    [updateEditingPlan, update, setModal],
  );

  // ── SSE Handlers ─────────────────────────────────────────────────────────────

  const handleSolicitudesActualizadas = useCallback(async () => {
    try {
      const res = await api.fetchPlanRequests();
      const requests = mapRequests(res.data ?? [], stateRef.current.plansData);
      update({ requests });
    } catch {
      /* silent */
    }
  }, [update]);

  const handlePlanesActualizados = useCallback(async () => {
    try {
      const planes = await api.fetchPlans();
      update({ plansData: mapPlanToPlansMap(planes) });
    } catch {
      /* silent */
    }
  }, [update]);

  const handleColoresActualizados = useCallback(async () => {
    try {
      const colors = await api.fetchColors();
      update({ buttonColors: colors });
    } catch {
      /* silent */
    }
  }, [update]);

  const handlePagoConfirmadoAdmin = useCallback(async () => {
    await handleSolicitudesActualizadas();
    if (stateRef.current.activeTab === 'payment') {
      await loadPaymentHistory(stateRef.current.paymentFilter);
    }
  }, [handleSolicitudesActualizadas, loadPaymentHistory]);

  const handlePagoFallidoAdmin = useCallback(
    (datos: { motivo?: string }) => {
      addPaymentNotif(
        'error',
        'Pago fallido',
        datos.motivo ?? 'El pago no fue completado',
      );
    },
    [addPaymentNotif],
  );

  // ── Approve / Reject Requests ─────────────────────────────────────────────────

  const handleApproveRequest = useCallback(
    async (requestId: number) => {
      update({ approvingRequestId: requestId });
      try {
        await api.approvePlanRequest(requestId);
        addPaymentNotif(
          'success',
          'Solicitud aprobada',
          `La solicitud #${requestId} fue aprobada correctamente.`,
        );
        await handleSolicitudesActualizadas();
      } catch (err) {
        addPaymentNotif(
          'error',
          'Error al aprobar',
          err instanceof Error ? err.message : 'Error desconocido',
        );
        console.error('Error approving request:', err);
      } finally {
        update({ approvingRequestId: null });
      }
    },
    [update, addPaymentNotif, handleSolicitudesActualizadas],
  );

  const handleRejectRequest = useCallback(
    async (requestId: number, notes: string) => {
      update({ rejectingRequestId: requestId });
      try {
        await api.rejectPlanRequest(requestId, notes);
        addPaymentNotif(
          'error',
          'Solicitud rechazada',
          `La solicitud #${requestId} fue rechazada.`,
        );
        await handleSolicitudesActualizadas();
      } catch (err) {
        console.error('Error rejecting request:', err);
      } finally {
        update({ rejectingRequestId: null });
      }
    },
    [update, addPaymentNotif, handleSolicitudesActualizadas],
  );

  // ── Return ────────────────────────────────────────────────────────────────────

  return {
    state,
    update,
    setModal,
    initialize,
    switchTab,
    openPlanEditor,
    closePlanEditor,
    updateEditingPlan,
    setEditorTab,
    savePlan,
    addFeature,
    updateFeature,
    removeFeature,
    addDetailedBenefit,
    updateDetailedBenefit,
    removeDetailedBenefit,
    togglePlanActive,
    confirmDeactivate,
    openDeleteConfirm,
    confirmDelete,
    openRestoreConfirm,
    confirmRestore,
    selectTimelineIcon,
    saveBtnColors,
    resetBtnColors,
    updateBtnColor,
    loadPaymentHistory,
    addPaymentNotif,
    dismissNotif,
    openVendedorModal,
    handleImageUpload,
    handleSolicitudesActualizadas,
    handlePlanesActualizados,
    handleColoresActualizados,
    handlePagoConfirmadoAdmin,
    handlePagoFallidoAdmin,
    handleApproveRequest,
    handleRejectRequest,
  };
}
