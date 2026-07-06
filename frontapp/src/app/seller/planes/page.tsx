'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlanes } from '@/features/seller/plans/hooks/usePlanes';
import { useSSE } from '@/features/seller/plans/hooks/useSSE';
import { motivationalMessages, notificationMessages } from '@/features/seller/plans/lib/plans';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import { apiGet, apiPost } from '@/features/seller/plans/lib/api';

import AccessBlocked from '@/features/seller/plans/shared/AccessBlocked';
import Notification from '@/features/seller/plans/shared/Notification';
import Modal from '@/features/seller/plans/shared/Modal';
import Timeline from '@/features/seller/plans/components/Timeline';
import CurrentPlanCard from '@/features/seller/plans/components/CurrentPlanCard';
import Showcase from '@/features/seller/plans/components/Showcase';
import Carousel from '@/features/seller/plans/components/Carousel';
import PaymentModal from '@/features/seller/plans/components/PaymentModal';
import { BenefitAskModal, BenefitFullModal } from '@/features/seller/plans/components/BenefitModals';
import { DowngradeModal, DowngradeConfirm2Modal } from '@/features/seller/plans/components/DowngradeModals';
import ExpiracionBanner from '@/features/seller/plans/components/ExpiracionBanner';
import IzipayModal from '@/features/public/checkout/components/modals/IzipayModal';
import { useIzipay } from '@/features/public/checkout/hooks/useIzipay';

