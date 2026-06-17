'use client';
import { availableIcons } from '@/features/seller/plans/lib/icons';
import type { PlansMap } from '@/features/seller/plans/types';
import sanitizeHtml from 'sanitize-html';

interface Props {
  plansData: PlansMap;
  onSelectIcon: (planId: string, iconKey: string) => void;
}

export default function TimelineEditor({ plansData, onSelectIcon }: Props) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-1">Iconos de Planes</h2>
        <p className="text-sm text-[var(--text-secondary)]">Personaliza los iconos de cada plan en la línea de tiempo de progresión</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(plansData).map(plan => (
          <div key={plan.id} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-subtle)] hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{plan.name}</h3>
                <span className="text-[11px] text-[var(--text-secondary)]">Icono actual</span>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-[var(--border-subtle)] shadow-sm" style={{ background: plan.cssColor }} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(availableIcons).map(([ik, path]) => (
                <div
                  role="button" tabIndex={0} key={ik}
                  className={`aspect-square flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 border
                    ${plan.timelineIcon === ik
                      ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)] shadow-sm'
                      : 'bg-[var(--bg-muted)] border-[var(--border-subtle)] hover:border-[var(--brand-teal)] hover:bg-[var(--bg-card)]'}`}
                  onClick={() => onSelectIcon(plan.id, ik)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectIcon(plan.id, ik); }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={plan.timelineIcon === ik ? 'white' : 'var(--text-secondary)'}
                    strokeWidth="2"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(path) }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
