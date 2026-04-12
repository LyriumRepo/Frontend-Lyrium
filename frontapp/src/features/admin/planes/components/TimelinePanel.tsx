'use client';
import { availableIcons } from '@/features/seller/plans/lib/icons';
import type { PlansMap } from '@/features/seller/plans/types';
import sanitizeHtml from 'sanitize-html';

interface Props {
  plansData: PlansMap;
  onSelectIcon: (planId: string, iconKey: string) => void;
}

export default function TimelinePanel({ plansData, onSelectIcon }: Props) {
  return (
    <div className="block animate-fade-in" id="timelinePanel">
      <div className="mb-7">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Iconos de Planes</h2>
        <p className="text-sm text-gray-400">Personaliza los iconos de cada plan en la línea de tiempo de progresión</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="timelinePointsEditor">
        {Object.entries(plansData).map(([key, plan]) => (
          <div key={key} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800">{plan.name}</h3>
              <div className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ background: plan.cssColor }} />
            </div>
            <span className="block text-xs font-semibold text-gray-700 mb-3">Seleccionar Icono:</span>
            <div className="grid grid-cols-4 gap-2.5" id={`iconSel_${key}`}>
              {Object.entries(availableIcons).map(([ik, path]) => (
                <div 
                  role="button"
                  tabIndex={0}
                  key={ik} 
                  className={`aspect-square flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-400
                    ${plan.timelineIcon === ik ? 'bg-blue-500 border-blue-500' : ''}`}
                  onClick={() => onSelectIcon(key, ik)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectIcon(key, ik); }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={plan.timelineIcon === ik ? "white" : "currentColor"} strokeWidth="2"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(path) }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
