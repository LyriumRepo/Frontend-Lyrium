'use client';
import Modal from '@/features/seller/plans/shared/Modal';
import { formatPrice, getPlanIconSvg } from '@/features/seller/plans/lib/helpers';
import { durationPresets, getDiscountForMonths } from '@/features/seller/plans/lib/plans';
import type { PlansMap } from '@/features/seller/plans/types';

interface Props {
  open: boolean; plan: string | null; plansData: PlansMap;
  selectedPresetId: string; customMonths: number; trialUsedPlans: string[];
  onClose: () => void; onSelectPreset: (id: string) => void;
  onChangeCustomQty: (delta: number) => void; onProcess: () => void;
}

export default function PaymentModal({ open, plan, plansData, selectedPresetId, customMonths, trialUsedPlans, onClose, onSelectPreset, onChangeCustomQty, onProcess }: Props) {
  if (!plan) return null;
  const data = plansData[plan]; if (!data) return null;

  const isTrial      = selectedPresetId === 'trial';
  const trialBlocked = trialUsedPlans.includes(plan);
  // "Por Vida" solo existe para Crece (plan propio crece-lifetime en el backend) —
  // se filtra para cualquier otro plan aunque durationPresets lo liste globalmente.
  const isCreceP     = plan === 'standard' || plan === 'crece';
  const availablePresets = durationPresets.filter(p => p.id !== 'lifetime' || isCreceP);
  const effectivePreset = (trialBlocked && selectedPresetId === 'trial') ? '1m' : selectedPresetId;
  const presetObj    = availablePresets.find(p => p.id === effectivePreset);
  const isLifetime   = presetObj?.isLifetime === true;

  const totalMonths = (() => {
    if (effectivePreset === 'trial')    return 1;
    if (effectivePreset === 'custom')   return customMonths;
    if (isLifetime)                     return null;
    return presetObj?.months ?? 1;
  })();

  const durationLabel = (() => {
    if (effectivePreset === 'trial') return 'Prueba gratuita (1 mes)';
    if (isLifetime) return 'Por vida (pago único)';
    const m = totalMonths ?? 1;
    if (m >= 12 && m % 12 === 0) { const y = m / 12; return y === 1 ? '1 año (12 meses)' : `${y} años (${m} meses)`; }
    return m === 1 ? '1 mes' : `${m} meses`;
  })();

  const discount    = (isTrial || isLifetime) ? 0 : (presetObj?.discountPercent ?? getDiscountForMonths(totalMonths ?? 1));
  const baseTotal   = isTrial ? 0 : isLifetime ? (presetObj?.lifetimePrice ?? 0) : data.price * (totalMonths ?? 1);
  const discountAmt = isLifetime ? 0 : baseTotal * (discount / 100);
  const finalTotal  = isLifetime ? (presetObj?.lifetimePrice ?? 0) : baseTotal - discountAmt;
  const cur         = data.currency ?? 'S/';

  const iconHtml = getPlanIconSvg(plan, 28, plansData).replace('stroke="currentColor"', 'stroke="white"');

  return (
    <Modal open={open} onClose={onClose} className="payment-modal">
      <div className="modal-header-section">
        <div 
            className="modal-plan-icon" 
            style={{ background: data.cssColor }}
            dangerouslySetInnerHTML={{ 
                // ✅ SEGURO: getPlanIconSvg() retorna SVG hardcoded interno
                // No viene de user input, API externa o database
                // Por lo tanto NO necesita sanitizar
                __html: iconHtml
            }} 
        />
        <h2 className="modal-title">Suscribirse a {data.name}</h2>
        <p className="modal-subtitle">{data.description}</p>
      </div>

      {/* Paso 1 */}
      <div id="payStep1">
        <div className="duration-selector">
          <h4 className="duration-label">Selecciona la duración</h4>
          <div className="duration-options preset-grid">
            {availablePresets.map(p => {
              const blocked  = p.isTrial && trialBlocked;
              const isActive = p.id === effectivePreset && !blocked;
              return (
                <button key={p.id}
                  className={`preset-btn${isActive ? ' active' : ''}${blocked ? ' preset-trial-used' : ''}`}
                  data-preset={p.id}
                  disabled={blocked}
                  onClick={() => !blocked && onSelectPreset(p.id)}
                  title={blocked ? 'Ya utilizaste la prueba gratuita' : ''}>
                  <span className="preset-label">{p.label}</span>
                  {p.isTrial && !blocked && <span className="preset-tag preset-free">Gratis</span>}
                  {p.isTrial && blocked && <span className="preset-tag preset-used">Ya usado</span>}
                  {p.isLifetime && <span className="preset-tag preset-lifetime">Pago único</span>}
                  {!p.isTrial && !p.isLifetime && (p.discountPercent ?? 0) > 0 && <span className="preset-tag preset-discount">-{p.discountPercent}%</span>}
                </button>
              );
            })}
          </div>

          {effectivePreset === 'trial'
            ? <div className="offer-tag" style={{ display:'block' }}>✨ Prueba gratuita por 1 mes sin compromiso</div>
            : isLifetime
              ? <div className="offer-tag" style={{ display:'block' }}>💎 Acceso de por vida — pago único, sin renovaciones</div>
              : discount > 0
                ? <div className="offer-tag" style={{ display:'block' }}>🎉 ¡{discount}% de descuento por {durationLabel}!</div>
                : null
          }
        </div>

        <div className="price-summary">
          <div className="summary-row"><span>Plan</span><span>{data.name}</span></div>
          <div className="summary-row"><span>Duración</span><span>{durationLabel}</span></div>
          <div className="summary-divider" />
          {baseTotal > 0 && discount > 0 && <div className="summary-row original-price-row"><span>Precio original</span><span className="original-price-value">{formatPrice(baseTotal, cur)}</span></div>}
          {discountAmt > 0 && <div className="summary-row discount-row"><span>Descuento</span><span>-{formatPrice(discountAmt, cur)} ({discount}%)</span></div>}
          <div className="summary-divider" />
          <div className="summary-row total-row"><span>Total a pagar</span><span>{formatPrice(finalTotal, cur)}</span></div>
          {!isTrial && !isLifetime && (totalMonths ?? 1) > 1 && <div className="summary-row per-month-row"><span>Equivale a</span><span>{formatPrice(finalTotal / (totalMonths ?? 1), cur)}/mes</span></div>}
        </div>

        <div id="step1Buttons">
          {effectivePreset === 'trial'
            ? <button className="btn-pay btn-pay-trial" onClick={onProcess}>Activar prueba gratuita</button>
            : <button className="btn-pay" onClick={onProcess}>Continuar al pago con Izipay ›</button>
          }
        </div>
      </div>
    </Modal>
  );
}
