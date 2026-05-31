'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as api from '@/features/admin/planes/api/planesAdminApi';
import type { PlanFromApi, ButtonColors } from '@/features/admin/planes/api/planesAdminApi';
import type { PlansMap, PlanData, AdminRequest, Vendedor, DetailedBenefit, PlanFeature } from '@/features/seller/plans/types';

export type AdminTab = 'requests' | 'plans' | 'timeline' | 'uisettings' | 'payment' | 'vendedores';
export type RequestFilter = 'all' | 'approved' | 'pending' | 'rejected';
export type PlanStatusFilter = 'all' | 'active' | 'inactive';
export type PaymentFilter = 'all' | 'paid' | 'failed' | 'pending';
export type VendedorFilter = 'all' | 'activo' | 'por_vencer' | 'vencido' | 'indefinido';

export interface PaymentTotals {
  total_monto: number;
  pagos_exitosos: number;
  pagos_fallidos: number;
  pagos_pending: number;
}

export interface Transaccion {
  id: number; orderId?: string; estado: string;
  monto: number; meses: number; fecha: string; procesadoEn?: string;
  transactionId?: string; metodoPago?: string;
  planId: string; planNombre?: string; planColor?: string;
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
  id: string; type: 'success' | 'error'; title: string; body: string;
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
  subscribeBg: '#3b82f6', subscribeColor: '#ffffff',
  currentBg: '#e5e7eb',   currentColor:   '#9ca3af',
  lockedBg:  '#9ca3af',   lockedColor:    '#e5e7eb',
  warningColor: '#ef4444',
};

const initialEdit: Partial<PlanData> = {
  id: '', name: '', badge: '', description: '', price: 0, priceAnnual: 0,
  currency: 'S/', period: '/mes', periodAnnual: '/año',
  usePriceMode: true, priceText: '', priceSubtext: '',
  cssColor: '#3b82f6', accentColor: '#2563eb',
  bgImage: '', bgImageFit: 'cover', bgImagePosition: 'center', showBgInCard: false,
  requiresPayment: false, enableClaimLock: false, claimMonths: 1,
  subscribeButtonText: 'Suscribirse', trialSuccessTitle: '', trialSuccessMessage: '',
  trialWaitMessage: '', claimedButtonText: '', claimedWarningText: '',
  compactVisibleCount: 5, isActive: true, timelineIcon: 'star',
};

const initialState: AdminState = {
  activeTab: 'requests', plansData: {},
  requests: [], requestFilter: 'all',
  planStatusFilter: 'all',
  vendedores: [], vendedorFilter: 'all', vendedorSearch: '',
  buttonColors: defaultBtnColors,
  vendedorPagos: [], paymentTotals: { total_monto: 0, pagos_exitosos: 0, pagos_fallidos: 0, pagos_pending: 0 },
  paymentFilter: 'all', paymentNotifs: [],
  editorOpen: false, editorPlanId: null, editorTitle: 'Editar Plan',
  editorTab: 'basic', editingPlan: { ...initialEdit },
  editFeatures: [], editDetailedBenefits: [],
  modals: { deleteConfirm: false, restoreConfirm: false, deactivateConfirm: false, imageError: false, vendedorHistorial: false },
  confirmTargetPlan: null, restoreConfirmText: '',
  imageErrorMsg: '', imageErrorSuggestion: '',
  selectedVendedor: null, isLoaded: false, vendedoresLoading: false,
  approvingRequestId: null, rejectingRequestId: null,
};

