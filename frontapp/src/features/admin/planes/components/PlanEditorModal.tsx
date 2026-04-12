'use client';
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/features/seller/plans/shared/Modal';
import type { PlanData, PlanFeature, DetailedBenefit } from '@/features/seller/plans/types';

interface Props {
  open: boolean; title: string; activeTab: string;
  editingPlan: Partial<PlanData>;
  editFeatures: PlanFeature[];
  editDetailedBenefits: DetailedBenefit[];
  onClose: () => void; onSave: () => void;
  onTabChange: (tab: string) => void;
  onUpdatePlan: (patch: Partial<PlanData>) => void;
  onAddFeature: () => void;
  onUpdateFeature: (idx: number, patch: Partial<PlanFeature>) => void;
  onRemoveFeature: (idx: number) => void;
  onAddDetailedBenefit: () => void;
  onUpdateDetailedBenefit: (idx: number, patch: Partial<DetailedBenefit>) => void;
  onRemoveDetailedBenefit: (idx: number) => void;
  onImageUpload: (file: File) => void;
}

const EDITOR_TABS = [
  { key: 'basic',    label: 'Básico',      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'pricing',  label: 'Precios',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 8h6M9 16h6"/></svg> },
  { key: 'design',   label: 'Diseño',      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { key: 'features', label: 'Beneficios',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
  { key: 'detailed', label: 'Detallados',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg> },
  { key: 'config',   label: 'Configuración',icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg> },
];

const FIT_OPTIONS = [['cover','Cubrir (llenar)'],['contain','Contener'],['fill','Estirar']];
const POS_OPTIONS = [['center','Centro'],['top','Arriba'],['bottom','Abajo'],['left','Izquierda'],['right','Derecha'],['top center','Arriba centro'],['bottom center','Abajo centro']];

export default function PlanEditorModal({ open, title, activeTab, editingPlan: ep, editFeatures, editDetailedBenefits, onClose, onSave, onTabChange, onUpdatePlan, onAddFeature, onUpdateFeature, onRemoveFeature, onAddDetailedBenefit, onUpdateDetailedBenefit, onRemoveDetailedBenefit, onImageUpload }: Props) {
  const [featFilter, setFeatFilter] = useState<'all'|'active'|'inactive'>('all');
  const p = ep;
  const showNumeric = p.usePriceMode !== false;
  const activeCount   = editFeatures.filter(f => f.active).length;
  const inactiveCount = editFeatures.filter(f => !f.active).length;
  const visibleCount  = p.compactVisibleCount ?? 5;
  const filteredFeatures = featFilter === 'all' ? editFeatures
    : featFilter === 'active' ? editFeatures.filter(f => f.active)
    : editFeatures.filter(f => !f.active);

  return (
    <Modal open={open} onClose={onClose} className="plan-editor-modal">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-5">{title}</h2>
      <div className="flex gap-1 mb-6 border-b-2 border-gray-200 overflow-x-auto pb-px">
        {EDITOR_TABS.map(t => (
          <button key={t.key} className={`px-4 py-2.5 border-none bg-transparent text-[13px] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 whitespace-nowrap border-b-3 border-transparent -mb-px
            ${activeTab === t.key ? 'text-blue-500 border-blue-500' : 'text-gray-400 hover:text-gray-700'}`} onClick={() => onTabChange(t.key)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="editor-content">

        {/* BÁSICO */}
        {activeTab === 'basic' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl">
              <input type="hidden" value={p.id ?? ''} readOnly />
              <div className="mb-4">
                <label htmlFor="plan-id" className="block text-[13px] font-semibold text-gray-700 mb-1.5">ID del Plan</label>
                <input id="plan-id" type="text" value={p.id ?? ''} placeholder="ej: plan_pro (sin espacios)" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500"
                  onChange={e => onUpdatePlan({ id: e.target.value })} disabled={['basic','standard','premium'].includes(p.id ?? '')} />
              </div>
              <div className="mb-4">
                <label htmlFor="plan-name" className="block text-[13px] font-semibold text-gray-700 mb-1.5">Nombre del Plan *</label>
                <input id="plan-name" type="text" value={p.name ?? ''} placeholder="Ej: Plan Profesional" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500"
                  onChange={e => onUpdatePlan({ name: e.target.value })} />
              </div>
              <div className="mb-4">
                <label htmlFor="plan-badge" className="block text-[13px] font-semibold text-gray-700 mb-1.5">Badge / Etiqueta</label>
                <input id="plan-badge" type="text" value={p.badge ?? ''} placeholder="Ej: MÁS POPULAR" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500"
                  onChange={e => onUpdatePlan({ badge: e.target.value })} />
              </div>
              <div className="mb-4">
                <label htmlFor="plan-description" className="block text-[13px] font-semibold text-gray-700 mb-1.5">Descripción</label>
                <textarea id="plan-description" value={p.description ?? ''} rows={3} placeholder="Descripción breve del plan" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500 resize-y"
                  onChange={e => onUpdatePlan({ description: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* PRECIOS */}
        {activeTab === 'pricing' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-base font-bold text-gray-800 mb-4">Modo de Precio</h3>
              <div className="mb-5">
                <label className="flex items-center gap-3 cursor-pointer mb-1 p-3 bg-white border border-gray-200 rounded-lg transition-all hover:border-blue-400">
                  <input type="checkbox" checked={p.usePriceMode !== false} className="w-5 h-5 accent-blue-500 cursor-pointer"
                    onChange={e => onUpdatePlan({ usePriceMode: e.target.checked })} />
                  <span className="text-sm font-semibold text-gray-700 flex-1">Usar precio numérico</span>
                </label>
                <p className="text-xs text-gray-400 mt-2">Desactiva para usar texto personalizado (ej: "Prueba gratuita")</p>
              </div>
              {showNumeric ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="plan-currency" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Moneda</label>
                      <input id="plan-currency" type="text" value={p.currency ?? 'S/'} placeholder="S/" maxLength={10} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                        onChange={e => onUpdatePlan({ currency: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="plan-price" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Precio Mensual</label>
                      <input id="plan-price" type="number" value={p.price ?? 0} placeholder="0.00" step={0.01} min={0} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                        onChange={e => onUpdatePlan({ price: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="plan-price-annual" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Precio Anual</label>
                      <input id="plan-price-annual" type="number" value={p.priceAnnual ?? 0} placeholder="0.00" step={0.01} min={0} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                        onChange={e => onUpdatePlan({ priceAnnual: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="plan-period" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Etiqueta Mensual</label>
                      <input id="plan-period" type="text" value={p.period ?? '/mes'} placeholder="/mes" maxLength={20} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                        onChange={e => onUpdatePlan({ period: e.target.value })} />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="plan-period-annual" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Etiqueta Anual</label>
                      <input id="plan-period-annual" type="text" value={p.periodAnnual ?? '/año'} placeholder="/año" maxLength={20} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                        onChange={e => onUpdatePlan({ periodAnnual: e.target.value })} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="plan-price-text" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Texto Principal de Precio</label>
                    <input type="text" value={p.priceText ?? ''} placeholder="Ej: Prueba gratuita" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                      onChange={e => onUpdatePlan({ priceText: e.target.value })} />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="plan-price-subtext" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subtexto (opcional)</label>
                    <input id="plan-price-subtext" type="text" value={p.priceSubtext ?? ''} placeholder="Ej: 6 meses" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                      onChange={e => onUpdatePlan({ priceSubtext: e.target.value })} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* DISEÑO */}
        {activeTab === 'design' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-4">Colores del Plan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-0">
                  <label htmlFor="plan-css-color" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Principal</label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative" style={{ background: p.cssColor ?? '#3b82f6' }}>
                      <input id="plan-css-color" type="color" value={p.cssColor ?? '#3b82f6'} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => onUpdatePlan({ cssColor: e.target.value })} />
                    </div>
                    <input type="text" aria-label="Color principal en formato hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" value={p.cssColor ?? '#3b82f6'} maxLength={7}
                      onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onUpdatePlan({ cssColor: e.target.value }); }} />
                    <div className="w-8 h-8 rounded-lg" style={{ background: p.cssColor ?? '#3b82f6' }} />
                  </div>
                </div>
                <div className="mb-0">
                  <label htmlFor="plan-accent-color" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color de Acento</label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative" style={{ background: p.accentColor ?? '#2563eb' }}>
                      <input id="plan-accent-color" type="color" value={p.accentColor ?? '#2563eb'} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => onUpdatePlan({ accentColor: e.target.value })} />
                    </div>
                    <input type="text" aria-label="Color de acento en formato hex" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" value={p.accentColor ?? '#2563eb'} maxLength={7}
                      onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onUpdatePlan({ accentColor: e.target.value }); }} />
                    <div className="w-8 h-8 rounded-lg" style={{ background: p.accentColor ?? '#2563eb' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-base font-bold text-gray-800 mb-4">Imagen de Fondo</h3>
              <div>
                <input type="file" id="editPlanImageUpload" accept="image/*,.heic,.heif,.avif,.tiff,.bmp,.ico" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) onImageUpload(f); }} />
                <button className="px-5 py-2.5 border-2 border-dashed border-blue-500 bg-transparent text-blue-500 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex items-center gap-2 hover:bg-blue-50"
                  onClick={() => document.getElementById('editPlanImageUpload')?.click()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  Subir Imagen
                </button>
                <input type="text" value={p.bgImage ?? ''} placeholder="URL o ruta de la imagen" className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ bgImage: e.target.value })} />
                <div className="grid grid-cols-2 gap-3 mt-2.5">
                  <div className="flex items-center gap-2">
                    <label htmlFor="plan-bg-fit" className="text-xs font-semibold text-gray-500 whitespace-nowrap">Ajuste:</label>
                    <select id="plan-bg-fit" className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 cursor-pointer" value={p.bgImageFit ?? 'cover'} onChange={e => onUpdatePlan({ bgImageFit: e.target.value as 'cover'|'contain' })}>
                      {FIT_OPTIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="plan-bg-position" className="text-xs font-semibold text-gray-500 whitespace-nowrap">Posición:</label>
                    <select id="plan-bg-position" className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 cursor-pointer" value={p.bgImagePosition ?? 'center'} onChange={e => onUpdatePlan({ bgImagePosition: e.target.value })}>
                      {POS_OPTIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer mt-2.5">
                  <input type="checkbox" checked={!!p.showBgInCard} className="w-4 h-4 accent-blue-500 cursor-pointer"
                    onChange={e => onUpdatePlan({ showBgInCard: e.target.checked })} />
                  <span className="text-xs font-semibold text-gray-700">Mostrar imagen en tarjeta pequeña del carrusel</span>
                </label>
                {p.bgImage && (
                  <div className="mt-2.5 rounded-xl overflow-hidden h-40 bg-gray-100 relative">
                    <Image 
                      src={p.bgImage} 
                      alt="Preview" 
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      style={{ objectFit: p.bgImageFit ?? 'cover', objectPosition: p.bgImagePosition ?? 'center' }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Acepta PNG, JPG, WebP, SVG, GIF, AVIF, HEIC y más.</p>
              </div>
            </div>
          </div>
        )}

        {/* BENEFICIOS */}
        {activeTab === 'features' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-base font-bold text-gray-800 mb-2">Beneficios Compactos (Tarjeta)</h3>
              <p className="text-xs text-gray-400 mb-4">Aparecen en la tarjeta del plan. Elige cuántos mostrar antes del "Ver más".</p>
              <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-xl">
                <span className="text-xs font-semibold text-gray-600">Mostrar</span>
                <input type="number" value={visibleCount} min={1} max={20} className="w-14 px-2 py-1.5 border border-gray-200 rounded-md text-sm font-semibold text-center"
                  onChange={e => onUpdatePlan({ compactVisibleCount: parseInt(e.target.value) || 5 })} />
                <span className="text-xs font-semibold text-gray-600">antes del "Ver más"</span>
                <div className="ml-auto flex gap-1.5">
                  <button className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${featFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    onClick={() => setFeatFilter('all')}>Todos</button>
                  <button className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${featFilter === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    onClick={() => setFeatFilter('active')}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"/>Activos
                  </button>
                  <button className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${featFilter === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    onClick={() => setFeatFilter('inactive')}>
                    <span className="w-2 h-2 rounded-full bg-red-500"/>No incluidos
                  </button>
                </div>
              </div>
              <div>
                {filteredFeatures.map((f) => {
                  const realIdx = editFeatures.indexOf(f);
                  return (
                    <div key={`k-${realIdx}`} className={`flex items-center gap-2 p-2 mb-2 rounded-lg border transition-all ${f.active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 opacity-75'}`}>
                      <button type="button" className={`px-3 py-2 rounded-full text-[11.5px] font-bold cursor-pointer transition-all whitespace-nowrap min-w-[90px] text-center
                        ${f.active ? 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300' : 'bg-red-200 text-red-700 hover:bg-red-300'}`}
                        onClick={() => onUpdateFeature(realIdx, { active: !f.active })}>
                        {f.active ? '✓ Activo' : '✕ No incluido'}
                      </button>
                      <input type="text" value={f.text ?? ''} placeholder="Texto del beneficio" className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                        onChange={e => onUpdateFeature(realIdx, { text: e.target.value })} />
                      <button className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-bold hover:bg-red-600" onClick={() => onRemoveFeature(realIdx)}>×</button>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs">
                <span className="text-emerald-600 font-semibold">✓ {activeCount} activos</span>
                <span className="text-gray-300">·</span>
                <span className="text-red-600 font-semibold">✕ {inactiveCount} no incluidos</span>
                <span className="text-gray-300">·</span>
                <span className="text-blue-600 font-semibold">Mostrando {visibleCount} en "Ver más"</span>
              </div>
              <button className="mt-4 px-4 py-2 border-2 border-dashed border-blue-500 bg-transparent text-blue-500 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:bg-blue-50"
                onClick={onAddFeature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                + Agregar Beneficio
              </button>
            </div>
          </div>
        )}

{/* DETALLADOS */}
        {activeTab === 'detailed' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-base font-bold text-gray-800 mb-2">Beneficios Detallados (Modal)</h3>
              <p className="text-xs text-gray-400 mb-4">Aparecen en el modal de detalles al hacer clic en cualquier beneficio.</p>
              <div>
                {editDetailedBenefits.map((b, i) => (
                  <div key={`benefit-${b.title?.slice(0, 8) ?? i}`} className="mb-4 p-3.5 bg-white rounded-xl border-l-4" style={{ borderLeftColor: b.color ?? '#3b82f6' }}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ background:`${b.color ?? '#3b82f6'}22`, border:`1.5px solid ${b.color ?? '#3b82f6'}55` }}>
                        <input type="text" value={b.emoji ?? ''} placeholder="😀" maxLength={4} className="w-full bg-transparent text-center text-lg" title="Emoji o símbolo"
                          onChange={e => onUpdateDetailedBenefit(i, { emoji: e.target.value })} />
                      </div>
                      <input type="text" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold" value={b.title ?? ''} placeholder="Título del beneficio"
                        onChange={e => onUpdateDetailedBenefit(i, { title: e.target.value })} />
                      <div className="w-9 h-9 rounded-lg overflow-hidden relative" style={{ background: b.color ?? '#3b82f6' }}>
                        <input type="color" value={b.color ?? '#3b82f6'} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={e => onUpdateDetailedBenefit(i, { color: e.target.value })} />
                      </div>
                      <button className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600" onClick={() => onRemoveDetailedBenefit(i)}>×</button>
                    </div>
                    <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Descripción detallada del beneficio…"
                      value={b.description ?? ''} onChange={e => onUpdateDetailedBenefit(i, { description: e.target.value })} />
                  </div>
                ))}
              </div>
              <button className="mt-3 px-4 py-2 border-2 border-dashed border-blue-500 bg-transparent text-blue-500 rounded-lg text-[13px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 hover:bg-blue-50"
                onClick={onAddDetailedBenefit}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar Beneficio Detallado
              </button>
            </div>
          </div>
        )}

        {/* CONFIGURACIÓN */}
        {activeTab === 'config' && (
          <div className="block animate-fade-in">
            <div className="p-5 bg-gray-50 rounded-xl mb-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">Configuración de Pago</h3>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border border-gray-200 rounded-lg transition-all hover:border-blue-400">
                <input type="checkbox" checked={!!p.requiresPayment} className="w-5 h-5 accent-blue-500 cursor-pointer"
                  onChange={e => onUpdatePlan({ requiresPayment: e.target.checked })} />
                <span className="text-sm font-semibold text-gray-700">Requiere pago</span>
              </label>
              <p className="text-xs text-gray-400 mt-2">Desactiva para planes completamente gratuitos o de prueba</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-xl mb-5">
              <h3 className="text-base font-bold text-gray-800 mb-4">Bloqueo de Reclamación</h3>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border border-gray-200 rounded-lg transition-all hover:border-blue-400 mb-4">
                <input type="checkbox" checked={!!p.enableClaimLock} className="w-5 h-5 accent-blue-500 cursor-pointer"
                  onChange={e => onUpdatePlan({ enableClaimLock: e.target.checked })} />
                <span className="text-sm font-semibold text-gray-700">Bloquear después de reclamar (solo una vez)</span>
              </label>
              <div className="mb-3">
                <label htmlFor="plan-claimed-button-text" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Texto del Botón Bloqueado</label>
                <input id="plan-claimed-button-text" type="text" value={p.claimedButtonText ?? ''} placeholder="Este plan ya ha sido reclamo con anterioridade" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ claimedButtonText: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="plan-claimed-warning-text" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mensaje de advertencia</label>
                <input id="plan-claimed-warning-text" type="text" value={p.claimedWarningText ?? ''} placeholder="⚠ Este plan solo puede ser reclamo una única vez." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ claimedWarningText: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="plan-claim-months" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Duración del plan gratuito (meses)</label>
                <input id="plan-claim-months" type="number" value={p.claimMonths ?? 1} min={1} max={120} className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ claimMonths: parseInt(e.target.value) || 1 })} />
              </div>
</div>
            <div className="p-5 bg-gray-50 rounded-xl">
              <h3 className="text-base font-bold text-gray-800 mb-4">Textos Personalizables</h3>
              <div className="mb-3">
                <label htmlFor="plan-subscribe-button-text" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Texto del Botón de Suscripción</label>
                <input id="plan-subscribe-button-text" type="text" value={p.subscribeButtonText ?? 'Suscribirse'} placeholder="Suscribirse" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ subscribeButtonText: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="plan-trial-success-title" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Título del Modal de Éxito</label>
                <input id="plan-trial-success-title" type="text" value={p.trialSuccessTitle ?? ''} placeholder="¡Solicitud enviada!" className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
                  onChange={e => onUpdatePlan({ trialSuccessTitle: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="plan-trial-success-message" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mensaje Principal del Modal</label>
                <textarea id="plan-trial-success-message" value={p.trialSuccessMessage ?? ''} rows={2} placeholder="Prueba gratuita de 6 meses..." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm resize-y"
                  onChange={e => onUpdatePlan({ trialSuccessMessage: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="plan-trial-wait-message" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mensaje de Espera</label>
                <textarea id="plan-trial-wait-message" value={p.trialWaitMessage ?? ''} rows={2} placeholder="Espere la aceptación del administrador..." className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-lg text-sm resize-y"
                  onChange={e => onUpdatePlan({ trialWaitMessage: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-5">
          <button className="px-6 py-3 border-2 border-gray-200 bg-transparent text-gray-600 rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-gray-400 hover:text-gray-800"
            onClick={onClose}>Cancelar</button>
          <button className="px-6 py-3 border-none bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-emerald-600 hover:-translate-y-0.5"
            onClick={onSave}>Guardar Cambios</button>
        </div>
      </div>
    </Modal>
  );
}
