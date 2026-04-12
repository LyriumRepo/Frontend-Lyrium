'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiGet, apiPost, createPlanRequest, getMyPlanRequest } from '@/features/seller/plans/lib/api';
import { buildPlanOrder, defaultPlansData, durationPresets, getDiscountForMonths } from '@/features/seller/plans/lib/plans';
import type { PlansMap, SubscriptionInfo, Request, ButtonColors, EstadoResponse, AvisoVencimientoResponse } from '@/features/seller/plans/types';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { useAuth } from '@/shared/lib/context/AuthContext';

export interface PlanesState {
  plansData: PlansMap; planOrder: string[]; currentPlan: string;
  userId: string; userName: string; claimedPlans: string[];
  trialUsedPlans: string[]; subscriptionInfo: SubscriptionInfo | null;
  avisoPorVencer: AvisoVencimientoResponse | null; requestsCache: Request[];
  buttonColors: ButtonColors; activeTab: 'my-plan' | 'all-plans';
  showcasePlan: string; carouselIndex: number; isDetailsExpanded: boolean;
  selectedPaymentPlan: string | null; pendingDowngradePlan: string | null;
  selectedPresetId: string; customMonths: number; benefitDetailPlanKey: string;
  expandedCards: Record<string, boolean>; pendingUIRefresh: boolean;
  modals: { payment: boolean; requestSent: boolean; downgrade: boolean; downgradeConfirm2: boolean; benefitDetail: boolean; benefitFullDetail: boolean; izipayPay: boolean; waitingPayment: boolean };
  sentText: string; downgradeConfirmText: string; isBlocked: boolean;
  blockInfo: { msg: string; sub: string; btnHref: string; btnLabel: string } | null;
  isLoaded: boolean; notification: { msg: string; color: string; visible: boolean } | null;
  izipayConfig: { formToken: string; publicKey: string; orderId: string } | null;
}

type ModalKey = keyof PlanesState['modals'];

const initialState: PlanesState = {
  plansData: defaultPlansData, planOrder: ['basic', 'standard', 'premium'],
  currentPlan: 'basic', userId: 'default', userName: 'Vendedor',
  claimedPlans: [], trialUsedPlans: [], subscriptionInfo: null,
  avisoPorVencer: null, requestsCache: [], buttonColors: {},
  activeTab: 'my-plan', showcasePlan: 'basic', carouselIndex: 0,
  isDetailsExpanded: false, selectedPaymentPlan: null, pendingDowngradePlan: null,
  selectedPresetId: 'trial', customMonths: 4, benefitDetailPlanKey: 'basic',
  expandedCards: {}, pendingUIRefresh: false,
  modals: { payment: false, requestSent: false, downgrade: false, downgradeConfirm2: false, benefitDetail: false, benefitFullDetail: false, izipayPay: false, waitingPayment: false },
  sentText: '', downgradeConfirmText: '', isBlocked: false, blockInfo: null,
  isLoaded: false, notification: null, izipayConfig: null,
};

// Mapa global para convertir slug a ID numérico
let slugToNumericIdMap: Record<string, number> = {};

