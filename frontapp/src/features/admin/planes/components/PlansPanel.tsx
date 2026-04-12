'use client';
import type { PlansMap } from '@/features/seller/plans/types';
import type { PlanStatusFilter } from '@/features/admin/planes/hooks/usePlanesAdmin';

const FIXED_ORDER = ['basic', 'standard', 'premium'];

const SvgEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const SvgDelete = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const SvgRestore = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;

interface Props {
  plansData: PlansMap;
  statusFilter: PlanStatusFilter;
  onFilterChange: (f: PlanStatusFilter) => void;
  onOpenEditor: (planId: string) => void;
  onToggleActive: (planId: string) => void;
  onOpenDelete: (planId: string) => void;
  onOpenRestore: (planId: string) => void;
}

export default function PlansPanel({ plansData, statusFilter, onFilterChange, onOpenEditor, onToggleActive, onOpenDelete, onOpenRestore }: Props) {
  const allKeys     = Object.keys(plansData);
  const orderedKeys = FIXED_ORDER.filter(k => allKeys.includes(k)).concat(allKeys.filter(k => !FIXED_ORDER.includes(k)));
  const filtered    = orderedKeys.filter(k => {
    const isActive = plansData[k]?.isActive !== false;
    if (statusFilter === 'active')   return isActive;
    if (statusFilter === 'inactive') return !isActive;
    return true;
  });

  return (
    <div className="block animate-fade-in" id="plansPanel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Gestión de Planes</h2>
        <button className="px-5 py-3 bg-blue-500 text-white rounded-xl text-[14px] font-bold cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'var(--admin-accent, #3b82f6)' }} onClick={() => onOpenEditor('new')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Nuevo Plan
        </button>
      </div>

      <div className="flex gap-2 mb-5" id="plansStatusFilters">
        {(['all', 'active', 'inactive'] as PlanStatusFilter[]).map(f => (
          <button key={f} className={`px-4 py-2 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200
            ${statusFilter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'}`}
            data-status={f} onClick={() => onFilterChange(f)}>
            {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8" id="plansGrid">
        {filtered.length === 0
          ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'50px', color:'#9ca3af', fontSize:'15px' }}>No hay planes en esta categoría.</div>
          : filtered.map(key => <PlanCard key={key} planKey={key} plansData={plansData} onEdit={onOpenEditor} onToggle={onToggleActive} onDelete={onOpenDelete} onRestore={onOpenRestore} />)
        }
      </div>
    </div>
  );
}

const IS_FIXED = (id: string) => ['basic', 'standard', 'premium'].includes(id);

function PlanCard({ planKey, plansData, onEdit, onToggle, onDelete, onRestore }: {
  planKey: string; plansData: PlansMap;
  onEdit: (id: string) => void; onToggle: (id: string) => void;
  onDelete: (id: string) => void; onRestore: (id: string) => void;
}) {
  const plan     = plansData[planKey]; if (!plan) return null;
  const isActive = plan.isActive !== false;

  let priceHtml: React.ReactNode;
  if (plan.usePriceMode === false && plan.priceText) {
    priceHtml = <div className="text-[1.8rem] font-extrabold" style={{ color:plan.cssColor }}>{plan.priceText}{plan.priceSubtext && <small className="text-[0.9rem] font-semibold text-gray-400"> {plan.priceSubtext}</small>}</div>;
  } else {
    priceHtml = <div className="text-[1.8rem] font-extrabold" style={{ color:plan.cssColor }}>{plan.currency ?? 'S/'} {(parseFloat(String(plan.price)) || 0).toFixed(2)}<small className="text-[0.9rem] font-semibold text-gray-400"> {plan.period ?? '/mes'}</small></div>;
  }

  const ToggleIcon = isActive
    ? () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="7" cy="12" r="3" fill="currentColor"/></svg>
    : () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="17" cy="12" r="3" fill="currentColor"/></svg>;

  return (
    <div className={`bg-white rounded-2xl p-6 border-2 border-gray-200 transition-all duration-300 relative overflow-hidden${isActive ? '' : ' opacity-55 grayscale-[40%]'}`} style={{ '--plan-color': plan.cssColor } as React.CSSProperties}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: plan.cssColor }} />
      <div className="mb-4">
        <div className="inline-block px-3 py-1 rounded-md text-[11px] font-bold mb-3" style={{ color:plan.cssColor, background:`${plan.cssColor}22` }}>{plan.badge}</div>
        <div className="text-[1.3rem] font-extrabold text-gray-800 mb-2">{plan.name}</div>
        {priceHtml}
        {!isActive && <div className="inline-block px-2.5 py-1 rounded-md bg-red-100 text-red-500 text-[10px] font-extrabold tracking-wider mt-2">INACTIVO</div>}
      </div>
      <div className="text-[13px] text-gray-400 mb-4">{plan.description}</div>
      <div className="mb-4 pt-4 border-t border-gray-200">
        <div className="text-[12px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Beneficios ({plan.features?.length ?? 0})</div>
        <ul className="list-none flex flex-col gap-1.5">
          {plan.features?.slice(0, 3).filter(f => f.active).map((f, i) => <li key={`k-${i}`} className="text-[12px] text-gray-700 pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-emerald-500 before:font-bold">{f.text}</li>)}
          {(plan.features?.length ?? 0) > 3 && <li className="text-gray-400 text-[12px]">+ {(plan.features?.length ?? 0) - 3} más...</li>}
        </ul>
      </div>
      <div className="flex gap-2 justify-end">
        <button className={`w-9 h-9 rounded-lg border-2 cursor-pointer transition-all duration-250 flex items-center justify-center flex-shrink-0
          ${isActive ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white hover:-translate-y-0.5' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:-translate-y-0.5'}`}
          title={isActive ? 'Desactivar plan' : 'Activar plan'} onClick={() => onToggle(plan.id)}>
          <ToggleIcon />
        </button>
        <button className="w-9 h-9 rounded-lg border-2 border-blue-500 text-blue-500 bg-transparent cursor-pointer transition-all duration-250 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:-translate-y-0.5" title="Editar" onClick={() => onEdit(plan.id)}><SvgEdit /></button>
        {IS_FIXED(plan.id) && (
          <button className="w-9 h-9 rounded-lg border-2 border-red-500 text-red-500 bg-transparent cursor-pointer transition-all duration-250 flex items-center justify-center hover:bg-red-500 hover:text-white hover:-translate-y-0.5" title="Restaurar" onClick={() => onRestore(plan.id)}><SvgRestore /></button>
        )}
        {!IS_FIXED(plan.id) && (
          <button className="w-9 h-9 rounded-lg border-2 border-red-500 text-red-500 bg-transparent cursor-pointer transition-all duration-250 flex items-center justify-center hover:bg-red-500 hover:text-white hover:-translate-y-0.5" title="Eliminar" onClick={() => onDelete(plan.id)}><SvgDelete /></button>
        )}
      </div>
    </div>
  );
}