export default function PlanesPage() {
  const planes = usePlanes();
  const { state } = planes;
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  // Inicialización automática vía usePlanes (useEffect interno con authLoading)

  // Apply button colors as CSS vars
  useEffect(() => {
    const c = state.buttonColors;
    const r = document.documentElement.style;
    if (c.subscribeBg) r.setProperty('--btn-subscribe-bg', c.subscribeBg);
    if (c.subscribeColor) r.setProperty('--btn-subscribe-color', c.subscribeColor);
    if (c.currentBg) r.setProperty('--btn-current-bg', c.currentBg);
    if (c.currentColor) r.setProperty('--btn-current-color', c.currentColor);
    if (c.lockedBg) r.setProperty('--btn-locked-bg', c.lockedBg);
    if (c.lockedColor) r.setProperty('--btn-locked-color', c.lockedColor);
    if (c.warningColor) r.setProperty('--claimed-text-color', c.warningColor);
  }, [state.buttonColors]);

  // Inject custom CSS for plan
  useEffect(() => {
    let el = document.getElementById('lyrium-custom-css');
    if (!el) { el = document.createElement('style'); el.id = 'lyrium-custom-css'; document.head.appendChild(el); }
    const data = state.plansData[state.currentPlan];
    el.textContent = (data?.customCSS) ? data.customCSS : '';
  }, [state.currentPlan, state.plansData]);

  // Initial notification — solo se dispara cuando isLoaded pasa de false a true
  const showNotification = planes.showNotification;
  useEffect(() => {
    if (!state.isLoaded) return;
    const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    showNotification(msg, '#3b82f6');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isLoaded]);

  // Motivational message rotation
  useEffect(() => {
    const interval = setInterval(() => setMotivationIndex(i => (i + 1) % motivationalMessages.length), 180000);
    return () => clearInterval(interval);
  }, []);

  // Days-left notification
  useEffect(() => {
    if (!state.isLoaded || !state.subscriptionInfo?.expiryDate) return;
    const daysLeft = Math.ceil((new Date(state.subscriptionInfo.expiryDate).getTime() - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 15) {
      const timer = setTimeout(() => showNotification(`⚠ Tu plan vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}. ¡Renueva ahora!`, '#f59e0b'), 2500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isLoaded, state.subscriptionInfo?.expiryDate]);

  // Keyboard carousel nav
  const carouselStep = planes.carouselStep;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state.activeTab !== 'all-plans') return;
      if (e.key === 'ArrowRight') carouselStep(1);
      if (e.key === 'ArrowLeft') carouselStep(-1);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state.activeTab, carouselStep]);

  // SSE
  const { disconnect: disconnectSSE } = useSSE(
    'planes', state.userId,
    {
      solicitud_actualizada: planes.handleSolicitudActualizada as never,
      pago_confirmado: planes.handlePagoConfirmado as never,
      pago_fallido: ({ motivo }: { motivo?: string }) => {
        planes.setModal('izipayPay', false);
        planes.setModal('waitingPayment', false);
        planes.showNotification(`El pago no pudo completarse. ${motivo ?? 'Inténtalo de nuevo.'}`, '#ef4444');
      },
      planes_actualizados: planes.handlePlanesActualizados as never,
      plan_vencido: planes.handlePlanVencido as never,
      colores_actualizados: planes.handleColoresActualizados as never,
    },
    state.isLoaded && !state.isBlocked,
  );

  // ── Izipay SDK ────────────────────────────────────────────────────────────
  const [izipayError, setIzipayError] = useState<string | null>(null);

  const handleIzipaySuccess = useCallback(async (result: import('@/features/public/checkout/hooks/useIzipay').KryptonPaymentSuccessDetail) => {
    planes.setModal('izipayPay', false);
    setIzipayError(null);
    planes.setModal('waitingPayment', true);

    const orderId = result?.clientAnswer?.orderDetails?.orderId ?? state.izipayConfig?.orderId ?? '';

    try {
      const res = await apiPost<{ success: boolean; message?: string }>(
        '/payments/izipay/plan-callback',
        { client_answer: result.clientAnswer, order_id: orderId },
      );

      planes.setModal('waitingPayment', false);

      if (res.success) {
        planes.showNotification('¡Pago confirmado! Tu plan ha sido activado.', '#10b981');
        await planes.initialize();
      } else {
        planes.showNotification(res.message ?? 'El pago fue recibido pero hubo un error al activar el plan. Contacta soporte.', '#f59e0b');
      }
    } catch {
      planes.setModal('waitingPayment', false);
      planes.showNotification('El pago fue procesado. Recarga la página para ver tu plan actualizado.', '#f59e0b');
    }
  }, [state.izipayConfig?.orderId]);

  const {
    loadSmartForm,
    error: izipaySdkError,
    isSdkReady: izipaySdkReady,
  } = useIzipay({ onSuccess: handleIzipaySuccess });

  // Inyectar formToken cuando el modal se abre y está montado en el DOM
  useEffect(() => {
    console.log('[page] izipayPay effect:', { modals: state.modals.izipayPay, hasToken: !!state.izipayConfig?.formToken, sdkReady: izipaySdkReady });
    if (state.modals.izipayPay && state.izipayConfig?.formToken) {
      setIzipayError(null);
      loadSmartForm(state.izipayConfig.formToken);
    }
  }, [state.modals.izipayPay, state.izipayConfig, loadSmartForm, izipaySdkReady]);

  // Sincronizar error del SDK al estado local
  useEffect(() => {
    if (izipaySdkError) setIzipayError(izipaySdkError);
  }, [izipaySdkError]);

  if (!state.isLoaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f9fafb' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
    </div>;
  }

  if (state.isBlocked && state.blockInfo) return <AccessBlocked {...state.blockInfo} />;

  const hasPending = planes.hasPendingRequest();

  const tabsButtons = (
    <>
      <button className={`tab-btn ${state.activeTab === 'my-plan' ? 'active' : ''}`} data-tab="my-plan" onClick={() => planes.switchTab('my-plan')}>
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        Mi Plan
      </button>
      <button className={`tab-btn ${state.activeTab === 'all-plans' ? 'active' : ''}`} data-tab="all-plans" onClick={() => planes.switchTab('all-plans')}>
        <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
        Planes
      </button>
    </>
  );

  return (
    <>
      {/* Notification */}
      {state.notification && (
        <Notification
          msg={state.notification.msg}
          color={state.notification.color}
          visible={state.notification.visible}
          onClose={() => planes.update({ notification: null })}
        />
      )}

      {/* Tabs */}
      <nav className="tabs-nav">
        {tabsButtons}
      </nav>

      <div className="container">

        {/* ── PESTAÑA: MI PLAN ── */}
        <div className={`tab-panel ${state.activeTab === 'my-plan' ? 'active' : ''}`} id="panel-my-plan">
          {showBanner && (
            <ExpiracionBanner
              avisoPorVencer={state.avisoPorVencer}
              subscriptionInfo={state.subscriptionInfo}
              currentPlan={state.currentPlan}
              plansData={state.plansData}
              onClose={() => setShowBanner(false)}
            />
          )}

          <ModuleHeader
            title="Mi Plan Actual"
            subtitle="Gestiona tu suscripción en LYRIUM Biomarketplace"
            icon="CreditCard"
          />

          <Timeline
            planOrder={state.planOrder} plansData={state.plansData}
            activePlan={state.currentPlan} suffix="MyPlan"
            onPointClick={plan => { }}
          />

          <div className="motivation-section">
            <div className="motivation-card-modern">
              <div className="motivation-icon-modern">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <p className="motivation-text-modern">{motivationalMessages[motivationIndex]}</p>
            </div>
          </div>
          <br />

          <nav className="tabs-nav-mobile">
            {tabsButtons}
          </nav>

          <div className="my-plan-layout">
            <div className="current-plan-section-wrapper animate-card-entrance">
              <div className="current-plan-wrapper">
                <CurrentPlanCard
                  currentPlan={state.currentPlan}
                  plansData={state.plansData}
                  subscriptionInfo={state.subscriptionInfo}
                  isDetailsExpanded={state.isDetailsExpanded}
                  onToggleDetails={planes.toggleDetails}
                  onFeatureClick={planes.onFeatureClick}
                  onToggleAutoRenewal={planes.toggleAutoRenewal}
                />
              </div>
            </div>
          </div>

          {hasPending && (
            <div className="pending-request-banner" id="pendingBanner">
              <div className="pending-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p>Tienes una solicitud de cambio de plan pendiente de aprobación.</p>
            </div>
          )}
        </div>

        {/* ── PESTAÑA: PLANES ── */}
        <div className={`tab-panel ${state.activeTab === 'all-plans' ? 'active' : ''}`} id="panel-all-plans">
          <ModuleHeader
            title="Explora Nuestros Planes"
            subtitle="Elige el plan perfecto para tu tienda en LYRIUM Biomarketplace"
            icon="Layers"
          />

          <Timeline
            planOrder={state.planOrder} plansData={state.plansData}
            activePlan={state.showcasePlan} suffix="Plans"
            onPointClick={planes.selectCarouselPlan}
          />

          <nav className="tabs-nav-mobile">
            {tabsButtons}
          </nav>

          <Showcase
            showcasePlan={state.showcasePlan}
            plansData={state.plansData}
            planOrder={state.planOrder}
            currentPlan={state.currentPlan}
            claimedPlans={state.claimedPlans}
            hasPendingRequest={hasPending}
            onOpenPayment={planes.openPaymentModal}
            onClaimFree={planes.claimFreePlan}
            onOpenDowngrade={planes.openDowngradeModal}
            onFeatureClick={planes.onFeatureClick}
          />

          <Carousel
            planOrder={state.planOrder}
            plansData={state.plansData}
            showcasePlan={state.showcasePlan}
            carouselIndex={state.carouselIndex}
            currentPlan={state.currentPlan}
            claimedPlans={state.claimedPlans}
            expandedCards={state.expandedCards}
            onSelect={planes.selectCarouselPlan}
            onStep={planes.carouselStep}
            onToggleCard={planes.toggleCarouselCard}
            onFeatureClick={planes.onFeatureClick}
          />
        </div>

      </div>

      {/* ── MODALS ── */}
      <PaymentModal
        open={state.modals.payment}
        plan={state.selectedPaymentPlan}
        plansData={state.plansData}
        selectedPresetId={state.selectedPresetId}
        customMonths={state.customMonths}
        trialUsedPlans={state.trialUsedPlans}
        onClose={planes.closePaymentModal}
        onSelectPreset={planes.selectPreset}
        onChangeCustomQty={planes.changeCustomQty}
        onProcess={() => { disconnectSSE(); planes.processPayment(); }}
      />

      <Modal open={state.modals.requestSent} onClose={planes.closeRequestSentModal} className="request-sent-modal" showClose={false}>
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <div className="waiting-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(state.sentText) }} style={{ marginTop: '12px', lineHeight: 1.6 }} />
          <button className="btn-sent-ok" style={{ marginTop: '20px' }} onClick={planes.closeRequestSentModal}>Entendido</button>
        </div>
      </Modal>

      <DowngradeModal
        open={state.modals.downgrade}
        plan={state.pendingDowngradePlan}
        plansData={state.plansData}
        onClose={planes.closeDowngradeModal}
        onConfirm={planes.confirmDowngrade}
      />

      <DowngradeConfirm2Modal
        open={state.modals.downgradeConfirm2}
        plan={state.pendingDowngradePlan}
        plansData={state.plansData}
        confirmText={state.downgradeConfirmText}
        onCancel={planes.cancelDowngradeConfirm2}
        onExecute={planes.executeDowngrade}
      />

      <BenefitAskModal
        open={state.modals.benefitDetail}
        planKey={state.benefitDetailPlanKey}
        plansData={state.plansData}
        onClose={() => planes.setModal('benefitDetail', false)}
        onGoToDetail={planes.goToBenefitDetail}
      />

      <BenefitFullModal
        open={state.modals.benefitFullDetail}
        planKey={state.benefitDetailPlanKey}
        plansData={state.plansData}
        onClose={() => planes.setModal('benefitFullDetail', false)}
      />

      <IzipayModal isOpen={state.modals.izipayPay} onClose={() => { planes.setModal('izipayPay', false); setIzipayError(null); }} error={izipayError} />

      <Modal open={state.modals.waitingPayment} onClose={() => planes.setModal('waitingPayment', false)} className="waiting-admin-modal" showClose={false}>
        <div className="waiting-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="waiting-title">Confirmando tu pago</h2>
        <p className="waiting-text">Estamos verificando tu pago con Izipay. No cierres esta ventana.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div className="payment-spinner"></div>
        </div>
        <button className="btn-sent-ok" style={{ marginTop: '20px', background: '#6b7280' }} onClick={() => planes.setModal('waitingPayment', false)}>Cerrar (seguir esperando)</button>
      </Modal>
    </>
  );
}