export function usePlanes() {
  const [state, _setState] = useState<PlanesState>(initialState);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  // stateRef: siempre apunta al estado actual para callbacks async
  const stateRef = useRef(state);
  const setState = useCallback((updater: PlanesState | ((prev: PlanesState) => PlanesState)) => {
    _setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);

  const update = useCallback((patch: Partial<PlanesState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, [setState]);

  const setModal = useCallback((key: ModalKey, open: boolean) => {
    setState(prev => ({ ...prev, modals: { ...prev.modals, [key]: open } }));
  }, []);

  const showNotification = useCallback((msg: string, color: string) => {
    setState(prev => ({ ...prev, notification: { msg, color, visible: true } }));
    setTimeout(() => setState(prev => ({ ...prev, notification: prev.notification ? { ...prev.notification, visible: false } : null })), 6000);
  }, []);

  const isPlanClaimed = (planKey: string) => state.claimedPlans.includes(planKey);
  const isTrialUsed   = (planKey: string) => state.trialUsedPlans.includes(planKey);
  const hasPendingRequest = () => state.requestsCache.some(r => r.status === 'pending');

  const getPaymentTotalMonths = (): number => {
    if (state.selectedPresetId === 'trial')  return 1;
    if (state.selectedPresetId === 'custom') return state.customMonths;
    return durationPresets.find(p => p.id === state.selectedPresetId)?.months ?? 1;
  };

  const getPaymentDurationLabel = (): string => {
    if (state.selectedPresetId === 'trial') return 'Prueba gratuita (1 mes)';
    const m = getPaymentTotalMonths();
    if (m >= 12 && m % 12 === 0) { const y = m / 12; return y === 1 ? '1 año (12 meses)' : `${y} años (${m} meses)`; }
    return m === 1 ? '1 mes' : `${m} meses`;
  };

  const initialize = useCallback(async () => {
    // MOCK DATA para desarrollo
    if (USE_MOCKS) {
      const mockUserId = 'mock-vendedor-001';
      const mockUserName = 'Vendedor Demo';
      const mockCurrentPlan = 'standard';
      const mockSubscriptionInfo: SubscriptionInfo = {
        plan: mockCurrentPlan,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        months: 1,
      };
      const mockRequests: Request[] = [
        { id: 1, type: 'upgrade', fromPlan: 'basic', toPlan: 'premium', planName: 'Premium', duration: '6 meses', durationId: '6', months: 6, amount: 150, userName: 'Vendedor Demo', status: 'pending' },
      ];
      const mockAviso: AvisoVencimientoResponse = {
        porVencer: false,
        diasRestantes: 30,
        nombrePlan: 'Standard',
      };
      const mockButtonColors: ButtonColors = {
        subscribeBg: '#3b82f6',
        subscribeColor: '#ffffff',
        currentBg: '#e5e7eb',
        currentColor: '#6b7280',
        lockedBg: '#9ca3af',
        lockedColor: '#e5e7eb',
        warningColor: '#ef4444',
      };

      update({
        userId: mockUserId,
        userName: mockUserName,
        currentPlan: mockCurrentPlan,
        subscriptionInfo: mockSubscriptionInfo,
        claimedPlans: ['basic'],
        trialUsedPlans: [],
        requestsCache: mockRequests,
        avisoPorVencer: mockAviso,
        buttonColors: mockButtonColors,
        isLoaded: true,
        isBlocked: false,
        blockInfo: null,
      });
      return;
    }

    // API REAL
    try {
      // Verificar autenticación usando el contexto de autenticación
      if (authLoading) {
        // Esperar a que termine de cargar
        return;
      }
      
      if (!isAuthenticated || !user) {
        let msg = 'Acceso restringido';
        let sub = 'Debes iniciar sesión como vendedor.';
        let btnHref = '/login';
        let btnLabel = 'Iniciar sesión';
        update({ isBlocked: true, blockInfo: { msg, sub, btnHref, btnLabel }, isLoaded: true });
        return;
      }

      // Verificar que el usuario tenga el rol de vendedor
      const userRole = user.role?.toLowerCase() || '';
      if (userRole !== 'seller' && userRole !== 'vendedor') {
        let msg = 'Esta sección es para vendedores';
        let sub = 'Gestiona los planes desde el panel admin.';
        let btnHref = '/admin';
        let btnLabel = 'Ir al panel admin';
        update({ isBlocked: true, blockInfo: { msg, sub, btnHref, btnLabel }, isLoaded: true });
        return;
      }

      const userId = String(user.id);
      const userName = user.display_name || user.username || 'Vendedor';
      
      // Fetch plans and subscription from Laravel API
      const [plansRes, subRes] = await Promise.all([
        apiGet<{ data: Array<{ id: number; name: string; slug: string; monthly_fee: string; features: string[]; detailed_benefits?: Array<{ title: string; description: string; icon?: string }> }> }>('/plans'),
        apiGet<{ data?: { id: number; plan_id: number; status: string; starts_at?: string; started_at?: string; ends_at?: string; expires_at?: string; plan: { id: number; name: string; slug: string; monthly_fee: string; features: string[] } } }>('/subscriptions/current').catch(() => ({ data: null })),
      ]);
      
      // Transform Laravel plans to frontend format
      // Crear un mapa de slug a numeric ID
      slugToNumericIdMap = {};
      const plansData: PlansMap = {};
      if (plansRes.data) {
        plansRes.data.forEach((plan) => {
          slugToNumericIdMap[plan.slug] = plan.id;
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
            features: plan.features?.map(f => ({ text: f, active: true })) || [],
            detailedBenefits: plan.detailed_benefits?.map(b => ({
              title: b.title,
              description: b.description,
              icon: b.icon || '',
            })) || [],
            isActive: true,
          };
        });
      }
      
      // Get current plan from subscription
      const subscription = subRes.data;
      const currentPlan = subscription?.plan?.slug || 'emprende';
      const endsAt = subscription?.ends_at || subscription?.expires_at || '';
      const startsAt = subscription?.starts_at || subscription?.started_at || '';
      const subscriptionInfo: SubscriptionInfo | null = subscription ? {
        plan: subscription.plan.slug,
        expiryDate: endsAt,
        months: 1,
        planId: String(subscription.plan_id),
        status: subscription.status,
        startDate: startsAt,
      } : null;
      
      const planOrder = buildPlanOrder(plansData);
      const carouselIndex = Math.max(0, planOrder.indexOf(currentPlan));
      update({
        plansData, planOrder, currentPlan, userId, userName,
        claimedPlans: [],
        trialUsedPlans: [],
        subscriptionInfo,
        avisoPorVencer: null,
        requestsCache: [],
        buttonColors: {},
        showcasePlan: currentPlan, carouselIndex, isLoaded: true,
      });
    } catch { update({ isLoaded: true }); }
  }, [update]);

  const switchTab = (tab: 'my-plan' | 'all-plans') => update({ activeTab: tab });

  const selectCarouselPlan = (plan: string) => {
    setState(prev => ({ ...prev, showcasePlan: plan, carouselIndex: prev.planOrder.indexOf(plan) }));
  };

  const carouselStep = (delta: number) => {
    setState(prev => {
      const newIndex = Math.max(0, Math.min(prev.planOrder.length - 1, prev.carouselIndex + delta));
      if (newIndex === prev.carouselIndex) return prev;
      return { ...prev, carouselIndex: newIndex, showcasePlan: prev.planOrder[newIndex] };
    });
  };

  const saveRequest = useCallback(async (req: Omit<Request, 'usuario_id'>) => {
    console.log('[usePlanes] saveRequest called with:', req);
    
    try {
      // Buscar el plan_id basado en el toPlan
      const plansData = state.plansData;
      const targetPlan = Object.values(plansData).find(p => p.slug === req.toPlan || p.id === req.toPlan);
      
      if (!targetPlan) {
        showNotification('Plan no encontrado', '#ef4444');
        return;
      }

      const numericPlanId = parseInt(targetPlan.id);
      console.log('[usePlanes] Creating request for plan:', targetPlan, 'plan_id:', isNaN(numericPlanId) ? 1 : numericPlanId);
      
      const response = await createPlanRequest({
        plan_id: isNaN(numericPlanId) ? 1 : numericPlanId,
        payment_method: req.paymentMethod === 'trial' ? 'trial' : 'izipay',
        months: req.months,
      });

      console.log('[usePlanes] saveRequest response:', response);

      if (response.success) {
        showNotification('Solicitud enviada correctamente', '#10b981');
        setModal('requestSent', true);
        
        // Si es trial, se aprueba automáticamente
        if (req.paymentMethod === 'trial') {
          showNotification('¡Tu plan ha sido activado!', '#10b981');
          // Recargar datos
          initialize();
        }
      } else {
        showNotification('Error al crear solicitud', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Error creating plan request:', error);
      showNotification('Error al procesar solicitud', '#ef4444');
    }
  }, [showNotification, state.plansData, setModal, initialize]);

  const claimFreePlan = useCallback(async (planKey: string) => {
    console.log('[usePlanes] Claiming free plan:', planKey);
    
    const plan = state.plansData[planKey];
    if (!plan) {
      showNotification('Plan no encontrado', '#ef4444');
      return;
    }

    try {
      const numericPlanId = parseInt(plan.id);
      const response = await createPlanRequest({
        plan_id: isNaN(numericPlanId) ? 1 : numericPlanId,
        payment_method: 'trial',
        months: 1,
      });

      if (response.success) {
        showNotification('¡Plan gratuito activado!', '#10b981');
        initialize();
      } else {
        showNotification('Error al activar plan', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Error claiming free plan:', error);
      showNotification('Error al procesar solicitud', '#ef4444');
    }
  }, [showNotification, state.plansData, initialize]);

  const openDowngradeModal  = (plan: string) => { update({ pendingDowngradePlan: plan }); setModal('downgrade', true); };
  const closeDowngradeModal = () => { setModal('downgrade', false); update({ pendingDowngradePlan: null }); };

  const confirmDowngrade = useCallback(() => {
    setState(prev => {
      const plan = prev.pendingDowngradePlan; if (!plan) return prev;
      let diasTexto = ' El cambio se aplicará de forma inmediata.';
      if (prev.subscriptionInfo?.expiryDate) {
        const dias = Math.ceil((new Date(prev.subscriptionInfo.expiryDate).getTime() - Date.now()) / 86400000);
        if (dias > 0) diasTexto = ` Conservarás los <strong>${dias} días restantes</strong>.`;
      }
      return { ...prev, downgradeConfirmText: diasTexto, modals: { ...prev.modals, downgrade: false, downgradeConfirm2: true } };
    });
  }, []);

  const cancelDowngradeConfirm2 = () => { setModal('downgradeConfirm2', false); update({ pendingDowngradePlan: null }); };

  const executeDowngrade = useCallback(async () => {
    const targetPlanKey = state.pendingDowngradePlan;
    if (!targetPlanKey) return;

    const plan = state.plansData[targetPlanKey];
    if (!plan) {
      showNotification('Plan no encontrado', '#ef4444');
      return;
    }

    console.log('[usePlanes] Execute downgrade to:', targetPlanKey);

    try {
      const numericPlanId = parseInt(plan.id);
      const response = await createPlanRequest({
        plan_id: isNaN(numericPlanId) ? 1 : numericPlanId,
        payment_method: 'trial',
        months: 1,
      });

      if (response.success) {
        showNotification('Solicitud de cambio enviada', '#10b981');
        setModal('downgradeConfirm2', false);
        initialize();
      } else {
        showNotification('Error al procesar solicitud', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Error executing downgrade:', error);
      showNotification('Error al procesar solicitud', '#ef4444');
    }
  }, [showNotification, state.plansData, state.pendingDowngradePlan, setModal, initialize]);

  const closeRequestSentModal = () => {
    setState(prev => {
      const refresh = prev.pendingUIRefresh;
      return { ...prev, modals: { ...prev.modals, requestSent: false }, pendingUIRefresh: false, currentPlan: refresh ? prev.currentPlan : prev.currentPlan };
    });
  };

  const openPaymentModal = useCallback(async (plan: string) => {
    console.log('[usePlanes] Opening payment modal for plan:', plan);
    const planData = state.plansData[plan];
    if (!planData) {
      showNotification('Plan no encontrado', '#ef4444');
      return;
    }
    // Abrir modal de pago (ya existe en el estado)
    update({ selectedPaymentPlan: plan });
    setModal('payment', true);
  }, [showNotification, state.plansData, setModal, update]);

  const closePaymentModal = () => { setModal('payment', false); update({ selectedPaymentPlan: null }); };

  const selectPreset = (id: string) => update({ selectedPresetId: id, customMonths: id === 'custom' ? 4 : state.customMonths });

  const changeCustomQty = (delta: number) => setState(prev => ({ ...prev, customMonths: Math.max(4, Math.min(48, prev.customMonths + delta)) }));

  const processPayment = useCallback(async () => {
    const {
      selectedPaymentPlan, selectedPresetId, plansData,
      currentPlan, userId, userName, customMonths,
    } = stateRef.current;
    if (!selectedPaymentPlan) return null;
    const isTrial = selectedPresetId === 'trial';
    const data = plansData[selectedPaymentPlan ?? ''];
    const planId = selectedPaymentPlan ?? '';
    
    // Calcular meses y label
    let totalMonths: number;
    if (selectedPresetId === 'trial')  totalMonths = 1;
    else if (selectedPresetId === 'custom') totalMonths = customMonths;
    else totalMonths = durationPresets.find(p => p.id === selectedPresetId)?.months ?? 1;
    
    let durationLabel: string;
    if (selectedPresetId === 'trial') durationLabel = 'Prueba gratuita (1 mes)';
    else if (totalMonths >= 12 && totalMonths % 12 === 0) { const y = totalMonths / 12; durationLabel = y === 1 ? '1 año (12 meses)' : `${y} años (${totalMonths} meses)`; }
    else durationLabel = totalMonths === 1 ? '1 mes' : `${totalMonths} meses`;

    // Trial - crear solicitud directamente
    if (isTrial) {
      setState(prev => ({ ...prev, sentText: `<strong>¡Tu plan ${data.name} está activándose!</strong><br><br><span style="color:#6b7280;font-size:13px;">Tu acceso se activará automáticamente en unos segundos.</span>`, selectedPaymentPlan: null, modals: { ...prev.modals, payment: false, requestSent: true } }));
      await saveRequest({ type: 'upgrade', fromPlan: currentPlan, toPlan: planId, planName: data.name, duration: durationLabel, durationId: 'trial', months: totalMonths, amount: 0, userName, paymentMethod: 'trial' });
      if (data.enableClaimLock) setState(prev => ({ ...prev, claimedPlans: prev.claimedPlans.includes(planId) ? prev.claimedPlans : [...prev.claimedPlans, planId] }));
      return null;
    }

    // Pago con Izipay - crear solicitud de pago
    try {
      // Obtener el ID numérico del plan usando el slug
      const numericPlanId = selectedPaymentPlan ? slugToNumericIdMap[selectedPaymentPlan] : 1;
      
      const response = await createPlanRequest({
        plan_id: numericPlanId,
        payment_method: 'izipay',
        months: totalMonths,
      });

      if (response.success) {
        // Aquí normalmente se iniciaría el pago con Izipay
        // Por ahora, simulamos que el pago fue exitoso
        showNotification('Pago procesado correctamente. Tu plan está activo.', '#10b981');
        setState(prev => ({ ...prev, selectedPaymentPlan: null, modals: { ...prev.modals, payment: false, requestSent: true } }));
        // Recargar datos
        initialize();
      } else {
        showNotification('Error al procesar pago', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Payment error:', error);
      showNotification('Error al procesar pago', '#ef4444');
    }
    
    return null;
  }, [saveRequest, showNotification, createPlanRequest, initialize]);

  const onFeatureClick      = (planKey: string) => { update({ benefitDetailPlanKey: planKey }); setModal('benefitDetail', true); };
  const goToBenefitDetail   = () => { setModal('benefitDetail', false); setModal('benefitFullDetail', true); };
  const toggleDetails       = () => setState(prev => ({ ...prev, isDetailsExpanded: !prev.isDetailsExpanded }));
  const toggleCarouselCard  = (key: string) => setState(prev => ({ ...prev, expandedCards: { ...prev.expandedCards, [key]: !prev.expandedCards[key] } }));

  // SSE handlers — wrapeados en useCallback y usan setState funcional para evitar stale closures
  const handleSolicitudActualizada = useCallback(async (data: { pendientes?: Request[] }) => {
    for (const req of (data.pendientes ?? [])) {
      if (req.status !== 'approved') continue;
      if (req.id) await apiPost('/solicitudes/aplicar.php', { id: req.id });
      const currentUserId = stateRef.current.userId;
      const est = await apiGet<EstadoResponse>(`/usuario/estado.php?usuario_id=${currentUserId}`);
      const av  = await apiGet<AvisoVencimientoResponse>(`/usuario/aviso_vencimiento.php?usuario_id=${currentUserId}`);
      setState(prev => {
        const planNom   = prev.plansData[req.toPlan]?.name ?? req.toPlan;
        const planColor = prev.plansData[req.toPlan]?.cssColor ?? '#10b981';
        // Programar notificación fuera del setState (efecto secundario)
        setTimeout(() => showNotification(`Tu plan ${planNom} está activo.`, planColor), 0);
        return {
          ...prev, currentPlan: req.toPlan,
          requestsCache: prev.requestsCache.filter(r => r.id !== req.id),
          subscriptionInfo: est.success ? (est.subscription ?? null) : prev.subscriptionInfo,
          claimedPlans: est.success ? (est.claimedPlans ?? prev.claimedPlans) : prev.claimedPlans,
          trialUsedPlans: est.success ? (est.trialUsed ?? prev.trialUsedPlans) : prev.trialUsedPlans,
          avisoPorVencer: av?.porVencer ? av : null,
          pendingUIRefresh: prev.modals.requestSent,
        };
      });
    }
  }, [showNotification]);

  const handlePagoConfirmado = useCallback(async (data: { planId: string; meses: number; monto: number }) => {
    setModal('waitingPayment', false);
    const currentUserId = stateRef.current.userId;
    const est = await apiGet<EstadoResponse>(`/usuario/estado.php?usuario_id=${currentUserId}`);
    const av  = await apiGet<AvisoVencimientoResponse>(`/usuario/aviso_vencimiento.php?usuario_id=${currentUserId}`);
    setState(prev => {
      const planNom   = prev.plansData[data.planId]?.name ?? data.planId;
      const planColor = prev.plansData[data.planId]?.cssColor ?? '#10b981';
      return {
        ...prev, currentPlan: data.planId,
        subscriptionInfo: est.success ? (est.subscription ?? null) : null,
        claimedPlans:     est.success ? (est.claimedPlans ?? []) : prev.claimedPlans,
        trialUsedPlans:   est.success ? (est.trialUsed    ?? []) : prev.trialUsedPlans,
        avisoPorVencer:   av?.porVencer ? av : null,
        pendingUIRefresh: true,
        sentText: `<strong>¡Pago confirmado! 🎉</strong><br><br>Tu plan <span style="color:${planColor};font-weight:800">${planNom}</span> ha sido activado por <strong>${data.meses === 1 ? '1 mes' : `${data.meses} meses`}</strong>.<br><br><span style="color:#6b7280;font-size:13px;">S/ ${parseFloat(String(data.monto ?? 0)).toFixed(2)} · Procesado por Izipay</span>`,
        modals: { ...prev.modals, requestSent: true },
      };
    });
  }, [setModal]);

  const handlePlanesActualizados = useCallback(async () => {
    const [planesRes, coloresRes] = await Promise.all([
      apiGet<{ success: boolean; plans?: PlansMap }>('/planes/config.php'),
      apiGet<{ success: boolean; colors?: ButtonColors }>('/ui/colores.php'),
    ]);
    setState(prev => {
      const newPlans = (planesRes.success && planesRes.plans && Object.keys(planesRes.plans).length > 0) ? planesRes.plans : prev.plansData;
      return { ...prev, plansData: newPlans, planOrder: buildPlanOrder(newPlans), buttonColors: (coloresRes.success && coloresRes.colors) ? coloresRes.colors : prev.buttonColors };
    });
  }, []);

  // Declarado ANTES del useEffect para evitar ReferenceError
  const handleColoresActualizados = useCallback(async () => {
    const res = await apiGet<{ success: boolean; colors?: ButtonColors }>('/ui/colores.php');
    if (res.success && res.colors) update({ buttonColors: res.colors });
  }, [update]);
  // Actualizar ref para que el BroadcastChannel listener siempre use la versión actualizada
  useEffect(() => { handleColoresActualizadosRef.current = handleColoresActualizados; }, [handleColoresActualizados]);

  // Refs para los handlers — evita ReferenceError independientemente del orden de declaración
  const handlePlanesActualizadosRef = useRef(handlePlanesActualizados);
  useEffect(() => { handlePlanesActualizadosRef.current = handlePlanesActualizados; }, [handlePlanesActualizados]);
  const handleColoresActualizadosRef = useRef<() => Promise<void>>(async () => {});
  // Escuchar notificaciones de cambios desde el admin (misma sesión del navegador)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('lyrium-planes');
    bc.onmessage = (e) => {
      if (e.data?.event === 'planes_actualizados') handlePlanesActualizadosRef.current();
      else if (e.data?.event === 'colores_actualizados') handleColoresActualizadosRef.current();
    };
    return () => bc.close();
  }, []);

  const handlePlanVencido = useCallback(async (data: { planActual?: string }) => {
    const currentUserId = stateRef.current.userId;
    const av = await apiGet<AvisoVencimientoResponse>(`/usuario/aviso_vencimiento.php?usuario_id=${currentUserId}`);
    setState(prev => ({ ...prev, currentPlan: data.planActual ?? 'basic', subscriptionInfo: null, avisoPorVencer: av?.porVencer ? av : null }));
    showNotification('Tu plan ha vencido y fue movido automáticamente al plan Emprende.', '#ef4444');
  }, [showNotification]);

  return {
    state, update, setModal, showNotification, initialize, switchTab,
    selectCarouselPlan, carouselStep, toggleCarouselCard, claimFreePlan,
    openDowngradeModal, closeDowngradeModal, confirmDowngrade,
    cancelDowngradeConfirm2, executeDowngrade, closeRequestSentModal,
    openPaymentModal, closePaymentModal, selectPreset, changeCustomQty,
    processPayment, onFeatureClick, goToBenefitDetail, toggleDetails,
    isPlanClaimed, isTrialUsed, hasPendingRequest,
    getPaymentTotalMonths, getPaymentDurationLabel, getDiscountForMonths,
    handleSolicitudActualizada, handlePagoConfirmado, handlePlanesActualizados,
    handlePlanVencido, handleColoresActualizados,
  };
}