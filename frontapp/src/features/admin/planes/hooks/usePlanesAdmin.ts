'use client';
// ============================================
// HOOK — useAdmin
// Estado + lógica de negocio del panel admin
// ============================================

import { useState, useCallback, useRef } from 'react';
import {
  apiGet, silentPost,
  getAllPlanRequests, approvePlanRequest, rejectPlanRequest,
  getSystemColors, updateSystemColors,
  getVendedores, getVendedorHistorial,
  updatePlanStatus, deletePlan, updatePlanIcon,
  savePlan as savePlanApi, updatePlan as updatePlanApi,
  getPaymentHistory,
} from '@/features/seller/plans/lib/api';
import { defaultPlansData, buildPlanOrder } from '@/features/seller/plans/lib/plans';
import { formatAdminDate } from '@/features/seller/plans/lib/helpers';
import type { PlansMap, PlanData, AdminRequest, Vendedor, ButtonColors, DetailedBenefit, PlanFeature } from '@/features/seller/plans/types';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { mockStorage } from '../lib/storage';

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

export interface VendedorPago extends Vendedor {
  correo?: string; total_monto: number; pagos_exitosos: number;
  transacciones: Transaccion[];
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
    rejectRequest: boolean;
  };
  rejectTargetId: number | null;
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
  activeTab: 'requests', plansData: defaultPlansData,
  requests: [], requestFilter: 'all',
  planStatusFilter: 'all',
  vendedores: [], vendedorFilter: 'all', vendedorSearch: '',
  buttonColors: defaultBtnColors,
  vendedorPagos: [], paymentTotals: { total_monto:0, pagos_exitosos:0, pagos_fallidos:0, pagos_pending:0 },
  paymentFilter: 'all', paymentNotifs: [],
  editorOpen: false, editorPlanId: null, editorTitle: 'Editar Plan',
  editorTab: 'basic', editingPlan: { ...initialEdit },
  editFeatures: [], editDetailedBenefits: [],
  modals: { deleteConfirm:false, restoreConfirm:false, deactivateConfirm:false, imageError:false, vendedorHistorial:false, rejectRequest:false },
  rejectTargetId: null,
  confirmTargetPlan: null, restoreConfirmText: '',
  imageErrorMsg: '', imageErrorSuggestion: '',
  selectedVendedor: null, isLoaded: false, vendedoresLoading: false, approvingRequestId: null, rejectingRequestId: null,
};

// Mapa slug → ID numérico del backend (solo para modo real API)
let slugToAdminNumericIdMap: Record<string, number> = {};

// ── Helpers de transformación ──────────────────────────────────
function transformBackendPlan(plan: any): PlanData {
  return {
    id: plan.slug,
    name: plan.name,
    slug: plan.slug,
    price: parseFloat(plan.monthly_fee) || 0,
    priceAnnual: parseFloat(plan.price_annual) || (parseFloat(plan.monthly_fee) || 0) * 12,
    period: plan.period || '/mes',
    periodAnnual: '/año',
    currency: plan.currency || 'S/',
    usePriceMode: plan.use_price_mode !== false && plan.use_price_mode !== 0,
    priceText: plan.price_text || (plan.monthly_fee === '0.00' ? 'Gratis' : `S/ ${plan.monthly_fee}`),
    priceSubtext: plan.price_subtext || (plan.monthly_fee === '0.00' ? 'Sin costo' : '/mes'),
    description: plan.description || '',
    badge: plan.badge || '',
    requiresPayment: plan.requires_payment ?? (plan.monthly_fee !== '0.00'),
    features: Array.isArray(plan.features)
      ? plan.features.map((f: any) => typeof f === 'string' ? { text: f, active: true } : { text: f.text || '', active: f.active !== false })
      : [],
    detailedBenefits: Array.isArray(plan.detailed_benefits)
      ? plan.detailed_benefits.map((b: any) => ({ emoji: b.emoji || '', title: b.title || '', description: b.description || '', color: b.color || '#3b82f6' }))
      : [],
    isActive: plan.is_active !== false && plan.is_active !== 0,
    cssColor: plan.css_color || '#3b82f6',
    accentColor: plan.accent_color || '#2563eb',
    bgImage: plan.bg_image || defaultPlansData[plan.slug]?.bgImage || '',
    color: plan.slug,
    allDetails: [],
    enableClaimLock: plan.enable_claim_lock !== false && plan.enable_claim_lock !== 0,
    claimMonths: plan.claim_months ?? 1,
    subscribeButtonText: plan.subscribe_button_text || 'Suscribirse',
    compactVisibleCount: plan.compact_visible_count ?? 5,
    timelineIcon: plan.timeline_icon || 'star',
  };
}

