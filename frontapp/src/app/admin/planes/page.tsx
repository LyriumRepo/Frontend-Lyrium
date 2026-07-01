'use client';
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useAdmin } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { useSSE } from '@/features/seller/plans/hooks/useSSE';
import RequestsPanel from '@/features/admin/planes/components/RequestsPanel';
import PlansGrid from '@/features/admin/planes/components/PlansGrid';
import TimelineEditor from '@/features/admin/planes/components/TimelineEditor';
import UISettingsPanel from '@/features/admin/planes/components/UISettingsPanel';
import PaymentPanel from '@/features/admin/planes/components/PaymentPanel';
import VendedoresPanel from '@/features/admin/planes/components/VendedoresPanel';
import PlanEditorModal from '@/features/admin/planes/components/PlanEditorModal';
import Modal from '@/features/seller/plans/shared/Modal';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';

const TAB_ICONS: Record<string, React.ReactElement> = {
  requests: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
  ),
  plans: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  timeline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  uisettings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41"/>
    </svg>
  ),
  payment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  vendedores: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

const TABS = [
  { key: 'requests',   label: 'Solicitudes' },
  { key: 'plans',      label: 'Planes' },
  { key: 'timeline',   label: 'Iconos' },
  { key: 'uisettings', label: 'Apariencia' },
  { key: 'payment',    label: 'Pagos' },
  { key: 'vendedores', label: 'Vendedores' },
] as const;

const SLOW_TABS = new Set(['vendedores', 'payment']);

