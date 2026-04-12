'use client';
// ============================================
// HOOK — useAdmin
// Estado + lógica de negocio del panel admin
// ============================================

import { useState, useCallback, useRef } from 'react';
import { apiGet, apiPost, silentPost, getAllPlanRequests, approvePlanRequest, rejectPlanRequest, getSystemColors, updateSystemColors, getVendedores, getVendedorHistorial, updatePlanStatus, deletePlan, updatePlanIcon } from '@/features/seller/plans/lib/api';
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
  modals: { deleteConfirm:false, restoreConfirm:false, deactivateConfirm:false, imageError:false, vendedorHistorial:false },
  confirmTargetPlan: null, restoreConfirmText: '',
  imageErrorMsg: '', imageErrorSuggestion: '',
  selectedVendedor: null, isLoaded: false, vendedoresLoading: false, approvingRequestId: null, rejectingRequestId: null,
};

export function useAdmin() {
  const [state, _setState] = useState<AdminState>(initialState);
  // stateRef: siempre apunta al estado actual para usarlo en callbacks async
  const stateRef = useRef(state);
  // wrapper que mantiene el ref sincronizado
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
    // MOCK DATA para desarrollo
    if (USE_MOCKS) {
      // Primero intentar leer desde localStorage
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

      const mockPaymentTotals: PaymentTotals = {
        total_monto: 800,
        pagos_exitosos: 5,
        pagos_fallidos: 1,
        pagos_pending: 1,
      };

      const mockVendedores: Vendedor[] = [
        { usuario_id: 'mock-001', username: 'Juan Perez', email: 'juan@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 45).toISOString(), historial: [] },
        { usuario_id: 'mock-002', username: 'Maria Garcia', email: 'maria@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 10).toISOString(), historial: [] },
        { usuario_id: 'mock-003', username: 'Carlos Lopez', email: 'carlos@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() - 86400000 * 5).toISOString(), historial: [] },
        { usuario_id: 'mock-004', username: 'Ana Martinez', email: 'ana@test.com', plan_actual: 'premium', nombre_plan: 'Premium', css_color: '#8b5cf6', fecha_expiracion: new Date(Date.now() + 86400000 * 120).toISOString(), historial: [] },
        { usuario_id: 'mock-005', username: 'Pedro Ramirez', email: 'pedro@test.com', plan_actual: 'basic', nombre_plan: 'Basic', css_color: '#10b981', fecha_expiracion: new Date(Date.now() + 86400000 * 30).toISOString(), historial: [] },
        { usuario_id: 'mock-006', username: 'Lucia Torres', email: 'lucia@test.com', plan_actual: 'standard', nombre_plan: 'Standard', css_color: '#3b82f6', fecha_expiracion: new Date(Date.now() + 86400000 * 60).toISOString(), historial: [] },
      ];

      update({
        plansData: plansToUse,
        requests: mockRequests,
        buttonColors: colorsToUse,
        vendedorPagos: mockVendedorPagos,
        vendedores: mockVendedores,
        paymentTotals: mockPaymentTotals,
        isLoaded: true,
      });
      return;
    }

    // API REAL - Laravel endpoints
    try {
      const [planesRes, requestsRes, colorsData] = await Promise.all([
        apiGet<{ success: boolean; data?: any[] }>('/plans'),
        getAllPlanRequests(),
        getSystemColors(),
      ]);
      
      // Transformar colores
      const buttonColors: ButtonColors = {
        subscribeBg: colorsData?.primary_color || defaultBtnColors.subscribeBg,
        subscribeColor: '#ffffff',
        currentBg: colorsData?.success_color || defaultBtnColors.currentBg,
        currentColor: '#ffffff',
        lockedBg: colorsData?.background_color || defaultBtnColors.lockedBg,
        lockedColor: colorsData?.text_secondary_color || defaultBtnColors.lockedColor,
        warningColor: colorsData?.error_color || defaultBtnColors.warningColor,
      };
      
      // Transformar planes
      const plansData: PlansMap = {};
      if (planesRes.success && Array.isArray(planesRes.data)) {
        planesRes.data.forEach((plan: any) => {
          plansData[plan.slug] = {
            id: plan.slug,
            name: plan.name,
            slug: plan.slug,
            price: parseFloat(plan.monthly_fee) || 0,
            priceAnnual: (parseFloat(plan.monthly_fee) || 0) * 12,
            period: 'mensual',
            periodAnnual: 'anual',
            currency: 'S/',
            usePriceMode: false,
            priceText: plan.monthly_fee === '0.00' ? 'Gratis' : `S/ ${plan.monthly_fee}`,
            priceSubtext: plan.monthly_fee === '0.00' ? 'Sin costo' : '/mes',
            description: '',
            badge: '',
            requiresPayment: plan.monthly_fee !== '0.00',
            features: plan.features?.map((f: string) => ({ text: f, active: true })) || [],
            isActive: true,
          };
        });
      }
      
      // Transformar solicitudes
      const transformedRequests: AdminRequest[] = [];
      
      // La respuesta de Laravel puede no tener 'success', verificar directamente data
      const requestsData = (requestsRes as any)?.data;
      
      if (Array.isArray(requestsData)) {
        requestsData.forEach((req: any) => {
          const reqMonths = req.months || 1;
          const durationLabel = reqMonths === 1 ? '1 mes' : reqMonths === 12 ? '1 año' : `${reqMonths} meses`;
          transformedRequests.push({
            id: req.id,
            usuario_id: String(req.store_id),
            userName: req.seller_name || req.store_name || '—',
            fromPlan: req.current_plan?.name || 'Sin plan',
            toPlan: req.plan?.name || req.requested_plan?.name || '',
            planName: req.plan?.name || req.requested_plan?.name || '',
            status: req.status === 'pending' ? 'pending' : req.status === 'approved' ? 'approved' : 'rejected',
            date: req.created_at || new Date().toISOString(),
            amount: parseFloat(req.total_amount || req.plan?.monthly_fee || '0'),
            months: reqMonths,
            paymentMethod: req.payment_method === 'trial' ? 'trial' : (req.payment_method === 'izipay' ? 'Izipay' : req.payment_method),
            type: req.payment_method === 'trial' ? 'trial' : 'upgrade',
            duration: durationLabel,
          });
        });
      }
      
      // Usar datos reales de la API
      const hasRealPlans = Object.keys(plansData).length > 0;
      const finalRequests = transformedRequests;
      const finalPlans = hasRealPlans ? plansData : defaultPlansData;
      
      update({
        plansData: finalPlans,
        requests: finalRequests,
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
    
    // MOCK DATA para pagos
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
      
      let filteredPagos = mockVendedorPagos;
      if (filter !== 'all') {
        filteredPagos = mockVendedorPagos.filter(v => v.transacciones.some(t => t.estado === filter));
      }
      
      const mockTotals: PaymentTotals = {
        total_monto: 800,
        pagos_exitosos: 5,
        pagos_fallidos: 1,
        pagos_pending: 1,
      };
      
      update({ vendedorPagos: filteredPagos, paymentTotals: mockTotals });
      return;
    }
    
    // API REAL
    const res = await apiGet<{ success: boolean; vendedores?: VendedorPago[]; totales?: PaymentTotals }>(`/pagos/historial.php?estado=${filter}`);
    if (res.success) update({ vendedorPagos: res.vendedores ?? [], paymentTotals: res.totales ?? initialState.paymentTotals });
  }, [update]);

  // ── Tabs ──────────────────────────────────────
  const switchTab = useCallback(async (tab: AdminTab) => {
    update({ activeTab: tab });
    
    // MOCK DATA para vendedores
    if (tab === 'vendedores' && USE_MOCKS) {
      update({ vendedoresLoading: true });
      
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
    
    // API REAL para vendedores
    if (tab === 'vendedores') {
      update({ vendedoresLoading: true });
      const [listaRes, histRes] = await Promise.all([
        apiGet<{ success: boolean; vendedores?: Vendedor[] }>('/vendedores/lista.php'),
        apiGet<{ success: boolean; historial?: Array<{ usuario_id: string; [k: string]: unknown }> }>('/vendedores/historial.php'),
      ]);
      const vendedores = (listaRes.success && listaRes.vendedores) ? listaRes.vendedores : [];
      const histMap: Record<string, unknown[]> = {};
      if (histRes.success && histRes.historial) {
        histRes.historial.forEach(h => {
          const key = String(h.usuario_id);
          if (!histMap[key]) histMap[key] = [];
          histMap[key].push(h);
        });
      }
      // Create new objects so React detects the change (no direct mutation)
      const vendedoresConHistorial = vendedores.map(v => ({
        ...v,
        historial: (histMap[String(v.usuario_id)] ?? []) as Vendedor['historial'],
      }));
      update({ vendedores: vendedoresConHistorial, vendedoresLoading: false });
    }
    if (tab === 'uisettings') {
      if (USE_MOCKS) {
        update({ buttonColors: defaultBtnColors });
        return;
      }
      const res = await apiGet<{ success: boolean; colors?: ButtonColors }>('/ui/colores.php');
      if (res.success && res.colors) update({ buttonColors: res.colors });
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
    const res = await apiGet<{ success: boolean; requests?: AdminRequest[] }>('/solicitudes/index.php');
    if (res.success) update({ requests: res.requests ?? [] });
  }, [update]);

  // ── Planes ─────────────────────────────────────
  const reloadPlans = useCallback(async () => {
    if (USE_MOCKS) {
      update({ plansData: defaultPlansData });
      return;
    }
    const res = await apiGet<{ success: boolean; plans?: PlansMap }>('/planes/config.php');
    if (res.success && res.plans) update({ plansData: res.plans });
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

  // savePlan — lee estado fresco desde stateRef para evitar stale closure
  const savePlan = useCallback(async () => {
    const { editingPlan: ep, editFeatures, editDetailedBenefits, plansData } = stateRef.current;
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
    
    // Intentar guardar en API, fallback a localStorage si USE_MOCKS
    if (USE_MOCKS) {
      const updatedPlans = { ...stateRef.current.plansData, [planId]: newPlan };
      mockStorage.setPlans(updatedPlans);
      setState(prev => ({ ...prev, plansData: updatedPlans, editorOpen: false, editorPlanId: null }));
      alert('Plan guardado correctamente (localStorage)');
      return;
    }
    
    const res = await apiPost<{ success: boolean; message?: string }>('/planes/config.php', newPlan);
    if (res.success) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: newPlan }, editorOpen: false, editorPlanId: null }));
      // Notificar a todos los clientes conectados via SSE
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      }
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      // Intentar notificar al PHP SSE (si broadcast.php existe en el servidor)
      silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
      alert('Plan guardado correctamente');
    } else {
      alert('Error al guardar: ' + (res.message ?? 'Error'));
    }
  }, []);

  // ── Toggle activo ──────────────────────────────
  const togglePlanActive = useCallback((planId: string) => {
    setState(prev => {
      const plan = prev.plansData[planId];
      if (!plan) return prev;
      if (plan.isActive !== false) {
        return { ...prev, confirmTargetPlan: planId, modals: { ...prev.modals, deactivateConfirm: true } };
      } else {
        // Activar plan
        if (USE_MOCKS) {
          const updatedPlans = { ...prev.plansData, [planId]: { ...prev.plansData[planId], isActive: true } };
          mockStorage.setPlans(updatedPlans);
          setState(p => ({ ...p, plansData: updatedPlans }));
          return prev;
        }
        apiPost<{ success: boolean }>('/planes/estado.php', { id: planId, activo: 1 }).then(res => {
          if (res.success) {
            setState(p => ({ ...p, plansData: { ...p.plansData, [planId]: { ...p.plansData[planId], isActive: true } } }));
            if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
            silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
          }
        });
        return prev;
      }
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
    
    const res = await apiPost<{ success: boolean }>('/planes/estado.php', { id: planId, activo: 0 });
    if (res.success) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], isActive: false } }, modals: { ...prev.modals, deactivateConfirm: false }, confirmTargetPlan: null }));
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      }
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      // Intentar notificar al PHP SSE (si broadcast.php existe en el servidor)
      silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
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
    
    const res = await apiPost<{ success: boolean; message?: string }>('/planes/eliminar.php', { id: planId });
    if (res.success) {
      setState(prev => {
        const plans = { ...prev.plansData }; delete plans[planId];
        return { ...prev, plansData: plans, modals: { ...prev.modals, deleteConfirm: false }, confirmTargetPlan: null };
      });
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      }
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      // Intentar notificar al PHP SSE (si broadcast.php existe en el servidor)
      silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
      alert('Plan eliminado correctamente');
    } else { alert('Error al eliminar: ' + (res.message ?? 'Error')); }
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
    
    const res = await apiPost<{ success: boolean; message?: string }>('/planes/config.php', restored);
    if (res.success) {
      setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: restored }, modals: { ...prev.modals, restoreConfirm: false }, confirmTargetPlan: null }));
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      }
      // Notificar a otras pestañas del navegador (BroadcastChannel)
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      // Intentar notificar al PHP SSE (si broadcast.php existe en el servidor)
      silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
      alert('Plan restaurado a su configuración original');
    } else { alert('Error: ' + (res.message ?? 'Error')); }
  }, []);

  // ── Iconos de timeline ─────────────────────────
  const selectTimelineIcon = useCallback((planId: string, iconKey: string) => {
    setState(prev => ({ ...prev, plansData: { ...prev.plansData, [planId]: { ...prev.plansData[planId], timelineIcon: iconKey } } }));
    apiPost('/planes/icono.php', { id: planId, icono: iconKey }).then(() => {
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'planes_actualizados' });
      silentPost('/sse/broadcast.php', { event: 'planes_actualizados' });
    });
  }, []);

  // ── Colores de botones ─────────────────────────
  const saveBtnColors = useCallback(async () => {
    const colors = stateRef.current.buttonColors;
    const res = await apiPost<{ success: boolean; message?: string }>('/ui/colores.php', { colors });
    if (res.success) {
      if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'colores_actualizados' });
      silentPost('/sse/broadcast.php', { event: 'colores_actualizados' });
      alert('Colores guardados correctamente');
    } else alert('Error: ' + (res.message ?? 'Error'));
  }, []);

  const resetBtnColors = useCallback(async () => {
    await apiPost('/ui/colores.php', { colors: defaultBtnColors });
    update({ buttonColors: { ...defaultBtnColors } });
    if (typeof BroadcastChannel !== 'undefined') new BroadcastChannel('lyrium-planes').postMessage({ event: 'colores_actualizados' });
    silentPost('/sse/broadcast.php', { event: 'colores_actualizados' });
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
  const openVendedorModal = useCallback((uid: string) => {
    setState(prev => {
      const v = prev.vendedores.find(x => String(x.usuario_id) === String(uid)) ?? null;
      return { ...prev, selectedVendedor: v, modals: { ...prev.modals, vendedorHistorial: true } };
    });
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
    // Si el admin está viendo vendedores, refrescar también
    if (stateRef.current.activeTab === 'vendedores') {
      const listaRes = await apiGet<{ success: boolean; vendedores?: Vendedor[] }>('/vendedores/lista.php');
      if (listaRes.success && listaRes.vendedores) {
        update({ vendedores: listaRes.vendedores.map(v => ({ ...v, historial: [] })) });
      }
    }
  }, [reloadRequests, update]);

  const handlePlanesActualizados = useCallback(async () => {
    await reloadPlans();
  }, [reloadPlans]);

  const handleColoresActualizados = useCallback(async () => {
    const res = await apiGet<{ success: boolean; colors?: ButtonColors }>('/ui/colores.php');
    if (res.success && res.colors) update({ buttonColors: res.colors });
  }, [update]);

  const handlePagoConfirmadoAdmin = useCallback(async (datos: { planId: string; monto: number; meses: number }) => {
    await reloadRequests();
    // Usar stateRef para leer estado fresco sin stale closure
    const planNom = stateRef.current.plansData[datos.planId]?.name ?? datos.planId;
    addPaymentNotif('success', 'Pago confirmado por Izipay',
      `Plan <strong>${planNom}</strong> activado · S/ ${parseFloat(String(datos.monto ?? 0)).toFixed(2)} · ${datos.meses ?? 1} mes(es)`);
    // Si el tab activo es pagos, recargar automáticamente
    if (stateRef.current.activeTab === 'payment') {
      await loadPaymentHistory(stateRef.current.paymentFilter);
    }
    // Si el tab activo es vendedores, recargar lista directamente
    if (stateRef.current.activeTab === 'vendedores') {
      const [listaRes, histRes] = await Promise.all([
        apiGet<{ success: boolean; vendedores?: Vendedor[] }>('/vendedores/lista.php'),
        apiGet<{ success: boolean; historial?: Array<{ usuario_id: string; [k: string]: unknown }> }>('/vendedores/historial.php'),
      ]);
      const vendedores = (listaRes.success && listaRes.vendedores) ? listaRes.vendedores : [];
      const histMap: Record<string, unknown[]> = {};
      if (histRes.success && histRes.historial) {
        histRes.historial.forEach(h => {
          const key = String(h.usuario_id);
          if (!histMap[key]) histMap[key] = [];
          histMap[key].push(h);
        });
      }
      update({ vendedores: vendedores.map(v => ({ ...v, historial: (histMap[String(v.usuario_id)] ?? []) as Vendedor['historial'] })) });
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
      // La API puede devolver success: true o un mensaje de éxito
      const isSuccess = (res as any).success === true || (res as any).message?.includes('correctamente');
      if (isSuccess) {
        // Recargar solicitudes
        initialize();
      } else {
        console.error('Error approving request:', (res as any).message);
      }
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
      if (isSuccess) {
        // Recargar solicitudes
        initialize();
      } else {
        console.error('Error rejecting request:', (res as any).message);
      }
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