'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanes } from '@/features/seller/plans/hooks/usePlanes';
import { useSSE } from '@/features/seller/plans/hooks/useSSE';
import { motivationalMessages, notificationMessages } from '@/features/seller/plans/lib/plans';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import { apiGet } from '@/features/seller/plans/lib/api';

import AccessBlocked from '@/features/seller/plans/shared/AccessBlocked';
import Notification from '@/features/seller/plans/shared/Notification';
import Modal from '@/features/seller/plans/shared/Modal';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
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

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="space-y-6">
          <div className="flex justify-center gap-3 mb-12">
            {[1, 2].map(i => (
              <div key={i} className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
          <div className="h-10 w-64 mx-auto rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-5 w-96 mx-auto rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanesPage() {
  const planes = usePlanes();
  const { state } = planes;
  const [motivationIndex, setMotivationIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

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

  useEffect(() => {
    let el = document.getElementById('lyrium-custom-css');
    if (!el) { el = document.createElement('style'); el.id = 'lyrium-custom-css'; document.head.appendChild(el); }
    const data = state.plansData[state.currentPlan];
    el.textContent = (data?.customCSS) ? data.customCSS : '';
  }, [state.currentPlan, state.plansData]);

  const showNotification = planes.showNotification;
  useEffect(() => {
    if (!state.isLoaded) return;
    const msg = notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
    showNotification(msg, '#14b8a6');
  }, [state.isLoaded]);

  useEffect(() => {
    const interval = setInterval(() => setMotivationIndex(i => (i + 1) % motivationalMessages.length), 180000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!state.isLoaded || !state.subscriptionInfo?.expiryDate) return;
    const daysLeft = Math.ceil((new Date(state.subscriptionInfo.expiryDate).getTime() - Date.now()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 15) {
      const timer = setTimeout(() => showNotification(`Tu plan vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}. Renueva ahora.`, '#f59e0b'), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.isLoaded, state.subscriptionInfo?.expiryDate]);

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

  const [izipayError, setIzipayError] = useState<string | null>(null);

  const handleIzipaySuccess = useCallback(() => {
    planes.setModal('izipayPay', false);
    setIzipayError(null);
    planes.setModal('waitingPayment', true);

    const planIdBefore = state.subscriptionInfo?.planId || '';
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const subRes = await apiGet<{ data?: { plan_id: number; status: string; plan: { slug: string } } }>('/subscriptions/current');
        const newPlanId = subRes?.data?.plan_id ? String(subRes.data.plan_id) : null;
        if (subRes?.data?.status === 'active' && newPlanId && newPlanId !== planIdBefore) {
          clearInterval(poll);
          planes.setModal('waitingPayment', false);
          planes.showNotification('¡Pago confirmado! Tu plan ha sido activado.', '#10b981');
          planes.initialize();
        }
      } catch {}
      if (attempts >= 30) {
        clearInterval(poll);
        planes.setModal('waitingPayment', false);
        planes.showNotification('El pago fue procesado pero hubo un retraso en la activación. Recarga la página.', '#f59e0b');
      }
    }, 2000);
  }, []);

  const {
    loadSmartForm,
    error: izipaySdkError,
    isSdkReady: izipaySdkReady,
  } = useIzipay({ onSuccess: handleIzipaySuccess });

  useEffect(() => {
    if (state.modals.izipayPay && state.izipayConfig?.formToken) {
      setIzipayError(null);
      loadSmartForm(state.izipayConfig.formToken);
    }
  }, [state.modals.izipayPay, state.izipayConfig, loadSmartForm, izipaySdkReady]);

  useEffect(() => {
    if (izipaySdkError) setIzipayError(izipaySdkError);
  }, [izipaySdkError]);

  if (!state.isLoaded) return <SkeletonPage />;

  if (state.isBlocked && state.blockInfo) return <AccessBlocked {...state.blockInfo} />;

  const hasPending = planes.hasPendingRequest();

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {state.notification && (
        <Notification
          msg={state.notification.msg}
          color={state.notification.color}
          visible={state.notification.visible}
          onClose={() => planes.update({ notification: null })}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <ModuleHeader
          title="Mi Plan"
          subtitle="Gestiona tu suscripción en LYRIUM Biomarketplace"
          icon="UserCheck"
        />

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg shadow-black/5 border border-gray-200/50 dark:border-gray-700/50">
            {[
              { id: 'my-plan', label: 'Mi Plan', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
              { id: 'all-plans', label: 'Planes', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => planes.switchTab(tab.id as 'my-plan' | 'all-plans')}
                className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  state.activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {state.activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <svg className="relative z-10 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state.activeTab === 'my-plan' ? (
            <motion.div
              key="my-plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {showBanner && (
                <ExpiracionBanner
                  avisoPorVencer={state.avisoPorVencer}
                  subscriptionInfo={state.subscriptionInfo}
                  currentPlan={state.currentPlan}
                  plansData={state.plansData}
                  onClose={() => setShowBanner(false)}
                />
              )}



              <Timeline
                planOrder={state.planOrder} plansData={state.plansData}
                activePlan={state.currentPlan} suffix="MyPlan"
                onPointClick={() => {}}
              />

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <CurrentPlanCard
                  currentPlan={state.currentPlan}
                  plansData={state.plansData}
                  subscriptionInfo={state.subscriptionInfo}
                  isDetailsExpanded={state.isDetailsExpanded}
                  onToggleDetails={planes.toggleDetails}
                  onFeatureClick={planes.onFeatureClick}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 dark:from-teal-900/20 dark:via-sky-900/20 dark:to-emerald-900/20 border border-teal-200/30 dark:border-teal-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{motivationalMessages[motivationIndex]}</p>
                </div>
              </motion.div>

              {hasPending && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Tienes una solicitud de cambio de plan pendiente de aprobación.</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all-plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >


              <Timeline
                planOrder={state.planOrder} plansData={state.plansData}
                activePlan={state.showcasePlan} suffix="Plans"
                onPointClick={planes.selectCarouselPlan}
              />

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALS */}
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

      <Modal open={state.modals.requestSent} onClose={planes.closeRequestSentModal} className="" showClose={false}>
        <div className="text-center py-4 px-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </motion.div>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(state.sentText) }} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed" />
          <button className="mt-5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95" onClick={planes.closeRequestSentModal}>Entendido</button>
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

      <Modal open={state.modals.waitingPayment} onClose={() => planes.setModal('waitingPayment', false)} className="" showClose={false}>
        <div className="text-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-500"
          />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Confirmando tu pago</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Estamos verificando tu pago con Izipay. No cierres esta ventana.</p>
          <button className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition-all" onClick={() => planes.setModal('waitingPayment', false)}>Cerrar (seguir esperando)</button>
        </div>
      </Modal>
    </div>
  );
}