export default function AdminPage() {
  const admin = useAdmin();
  const { state, update, setModal } = admin;
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  useEffect(() => {
    admin.initialize();
  }, []);

  // SSE — solo conectar cuando el panel ya está cargado
  const sse = useSSE('admin', '', {
    solicitudes_actualizadas: admin.handleSolicitudesActualizadas,
    planes_actualizados:      admin.handlePlanesActualizados,
    colores_actualizados:     admin.handleColoresActualizados,
    pago_confirmado:          admin.handlePagoConfirmadoAdmin as never,
    pago_fallido:             admin.handlePagoFallidoAdmin,
  }, state.isLoaded);

  // Stream dedicado de solicitudes de plan — emite `new_plan_request` cuando un
  // vendedor inicia una sesión de pago, actualizando la pestaña Solicitudes en tiempo real.
  const planStreamRef = useRef<EventSource | null>(null);
  useEffect(() => {
    if (!state.isLoaded) return;
    const API = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    const es = new EventSource(`${API}/admin/plan-requests/stream`, { withCredentials: true });
    planStreamRef.current = es;
    es.addEventListener('new_plan_request', () => {
      admin.handleSolicitudesActualizadas();
    });
    es.onerror = () => {
      es.close();
      planStreamRef.current = null;
    };
    return () => {
      es.close();
      planStreamRef.current = null;
    };
  }, [state.isLoaded]);

  const handleSwitchTab = useCallback(async (tab: string) => {
    if (SLOW_TABS.has(tab)) {
      sse.disconnect();
      await new Promise(r => setTimeout(r, 400));
    }
    if (tab === 'requests') {
      sse.connect();
    }
    await admin.switchTab(tab as never);
  }, [admin, sse]);

  const s = state;

  const pendingCount = useMemo(
    () => s.requests.filter(r => r.status === 'pending').length,
    [s.requests]
  );

  const activePlansCount = useMemo(
    () => Object.values(s.plansData).filter(p => p.isActive !== false).length,
    [s.plansData]
  );

  const totalRecaudado = useMemo(
    () => s.paymentTotals.total_monto,
    [s.paymentTotals]
  );

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">

      {/* ── Module header ─────────────────────── */}
      <ModuleHeader
        title="Planes y Suscripciones"
        subtitle="Gestiona planes, procesa solicitudes y monitorea pagos"
        icon="CreditCard"
        actions={s.isLoaded && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0">
            {pendingCount > 0 && (
              <button
                onClick={() => handleSwitchTab('requests')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </span>
              </button>
            )}
            <button
              onClick={() => handleSwitchTab('plans')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-emerald-900/20 border border-sky-200 dark:border-emerald-800 cursor-pointer hover:bg-sky-100 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-sky-400 dark:from-emerald-600 dark:to-teal-500 text-white text-[10px] font-black shadow-sm shadow-sky-500/30 dark:shadow-emerald-900/40">
                {activePlansCount}
              </span>
              <span className="text-xs font-bold text-sky-700 dark:text-emerald-400">
                plan{activePlansCount !== 1 ? 'es' : ''} activo{activePlansCount !== 1 ? 's' : ''}
              </span>
            </button>
          </div>
        )}
      />

      <div className="max-w-7xl mx-auto px-5 pt-0 pb-0 relative">
          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(t => {
              const isActive = s.activeTab === t.key;
              const hasBadge = t.key === 'requests' && pendingCount > 0;
              return (
                <button
                  key={t.key}
                  onClick={() => handleSwitchTab(t.key)}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 text-sm font-semibold
                    whitespace-nowrap cursor-pointer transition-all duration-150
                    border-b-2 rounded-t-lg
                    ${isActive
                      ? 'border-[var(--brand-teal)] text-[var(--brand-teal)] bg-[var(--brand-teal)]/5'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }
                  `}
                >
                  <span className={isActive ? 'text-[var(--brand-teal)]' : 'opacity-60'}>
                    {TAB_ICONS[t.key]}
                  </span>
                  {t.label}
                  {hasBadge && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-white text-[10px] font-black leading-none">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
      </div>

      {/* ── Contenido ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 py-6">

        {s.activeTab === 'requests' && (
          <div className="animate-fade-in">
            <RequestsPanel
              requests={s.requests}
              plansData={s.plansData}
              filter={s.requestFilter}
              onFilterChange={f => update({ requestFilter: f as never })}
              notifs={s.paymentNotifs}
              onDismissNotif={admin.dismissNotif}
              onApprove={admin.handleApproveRequest}
              onReject={(id: number) => { setRejectTargetId(id); setRejectModalOpen(true); }}
              approvingId={s.approvingRequestId}
              rejectingId={s.rejectingRequestId}
            />
          </div>
        )}

        {s.activeTab === 'plans' && (
          <div className="animate-fade-in">
            <PlansGrid
              plansData={s.plansData}
              statusFilter={s.planStatusFilter}
              onEdit={admin.openPlanEditor}
              onNew={() => admin.openPlanEditor('new')}
              onToggleActive={admin.togglePlanActive}
              onDelete={admin.openDeleteConfirm}
              onRestore={admin.openRestoreConfirm}
              onFilterChange={f => update({ planStatusFilter: f as never })}
            />
          </div>
        )}

        {s.activeTab === 'timeline' && (
          <div className="animate-fade-in">
            <TimelineEditor
              plansData={s.plansData}
              onSelectIcon={admin.selectTimelineIcon}
            />
          </div>
        )}

        {s.activeTab === 'uisettings' && (
          <div className="animate-fade-in">
            <UISettingsPanel
              colors={s.buttonColors}
              onChange={admin.updateBtnColor}
              onSave={admin.saveBtnColors}
              onReset={admin.resetBtnColors}
            />
          </div>
        )}

        {s.activeTab === 'payment' && (
          <div className="animate-fade-in">
            <PaymentPanel
              vendedorPagos={s.vendedorPagos}
              totales={s.paymentTotals}
              filter={s.paymentFilter}
              onFilterChange={f => admin.loadPaymentHistory(f as never)}
            />
          </div>
        )}

        {s.activeTab === 'vendedores' && (
          <div className="animate-fade-in" id="vendedoresPanel">
            <VendedoresPanel
              vendedores={s.vendedores}
              loading={s.vendedoresLoading}
              filter={s.vendedorFilter}
              search={s.vendedorSearch}
              selectedVendedor={s.selectedVendedor}
              modalOpen={s.modals.vendedorHistorial}
              onFilterChange={f => update({ vendedorFilter: f as never })}
              onSearchChange={q => update({ vendedorSearch: q })}
              onOpenModal={admin.openVendedorModal}
              onCloseModal={() => setModal('vendedorHistorial', false)}
            />
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────── */}
      <PlanEditorModal
        open={s.editorOpen}
        title={s.editorTitle}
        activeTab={s.editorTab}
        editingPlan={s.editingPlan}
        editFeatures={s.editFeatures}
        editDetailedBenefits={s.editDetailedBenefits}
        onClose={admin.closePlanEditor}
        onSave={admin.savePlan}
        onTabChange={admin.setEditorTab}
        onUpdatePlan={admin.updateEditingPlan}
        onAddFeature={admin.addFeature}
        onUpdateFeature={admin.updateFeature}
        onRemoveFeature={admin.removeFeature}
        onAddDetailedBenefit={admin.addDetailedBenefit}
        onUpdateDetailedBenefit={admin.updateDetailedBenefit}
        onRemoveDetailedBenefit={admin.removeDetailedBenefit}
        onImageUpload={admin.handleImageUpload}
      />

      <Modal open={s.modals.deleteConfirm} onClose={() => setModal('deleteConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-[var(--bg-danger)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">¿Eliminar plan?</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Esta acción no se puede deshacer. El plan será eliminado permanentemente.</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
            onClick={() => setModal('deleteConfirm', false)}>Cancelar</button>
          <button className="flex-1 px-6 py-3 border-none bg-[var(--color-error)] text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:opacity-90"
            onClick={admin.confirmDelete}>Sí, eliminar</button>
        </div>
      </Modal>

      <Modal open={s.modals.restoreConfirm} onClose={() => setModal('restoreConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">¿Restaurar plan?</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{s.restoreConfirmText || 'El plan volverá a su configuración original. Los cambios se perderán.'}</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
            onClick={() => setModal('restoreConfirm', false)}>Cancelar</button>
          <button className="flex-1 px-6 py-3 border-none bg-amber-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-amber-600"
            onClick={admin.confirmRestore}>Sí, restaurar</button>
        </div>
      </Modal>

      <Modal open={s.modals.deactivateConfirm} onClose={() => setModal('deactivateConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">¿Desactivar plan?</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">El plan dejará de ser visible para los usuarios. Podrás reactivarlo cuando quieras.</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
            onClick={() => setModal('deactivateConfirm', false)}>No, mantener</button>
          <button className="flex-1 px-6 py-3 border-none bg-amber-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-amber-600"
            onClick={admin.confirmDeactivate}>Sí, desactivar</button>
        </div>
      </Modal>

      <Modal open={s.modals.imageError} onClose={() => setModal('imageError', false)} className="max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-[var(--bg-danger)] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">Error al cargar imagen</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-2">{s.imageErrorMsg}</p>
        <p className="text-xs text-[var(--text-secondary)] mb-6">{s.imageErrorSuggestion}</p>
        <div className="flex justify-center">
          <button className="px-6 py-3 border-none bg-[var(--brand-teal)] text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5"
            onClick={() => setModal('imageError', false)}>Intentar de nuevo</button>
        </div>
      </Modal>

      {/* ── Modal de rechazo de solicitud ─────────── */}
      <Modal
        open={rejectModalOpen}
        onClose={() => { setRejectModalOpen(false); setRejectNotes(''); }}
        className="max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">Rechazar solicitud</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">El vendedor recibirá el motivo del rechazo</p>
          </div>
        </div>

        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
          Motivo del rechazo <span className="text-[var(--color-error)]">*</span>
        </label>
        <textarea
          value={rejectNotes}
          onChange={e => setRejectNotes(e.target.value)}
          placeholder="Describe el motivo del rechazo (mínimo 10 caracteres)..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--color-error)] transition-colors placeholder:text-[var(--text-secondary)]"
        />
        <p className="text-[11px] text-[var(--text-secondary)] mt-1 mb-5">
          {rejectNotes.length < 10 ? `Faltan ${10 - rejectNotes.length} caracteres mínimos` : `${rejectNotes.length} caracteres`}
        </p>

        <div className="flex gap-3">
          <button
            className="flex-1 px-5 py-2.5 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-bold cursor-pointer hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all"
            onClick={() => { setRejectModalOpen(false); setRejectNotes(''); }}
          >
            Cancelar
          </button>
          <button
            disabled={rejectNotes.trim().length < 10 || s.rejectingRequestId === rejectTargetId}
            className="flex-1 px-5 py-2.5 border-none bg-[var(--color-error)] text-white rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            onClick={async () => {
              if (!rejectTargetId || rejectNotes.trim().length < 10) return;
              setRejectModalOpen(false);
              setRejectNotes('');
              await admin.handleRejectRequest(rejectTargetId, rejectNotes.trim());
            }}
          >
            {s.rejectingRequestId === rejectTargetId ? 'Rechazando...' : 'Confirmar rechazo'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