function transformBackendRequest(req: any): AdminRequest {
  const reqMonths = req.months || 1;
  const durationLabel = reqMonths === 1 ? '1 mes' : reqMonths === 12 ? '1 año' : `${reqMonths} meses`;
  return {
    id: req.id,
    usuario_id: String(req.store_id),
    userName: req.seller_name || req.store_name || '—',
    // Usar slug para que RequestsPanel pueda buscar color en plansData
    fromPlan: req.current_plan_slug || req.current_plan?.slug || 'sin-plan',
    toPlan: req.plan?.slug || req.requested_plan?.slug || req.plan?.name || req.requested_plan?.name || '',
    planName: req.plan?.name || req.requested_plan?.name || '',
    status: req.status === 'pending' ? 'pending' : req.status === 'approved' ? 'approved' : 'rejected',
    date: req.created_at || new Date().toISOString(),
    amount: parseFloat(req.total_amount || req.plan?.monthly_fee || '0'),
    months: reqMonths,
    paymentMethod: req.payment_method === 'trial' ? 'trial' : req.payment_method === 'izipay' ? 'Izipay' : req.payment_method,
    type: req.payment_method === 'trial' ? 'trial' : 'upgrade',
    duration: durationLabel,
  };
}

function transformBackendVendedor(v: any): Vendedor {
  // Backend /admin/vendedores returns: { id, trade_name, seller:{email}, subscription:{plan_slug, plan_name, plan_color, ends_at} }
  return {
    usuario_id: String(v.id || v.store_id || v.usuario_id || ''),
    username: v.trade_name || v.name || v.username || '',
    email: v.seller?.email || v.email || '',
    plan_actual: v.subscription?.plan_slug || v.current_plan?.slug || v.plan_actual || '',
    nombre_plan: v.subscription?.plan_name || v.current_plan?.name || v.nombre_plan || 'Sin plan',
    css_color: v.subscription?.plan_color || v.css_color || v.current_plan?.css_color || '#9ca3af',
    fecha_expiracion: v.subscription?.ends_at || v.subscription_ends_at || v.fecha_expiracion || '',
    historial: [],
  };
}

function transformColors(colorsData: Record<string, string>): ButtonColors {
  return {
    subscribeBg: colorsData.primary_color || defaultBtnColors.subscribeBg,
    subscribeColor: '#ffffff',
    currentBg: colorsData.success_color || defaultBtnColors.currentBg,
    currentColor: '#ffffff',
    lockedBg: colorsData.background_color || defaultBtnColors.lockedBg,
    lockedColor: colorsData.text_secondary_color || defaultBtnColors.lockedColor,
    warningColor: colorsData.error_color || defaultBtnColors.warningColor,
  };
}

function buildBackendPlanPayload(plan: PlanData, planId: string) {
  return {
    name: plan.name,
    slug: planId,
    monthly_fee: parseFloat(String(plan.price ?? 0)),
    features: (plan.features || [])
      .filter(f => f.text?.trim())
      .map(f => ({ text: f.text.trim(), active: f.active !== false })),
    detailed_benefits: (plan.detailedBenefits || [])
      .filter(b => b.title?.trim())
      .map(b => ({ emoji: b.emoji || '', title: b.title, description: b.description || '', color: b.color || '#3b82f6' })),
    is_active: plan.isActive !== false ? 1 : 0,
    description: plan.description || '',
    badge: plan.badge || '',
    css_color: plan.cssColor || '#3b82f6',
    accent_color: plan.accentColor || '#2563eb',
    requires_payment: plan.requiresPayment ? 1 : 0,
    enable_claim_lock: plan.enableClaimLock ? 1 : 0,
    claim_months: plan.claimMonths ?? 1,
    subscribe_button_text: plan.subscribeButtonText || 'Suscribirse',
    currency: plan.currency || 'S/',
    period: plan.period || '/mes',
    price_text: plan.priceText || '',
    price_subtext: plan.priceSubtext || '',
    use_price_mode: plan.usePriceMode !== false ? 1 : 0,
    compact_visible_count: plan.compactVisibleCount ?? 5,
    bg_image: plan.bgImage || '',
  };
}

function broadcastPlanesActualizados() {
  if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
  silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
}

