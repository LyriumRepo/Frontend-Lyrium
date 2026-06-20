'use client';
import { formatPrice } from '@/features/seller/plans/lib/helpers';
import type { PlansMap } from '@/features/seller/plans/types';

const svgEdit    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const svgDelete  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const svgRestore = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const FIXED = ['basic', 'standard', 'premium'];

interface Props {
  plansData: PlansMap; statusFilter: string;
  onEdit: (id: string) => void; onToggleActive: (id: string) => void;
  onDelete: (id: string) => void; onRestore: (id: string) => void;
  onNew: () => void; onFilterChange: (f: string) => void;
}

export default function PlansGrid({ plansData, statusFilter, onEdit, onToggleActive, onDelete, onRestore, onNew, onFilterChange }: Props) {
  const allKeys = Object.keys(plansData);
  const orderedKeys = FIXED.filter(k => allKeys.includes(k)).concat(allKeys.filter(k => !FIXED.includes(k)));
  const filtered = orderedKeys.filter(key => {
    const isActive = plansData[key].isActive !== false;
    if (statusFilter === 'active')   return isActive;
    if (statusFilter === 'inactive') return !isActive;
    return true;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Gestión de Planes</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{filtered.length} plan{filtered.length !== 1 ? 'es' : ''} · {orderedKeys.filter(k => plansData[k].isActive !== false).length} activos</p>
        </div>
        <button
          className="px-5 py-2.5 bg-[var(--brand-teal)] text-white rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 flex items-center gap-2 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg shadow-[0_0_0_0_var(--brand-teal)]"
          onClick={onNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Crear Nuevo Plan
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'all',      label: 'Todos' },
          { key: 'active',   label: 'Activos' },
          { key: 'inactive', label: 'Inactivos' },
        ].map(f => (
          <button key={f.key}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 border
              ${statusFilter === f.key
                ? 'bg-[var(--brand-teal)] text-white border-[var(--brand-teal)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]'}`}
            onClick={() => onFilterChange(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {filtered.length === 0
          ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <p className="text-sm">No hay planes en esta categoría.</p>
            </div>
          )
          : filtered.map(key => {
            const plan = plansData[key];
            const isActive = plan.isActive !== false;
            const isFixed  = FIXED.includes(key);
            return (
              <div key={key}
                className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] transition-all duration-300 relative overflow-hidden hover:shadow-md hover:-translate-y-0.5${!isActive ? ' opacity-55 grayscale-[40%]' : ''}`}
                style={{ '--plan-color': plan.cssColor } as React.CSSProperties}>

                {/* Barra de color del plan */}
                <div className="h-1" style={{ background: plan.cssColor }} />

                <div className="p-5">
                  {/* Badge + nombre */}
                  <div className="mb-3">
                    <div className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold mb-2" style={{ color: plan.cssColor, background: `${plan.cssColor}22` }}>
                      {plan.badge}
                    </div>
                    {!isActive && (
                      <span className="inline-block ml-2 px-2 py-0.5 rounded-md bg-[var(--bg-danger)] text-[var(--color-error)] text-[10px] font-extrabold tracking-wider">INACTIVO</span>
                    )}
                    <div className="text-base font-extrabold text-[var(--text-primary)] mt-1">{plan.name}</div>
                  </div>

                  {/* Precio */}
                  {plan.usePriceMode === false && plan.priceText
                    ? <div className="text-[1.6rem] font-extrabold leading-none mb-1" style={{ color: plan.cssColor }}>
                        {plan.priceText}
                        {plan.priceSubtext && <small className="text-[0.85rem] font-semibold text-[var(--text-secondary)] ml-1">{plan.priceSubtext}</small>}
                      </div>
                    : <div className="text-[1.6rem] font-extrabold leading-none mb-1" style={{ color: plan.cssColor }}>
                        {plan.currency ?? 'S/'} {(plan.price ?? 0).toFixed(2)}
                        <small className="text-[0.85rem] font-semibold text-[var(--text-secondary)] ml-1">{plan.period ?? '/mes'}</small>
                      </div>
                  }

                  <p className="text-[13px] text-[var(--text-secondary)] mb-4 line-clamp-2">{plan.description}</p>

                  {/* Beneficios */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] mb-4">
                    <div className="text-[11px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                      Beneficios ({plan.features?.length ?? 0})
                    </div>
                    <ul className="list-none flex flex-col gap-1.5">
                      {(plan.features ?? []).slice(0, 3).filter(f => f.active).map(f => (
                        <li key={f.text} className="text-[12px] text-[var(--text-primary)] pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-[var(--color-success)] before:font-bold">
                          {f.text}
                        </li>
                      ))}
                      {(plan.features?.length ?? 0) > 3 && (
                        <li className="text-[var(--text-secondary)] text-[12px]">+ {(plan.features?.length ?? 0) - 3} más...</li>
                      )}
                    </ul>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 justify-end">
                    <button
                      className={`w-9 h-9 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-center
                        ${isActive
                          ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white hover:-translate-y-0.5'
                          : 'border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:text-white hover:-translate-y-0.5'}`}
                      title={isActive ? 'Desactivar plan' : 'Activar plan'}
                      onClick={() => onToggleActive(key)}>
                      {isActive
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="7" cy="12" r="3" fill="currentColor"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="17" cy="12" r="3" fill="currentColor"/></svg>
                      }
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg border border-[var(--brand-teal)] text-[var(--brand-teal)] bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-[var(--brand-teal)] hover:text-white hover:-translate-y-0.5"
                      title="Editar" onClick={() => onEdit(key)}>{svgEdit}
                    </button>
                    {isFixed && (
                      <button
                        className="w-9 h-9 rounded-lg border border-[var(--color-error)] text-[var(--color-error)] bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-[var(--color-error)] hover:text-white hover:-translate-y-0.5"
                        title="Restaurar" onClick={() => onRestore(key)}>{svgRestore}
                      </button>
                    )}
                    {!isFixed && (
                      <button
                        className="w-9 h-9 rounded-lg border border-[var(--color-error)] text-[var(--color-error)] bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-[var(--color-error)] hover:text-white hover:-translate-y-0.5"
                        title="Eliminar" onClick={() => onDelete(key)}>{svgDelete}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </>
  );
}
