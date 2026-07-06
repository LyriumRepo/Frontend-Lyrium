'use client';
import { useCallback, useEffect, useState } from 'react';
import { hexToRgba, formatPrice, formatDate, getDaysLeft } from '@/features/seller/plans/lib/helpers';
import type { PlansMap, SubscriptionInfo } from '@/features/seller/plans/types';
import Icon from '@/components/ui/Icon';
import { paymentMethodApi, type PaymentMethod } from '@/shared/lib/api/paymentMethodRepository';
import TokenizeNewCardModal from '@/features/customer/payment-methods/TokenizeNewCardModal';

interface Props {
  currentPlan: string; plansData: PlansMap;
  subscriptionInfo: SubscriptionInfo | null;
  isDetailsExpanded: boolean; onToggleDetails: () => void;
  onFeatureClick: (planKey: string) => void;
  onToggleAutoRenewal?: (enabled: boolean, paymentMethodId?: number) => Promise<boolean>;
}

export default function CurrentPlanCard({ currentPlan, plansData, subscriptionInfo, isDetailsExpanded, onToggleDetails, onFeatureClick, onToggleAutoRenewal }: Props) {
  const data = plansData[currentPlan];

  const [tokenizedCard, setTokenizedCard] = useState<PaymentMethod | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);
  const [updatingAutoRenew, setUpdatingAutoRenew] = useState(false);

  const loadPaymentMethods = useCallback(async () => {
    setLoadingCard(true);
    try {
      const methods = await paymentMethodApi.list();
      const card = methods.find((m) => m.tipo_metodo === 'tarjeta' && m.card_token && m.token_status === 'active') ?? null;
      setTokenizedCard(card);
    } catch {
      setTokenizedCard(null);
    } finally {
      setLoadingCard(false);
    }
  }, []);

  useEffect(() => {
    if (onToggleAutoRenewal) loadPaymentMethods();
  }, [onToggleAutoRenewal, loadPaymentMethods]);

  const handleAutoRenewChange = async (enabled: boolean) => {
    if (!onToggleAutoRenewal || updatingAutoRenew) return;
    if (enabled && !tokenizedCard) {
      setShowTokenizeModal(true);
      return;
    }
    setUpdatingAutoRenew(true);
    await onToggleAutoRenewal(enabled, tokenizedCard?.id);
    setUpdatingAutoRenew(false);
  };

  const handleCardTokenized = () => {
    setShowTokenizeModal(false);
    loadPaymentMethods();
  };

  if (!data) return null;

  const planColor = data.cssColor ?? 'var(--brand-green)';
  const visibleLimit = data.compactVisibleCount ?? 5;

  const badgeStyle: React.CSSProperties = {
    background: hexToRgba(planColor, 0.12),
    color: planColor,
    border: `1px solid ${hexToRgba(planColor, 0.35)}`,
  };

  let daysLeft = 0;
  let expiryBadge: React.ReactNode = null;

  if (currentPlan === 'basic') {
    expiryBadge = (
      <div className="expiry-badge" style={badgeStyle}>
        <Icon name="Clock" className="w-3.5 h-3.5 shrink-0" />
        <span>Vigencia: Indefinida</span>
      </div>
    );
  } else if (subscriptionInfo?.plan === currentPlan) {
    daysLeft = getDaysLeft(subscriptionInfo.expiryDate);
    const warningStyle: React.CSSProperties = daysLeft <= 15
      ? { background: hexToRgba('#f59e0b', 0.12), color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)' }
      : badgeStyle;
    expiryBadge = (
      <div className="expiry-badge" style={warningStyle}>
        <Icon name="Clock" className="w-3.5 h-3.5 shrink-0" />
        <span>Vence: {formatDate(subscriptionInfo.expiryDate)} ({daysLeft} días restantes)</span>
      </div>
    );
  } else {
    expiryBadge = (
      <div className="expiry-badge" style={badgeStyle}>
        <Icon name="Clock" className="w-3.5 h-3.5 shrink-0" />
        <span>Vigencia: Activa</span>
      </div>
    );
  }

  const priceText = data.usePriceMode === false && data.priceText
    ? data.priceText
    : (currentPlan === 'basic' ? 'GRATIS' : formatPrice(data.price, data.currency ?? 'S/'));

  const periodText = data.usePriceMode === false && data.priceText
    ? (data.priceSubtext ?? '')
    : (currentPlan === 'basic' ? '' : (data.period ?? '/mes'));

  return (
    <div
      className="current-plan-card plan-neon-glow"
      id="currentPlanCard"
      style={{
        '--plan-glow':       hexToRgba(planColor, 0.5),
        '--plan-glow-soft':  hexToRgba(planColor, 0.15),
        '--plan-glow-inner': hexToRgba(planColor, 0.1),
        border: `1.5px solid ${hexToRgba(planColor, 0.45)}`,
      } as React.CSSProperties}
    >
      {data.bgImage && (
        <div className="plan-background-image" style={{
          backgroundImage: `url('${data.bgImage}')`,
          backgroundSize: data.bgImageFit === 'contain' ? 'contain' : (data.bgImageFit ?? 'cover'),
          backgroundPosition: data.bgImagePosition ?? 'center',
        }} />
      )}
      <div className="plan-content">
        <div className="plan-header-compact">
          <span className="plan-badge-mini" style={{ background: planColor }}>{data.name}</span>
          <div className="plan-price-compact">
            <span className="amount" style={{ color: planColor }}>{priceText}</span>
            <span className="period">{periodText}</span>
          </div>
        </div>

        <div className="plan-features-compact" id="currentPlanFeatures">
          <div className="plan-expiry-info">{expiryBadge}</div>

          {(data.features ?? []).slice(0, visibleLimit).map((f, i) => (
            <div
              key={`feat-${i}-${String(f.text ?? '').slice(0, 12)}`}
              role="button"
              tabIndex={0}
              className={`feature-row ${f.active ? 'active-feature' : 'inactive-feature'} feature-clickable`}
              onClick={() => onFeatureClick(currentPlan)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFeatureClick(currentPlan); }}
            >
              <Icon
                name={f.active ? 'Check' : 'X'}
                className={`w-4 h-4 shrink-0 ${f.active ? '' : 'text-[var(--text-secondary)]'}`}
                style={f.active ? { color: planColor } : undefined}
              />
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {onToggleAutoRenewal && subscriptionInfo?.plan === currentPlan && (
          <div
            className="flex items-center justify-center gap-2 w-full px-2.5 py-1.5 mb-3 rounded-lg relative z-10"
            style={{ background: hexToRgba(planColor, 0.08), border: `1px solid ${hexToRgba(planColor, 0.35)}` }}
          >
            <Icon name="RefreshCw" className="w-3.5 h-3.5 shrink-0" style={{ color: planColor }} />
            <span className="text-[11px] font-bold shrink-0" style={{ color: planColor }}>Renovación automática</span>

            {!loadingCard && !tokenizedCard && (
              <button
                type="button"
                onClick={() => setShowTokenizeModal(true)}
                className="text-[10px] font-semibold underline underline-offset-2 text-gray-500 dark:text-gray-400 truncate"
              >
                Guardar tarjeta
              </button>
            )}
            {!loadingCard && tokenizedCard && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {tokenizedCard.card_brand} •••• {tokenizedCard.card_last4}
              </span>
            )}

            <label className={`relative inline-flex items-center shrink-0 ml-1 ${(loadingCard || updatingAutoRenew) ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                aria-label="Renovación automática"
                className="sr-only peer"
                checked={!!subscriptionInfo?.autoRenew}
                disabled={loadingCard || updatingAutoRenew}
                onChange={(e) => handleAutoRenewChange(e.target.checked)}
              />
              <div
                className="w-8 h-[18px] rounded-full bg-gray-300 dark:bg-[var(--bg-primary)] peer-checked:bg-[var(--plan-color)] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5"
                style={{ '--plan-color': planColor } as React.CSSProperties}
              />
            </label>
          </div>
        )}

        <button
          className={`details-btn ${isDetailsExpanded ? 'expanded' : ''}`}
          style={{ color: planColor, borderColor: hexToRgba(planColor, 0.25) }}
          onClick={onToggleDetails}
        >
          <span>{isDetailsExpanded ? 'Ver menos' : 'Ver detalles'}</span>
          <Icon name="ChevronDown" className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {isDetailsExpanded && (data.features ?? []).length > visibleLimit && (
        <div className="plan-details-expanded show">
          <div className="details-divider" />
          <div className="details-grid">
            {(data.features ?? []).slice(visibleLimit).map((f) => (
              <div key={`detail-${(f.text ?? '').slice(0, 8)}`} className={`detail-item ${f.active ? 'detail-active' : 'detail-inactive'}`}>
                <Icon
                  name={f.active ? 'CheckCircle2' : 'XCircle'}
                  className={`w-5 h-5 shrink-0 ${f.active ? '' : 'text-[var(--text-secondary)]'}`}
                  style={f.active ? { color: planColor } : undefined}
                />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTokenizeModal && (
        <TokenizeNewCardModal
          onClose={() => setShowTokenizeModal(false)}
          onSuccess={handleCardTokenized}
        />
      )}
    </div>
  );
}
