'use client';
import { hexToRgba, formatPrice, formatDate, getDaysLeft } from '@/features/seller/plans/lib/helpers';
import type { PlansMap, SubscriptionInfo } from '@/features/seller/plans/types';
import Icon from '@/components/ui/Icon';

interface Props {
  currentPlan: string; plansData: PlansMap;
  subscriptionInfo: SubscriptionInfo | null;
  isDetailsExpanded: boolean; onToggleDetails: () => void;
  onFeatureClick: (planKey: string) => void;
}

export default function CurrentPlanCard({ currentPlan, plansData, subscriptionInfo, isDetailsExpanded, onToggleDetails, onFeatureClick }: Props) {
  const data = plansData[currentPlan];
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
    </div>
  );
}