function broadcastColoresActualizados() {
  if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'colores_actualizados' });
  silentPost('/sse/broadcast.php', { event: 'colores_actualizados' });
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
    setState(prev => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, [setState]);

  const setModal = useCallback((key: ModalKey, open: boolean) => {
    setState(prev => ({ ...prev, modals: { ...prev.modals, [key]: open } }));
  }, []);

  // ── Inicialización ────────────────────────────
  const initialize = useCallback(async () => {
    if (USE_MOCKS) {
      const storedPlans = mockStorage.getPlans();
      const storedColors = mockStorage.getColors();
      const plansToUse = storedPlans || defaultPlansData;
      const colorsToUse = storedColors || defaultBtnColors;

      const mockRequests: AdminRequest[] = [
        { id: 1, usuario_id: 'mock-001', userName: 'Juan Perez', type: 'upgrade', fromPlan: 'basic', toPlan: 'premium', planName: 'Premium', status: 'pending', date: new Date().toISOString(), months: 6, amount: 350 },
        { id: 2, usuario_id: 'mock-002', userName: 'Maria Garcia', type: 'upgrade', fromPlan: 'standard', toPlan: 'premium', planName: 'Premium', status: 'approved', date: new Date(Date.now() - 86400000 * 2).toISOString(), months: 12, amount: 600 },
        { id: 3, usuario_id: 'mock-003', userName: 'Carlos Lopez', type: 'downgrade', fromPlan: 'premium', toPlan: 'standard', planName: 'Standard', status: 'rejected', date: new Date(Date.now() - 86400000 * 5).toISOString(), months: 3, amount: 120 },
      ];

      const mockVendedorPagos: VendedorPago[] = [
        {
          usuario_id: 'mock-001', username: 'Juan Perez', email: 'juan@test.com', correo: 'juan@test.com',
          plan_actual: 'basic', total_monto: 150, pagos_exitosos: 2,
          transacciones: [
            { id: 1, estado: 'paid', monto: 50, meses: 1, fecha: new Date(Date.now() - 86400000 * 20).toISOString(), metodoPago: 'YAPE', planId: 'basic', planNombre: 'Basic', planColor: '#10b981' },
            { id: 2, estado: 'paid', monto: 100, meses: 2, fecha: new Date(Date.now() - 86400000 * 10).toISOString(), metodoPago: 'PLIN', planId: 'basic', planNombre: 'Basic', planColor: '#10b981' },
          ],
          historial: [],
        },
        {
          usuario_id: 'mock-002', username: 'Maria Garcia', email: 'maria@test.com', correo: 'maria@test.com',
          plan_actual: 'premium', total_monto: 650, pagos_exitosos: 3,
          transacciones: [
            { id: 3, estado: 'paid', monto: 200, meses: 6, fecha: new Date(Date.now() - 86400000 * 30).toISOString(), metodoPago: 'TARJETA', planId: 'premium', planNombre: 'Premium', planColor: '#8b5cf6' },
            { id: 4, estado: 'failed', monto: 100, meses: 3, fecha: new Date(Date.now() - 86400000 * 15).toISOString(), metodoPago: 'YAPE', planId: 'standard', planNombre: 'Standard', planColor: '#3b82f6' },
            { id: 5, estado: 'paid', monto: 350, meses: 12, fecha: new Date(Date.now() - 86400000 * 5).toISOString(), metodoPago: 'TARJETA', planId: 'premium', planNombre: 'Premium', planColor: '#8b5cf6' },
            { id: 6, estado: 'pending', monto: 100, meses: 3, fecha: new Date().toISOString(), metodoPago: 'PLIN', planId: 'standard', planNombre: 'Standard', planColor: '#3b82f6' },
          ],
          historial: [],
        },
      ];

      const mockPaymentTotals: PaymentTotals = { total_monto: 800, pagos_exitosos: 5, pagos_fallidos: 1, pagos_pending: 1 };

      const mockVendedores: Vendedor[] = [
        { usuario_id: 'mock-001', username: 'Juan Perez', email: 'juan@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 45).toISOString(), historial: [] },
        { usuario_id: 'mock-002', username: 'Maria Garcia', email: 'maria@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 10).toISOString(), historial: [] },
        { usuario_id: 'mock-003', username: 'Carlos Lopez', email: 'carlos@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() - 86400000 * 5).toISOString(), historial: [] },
        { usuario_id: 'mock-004', username: 'Ana Martinez', email: 'ana@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 120).toISOString(), historial: [] },
        { usuario_id: 'mock-005', username: 'Pedro Ramirez', email: 'pedro@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 30).toISOString(), historial: [] },
        { usuario_id: 'mock-006', username: 'Lucia Torres', email: 'lucia@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() + 86400000 * 60).toISOString(), historial: [] },
      ];

      update({ plansData: plansToUse, requests: mockRequests, buttonColors: colorsToUse, vendedorPagos: mockVendedorPagos, vendedores: mockVendedores, paymentTotals: mockPaymentTotals, isLoaded: true });
      return;
    }

    // API REAL — fuente única de verdad: el backend Laravel
    try {
      const [planesRes, requestsRes, colorsData] = await Promise.all([
        apiGet<{ data?: any[] }>('/admin/plans'),
        getAllPlanRequests(),
        getSystemColors(),
      ]);

      // Planes: poblar slugToAdminNumericIdMap para operaciones CRUD
      const plansData: PlansMap = {};
      if (Array.isArray(planesRes.data)) {
        planesRes.data.forEach((plan: any) => {
          slugToAdminNumericIdMap[plan.slug] = plan.id;
          plansData[plan.slug] = transformBackendPlan(plan);
        });
      }

      // Solicitudes
      const requestsData = (requestsRes as any)?.data;
      const transformedRequests: AdminRequest[] = Array.isArray(requestsData)
        ? requestsData.map(transformBackendRequest)
        : [];

      // Colores
      const buttonColors = (colorsData && Object.keys(colorsData).length > 0)
        ? transformColors(colorsData)
        : defaultBtnColors;

      const hasRealPlans = Object.keys(plansData).length > 0;
      update({
        plansData: hasRealPlans ? plansData : defaultPlansData,
        requests: transformedRequests,
        buttonColors,
        isLoaded: true,
      });
    } catch (err) {
      console.error('Error loading admin plans data:', err);
      update({ isLoaded: true });
    }
  }, [update]);

  // ── Historial de pagos ─────────────────────────
  const loadPaymentHistory = useCallback(async (filter: PaymentFilter) => {
    update({ paymentFilter: filter });

    if (USE_MOCKS) {
      const mockVendedorPagos: VendedorPago[] = [
        {
          usuario_id: 'mock-001', username: 'Juan Perez', email: 'juan@test.com', correo: 'juan@test.com',
          plan_actual: 'basic', total_monto: 150, pagos_exitosos: 2,
          transacciones: [
            { id: 1, estado: 'paid', monto: 50, meses: 1, fecha: new Date(Date.now() - 86400000 * 20).toISOString(), metodoPago: 'YAPE', planId: 'basic', planNombre: 'Basic', planColor: '#10b981' },
            { id: 2, estado: 'paid', monto: 100, meses: 2, fecha: new Date(Date.now() - 86400000 * 10).toISOString(), metodoPago: 'PLIN', planId: 'basic', planNombre: 'Basic', planColor: '#10b981' },
          ],
          historial: [],
        },
        {
          usuario_id: 'mock-002', username: 'Maria Garcia', email: 'maria@test.com', correo: 'maria@test.com',
          plan_actual: 'premium', total_monto: 650, pagos_exitosos: 3,
          transacciones: [
            { id: 3, estado: 'paid', monto: 200, meses: 6, fecha: new Date(Date.now() - 86400000 * 30).toISOString(), metodoPago: 'TARJETA', planId: 'premium', planNombre: 'Premium', planColor: '#8b5cf6' },
            { id: 4, estado: 'failed', monto: 100, meses: 3, fecha: new Date(Date.now() - 86400000 * 15).toISOString(), metodoPago: 'YAPE', planId: 'standard', planNombre: 'Standard', planColor: '#3b82f6' },
            { id: 5, estado: 'paid', monto: 350, meses: 12, fecha: new Date(Date.now() - 86400000 * 5).toISOString(), metodoPago: 'TARJETA', planId: 'premium', planNombre: 'Premium', planColor: '#8b5cf6' },
            { id: 6, estado: 'pending', monto: 100, meses: 3, fecha: new Date().toISOString(), metodoPago: 'PLIN', planId: 'standard', planNombre: 'Standard', planColor: '#3b82f6' },
          ],
          historial: [],
        },
      ];
      const filteredPagos = filter !== 'all'
        ? mockVendedorPagos.filter(v => v.transacciones.some(t => t.estado === filter))
        : mockVendedorPagos;
      update({ vendedorPagos: filteredPagos, paymentTotals: { total_monto: 800, pagos_exitosos: 5, pagos_fallidos: 1, pagos_pending: 1 } });
      return;
    }

    try {
      const res = await getPaymentHistory(filter);
      update({ vendedorPagos: res.vendedores ?? [], paymentTotals: res.totales ?? initialState.paymentTotals });
    } catch (err) {
      console.error('Error loading payment history:', err);
    }
  }, [update]);

  // ── Tabs ──────────────────────────────────────
  const switchTab = useCallback(async (tab: AdminTab) => {
    update({ activeTab: tab });

    if (tab === 'vendedores') {
      update({ vendedoresLoading: true });

      if (USE_MOCKS) {
        const mockVendedores: Vendedor[] = [
          { usuario_id: 'mock-001', username: 'Juan Perez', email: 'juan@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 45).toISOString(), historial: [] },
          { usuario_id: 'mock-002', username: 'Maria Garcia', email: 'maria@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 10).toISOString(), historial: [] },
          { usuario_id: 'mock-003', username: 'Carlos Lopez', email: 'carlos@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() - 86400000 * 5).toISOString(), historial: [] },
          { usuario_id: 'mock-004', username: 'Ana Martinez', email: 'ana@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 120).toISOString(), historial: [] },
          { usuario_id: 'mock-005', username: 'Pedro Ramirez', email: 'pedro@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 30).toISOString(), historial: [] },
          { usuario_id: 'mock-006', username: 'Lucia Torres', email: 'lucia@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() + 86400000 * 60).toISOString(), historial: [] },
        ];
        update({ vendedores: mockVendedores, vendedoresLoading: false });
        return;
      }

      try {
        const vendedoresRaw = await getVendedores();
        update({ vendedores: vendedoresRaw.map(transformBackendVendedor), vendedoresLoading: false });
      } catch (err) {
        console.error('Error loading vendedores:', err);
        update({ vendedoresLoading: false });
      }
    }

    if (tab === 'uisettings') {
      if (USE_MOCKS) { update({ buttonColors: defaultBtnColors }); return; }
      try {
        const colorsData = await getSystemColors();
        if (colorsData && Object.keys(colorsData).length > 0) update({ buttonColors: transformColors(colorsData) });
      } catch {}
    }

    if (tab === 'payment') loadPaymentHistory('all');
  }, [update, loadPaymentHistory]);

  // ── Solicitudes ───────────────────────────────
  const reloadRequests = useCallback(async () => {
    if (USE_MOCKS) {
      const mockRequests: AdminRequest[] = [
        { id: 1, usuario_id: 'mock-001', userName: 'Juan Perez', type: 'upgrade', fromPlan: 'basic', toPlan: 'premium', planName: 'Premium', status: 'pending', date: new Date().toISOString(), months: 6, amount: 350 },
        { id: 2, usuario_id: 'mock-002', userName: 'Maria Garcia', type: 'upgrade', fromPlan: 'standard', toPlan: 'premium', planName: 'Premium', status: 'approved', date: new Date(Date.now() - 86400000 * 2).toISOString(), months: 12, amount: 600 },
        { id: 3, usuario_id: 'mock-003', userName: 'Carlos Lopez', type: 'downgrade', fromPlan: 'premium', toPlan: 'standard', planName: 'Standard', status: 'rejected', date: new Date(Date.now() - 86400000 * 5).toISOString(), months: 3, amount: 120 },
      ];
      update({ requests: mockRequests });
      return;
    }
    try {
      const res = await getAllPlanRequests();
      const requestsData = (res as any)?.data;
      const transformedRequests: AdminRequest[] = Array.isArray(requestsData)
        ? requestsData.map(transformBackendRequest)
        : [];
      update({ requests: transformedRequests });
    } catch (err) {
      console.error('Error reloading requests:', err);
    }
  }, [update]);

  // ── Planes ─────────────────────────────────────
  const reloadPlans = useCallback(async () => {
    if (USE_MOCKS) {
      const stored = mockStorage.getPlans();
      update({ plansData: stored || defaultPlansData });
      return;
    }
    try {
      const res = await apiGet<{ data?: any[] }>('/admin/plans');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const plansData: PlansMap = {};
        res.data.forEach((plan: any) => {
          slugToAdminNumericIdMap[plan.slug] = plan.id;
          plansData[plan.slug] = transformBackendPlan(plan);
        });
        update({ plansData });
      }
    } catch (err) {
      console.error('Error reloading plans:', err);
    }
  }, [update]);

  // ── Editor ─────────────────────────────────────
  const openPlanEditor = useCallback((planId: string) => {
    if (planId === 'new') {
      update({ editorOpen: true, editorPlanId: 'new', editorTitle: 'Crear Nuevo Plan', editorTab: 'basic', editingPlan: { ...initialEdit }, editFeatures: [], editDetailedBenefits: [] });
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
            : (plan.allDetails && plan.allDetails.length > 0)
              ? [...(plan.allDetails as import('@/features/seller/plans/types').DetailedBenefit[])]
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
    setState(prev => ({ ...prev, editDetailedBenefits: [...prev.editDetailedBenefits, { emoji: '', title: '', description: '', color: '#3b82f6' }] }));
  }, []);

  const updateDetailedBenefit = useCallback((idx: number, patch: Partial<DetailedBenefit>) => {
    setState(prev => {
      const arr = [...prev.editDetailedBenefits];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, editDetailedBenefits: arr };
    });
  }, []);

  const removeDetailedBenefit = useCallback((idx: number) => {
    setState(prev => ({ ...prev, editDetailedBenefits: prev.editDetailedBenefits.filter((_, i) => i !== idx) }));
  }, []);

  // savePlan — el administrador es el único que puede crear/editar planes
  const savePlan = useCallback(async () => {
    const { editingPlan: ep, editFeatures, editDetailedBenefits, plansData, editorPlanId } = stateRef.current;
    if (!ep.name?.trim()) { alert('El nombre del plan es obligatorio'); return; }
    const planId = ep.id?.trim() || 'plan_' + Date.now();
    const existing = plansData[planId] ?? {};
    const newPlan: PlanData = {
      ...(existing as PlanData),
      ...ep,
      id: planId,
      name: ep.name!.trim(),
      badge: ep.badge ?? '',
      description: ep.description ?? '',
      price: ep.price ?? 0,
      priceAnnual: ep.priceAnnual ?? 0,
      currency: ep.currency ?? 'S/',
      period: ep.period ?? '/mes',
      periodAnnual: ep.periodAnnual ?? '/año',
      usePriceMode: ep.usePriceMode !== false,
      requiresPayment: !!ep.requiresPayment,
      cssColor: ep.cssColor ?? '#3b82f6',
      accentColor: ep.accentColor ?? ep.cssColor ?? '#2563eb',
      bgImage: ep.bgImage ?? '',
      bgImageFit: ep.bgImageFit ?? 'cover',
      bgImagePosition: ep.bgImagePosition ?? 'center',
      showBgInCard: !!ep.showBgInCard,
      isActive: (existing as PlanData).isActive !== false,
      customCSS: '',
      enableClaimLock: !!ep.enableClaimLock,
      claimMonths: ep.claimMonths ?? 1,
      subscribeButtonText: ep.subscribeButtonText ?? 'Suscribirse',
      trialSuccessTitle:   ep.trialSuccessTitle   ?? '',
      trialSuccessMessage: ep.trialSuccessMessage ?? '',
      trialWaitMessage:    ep.trialWaitMessage    ?? '',
      claimedButtonText:   ep.claimedButtonText   ?? '',
      claimedWarningText:  ep.claimedWarningText  ?? '',
      compactVisibleCount: ep.compactVisibleCount ?? 5,
      priceText:    ep.priceText    ?? '',
      priceSubtext: ep.priceSubtext ?? '',
      color: planId,
      features: editFeatures.filter(f => f.text?.trim()),
      allDetails: editFeatures.filter(f => f.text?.trim()) as unknown as DetailedBenefit[],
      detailedBenefits: editDetailedBenefits.filter(b => b.title?.trim()),
      timelineIcon: (existing as PlanData).timelineIcon ?? 'star',
    };

    if (USE_MOCKS) {
      const updatedPlans = { ...stateRef.current.plansData, [planId]: newPlan };
      mockStorage.setPlans(updatedPlans);
      setState(prev => ({ ...prev, plansData: updatedPlans, editorOpen: false, editorPlanId: null }));
      alert('Plan guardado correctamente (localStorage)');
      return;
    }

    const backendPayload = buildBackendPlanPayload(newPlan, planId);
    const numericId = slugToAdminNumericIdMap[planId];
    let success = false;

    if (editorPlanId === 'new' || !numericId) {
      const res = await savePlanApi(backendPayload);
      success = res.success;
      if (success && res.data?.id) slugToAdminNumericIdMap[planId] = res.data.id;
    } else {
      success = await updatePlanApi(numericId, backendPayload);
    }

    if (success) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: newPlan }, editorOpen: false, editorPlanId: null }));
      broadcastPlanesActualizados();
      alert('Plan guardado correctamente');
    } else {
      alert('Error al guardar plan');
    }
  }, []);

  // ── Toggle activo ──────────────────────────────
  const togglePlanActive = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plansData[planId];
      if (!plan) return prev;
      if (plan.isActive !== false) {
        return { ...prev, confirmTargetPlan: planId, modals: { ...prev.modals, deactivateConfirm: true } };
      }
      // Activar plan directamente
      if (USE_MOCKS) {
        const updatedPlans = { ...prev.plansData, [planId]: { ...prev.plansData[planId], isActive: true } };
        mockStorage.setPlans(updatedPlans);
        return { ...prev, plansData: updatedPlans };
      }
      const numericId = slugToAdminNumericIdMap[planId];
      if (numericId) {
        updatePlanStatus(numericId, true).then(ok => {
          if (ok) {
            setState(p => ({ ...p, plansData: { ...p.plansData, [planId]: { ...p.plansData[planId], isActive: true } } }));
            broadcastPlanesActualizados();
          }
        });
      }
      return prev;
    });
  }, []);

  const confirmDeactivate = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan ?? '';
    if (!planId) return;

    if (USE_MOCKS) {
      const updatedPlans = { ...stateRef.current.plansData, [planId]: { ...stateRef.current.plansData[planId], isActive: false } };
      mockStorage.setPlans(updatedPlans);
      setState(prev => ({ ...prev, plansData: updatedPlans, modals: { ...prev.modals, deactivateConfirm: false }, confirmTargetPlan: null }));
      return;
    }

    const numericId = slugToAdminNumericIdMap[planId];
    if (!numericId) { setState(prev => ({ ...prev, modals: { ...prev.modals, deactivateConfirm: false }, confirmTargetPlan: null })); return; }
    const ok = await updatePlanStatus(numericId, false);
    if (ok) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], isActive: false } }, modals: { ...prev.modals, deactivateConfirm: false }, confirmTargetPlan: null }));
      broadcastPlanesActualizados();
    }
  }, []);

  // ── Eliminar plan ──────────────────────────────
  const openDeleteConfirm = useCallback((planId: string) => {
    update({ confirmTargetPlan: planId }); setModal('deleteConfirm', true);
  }, [update, setModal]);

  const confirmDelete = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan ?? '';
    if (!planId) return;

    if (USE_MOCKS) {
      const plans = { ...stateRef.current.plansData };
      delete plans[planId];
      mockStorage.setPlans(plans);
      setState(prev => ({ ...prev, plansData: plans, modals: { ...prev.modals, deleteConfirm: false }, confirmTargetPlan: null }));
      alert('Plan eliminado correctamente (localStorage)');
      return;
    }

    const numericId = slugToAdminNumericIdMap[planId];
    if (!numericId) { alert('Plan no encontrado en el sistema'); return; }
    const ok = await deletePlan(numericId);
    if (ok) {
      delete slugToAdminNumericIdMap[planId];
      setState(prev => {
        const plans = { ...prev.plansData }; delete plans[planId];
        return { ...prev, plansData: plans, modals: { ...prev.modals, deleteConfirm: false }, confirmTargetPlan: null };
      });
      broadcastPlanesActualizados();
      alert('Plan eliminado correctamente');
    } else {
      alert('Error al eliminar plan');
    }
  }, []);

  // ── Restaurar plan ─────────────────────────────
  const openRestoreConfirm = useCallback((planId: string) => {
    const planName = defaultPlansData[planId]?.name ?? planId;
    update({ confirmTargetPlan: planId, restoreConfirmText: `El plan "${planName}" volverá a su configuración original por defecto.` });
    setModal('restoreConfirm', true);
  }, [update, setModal]);

  const confirmRestore = useCallback(async () => {
    const planId = stateRef.current.confirmTargetPlan ?? '';
    if (!planId || !defaultPlansData[planId]) return;
    const restored = JSON.parse(JSON.stringify(defaultPlansData[planId])) as PlanData;

    if (USE_MOCKS) {
      const updatedPlans = { ...stateRef.current.plansData, [planId]: restored };
      mockStorage.setPlans(updatedPlans);
      setState(prev => ({ ...prev, plansData: updatedPlans, modals: { ...prev.modals, restoreConfirm: false }, confirmTargetPlan: null }));
      alert('Plan restaurado a su configuración original (localStorage)');
      return;
    }

    const numericId = slugToAdminNumericIdMap[planId];
    let ok = false;
    if (numericId) {
      ok = await updatePlanApi(numericId, buildBackendPlanPayload(restored, planId));
    }
    if (ok || !numericId) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: restored }, modals: { ...prev.modals, restoreConfirm: false }, confirmTargetPlan: null }));
      if (numericId) broadcastPlanesActualizados();
      alert('Plan restaurado a su configuración original');
    } else {
      alert('Error al restaurar plan');
    }
  }, []);

  // ── Iconos de timeline ─────────────────────────
  const selectTimelineIcon = useCallback((planId: string, iconKey: string) => {
    setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], timelineIcon: iconKey } } }));
    if (!USE_MOCKS) {
      const numericId = slugToAdminNumericIdMap[planId];
      if (numericId) updatePlanIcon(numericId, iconKey).then(() => broadcastPlanesActualizados());
    }
  }, []);

  // ── Colores de botones ─────────────────────────
  const saveBtnColors = useCallback(async () => {
    const colors = stateRef.current.buttonColors;

    if (USE_MOCKS) {
      mockStorage.setColors(colors);
      alert('Colores guardados correctamente');
      return;
    }

    const backendColors = {
      primary_color:        colors.subscribeBg      ?? defaultBtnColors.subscribeBg!,
      success_color:        colors.currentBg        ?? defaultBtnColors.currentBg!,
      background_color:     colors.lockedBg         ?? defaultBtnColors.lockedBg!,
      text_secondary_color: colors.lockedColor      ?? defaultBtnColors.lockedColor!,
      error_color:          colors.warningColor     ?? defaultBtnColors.warningColor!,
    };
    const ok = await updateSystemColors(backendColors);
    if (ok) {
      broadcastColoresActualizados();
      alert('Colores guardados correctamente');
    } else {
      alert('Error al guardar colores');
    }
  }, []);

  const resetBtnColors = useCallback(async () => {
    update({ buttonColors: { ...defaultBtnColors } });

    if (USE_MOCKS) { return; }

    await updateSystemColors({
      primary_color:        defaultBtnColors.subscribeBg!,
      success_color:        defaultBtnColors.currentBg!,
      background_color:     defaultBtnColors.lockedBg!,
      text_secondary_color: defaultBtnColors.lockedColor!,
      error_color:          defaultBtnColors.warningColor!,
    });
    broadcastColoresActualizados();
  }, [update]);

  const updateBtnColor = useCallback((key: keyof ButtonColors, value: string) => {
    setState(prev => ({ ...prev, buttonColors: { ...prev.buttonColors, [key]: value } }));
  }, []);

  // ── Notificaciones SSE de pago ─────────────────
  const addPaymentNotif = useCallback((type: 'success' | 'error', title: string, body: string) => {
    const notif: PaymentNotif = { id: 'pn-' + Date.now(), type, title, body };
    setState(prev => ({ ...prev, paymentNotifs: [notif, ...prev.paymentNotifs] }));
    setTimeout(() => setState(prev => ({ ...prev, paymentNotifs: prev.paymentNotifs.filter(n => n.id !== notif.id) })), 12000);
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setState(prev => ({ ...prev, paymentNotifs: prev.paymentNotifs.filter(n => n.id !== id) }));
  }, []);

  // ── Vendedores ─────────────────────────────────
  const openVendedorModal = useCallback(async (uid: string) => {
    setState(prev => {
      const v = prev.vendedores.find(x => String(x.usuario_id) === String(uid)) ?? null;
      return { ...prev, selectedVendedor: v, modals: { ...prev.modals, vendedorHistorial: true } };
    });
    if (USE_MOCKS) return;
    try {
      const historial = await getVendedorHistorial(Number(uid));
      if (historial && historial.length > 0) {
        setState(prev => ({
          ...prev,
          vendedores: prev.vendedores.map(v => String(v.usuario_id) === String(uid) ? { ...v, historial } : v),
          selectedVendedor: prev.selectedVendedor && String(prev.selectedVendedor.usuario_id) === String(uid)
            ? { ...prev.selectedVendedor, historial }
            : prev.selectedVendedor,
        }));
      }
    } catch {}
  }, []);

  // ── Manejo de imagen ───────────────────────────
  const handleImageUpload = useCallback((file: File) => {
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif|heic|heif)$/i.test(file.name);
    if (!isImage) { update({ imageErrorMsg: `El archivo "${file.name}" no parece ser una imagen.`, imageErrorSuggestion: 'Intente con PNG, JPG, WebP, SVG u otro formato.' }); setModal('imageError', true); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        updateEditingPlan({ bgImage: base64 }); return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 900; let { width: w, height: h } = img;
        if (w <= maxDim && h <= maxDim) { updateEditingPlan({ bgImage: base64 }); return; }
        const ratio = Math.min(maxDim / w, maxDim / h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateEditingPlan({ bgImage: canvas.toDataURL('image/jpeg', 0.70) });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  }, [updateEditingPlan, update, setModal]);

  // ── SSE handlers ──────────────────────────────
  const handleSolicitudesActualizadas = useCallback(async () => {
    await reloadRequests();
    if (stateRef.current.activeTab === 'vendedores' && !USE_MOCKS) {
      try {
        const vendedoresRaw = await getVendedores();
        update({ vendedores: vendedoresRaw.map(transformBackendVendedor) });
      } catch {}
    }
  }, [reloadRequests, update]);

  const handlePlanesActualizados = useCallback(async () => {
    await reloadPlans();
  }, [reloadPlans]);

  const handleColoresActualizados = useCallback(async () => {
    if (USE_MOCKS) { update({ buttonColors: defaultBtnColors }); return; }
    try {
      const colorsData = await getSystemColors();
      if (colorsData && Object.keys(colorsData).length > 0) update({ buttonColors: transformColors(colorsData) });
    } catch {}
  }, [update]);

  const handlePagoConfirmadoAdmin = useCallback(async (datos: { planId: string; monto: number; meses: number }) => {
    await reloadRequests();
    const planNom = stateRef.current.plansData[datos.planId]?.name ?? datos.planId;
    addPaymentNotif('success', 'Pago confirmado por Izipay',
      `Plan <strong>${planNom}</strong> activado · S/ ${parseFloat(String(datos.monto ?? 0)).toFixed(2)} · ${datos.meses ?? 1} mes(es)`);
    if (stateRef.current.activeTab === 'payment') {
      await loadPaymentHistory(stateRef.current.paymentFilter);
    }
    if (stateRef.current.activeTab === 'vendedores' && !USE_MOCKS) {
      try {
        const vendedoresRaw = await getVendedores();
        update({ vendedores: vendedoresRaw.map(transformBackendVendedor) });
      } catch {}
    }
  }, [reloadRequests, addPaymentNotif, loadPaymentHistory, update]);

  const handlePagoFallidoAdmin = useCallback((datos: { motivo?: string }) => {
    addPaymentNotif('error', 'Pago fallido', datos.motivo ?? 'El pago no fue completado por Izipay');
  }, [addPaymentNotif]);

  // Aprobar solicitud de plan
  const handleApproveRequest = useCallback(async (requestId: number) => {
    update({ approvingRequestId: requestId });
    try {
      const res = await approvePlanRequest(requestId);
      const isSuccess = (res as any).success === true || (res as any).message?.includes('correctamente');
      if (isSuccess) initialize();
      else console.error('Error approving request:', (res as any).message);
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      update({ approvingRequestId: null });
    }
  }, [initialize, update]);

  // Rechazar solicitud de plan
  const handleRejectRequest = useCallback(async (requestId: number, notes: string) => {
    update({ rejectingRequestId: requestId });
    try {
      const res = await rejectPlanRequest(requestId, notes);
      const isSuccess = (res as any).success === true || (res as any).message?.includes('correctamente');
      if (isSuccess) initialize();
      else console.error('Error rejecting request:', (res as any).message);
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      update({ rejectingRequestId: null });
    }
  }, [initialize, update]);

  const openRejectModal = useCallback((id: number) => {
    setState(prev => ({ ...prev, rejectTargetId: id, modals: { ...prev.modals, rejectRequest: true } }));
  }, [setState]);

  const closeRejectModal = useCallback(() => {
    setState(prev => ({ ...prev, rejectTargetId: null, modals: { ...prev.modals, rejectRequest: false } }));
  }, [setState]);

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
    openRejectModal, closeRejectModal,
  };
}
