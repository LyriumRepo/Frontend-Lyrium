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
  const effectivePreset = (trialBlocked && selectedPresetId === 'trial') ? '1m' : selectedPresetId;

  const totalMonths = (() => {
    if (effectivePreset === 'trial')  return 1;
    if (effectivePreset === 'custom') return customMonths;
    return durationPresets.find(p => p.id === effectivePreset)?.months ?? 1;
  })();

  const durationLabel = (() => {
    if (effectivePreset === 'trial') return 'Prueba gratuita (1 mes)';
    const m = totalMonths;
    if (m >= 12 && m % 12 === 0) { const y = m / 12; return y === 1 ? '1 año (12 meses)' : `${y} años (${m} meses)`; }
    return m === 1 ? '1 mes' : `${m} meses`;
  })();

  const discount    = isTrial ? 0 : getDiscountForMonths(totalMonths);
  const baseTotal   = isTrial ? 0 : data.price * totalMonths;
  const discountAmt = baseTotal * (discount / 100);
  const finalTotal  = baseTotal - discountAmt;
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
            {durationPresets.map(p => {
              const blocked  = p.isTrial && trialBlocked;
              const isActive = p.id === effectivePreset && !blocked;
              const discount = p.isTrial ? 0 : getDiscountForMonths(p.months ?? 1);
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
                  {!p.isTrial && p.id !== 'custom' && discount > 0 && <span className="preset-tag preset-discount">-{discount}%</span>}
                  {p.id === 'custom' && <span className="preset-tag preset-custom">Meses</span>}
                </button>
              );
            })}
          </div>

          {effectivePreset === 'trial'
            ? <div className="offer-tag" style={{ display:'block' }}>✨ Prueba gratuita por 1 mes sin compromiso</div>
            : discount > 0
              ? <div className="offer-tag" style={{ display:'block' }}>🎉 ¡{discount}% de descuento por {durationLabel}!</div>
              : null
          }
        </div>

        {effectivePreset === 'custom' && (
          <div className="custom-qty-section" style={{ display:'block' }}>
            <div className="custom-qty-header"><span className="custom-qty-title">Elige la cantidad de meses</span></div>
            <div className="custom-qty-row">
              <button className="qty-btn" onClick={() => onChangeCustomQty(-1)}>−</button>
              <input type="number" className="qty-input" value={customMonths} min={4} max={48} readOnly />
              <button className="qty-btn" onClick={() => onChangeCustomQty(1)}>+</button>
            </div>
            <div className="custom-qty-range"><span>4 meses</span><span>48 meses</span></div>
          </div>
        )}

        <div className="price-summary">
          <div className="summary-row"><span>Plan</span><span>{data.name}</span></div>
          <div className="summary-row"><span>Duración</span><span>{durationLabel}</span></div>
          <div className="summary-divider" />
          {baseTotal > 0 && discount > 0 && <div className="summary-row original-price-row"><span>Precio original</span><span className="original-price-value">{formatPrice(baseTotal, cur)}</span></div>}
          {discountAmt > 0 && <div className="summary-row discount-row"><span>Descuento</span><span>-{formatPrice(discountAmt, cur)} ({discount}%)</span></div>}
          <div className="summary-divider" />
          <div className="summary-row total-row"><span>Total a pagar</span><span>{formatPrice(finalTotal, cur)}</span></div>
          {!isTrial && totalMonths > 1 && <div className="summary-row per-month-row"><span>Equivale a</span><span>{formatPrice(finalTotal / totalMonths, cur)}/mes</span></div>}
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
