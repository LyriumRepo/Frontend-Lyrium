'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiGet, apiPost, createPlanRequest, createIzipayPlanSession, getMyPlanRequest, getSystemColors, updateAutoRenew } from '@/features/seller/plans/lib/api';
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

// Mapa global slug → ID numérico del backend
let slugToNumericIdMap: Record<string, number> = {};

// Mapa slug del backend → clave en defaultPlansData
const slugToDefaultKey: Record<string, string> = {
  emprende: 'basic',
  crece:    'standard',
  especial: 'premium',
};

export function usePlanes() {
  const [state, _setState] = useState<PlanesState>(initialState);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
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
      const mockAviso: AvisoVencimientoResponse = { porVencer: false, diasRestantes: 30, nombrePlan: 'Standard' };
      const mockButtonColors: ButtonColors = {
        subscribeBg: '#3b82f6', subscribeColor: '#ffffff',
        currentBg: '#e5e7eb',  currentColor: '#6b7280',
        lockedBg: '#9ca3af',   lockedColor: '#e5e7eb',
        warningColor: '#ef4444',
      };
      update({
        userId: mockUserId, userName: mockUserName, currentPlan: mockCurrentPlan,
        subscriptionInfo: mockSubscriptionInfo, claimedPlans: ['basic'], trialUsedPlans: [],
        requestsCache: mockRequests, avisoPorVencer: mockAviso, buttonColors: mockButtonColors,
        isLoaded: true, isBlocked: false, blockInfo: null,
      });
      return;
    }

    // API REAL — el vendedor solo lee, no escribe planes
    try {
      if (authLoading) return;

      if (!isAuthenticated || !user) {
        update({ isBlocked: true, blockInfo: { msg: 'Acceso restringido', sub: 'Debes iniciar sesión como vendedor.', btnHref: '/login', btnLabel: 'Iniciar sesión' }, isLoaded: true });
        return;
      }

      const userRole = user.role?.toLowerCase() || '';
      if (userRole !== 'seller' && userRole !== 'vendedor') {
        update({ isBlocked: true, blockInfo: { msg: 'Esta sección es para vendedores', sub: 'Gestiona los planes desde el panel admin.', btnHref: '/admin', btnLabel: 'Ir al panel admin' }, isLoaded: true });
        return;
      }

      const userId = String(user.id);
      const userName = user.display_name || user.username || 'Vendedor';

      type SubscriptionResponse = { data?: { id: number; plan_id: number; status: string; starts_at?: string; started_at?: string; ends_at?: string; expires_at?: string; auto_renew?: boolean; payment_method_id?: number | null; plan: { id: number; name: string; slug: string; monthly_fee: string; features: string[] } }; success?: boolean; message?: string };

      // apiGet() (features/seller/plans/lib/api.ts) NUNCA lanza excepción: si la
      // petición excede su timeout (o falla de red), resuelve silenciosamente con
      // { success: false, message: 'timeout' } — un objeto que parece válido pero
      // no tiene `.data`. En dev, el servidor PHP es single-thread y esta llamada
      // corre en paralelo con /plans (ya señalado como lento en el código), así que
      // puede quedar en cola y expirar justo tras un F5. Detectamos ese sentinel
      // explícitamente (no solo excepciones) y reintentamos antes de darnos por
      // vencidos — si igual falla, lo distinguimos de "no tiene suscripción" (que el
      // backend responde con 200 y data:null) para no mostrarle al vendedor un plan
      // inferior al que realmente tiene contratado.
      const isFailedResponse = (res: SubscriptionResponse): boolean => res.success === false;

      const fetchSubscriptionWithRetry = async (): Promise<SubscriptionResponse | null> => {
        try {
          const first = await apiGet<SubscriptionResponse>('/subscriptions/current');
          if (!isFailedResponse(first)) return first;
        } catch {
          // apiGet no debería lanzar, pero por si acaso
        }

        await new Promise((resolve) => setTimeout(resolve, 400));
        try {
          const second = await apiGet<SubscriptionResponse>('/subscriptions/current');
          if (isFailedResponse(second)) {
            console.error('[usePlanes] /subscriptions/current falló tras reintento:', second.message);
            return null;
          }
          return second;
        } catch (err) {
          console.error('[usePlanes] Error obteniendo suscripción actual tras reintento:', err);
          return null;
        }
      };

      // Fuente única de verdad: los planes vienen del backend (definidos por el admin)
      const [plansRes, subRes, colorsData] = await Promise.all([
        apiGet<{ data: Array<{ id: number; name: string; slug: string; monthly_fee: string; css_color?: string; accent_color?: string; features: string[]; detailed_benefits?: Array<{ title: string; description: string; icon?: string }> }> }>('/plans'),
        fetchSubscriptionWithRetry(),
        getSystemColors().catch(() => ({})),
      ]);

      slugToNumericIdMap = {};
      const plansData: PlansMap = {};
      if (plansRes.data) {
        plansRes.data.forEach((plan) => {
          slugToNumericIdMap[plan.slug] = plan.id;
          const fallback = defaultPlansData[slugToDefaultKey[plan.slug] ?? plan.slug];
          plansData[plan.slug] = {
            id: plan.slug,
            numericId: plan.id,
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
            features: plan.features?.map(f =>
              typeof f === 'string' ? { text: f, active: true } : { text: String((f as any).text ?? ''), active: (f as any).active ?? true }
            ) || [],
            detailedBenefits: plan.detailed_benefits?.map(b => ({ title: b.title, description: b.description, icon: b.icon || '' })) || [],
            isActive: true,
            cssColor: plan.css_color || fallback?.cssColor || '#10b981',
            accentColor: plan.accent_color || fallback?.accentColor || '#059669',
            bgImage: fallback?.bgImage || '',
            showBgInCard: fallback?.showBgInCard ?? false,
          };
        });
      }

      const subscriptionFetchFailed = subRes === null;
      const subscription = subRes?.data;
      // Si la petición falló de verdad (no que "no tiene suscripción"), no asumamos
      // 'emprende' — eso le mostraría al vendedor un plan inferior al que realmente
      // tiene activo. Mantenemos el último plan conocido en ese caso.
      const currentPlan = subscription?.plan?.slug
        || (subscriptionFetchFailed ? stateRef.current.currentPlan : 'emprende');
      const endsAt = subscription?.ends_at || subscription?.expires_at || '';
      const startsAt = subscription?.starts_at || subscription?.started_at || '';
      const subscriptionInfo: SubscriptionInfo | null = subscription ? {
        plan: subscription.plan.slug,
        expiryDate: endsAt,
        months: 1,
        planId: String(subscription.plan_id),
        status: subscription.status,
        startDate: startsAt,
        subscriptionId: subscription.id,
        autoRenew: subscription.auto_renew ?? false,
        paymentMethodId: subscription.payment_method_id ?? null,
      } : null;

      const buttonColors: ButtonColors = (colorsData && Object.keys(colorsData).length > 0) ? {
        subscribeBg: (colorsData as any).primary_color,
        subscribeColor: '#ffffff',
        currentBg: (colorsData as any).success_color,
        currentColor: '#ffffff',
        lockedBg: (colorsData as any).background_color,
        lockedColor: (colorsData as any).text_secondary_color,
        warningColor: (colorsData as any).error_color,
      } : {};

      const effectivePlans = Object.keys(plansData).length > 0 ? plansData : defaultPlansData;
      const planOrder = buildPlanOrder(effectivePlans);
      const effectivePlan = planOrder.includes(currentPlan) ? currentPlan : (planOrder[0] ?? 'basic');
      const carouselIndex = Math.max(0, planOrder.indexOf(effectivePlan));
      update({
        plansData: effectivePlans, planOrder, currentPlan: effectivePlan, userId, userName,
        claimedPlans: [], trialUsedPlans: [], subscriptionInfo,
        avisoPorVencer: null, requestsCache: [],
        ...(Object.keys(buttonColors).length > 0 ? { buttonColors } : {}),
        showcasePlan: effectivePlan, carouselIndex, isLoaded: true,
      });
    } catch (initErr) {
      const fallbackPlans = defaultPlansData;
      const fallbackOrder = buildPlanOrder(fallbackPlans);
      update({
        isLoaded: true,
        plansData: fallbackPlans,
        planOrder: fallbackOrder,
        currentPlan: 'basic',
        showcasePlan: 'basic',
        carouselIndex: 0,
      });
    }
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
    try {
      const numericPlanId = stateRef.current.plansData[req.toPlan]?.numericId ?? slugToNumericIdMap[req.toPlan];

      const response = await createPlanRequest({
        plan_id: numericPlanId,
        payment_method: req.paymentMethod === 'trial' ? 'trial' : 'izipay',
        months: req.months,
      });

      if (response.success) {
        showNotification('Solicitud enviada correctamente', '#10b981');
        setModal('requestSent', true);
        if (req.paymentMethod === 'trial') {
          showNotification('¡Tu plan ha sido activado!', '#10b981');
          initialize();
        }
      } else {
        showNotification('Error al crear solicitud', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Error creating plan request:', error);
      showNotification('Error al procesar solicitud', '#ef4444');
    }
  }, [showNotification, setModal, initialize]);

  const claimFreePlan = useCallback(async (planKey: string) => {
    const plan = state.plansData[planKey];
    if (!plan) { showNotification('Plan no encontrado', '#ef4444'); return; }

    try {
      const numericPlanId = plan.numericId ?? slugToNumericIdMap[planKey];
      const response = await createPlanRequest({ plan_id: numericPlanId!, payment_method: 'trial', months: 1 });
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
    if (!plan) { showNotification('Plan no encontrado', '#ef4444'); return; }

    try {
      const numericPlanId = plan.numericId ?? slugToNumericIdMap[targetPlanKey];
      const response = await createPlanRequest({ plan_id: numericPlanId!, payment_method: 'trial', months: 1 });
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
    const planData = state.plansData[plan];
    if (!planData) { showNotification('Plan no encontrado', '#ef4444'); return; }
    // Si el plan requiere pago, iniciar en '1m' para que el botón muestre Izipay, no trial
    const defaultPreset = planData.requiresPayment ? '1m' : 'trial';
    update({ selectedPaymentPlan: plan, selectedPresetId: defaultPreset });
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

    let totalMonths: number;
    if (selectedPresetId === 'trial')       totalMonths = 1;
    else if (selectedPresetId === 'custom') totalMonths = customMonths;
    else totalMonths = durationPresets.find(p => p.id === selectedPresetId)?.months ?? 1;

    let durationLabel: string;
    if (selectedPresetId === 'trial') durationLabel = 'Prueba gratuita (1 mes)';
    else if (totalMonths >= 12 && totalMonths % 12 === 0) { const y = totalMonths / 12; durationLabel = y === 1 ? '1 año (12 meses)' : `${y} años (${totalMonths} meses)`; }
    else durationLabel = totalMonths === 1 ? '1 mes' : `${totalMonths} meses`;

    if (isTrial) {
      setState(prev => ({ ...prev, sentText: `<strong>¡Tu plan ${data.name} está activándose!</strong><br><br><span style="color:#6b7280;font-size:13px;">Tu acceso se activará automáticamente en unos segundos.</span>`, selectedPaymentPlan: null, modals: { ...prev.modals, payment: false, requestSent: true } }));
      await saveRequest({ type: 'upgrade', fromPlan: currentPlan, toPlan: planId, planName: data.name, duration: durationLabel, durationId: 'trial', months: totalMonths, amount: 0, userName, paymentMethod: 'trial' });
      if (data.enableClaimLock) setState(prev => ({ ...prev, claimedPlans: prev.claimedPlans.includes(planId) ? prev.claimedPlans : [...prev.claimedPlans, planId] }));
      return null;
    }

    try {
      const planEntry = plansData[selectedPaymentPlan ?? ''];
      const numericPlanId = planEntry?.numericId ?? slugToNumericIdMap[selectedPaymentPlan ?? ''];

      // Mapa de claves default → slugs del backend (para cuando /plans no cargó a tiempo)
      const defaultKeyToSlug: Record<string, string> = {
        basic: 'emprende',
        standard: 'crece',
        premium: 'especial',
      };
      const planSlug = planEntry?.slug
        ?? (selectedPaymentPlan ? defaultKeyToSlug[selectedPaymentPlan] : undefined)
        ?? selectedPaymentPlan
        ?? undefined;

      if (!numericPlanId && !planSlug) {
        showNotification('No se pudo identificar el plan. Recarga la página e intenta de nuevo.', '#ef4444');
        return null;
      }

      const session = await createIzipayPlanSession({
        ...(numericPlanId ? { plan_id: numericPlanId } : { plan_slug: planSlug }),
        months: totalMonths,
      });

      if (!session.success) {
        showNotification(session.message ?? 'Error al iniciar el pago con Izipay', '#ef4444');
        return null;
      }

      // Modo simulación (backend sin credenciales Izipay reales):
      // el backend ya aprobó el PlanRequest automáticamente — actualizamos UI directamente
      // sin esperar a initialize() porque /plans es lento en dev (PHP single-thread).
      if (session.mode === 'mock') {
        const planNom = data.name;
        const newPlanKey = planEntry?.slug ?? planSlug ?? selectedPaymentPlan ?? '';
        setState(prev => {
          const planInState = prev.plansData[newPlanKey] ?? prev.plansData[selectedPaymentPlan ?? ''];
          const resolvedKey = planInState ? newPlanKey : prev.currentPlan;
          return {
            ...prev,
            currentPlan: resolvedKey,
            showcasePlan: resolvedKey,
            carouselIndex: Math.max(0, prev.planOrder.indexOf(resolvedKey)),
            subscriptionInfo: {
              plan: resolvedKey,
              expiryDate: new Date(Date.now() + totalMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
              months: totalMonths,
            },
            sentText: `<strong>✅ ¡Plan activado!</strong><br><br>Tu plan <strong>${planNom}</strong> ha sido activado por <strong>${totalMonths === 1 ? '1 mes' : `${totalMonths} meses`}</strong>.`,
            pendingUIRefresh: false,
            modals: { ...prev.modals, payment: false, requestSent: true },
          };
        });
        return null;
      }

      if (session.form_token && session.public_key && session.izipay_order_id) {
        setState(prev => ({
          ...prev,
          izipayConfig: {
            formToken: session.form_token!,
            publicKey: session.public_key!,
            orderId: session.izipay_order_id!,
          },
          modals: { ...prev.modals, payment: false, izipayPay: true },
        }));
      } else {
        showNotification('Respuesta de pago incompleta. Intenta más tarde.', '#ef4444');
      }
    } catch (error) {
      console.error('[usePlanes] Izipay session error:', error);
      showNotification('No se pudo conectar con el servicio de pago. Intenta más tarde.', '#ef4444');
    }

    return null;
  }, [saveRequest, showNotification, initialize]);

  const onFeatureClick      = (planKey: string) => { update({ benefitDetailPlanKey: planKey }); setModal('benefitDetail', true); };
  const goToBenefitDetail   = () => { setModal('benefitDetail', false); setModal('benefitFullDetail', true); };
  const toggleDetails       = () => setState(prev => ({ ...prev, isDetailsExpanded: !prev.isDetailsExpanded }));
  const toggleCarouselCard  = (key: string) => setState(prev => ({ ...prev, expandedCards: { ...prev.expandedCards, [key]: !prev.expandedCards[key] } }));

  // ── SSE handlers ──────────────────────────────
  // Cuando el admin aprueba/rechaza una solicitud, recargamos estado completo desde API
  const handleSolicitudActualizada = useCallback(async (data: { pendientes?: Request[] }) => {
    const approved = (data.pendientes ?? []).filter(r => r.status === 'approved');
    if (approved.length === 0) return;
    await initialize();
    const planNom = approved[0]?.toPlan
      ? stateRef.current.plansData[approved[0].toPlan]?.name ?? approved[0].toPlan
      : '';
    if (planNom) showNotification(`Tu plan ${planNom} está activo.`, '#10b981');
  }, [initialize, showNotification]);

  const handlePagoConfirmado = useCallback(async (data: { planId: string; meses: number; monto: number }) => {
    setModal('waitingPayment', false);
    await initialize();
    const { plansData } = stateRef.current;
    const planNom   = plansData[data.planId]?.name    ?? data.planId;
    const planColor = plansData[data.planId]?.cssColor ?? '#10b981';
    setState(prev => ({
      ...prev,
      sentText: `<strong>¡Pago confirmado! 🎉</strong><br><br>Tu plan <span style="color:${planColor};font-weight:800">${planNom}</span> ha sido activado por <strong>${data.meses === 1 ? '1 mes' : `${data.meses} meses`}</strong>.<br><br><span style="color:#6b7280;font-size:13px;">S/ ${parseFloat(String(data.monto ?? 0)).toFixed(2)} · Procesado por Izipay</span>`,
      pendingUIRefresh: true,
      modals: { ...prev.modals, requestSent: true },
    }));
  }, [setModal, initialize]);

  // Cuando llegan planes actualizados desde el admin, refrescamos desde el backend
  const handlePlanesActualizados = useCallback(async () => {
    if (USE_MOCKS) return;
    try {
      const [plansRes, colorsData] = await Promise.all([
        apiGet<{ data?: Array<{ id: number; name: string; slug: string; monthly_fee: string; features?: string[]; detailed_benefits?: Array<{ title: string; description: string; icon?: string }> }> }>('/plans'),
        getSystemColors().catch(() => ({})),
      ]);
      const newPlans: PlansMap = {};
      if (plansRes.data) {
        plansRes.data.forEach(plan => {
          slugToNumericIdMap[plan.slug] = plan.id;
          newPlans[plan.slug] = {
            id: plan.slug, numericId: plan.id, name: plan.name, slug: plan.slug,
            price: parseFloat(plan.monthly_fee) || 0,
            priceAnnual: (parseFloat(plan.monthly_fee) || 0) * 12,
            period: 'mensual', periodAnnual: 'anual', currency: 'S/',
            usePriceMode: false,
            priceText: plan.monthly_fee === '0.00' ? 'Gratis' : `S/ ${plan.monthly_fee}`,
            priceSubtext: plan.monthly_fee === '0.00' ? 'Sin costo' : '/mes',
            description: '', badge: '',
            requiresPayment: plan.monthly_fee !== '0.00',
            features: plan.features?.map(f =>
              typeof f === 'string' ? { text: f, active: true } : { text: String((f as any).text ?? ''), active: (f as any).active ?? true }
            ) || [],
            detailedBenefits: plan.detailed_benefits?.map(b => ({ title: b.title, description: b.description, icon: b.icon || '' })) || [],
            isActive: true,
            bgImage: defaultPlansData[slugToDefaultKey[plan.slug] ?? plan.slug]?.bgImage || '',
            showBgInCard: defaultPlansData[slugToDefaultKey[plan.slug] ?? plan.slug]?.showBgInCard ?? false,
          };
        });
      }
      const buttonColors: ButtonColors = (colorsData && Object.keys(colorsData).length > 0) ? {
        subscribeBg: (colorsData as any).primary_color,
        subscribeColor: '#ffffff',
        currentBg: (colorsData as any).success_color,
        currentColor: '#ffffff',
        lockedBg: (colorsData as any).background_color,
        lockedColor: (colorsData as any).text_secondary_color,
        warningColor: (colorsData as any).error_color,
      } : {};
      setState(prev => {
        const plans = Object.keys(newPlans).length > 0 ? newPlans : prev.plansData;
        return {
          ...prev, plansData: plans, planOrder: buildPlanOrder(plans),
          ...(Object.keys(buttonColors).length > 0 ? { buttonColors } : {}),
        };
      });
    } catch (err) {
      console.error('[usePlanes] handlePlanesActualizados error:', err);
    }
  }, []);

  // Declarado ANTES del useEffect para evitar ReferenceError
  const handleColoresActualizados = useCallback(async () => {
    if (USE_MOCKS) return;
    try {
      const colorsData = await getSystemColors();
      if (colorsData && Object.keys(colorsData).length > 0) {
        update({ buttonColors: {
          subscribeBg: (colorsData as any).primary_color,
          subscribeColor: '#ffffff',
          currentBg: (colorsData as any).success_color,
          currentColor: '#ffffff',
          lockedBg: (colorsData as any).background_color,
          lockedColor: (colorsData as any).text_secondary_color,
          warningColor: (colorsData as any).error_color,
        } });
      }
    } catch {}
  }, [update]);
  useEffect(() => { handleColoresActualizadosRef.current = handleColoresActualizados; }, [handleColoresActualizados]);

  // Auto-inicializar cuando auth resuelve (authLoading pasa de true a false)
  useEffect(() => {
    if (!authLoading) {
      initialize();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

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

  const toggleAutoRenewal = useCallback(async (enabled: boolean, paymentMethodId?: number) => {
    const subscriptionId = stateRef.current.subscriptionInfo?.subscriptionId;
    if (!subscriptionId) {
      showNotification('No se encontró tu suscripción activa', '#ef4444');
      return false;
    }

    try {
      const response = await updateAutoRenew(subscriptionId, enabled, paymentMethodId);

      // El backend responde 422 (sin tarjeta tokenizada) con `message` pero sin `subscription`
      if (!response.subscription) {
        showNotification(response.message ?? 'No se pudo actualizar la renovación automática', '#ef4444');
        return false;
      }

      setState(prev => prev.subscriptionInfo ? {
        ...prev,
        subscriptionInfo: {
          ...prev.subscriptionInfo,
          autoRenew: response.subscription?.auto_renew ?? enabled,
          paymentMethodId: response.subscription?.payment_method_id ?? paymentMethodId ?? prev.subscriptionInfo.paymentMethodId,
        },
      } : prev);
      showNotification(enabled ? 'Renovación automática activada' : 'Renovación automática desactivada', '#10b981');
      return true;
    } catch (error) {
      console.error('[usePlanes] Error toggling auto-renewal:', error);
      showNotification('No se pudo actualizar la renovación automática', '#ef4444');
      return false;
    }
  }, [showNotification, setState]);

  const handlePlanVencido = useCallback(async () => {
    await initialize();
    showNotification('Tu plan ha vencido y fue movido automáticamente al plan Emprende.', '#ef4444');
  }, [initialize, showNotification]);

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
    handlePlanVencido, handleColoresActualizados, toggleAutoRenewal,
  };
}
