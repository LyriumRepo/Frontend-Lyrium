'use client';
import { useState } from 'react';
import { hexToRgba, lightenColor, formatPrice, isMobile } from '@/features/seller/plans/lib/helpers';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  showcasePlan: string; plansData: PlansMap; planOrder: string[];
  currentPlan: string; claimedPlans: string[];
  hasPendingRequest: boolean;
  onOpenPayment: (plan: string) => void;
  onClaimFree: (plan: string) => void;
  onOpenDowngrade: (plan: string) => void;
  onFeatureClick: (plan: string) => void;
}

export default function Showcase({ showcasePlan, plansData, planOrder, currentPlan, claimedPlans, hasPendingRequest, onOpenPayment, onClaimFree, onOpenDowngrade, onFeatureClick }: Props) {
  const [showcaseExpanded, setShowcaseExpanded] = useState(false);
  const data = plansData[showcasePlan];

  const isCurrent   = showcasePlan === currentPlan;
  const currentIdx  = planOrder.indexOf(currentPlan);
  const targetIdx   = planOrder.indexOf(showcasePlan);
  const isDowngrade = targetIdx < currentIdx;
  const planLocked  = !!(data?.enableClaimLock && claimedPlans.includes(showcasePlan));
  const pending     = hasPendingRequest;

  if (!data) {
    return (
      <div className="plan-showcase">
        <div className="showcase-bg" style={{ background:'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }} />
        <div className="showcase-content" style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}>
          <h3 style={{ fontSize:'18px', color:'#6b7280', margin:'0 0 8px' }}>Sin planes disponibles</h3>
          <p style={{ fontSize:'14px', margin:0 }}>El administrador debe configurar al menos un plan.</p>
        </div>
      </div>
    );
  }

  const defaultLimit = isMobile() ? 5 : 6;
  const configLimit  = data.compactVisibleCount ?? defaultLimit;
  const maxShow      = showcaseExpanded ? (data.features?.length ?? 0) : configLimit;

  let bgStyle: React.CSSProperties = {};
  const planCssColor = data.cssColor ?? '#3b82f6';
  if (data.bgImage) {
    bgStyle = { backgroundImage:`url('${data.bgImage}')`, backgroundSize: data.bgImageFit === 'contain' ? 'contain' : 'cover', backgroundPosition: data.bgImagePosition ?? 'center' };
  } else {
    bgStyle = { background:`linear-gradient(135deg, ${lightenColor(planCssColor, 0.85)} 0%, ${lightenColor(planCssColor, 0.7)} 40%, ${lightenColor(planCssColor, 0.4)} 100%)` };
  }

  // Price section
  let priceSection: React.ReactNode;
  if (!data.requiresPayment && data.price === 0 && showcasePlan !== 'basic') {
    const refPlan  = plansData.standard ?? plansData[planOrder[Math.min(1, planOrder.length - 1)]];
    const refTotal = refPlan ? refPlan.price * 6 : 0;
    priceSection = (
      <div className="showcase-price-section animate-showcase-el" style={{ animationDelay:'0.25s' }}>
        {refTotal > 0 && <div className="showcase-price"><span className="amount" style={{ textDecoration:'line-through', color:'#9ca3af', fontSize:'1.8rem' }}>{formatPrice(refTotal, data.currency)}</span></div>}
        <div className="showcase-price"><span className="amount" style={{ color:data.cssColor }}>{data.currency ?? 'S/'} 0</span><span className="period" style={{ color:data.cssColor, fontWeight:700 }}> — Prueba gratuita 6 meses</span></div>
      </div>
    );
  } else if (data.usePriceMode === false && data.priceText) {
    priceSection = (
      <div className="showcase-price-section animate-showcase-el" style={{ animationDelay:'0.25s' }}>
        <div className="showcase-price"><span className="amount" style={{ color:data.cssColor }}>{data.priceText}</span>{data.priceSubtext && <span className="period"> {data.priceSubtext}</span>}</div>
      </div>
    );
  } else {
    const priceVal = data.price === 0 ? 'GRATIS' : formatPrice(data.price, data.currency);
    priceSection = (
      <div className="showcase-price-section animate-showcase-el" style={{ animationDelay:'0.25s' }}>
        <div className="showcase-price">
          <span className="amount">{priceVal}</span>
          {data.price > 0 && <span className="period">{data.period ?? '/mes'}</span>}
        </div>
        {data.price === 0 && <div className="showcase-price-annual"><span className="annual-amount">Única vez</span></div>}
        {data.priceAnnual > 0 && data.price > 0 && <div className="showcase-price-annual"><span className="annual-amount">{formatPrice(data.priceAnnual, data.currency)}</span><span className="annual-label">{data.periodAnnual ?? '/año'}</span></div>}
      </div>
    );
  }

  // CTA button
  let ctaBtn: React.ReactNode;
  const btnStyle: React.CSSProperties = { background:`var(--btn-subscribe-bg, ${data.cssColor})`, color:'var(--btn-subscribe-color, #fff)' };
  const btnText = data.subscribeButtonText ?? 'Suscribirse';
  if (isCurrent) {
    ctaBtn = <button className="btn-subscribe is-current" disabled>Plan Actual</button>;
  } else if (planLocked) {
    ctaBtn = (
      <>
        <button className="btn-subscribe btn-locked" disabled>{data.claimedButtonText ?? 'Este plan ya ha sido reclamado'}</button>
        {data.claimedWarningText && <p className="claimed-warning-text">{data.claimedWarningText}</p>}
      </>
    );
  } else if (pending) {
    ctaBtn = <button className="btn-subscribe is-current" disabled>Solicitud pendiente</button>;
  } else if (showcasePlan === 'premium' && !data.requiresPayment) {
    ctaBtn = <button className="btn-subscribe" style={btnStyle} onClick={() => onClaimFree(showcasePlan)}>{btnText}</button>;
  } else if (isDowngrade) {
    ctaBtn = <button className="btn-subscribe" style={btnStyle} onClick={() => onOpenDowngrade(showcasePlan)}>{btnText}</button>;
  } else if (!data.requiresPayment) {
    ctaBtn = <button className="btn-subscribe" style={btnStyle} onClick={() => onClaimFree(showcasePlan)}>{btnText}</button>;
  } else {
    ctaBtn = <button className="btn-subscribe" style={btnStyle} onClick={() => onOpenPayment(showcasePlan)}>{btnText}</button>;
  }

  const badgeBg     = hexToRgba(planCssColor, 0.12);
  const badgeColor  = data.accentColor ?? planCssColor;
  const badgeBorder = hexToRgba(planCssColor, 0.37);

  return (
    <div className="plan-showcase" id="planShowcase">
      <div className={`showcase-bg ${data.bgImage ? 'has-image' : ''}`} style={{ ...bgStyle, animation:'showcaseBgFade 2.5s ease' }} />
      <div className="showcase-content" style={{ animation:'showcasePlanChange 1.8s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="showcase-badge animate-showcase-el" style={{ background:badgeBg, color:badgeColor, border:`1px solid ${badgeBorder}`, animationDelay:'0.1s' }}>{data.badge}</div>
        <h2 className="showcase-plan-name animate-showcase-el" style={{ color:lightenColor(planCssColor, -0.1), animationDelay:'0.15s' }}>{data.name}</h2>
        <p className="showcase-description animate-showcase-el" style={{ animationDelay:'0.2s' }}>{data.description}</p>
        {priceSection}
        <div className="showcase-features animate-showcase-el" style={{ animationDelay:'0.3s' }}>
          {(data.features ?? []).slice(0, maxShow).map((f, i) => (
            <div 
              role="button"
              tabIndex={0}
              key={`${showcasePlan}-sf-${i}`} 
              className={`showcase-feature ${f.active ? 'sf-active' : 'sf-inactive'} feature-clickable`} 
              onClick={() => onFeatureClick(showcasePlan)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFeatureClick(showcasePlan); }}
            >
              <span className={`sf-icon ${f.active ? 'active' : 'inactive'}`}>{f.active ? '✓' : '✕'}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        {(data.features?.length ?? 0) > configLimit && (
          <button className="showcase-toggle-btn" onClick={() => setShowcaseExpanded(!showcaseExpanded)}>
            {showcaseExpanded
              ? <><span>Ver menos</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg></>
              : <><span>Ver {((data.features?.length ?? 0) - configLimit)} beneficios más</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></>
            }
          </button>
        )}
        <div className="showcase-cta animate-showcase-el" style={{ animationDelay:'0.35s' }}>{ctaBtn}</div>
      </div>
    </div>
  );
}