function mapPlanToPlansMap(plans: api.PlanFromApi[]): PlansMap {
  const map: PlansMap = {};
  for (const p of plans) {
    map[p.slug] = {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      price: parseFloat(p.monthly_fee),
      priceAnnual: p.price_annual ? parseFloat(p.price_annual) : parseFloat(p.monthly_fee) * 12,
      currency: p.currency ?? 'S/',
      period: p.period ?? '/mes',
      periodAnnual: '/año',
      usePriceMode: p.use_price_mode ?? true,
      priceText: p.price_text ?? (parseFloat(p.monthly_fee) === 0 ? 'Gratis' : `S/ ${p.monthly_fee}`),
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

function broadcast(event: string): void {
  if (typeof BroadcastChannel !== 'undefined') {
    new BroadcastChannel('lyrium-planes').postMessage({ event });
  }
}

export function useAdmin() {
  const [state, _setState] = useState<AdminState>(initialState);
  const stateRef = useRef(state);

  const setState = useCallback((updater: AdminState | ((prev: AdminState) => AdminState)) => {
    _setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);

  const update = useCallback((patch: Partial<AdminState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, [setState]);

  const setModal = useCallback((key: ModalKey, open: boolean) => {
    setState(prev => ({ ...prev, modals: { ...prev.modals, [key]: open } }));
  }, []);

  // ── Inicialización ──────────────────────────

  const initialize = useCallback(async () => {
    try {
      const [planes, requestsRes, colors] = await Promise.all([
        api.fetchPlans(),
        api.fetchPlanRequests(),
        api.fetchColors().catch(() => defaultBtnColors),
      ]);

      const plansData = mapPlanToPlansMap(planes);

      const requests: AdminRequest[] = (requestsRes.data ?? []).map((r: api.PlanRequestFromApi) => ({
        id: r.id,
        usuario_id: String(r.store_id),
        userName: r.seller_name || r.store_name || '—',
        fromPlan: '',
        toPlan: r.plan?.name ?? '',
        planName: r.plan?.name ?? '',
        status: r.status as AdminRequest['status'],
        date: r.created_at,
        amount: Number(r.total_amount) || 0,
        months: r.months ?? 1,
        paymentMethod: r.payment_method === 'trial' ? 'trial' : 'izipay',
        type: r.payment_method === 'trial' ? 'trial' : 'upgrade',
        duration: r.months === 1 ? '1 mes' : r.months === 12 ? '1 año' : `${r.months} meses`,
      }));

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

  // ── Tabs ────────────────────────────────────

  const switchTab = useCallback(async (tab: AdminTab) => {
    update({ activeTab: tab });

    if (tab === 'vendedores') {
      update({ vendedoresLoading: true });
      try {
        const res = await api.fetchVendedores({ per_page: 100 });
        const vendedores: Vendedor[] = (res.data ?? []).map((v: api.VendedorFromApi) => ({
          usuario_id: String(v.store_id),
          username: v.trade_name || v.seller?.name || '—',
          email: v.seller?.email,
          correo: v.seller?.email,
          plan_actual: v.subscription?.plan_slug ?? '',
          nombre_plan: v.subscription?.plan_name ?? '',
          css_color: v.subscription?.plan_color ?? '',
          fecha_expiracion: v.subscription?.ends_at ?? '',
          historial: [],
        }));
        update({ vendedores, vendedoresLoading: false });
      } catch {
        update({ vendedores: [], vendedoresLoading: false });
      }
    }

    if (tab === 'uisettings') {
      try {
        const colors = await api.fetchColors();
        update({ buttonColors: colors });
      } catch { /* keep current */ }
    }

    if (tab === 'payment') {
      await loadPaymentHistory(stateRef.current.paymentFilter);
    }
  }, [update]);

  // ── Payment History ─────────────────────────

  const loadPaymentHistory = useCallback(async (filter: PaymentFilter) => {
    update({ paymentFilter: filter });
    try {
      const res = await api.fetchPagos({
        estado: filter === 'all' ? undefined : filter,
        per_page: 100,
      });

      const vendedorPagos: VendedorPago[] = (res.data ?? []).map((p: api.PagoFromApi) => ({
        usuario_id: String(p.store_id),
        username: p.store_name || p.seller_name || '—',
        email: p.seller_email,
        correo: p.seller_email,
        plan_actual: p.plan?.slug ?? '',
        total_monto: Number(p.amount) || 0,
        pagos_exitosos: p.payment_status === 'paid' ? 1 : 0,
        transacciones: [{
          id: p.id,
          estado: p.payment_status,
          monto: Number(p.amount) || 0,
          meses: p.months ?? 1,
          fecha: p.created_at,
          procesadoEn: p.procesado_en,
          metodoPago: p.payment_method === 'izipay' ? 'Izipay' : p.payment_method,
          planId: p.plan?.slug ?? '',
          planNombre: p.plan?.name ?? '',
          planColor: p.plan?.color ?? '',
        }],
        historial: [],
      }));

      const totals = res.totales ?? { total_monto: 0, pagos_exitosos: 0, pagos_fallidos: 0, pagos_pending: 0 };

      update({ vendedorPagos, paymentTotals: totals });
    } catch {
      update({ vendedorPagos: [], paymentTotals: { total_monto: 0, pagos_exitosos: 0, pagos_fallidos: 0, pagos_pending: 0 } });
    }
  }, [update]);

  // ── Plan Editor ─────────────────────────────

  const openPlanEditor = useCallback((planId: string) => {
    if (planId === 'new') {
      update({
        editorOpen: true, editorPlanId: 'new', editorTitle: 'Crear Nuevo Plan',
        editorTab: 'basic', editingPlan: { ...initialEdit },
        editFeatures: [], editDetailedBenefits: [],
      });
    } else {
      setState(prev => {
        const plan = prev.plansData[planId];
        if (!plan) return prev;
        return {
          ...prev,
          editorOpen: true, editorPlanId: planId, editorTitle: 'Editar Plan',
          editorTab: 'basic',
          editingPlan: { ...plan },
          editFeatures: plan.features ? [...plan.features] : [],
          editDetailedBenefits: (plan.detailedBenefits && plan.detailedBenefits.length > 0)
            ? [...plan.detailedBenefits]
            : [],
        };
      });
    }
  }, [update]);

  const closePlanEditor = useCallback(() => {
    update({ editorOpen: false, editorPlanId: null });
  }, [update]);

  const updateEditingPlan = useCallback((patch: Partial<PlanData>) => {
    setState(prev => ({ ...prev, editingPlan: { ...prev.editingPlan, ...patch } }));
  }, []);

  const setEditorTab = useCallback((tab: string) => update({ editorTab: tab }), [update]);

  const addFeature = useCallback(() => {
    setState(prev => ({ ...prev, editFeatures: [...prev.editFeatures, { text: '', active: true }] }));
  }, []);

  const updateFeature = useCallback((idx: number, patch: Partial<PlanFeature>) => {
    setState(prev => {
      const arr = [...prev.editFeatures];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, editFeatures: arr };
    });
  }, []);

  const removeFeature = useCallback((idx: number) => {
    setState(prev => ({ ...prev, editFeatures: prev.editFeatures.filter((_, i) => i !== idx) }));
  }, []);

  const addDetailedBenefit = useCallback(() => {
    setState(prev => ({
      ...prev,
      editDetailedBenefits: [...prev.editDetailedBenefits, { emoji: '', title: '', description: '', color: '#3b82f6' }],
    }));
  }, []);

  const updateDetailedBenefit = useCallback((idx: number, patch: Partial<DetailedBenefit>) => {
    setState(prev => {
      const arr = [...prev.editDetailedBenefits];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, editDetailedBenefits: arr };
    });
  }, []);

  const removeDetailedBenefit = useCallback((idx: number) => {
    setState(prev => ({
      ...prev,
      editDetailedBenefits: prev.editDetailedBenefits.filter((_, i) => i !== idx),
    }));
  }, []);

  // ── Save Plan ───────────────────────────────

  const savePlan = useCallback(async () => {
    console.log('[savePlan] clicked, stateRef:', stateRef.current?.editingPlan?.name);
    const { editingPlan: ep, editFeatures, editDetailedBenefits, plansData } = stateRef.current;
    if (!ep.name?.trim()) { alert('El nombre del plan es obligatorio'); return; }

    const features = editFeatures.filter(f => f.text?.trim());
    const detailedBenefits = editDetailedBenefits.filter(b => b.title?.trim());

    const slug = ep.slug?.trim() || ep.name?.trim().toLowerCase().replace(/\s+/g, '-') || 'plan_' + Date.now();

    const payload: Record<string, unknown> = {
      name: ep.name.trim(),
      slug,
      monthly_fee: ep.price ?? 0,
      commission_rate: ep.commission_rate ?? 0.05,
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
      price_text: ep.priceText ?? null,
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
      const isExisting = plansData[slug] != null;
      const saved = isExisting
        ? await api.updatePlan(slug, payload)
        : await api.createPlan(payload);

      const updatedPlan: PlanData = {
        ...ep,
        id: saved.slug,
        slug: saved.slug,
        price: parseFloat(saved.monthly_fee),
        features,
        detailedBenefits,
        isActive: saved.is_active,
      } as PlanData;

      setState(prev => ({
        ...prev,
        plansData: { ...prev.plansData, [saved.slug]: updatedPlan },
        editorOpen: false,
        editorPlanId: null,
      }));

      broadcast('planes_actualizados');
      alert('Plan guardado correctamente');
    } catch (err) {
      alert('Error al guardar el plan: ' + (err instanceof Error ? err.message : 'Error'));
    }
  }, []);

  // ── Toggle active ───────────────────────────

  const togglePlanActive = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plansData[planId];
      if (!plan) return prev;
      if (plan.isActive !== false) {
        return { ...prev, confirmTargetPlan: planId, modals: { ...prev.modals, deactivateConfirm: true } };
      }
      return { ...prev, confirmTargetPlan: planId };
    });
  }, []);

  const confirmDeactivate = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan;
    if (!planId) return;

    const plan = stateRef.current.plansData[planId];
    if (!plan) return;

    try {
      const saved = await api.togglePlanActive(planId);
      setState(prev => ({
        ...prev,
        plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], isActive: saved.is_active } },
        modals: { ...prev.modals, deactivateConfirm: false },
        confirmTargetPlan: null,
      }));
      broadcast('planes_actualizados');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error'));
    }
  }, []);

  // ── Delete ──────────────────────────────────

  const openDeleteConfirm = useCallback((planId: string) => {
    update({ confirmTargetPlan: planId });
    setModal('deleteConfirm', true);
  }, [update, setModal]);

  const confirmDelete = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan;
    if (!planId) return;

    const plan = stateRef.current.plansData[planId];
    if (!plan) return;

    try {
      await api.deletePlan(planId);
      setState(prev => {
        const plans = { ...prev.plansData };
        delete plans[planId];
        return { ...prev, plansData: plans, modals: { ...prev.modals, deleteConfirm: false }, confirmTargetPlan: null };
      });
      broadcast('planes_actualizados');
      alert('Plan eliminado correctamente');
    } catch (err) {
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : 'Error'));
    }
  }, []);

  // ── Restore ─────────────────────────────────

  const openRestoreConfirm = useCallback(async (planId: string) => {
    const plan = stateRef.current.plansData[planId];
    const planName = plan?.name ?? planId;
    update({
      confirmTargetPlan: planId,
      restoreConfirmText: `El plan "${planName}" volverá a su configuración original por defecto.`,
    });
    setModal('restoreConfirm', true);
  }, [update, setModal]);

  const confirmRestore = useCallback(async () => {
    setModal('restoreConfirm', false);
    alert('Función de restauración disponible próximamente');
  }, [setModal]);

  // ── Timeline Icon ───────────────────────────

  const selectTimelineIcon = useCallback(async (planId: string, iconKey: string) => {
    const plan = stateRef.current.plansData[planId];
    if (!plan) return;

    setState(prev => ({
      ...prev,
      plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], timelineIcon: iconKey } },
    }));

    try {
      await api.updatePlanIcon(planId, iconKey);
      broadcast('planes_actualizados');
    } catch { /* silent */ }
  }, []);

  // ── Colors ──────────────────────────────────

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

  const updateBtnColor = useCallback((key: keyof ButtonColors, value: string) => {
    setState(prev => ({ ...prev, buttonColors: { ...prev.buttonColors, [key]: value } }));
  }, []);

  // ── Payment Notifications ───────────────────

  const addPaymentNotif = useCallback((type: 'success' | 'error', title: string, body: string) => {
    const notif: PaymentNotif = { id: 'pn-' + Date.now(), type, title, body };
    setState(prev => ({ ...prev, paymentNotifs: [notif, ...prev.paymentNotifs] }));
    setTimeout(() => {
      setState(prev => ({ ...prev, paymentNotifs: prev.paymentNotifs.filter(n => n.id !== notif.id) }));
    }, 12000);
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setState(prev => ({ ...prev, paymentNotifs: prev.paymentNotifs.filter(n => n.id !== id) }));
  }, []);

  // ── Vendedores ──────────────────────────────

  const openVendedorModal = useCallback((uid: string) => {
    setState(prev => {
      const v = prev.vendedores.find(x => String(x.usuario_id) === String(uid)) ?? null;
      return { ...prev, selectedVendedor: v, modals: { ...prev.modals, vendedorHistorial: true } };
    });
  }, []);

  // ── Image Upload ────────────────────────────

  const handleImageUpload = useCallback((file: File) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(file.name);
    if (!isImage) {
      update({
        imageErrorMsg: `El archivo "${file.name}" no parece ser una imagen.`,
        imageErrorSuggestion: 'Intente con PNG, JPG, WebP, SVG u otro formato.',
      });
      setModal('imageError', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        updateEditingPlan({ bgImage: base64 });
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width: w, height: h } = img;
        if (w <= maxDim && h <= maxDim) { updateEditingPlan({ bgImage: base64 }); return; }
        const ratio = Math.min(maxDim / w, maxDim / h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateEditingPlan({ bgImage: canvas.toDataURL('image/jpeg', 0.70) });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  }, [updateEditingPlan, update, setModal]);

  // ── SSE Handlers ────────────────────────────

  const handleSolicitudesActualizadas = useCallback(async () => {
    try {
      const res = await api.fetchPlanRequests();
      const requests: AdminRequest[] = (res.data ?? []).map((r: api.PlanRequestFromApi) => ({
        id: r.id,
        usuario_id: String(r.store_id),
        userName: r.seller_name || r.store_name || '—',
        fromPlan: '',
        toPlan: r.plan?.name ?? '',
        planName: r.plan?.name ?? '',
        status: r.status as AdminRequest['status'],
        date: r.created_at,
        amount: Number(r.total_amount) || 0,
        months: r.months ?? 1,
        paymentMethod: r.payment_method === 'trial' ? 'trial' : 'izipay',
        type: r.payment_method === 'trial' ? 'trial' : 'upgrade',
        duration: r.months === 1 ? '1 mes' : r.months === 12 ? '1 año' : `${r.months} meses`,
      }));
      update({ requests });
    } catch { /* silent */ }
  }, [update]);

  const handlePlanesActualizados = useCallback(async () => {
    try {
      const planes = await api.fetchPlans();
      update({ plansData: mapPlanToPlansMap(planes) });
    } catch { /* silent */ }
  }, [update]);

  const handleColoresActualizados = useCallback(async () => {
    try {
      const colors = await api.fetchColors();
      update({ buttonColors: colors });
    } catch { /* silent */ }
  }, [update]);

  const handlePagoConfirmadoAdmin = useCallback(async () => {
    await handleSolicitudesActualizadas();
    if (stateRef.current.activeTab === 'payment') {
      await loadPaymentHistory(stateRef.current.paymentFilter);
    }
  }, [handleSolicitudesActualizadas, loadPaymentHistory]);

  const handlePagoFallidoAdmin = useCallback((datos: { motivo?: string }) => {
    addPaymentNotif('error', 'Pago fallido', datos.motivo ?? 'El pago no fue completado');
  }, [addPaymentNotif]);

  const handleApproveRequest = useCallback(async (requestId: number) => {
    update({ approvingRequestId: requestId });
    try {
      await api.approvePlanRequest(requestId);
      await initialize();
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      update({ approvingRequestId: null });
    }
  }, [initialize, update]);

  const handleRejectRequest = useCallback(async (requestId: number, notes: string) => {
    update({ rejectingRequestId: requestId });
    try {
      await api.rejectPlanRequest(requestId, notes);
      await initialize();
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      update({ rejectingRequestId: null });
    }
  }, [initialize, update]);

  return {
    state, update, setModal, initialize, switchTab,
    openPlanEditor, closePlanEditor, updateEditingPlan, setEditorTab, savePlan,
    addFeature, updateFeature, removeFeature,
    addDetailedBenefit, updateDetailedBenefit, removeDetailedBenefit,
    togglePlanActive, confirmDeactivate,
    openDeleteConfirm, confirmDelete,
    openRestoreConfirm, confirmRestore,
    selectTimelineIcon,
    saveBtnColors, resetBtnColors, updateBtnColor,
    loadPaymentHistory,
    addPaymentNotif, dismissNotif,
    openVendedorModal,
    handleImageUpload,
    handleSolicitudesActualizadas, handlePlanesActualizados,
    handleColoresActualizados, handlePagoConfirmadoAdmin, handlePagoFallidoAdmin,
    handleApproveRequest, handleRejectRequest,
  };
}
