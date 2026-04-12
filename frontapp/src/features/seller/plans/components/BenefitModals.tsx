'use client';
import Modal from '@/features/seller/plans/shared/Modal';
import { benefitDetailsFallback } from '@/features/seller/plans/lib/benefitDetails';
import type { PlansMap, DetailedBenefit } from '@/features/seller/plans/types';

interface BenefitAskProps {
  open: boolean; planKey: string; plansData: PlansMap;
  onClose: () => void; onGoToDetail: () => void;
}

export function BenefitAskModal({ open, planKey, plansData, onClose, onGoToDetail }: BenefitAskProps) {
  const data = plansData[planKey];
  return (
    <Modal open={open} onClose={onClose} className="benefit-detail-ask-modal">
      <div className="benefit-ask-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h2 className="benefit-ask-title">¿Desea conocer los beneficios más a detalle?</h2>
      <p className="benefit-ask-text">Podrás ver una descripción completa de cada beneficio incluido en el plan {data?.name ?? planKey}.</p>
      <div className="benefit-ask-actions">
        <button className="btn-benefit-no" onClick={onClose}>No, gracias</button>
        <button className="btn-benefit-yes" onClick={onGoToDetail}>Sí, ver detalles</button>
      </div>
    </Modal>
  );
}

interface BenefitFullProps {
  open: boolean; planKey: string; plansData: PlansMap; onClose: () => void;
}

export function BenefitFullModal({ open, planKey, plansData, onClose }: BenefitFullProps) {
  const data = plansData[planKey];
  const details: DetailedBenefit[] = (data?.detailedBenefits && data.detailedBenefits.length > 0)
    ? data.detailedBenefits
    : (benefitDetailsFallback[planKey] ?? []) as DetailedBenefit[];

  return (
    <Modal open={open} onClose={onClose} className="benefit-full-detail-modal">
      <div className="benefit-detail-header">
        <div className="benefit-detail-icon-wrap" style={{ background: data?.cssColor ?? '#3b82f6' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h2 className="benefit-detail-title">Beneficios del Plan {data?.name ?? planKey}</h2>
        <p className="benefit-detail-subtitle">Conoce a detalle cada beneficio incluido</p>
      </div>
      <div className="benefit-detail-list">
        {details.length === 0
          ? <p style={{ textAlign:'center', color:'#6b7280', padding:'30px' }}>No hay detalles disponibles para este plan.</p>
          : details.map((d, i) => {
              const iconChar = ('emoji' in d && d.emoji) ? d.emoji : ('icon' in d ? (d as any).icon : '');
              const iconColor = d.color ?? data?.cssColor ?? '#3b82f6';
              return (
                <div key={`bd-${i}`} className="benefit-detail-item animate-benefit-item" style={{ animationDelay:`${i * 0.08}s` }}>
                  <div className="benefit-detail-item-icon" style={{ background:`${iconColor}22`, color: iconColor, border:`2px solid ${iconColor}33` }}>
                    {iconChar}
                  </div>
                  <div className="benefit-detail-item-content"><h4>{d.title}</h4><p>{d.description}</p></div>
                </div>
              );
            })
        }
      </div>
    </Modal>
  );
}
