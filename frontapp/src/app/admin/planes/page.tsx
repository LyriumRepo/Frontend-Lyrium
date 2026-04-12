'use client';
import { useEffect } from 'react';
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

const TABS = [
  { key:'requests',   label:'Solicitudes',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
  { key:'plans',      label:'Gestión de Planes',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
  { key:'timeline',   label:'Iconos de Planes',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { key:'uisettings', label:'Apariencia',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41"/></svg> },
  { key:'payment',    label:'Pagos',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key:'vendedores', label:'Vendedores',
    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
];

export default function AdminPage() {
  const admin = useAdmin();
  const { state, update, setModal } = admin;

  useEffect(() => {
    admin.initialize();
  }, []);

  // SSE — solo conectar cuando el panel ya está cargado
  useSSE('admin', '', {
    solicitudes_actualizadas: admin.handleSolicitudesActualizadas,
    planes_actualizados:      admin.handlePlanesActualizados,
    colores_actualizados:     admin.handleColoresActualizados,
    pago_confirmado:          admin.handlePagoConfirmadoAdmin as never,
    pago_fallido:             admin.handlePagoFallidoAdmin,
  }, state.isLoaded);

  const s = state;

  return (
    <div className="max-w-7xl mx-auto p-5">
      {/* Pestañas */}
      <div className="flex gap-2.5 mb-6 overflow-y-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.key} className={`px-5 py-3 border-2 border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-500 cursor-pointer transition-all duration-300 flex items-center gap-2
            ${s.activeTab === t.key ? 'bg-white text-black border-black' : 'hover:border-gray-400 hover:text-gray-700'}`}
            onClick={() => admin.switchTab(t.key as never)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {s.activeTab === 'requests' && (
        <div className="block animate-fade-in">
          <RequestsPanel 
            requests={s.requests} 
            plansData={s.plansData} 
            filter={s.requestFilter} 
            onFilterChange={f => update({ requestFilter: f as never })} 
            notifs={s.paymentNotifs} 
            onDismissNotif={admin.dismissNotif}
            onApprove={admin.handleApproveRequest}
            onReject={admin.handleRejectRequest}
            approvingId={s.approvingRequestId}
            rejectingId={s.rejectingRequestId}
          />
        </div>
      )}
      {s.activeTab === 'plans' && (
        <div className="block animate-fade-in">
          <PlansGrid plansData={s.plansData} statusFilter={s.planStatusFilter} onEdit={admin.openPlanEditor} onNew={() => admin.openPlanEditor('new')} onToggleActive={admin.togglePlanActive} onDelete={admin.openDeleteConfirm} onRestore={admin.openRestoreConfirm} onFilterChange={f => update({ planStatusFilter: f as never })} />
        </div>
      )}
      {s.activeTab === 'timeline' && (
        <div className="block animate-fade-in">
          <TimelineEditor plansData={s.plansData} onSelectIcon={admin.selectTimelineIcon} />
        </div>
      )}
      {s.activeTab === 'uisettings' && (
        <div className="block animate-fade-in">
          <UISettingsPanel colors={s.buttonColors} onChange={admin.updateBtnColor} onSave={admin.saveBtnColors} onReset={admin.resetBtnColors} />
        </div>
      )}
      {s.activeTab === 'payment' && (
        <div className="block animate-fade-in">
          <PaymentPanel vendedorPagos={s.vendedorPagos} totales={s.paymentTotals} filter={s.paymentFilter} onFilterChange={f => admin.loadPaymentHistory(f as never)} />
        </div>
      )}
      {s.activeTab === 'vendedores' && (
        <div className="block animate-fade-in" id="vendedoresPanel">
          <VendedoresPanel vendedores={s.vendedores} loading={s.vendedoresLoading} filter={s.vendedorFilter} search={s.vendedorSearch} selectedVendedor={s.selectedVendedor} modalOpen={s.modals.vendedorHistorial} onFilterChange={f => update({ vendedorFilter: f as never })} onSearchChange={q => update({ vendedorSearch: q })} onOpenModal={admin.openVendedorModal} onCloseModal={() => setModal('vendedorHistorial', false)} />
        </div>
      )}

      {/* Editor de planes */}
      <PlanEditorModal open={s.editorOpen} title={s.editorTitle} activeTab={s.editorTab} editingPlan={s.editingPlan} editFeatures={s.editFeatures} editDetailedBenefits={s.editDetailedBenefits} onClose={admin.closePlanEditor} onSave={admin.savePlan} onTabChange={admin.setEditorTab} onUpdatePlan={admin.updateEditingPlan} onAddFeature={admin.addFeature} onUpdateFeature={admin.updateFeature} onRemoveFeature={admin.removeFeature} onAddDetailedBenefit={admin.addDetailedBenefit} onUpdateDetailedBenefit={admin.updateDetailedBenefit} onRemoveDetailedBenefit={admin.removeDetailedBenefit} onImageUpload={admin.handleImageUpload} />

{/* Modal eliminar */}
      <Modal open={s.modals.deleteConfirm} onClose={() => setModal('deleteConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-3">¿Eliminar plan?</h2>
        <p className="text-sm text-gray-400 mb-6">Esta acción no se puede deshacer. El plan será eliminado permanentemente.</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border-2 border-gray-200 bg-transparent text-gray-600 rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-gray-400 hover:text-gray-800"
            onClick={() => setModal('deleteConfirm', false)}>Cancelar</button>
          <button className="flex-1 px-6 py-3 border-none bg-red-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-red-600"
            onClick={admin.confirmDelete}>Sí, eliminar</button>
        </div>
      </Modal>

      {/* Modal restaurar */}
      <Modal open={s.modals.restoreConfirm} onClose={() => setModal('restoreConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5420b" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-3">¿Restaurar plan?</h2>
        <p className="text-sm text-gray-400 mb-6">{s.restoreConfirmText || 'El plan volverá a su configuración original. Los cambios se perderán.'}</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border-2 border-gray-200 bg-transparent text-gray-600 rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-gray-400 hover:text-gray-800"
            onClick={() => setModal('restoreConfirm', false)}>Cancelar</button>
          <button className="flex-1 px-6 py-3 border-none bg-orange-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-orange-600"
            onClick={admin.confirmRestore}>Sí, restaurar</button>
        </div>
      </Modal>

      {/* Modal desactivar */}
      <Modal open={s.modals.deactivateConfirm} onClose={() => setModal('deactivateConfirm', false)} className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-3">¿Desactivar plan?</h2>
        <p className="text-sm text-gray-400 mb-6">El plan dejará de ser visible para los usuarios. Podrás reactivarlo cuando quieras.</p>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 border-2 border-gray-200 bg-transparent text-gray-600 rounded-xl text-sm font-bold cursor-pointer transition-all hover:border-gray-400 hover:text-gray-800"
            onClick={() => setModal('deactivateConfirm', false)}>No, mantener</button>
          <button className="flex-1 px-6 py-3 border-none bg-amber-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-amber-600"
            onClick={admin.confirmDeactivate}>Sí, desactivar</button>
        </div>
      </Modal>

      {/* Modal error imagen */}
      <Modal open={s.modals.imageError} onClose={() => setModal('imageError', false)} className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-3">Error al cargar imagen</h2>
        <p className="text-sm text-gray-400 mb-2">{s.imageErrorMsg}</p>
        <p className="text-xs text-gray-400 mb-6">{s.imageErrorSuggestion}</p>
        <div className="flex justify-center">
          <button className="px-6 py-3 border-none bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:bg-emerald-600 hover:-translate-y-0.5"
            onClick={() => setModal('imageError', false)}>Intentar de nuevo</button>
        </div>
      </Modal>
    </div>
  );
}
