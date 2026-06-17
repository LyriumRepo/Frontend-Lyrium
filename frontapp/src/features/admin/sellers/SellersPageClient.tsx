'use client';

import React, { useState, useMemo } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { useControlVendedores } from '@/features/admin/sellers/hooks/useControlVendedores';
import {
  StatsOverview,
  ProductModeration,
  AuditLog,
} from '@/components/admin/sellers/ModuleSections';
import SellerList from '@/components/admin/SellerList';
import {
  Users,
  Search,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  X,
  FileCheck,
} from 'lucide-react';
import { SellerStatus, ProductStatus } from '@/features/admin/sellers/types';
import Skeleton, { SkeletonRow } from '@/components/ui/Skeleton';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import ProductModerationModal from '@/components/admin/sellers/ProductModerationModal';
import { useContratos } from '@/features/admin/contracts/hooks/useContratos';
import { ContratosModule } from '@/components/admin/contracts/ContractsModule';
import { ContractDetailModal } from '@/components/admin/contracts/ContractDetailModal';
import { exportToCSV } from '@/shared/lib/utils/export';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const TabButton = ({ active, onClick, label, icon, badge }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 rounded-2xl text-[11px] font-black transition-all flex items-center gap-3 relative border ${
      active
        ? 'bg-[var(--bg-card)] shadow-xl shadow-black/5 text-cyan-500 border-[var(--border-subtle)]'
        : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-secondary)]'
    }`}
  >
    {icon}
    <span className="uppercase tracking-widest">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 px-2.5 py-1 bg-rose-500 text-white rounded-full text-[9px] font-black animate-bounce shadow-lg shadow-rose-500/20">
        {badge}
      </span>
    )}
  </button>
);

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'seller' | 'product';
  onSubmit: (data: { status: string; reason: string }) => void | Promise<void>;
  isSubmitting: boolean;
  suggested?: string;
  sellerContractStatus?: string;
}

const ManagementModal = ({
  isOpen,
  onClose,
  title,
  type,
  onSubmit,
  isSubmitting,
  suggested,
  sellerContractStatus,
}: ManagementModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalsPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          role="button"
          tabIndex={0}
          className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
        />

        <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-10 animate-scaleUp border border-[var(--border-subtle)] font-industrial">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className={`h-2 w-full absolute top-0 left-0 ${type === 'seller' ? 'bg-rose-500' : 'bg-cyan-500'}`}
          />

          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2 rounded-lg ${type === 'seller' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'}`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase">
              {title}
            </h3>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-8 font-medium leading-relaxed">
            {type === 'seller'
              ? 'La suspensión o baja de una cuenta es una acción crítica que afecta la recaudación y visibilidad del vendedor. Requiere trazabilidad absoluta.'
              : 'Asegúrese de que el producto cumpla con las políticas de calidad y descripción antes de habilitar su venta pública.'}
          </p>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmit({
                status: fd.get('status') as string,
                reason: fd.get('reason') as string,
              });
            }}
          >
            <div>
              <label
                htmlFor="seller-status"
                className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-2"
              >
                Nuevo Estado Transaccional
              </label>
              <div className="relative">
                <select
                  id="seller-status"
                  name="status"
                  defaultValue={suggested}
                  required
                  className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl font-black text-[var(--text-primary)] focus:ring-4 focus:ring-cyan-500/10 appearance-none transition-all"
                >
                  {type === 'seller' ? (
                    <>
                      <option
                        value="ACTIVE"
                        disabled={sellerContractStatus !== 'VIGENTE'}
                      >
                        ACTIVA - Operación Normal{' '}
                        {sellerContractStatus !== 'VIGENTE'
                          ? '(BLOQUEADO)'
                          : ''}
                      </option>
                      <option value="SUSPENDED">
                        SUSPENDIDA - Bloqueo Temporal
                      </option>
                      <option value="REJECTED">BAJA LÓGICA - Cese Total</option>
                    </>
                  ) : (
                    <>
                      <option value="APPROVED">
                        APROBADO - Publicación Inmediata
                      </option>
                      <option value="REJECTED">
                        RECHAZADO - Violación de Políticas
                      </option>
                    </>
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                  <Sliders className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="seller-reason"
                className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-2"
              >
                Justificación de Auditoría (RF-02) *
              </label>
              <textarea
                id="seller-reason"
                name="reason"
                rows={4}
                required
                minLength={10}
                placeholder="Detalle los motivos técnicos..."
                className="w-full p-5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-3xl font-medium text-[var(--text-primary)] focus:ring-4 focus:ring-cyan-500/10 focus:bg-[var(--bg-card)] transition-all resize-none text-[11px] placeholder:text-[var(--text-secondary)]"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <BaseButton
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="flex-1"
              >
                {isSubmitting ? 'Sincronizando...' : 'Confirmar Cambio'}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </ModalsPortal>
  );
};

interface SellersPageClientProps {}

export function SellersPageClient(_props: SellersPageClientProps) {
  const {
    loading,
    error,
    currentTab,
    setCurrentTab,
    stats,
    statsData,
    filteredSellers,
    filters,
    actions,
    setFilters,
    productsLoading,
    products,
    profileRequests,
    profileRequestsLoading,
    profileRequestsError,
    pendingProfileRequestsCount,
  } = useControlVendedores();

  const { state: contractsState, actions: contractsActions } = useContratos();

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'seller' | 'product';
    id: number;
    title: string;
    suggested?: string;
  }>({ isOpen: false, type: 'seller', id: 0, title: '' });

  const [productModal, setProductModal] = useState<{
    isOpen: boolean;
    productId: number | null;
    rejectionReason?: string | null;
  }>({ isOpen: false, productId: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const combinedSellers = filteredSellers;

  const handleExport = () => {
    if (!filteredSellers.length) return;
    const headers = ['ID', 'Nombre', 'Empresa', 'Email', 'Estado', 'Contratos'];
    const csvData = filteredSellers.map((s) => [
      s.id,
      s.name,
      s.company,
      s.email,
      s.status,
      s.contractStatus,
    ]);
    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(headers, csvData, `padron-vendedores-${dateStr}.csv`);
  };

  const handleStatusSubmit = async ({
    status,
    reason,
  }: {
    status: string;
    reason: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (statusModal.type === 'seller') {
        const seller = combinedSellers.find((s: any) => s.id === statusModal.id);
        if (status === 'ACTIVE' && seller?.contractStatus !== 'VIGENTE') {
          alert(
            'BLOQUEO TÉCNICO: No se puede activar una cuenta sin un contrato VIGENTE (RF-16).',
          );
          return;
        }
        await actions.updateSellerStatus(
          statusModal.id,
          status as SellerStatus,
          reason,
        );
      } else {
        await actions.updateProductStatus(
          statusModal.id,
          status as ProductStatus,
          reason,
        );
      }
      setStatusModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
        <ModuleHeader
          title="Control de Vendedores"
          subtitle="Cargando Inteligencia Operativa..."
          icon="Users"
        />

        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm">
          <SkeletonRow count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Control de Vendedores"
        subtitle="Gestión y supervisión estratégica de vendedores"
        icon="Users"
      />

      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-500 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] py-5 pb-6 overflow-x-auto no-scrollbar scroll-smooth">
        <TabButton
          active={currentTab === 'vendedores'}
          onClick={() => setCurrentTab('vendedores')}
          label="Gestión de Vendedores"
          icon={<Users className="w-5 h-5" />}
          badge={stats.pending}
        />
        <TabButton
          active={currentTab === 'aprobacion'}
          onClick={() => setCurrentTab('aprobacion')}
          label="Aprobación de Productos"
          icon={<CheckCircle className="w-5 h-5" />}
          badge={stats.pendingProducts}
        />
        <TabButton
          active={currentTab === 'auditoria'}
          onClick={() => setCurrentTab('auditoria')}
          label="Historial de Auditoría"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <TabButton
          active={currentTab === 'validacion'}
          onClick={() => setCurrentTab('validacion')}
          label="Validación de Datos"
          icon={<FileCheck className="w-5 h-5" />}
          badge={
            pendingProfileRequestsCount > 0
              ? pendingProfileRequestsCount
              : undefined
          }
        />
        <TabButton
          active={currentTab === 'contratos'}
          onClick={() => setCurrentTab('contratos' as any)}
          label="Contratos"
          icon={<FileCheck className="w-5 h-5" />}
        />
      </div>

      <div className="min-h-[500px]">

        {currentTab === 'vendedores' && (
          <div className="space-y-6 animate-fadeIn">
            <StatsOverview stats={{ ...stats, pending: stats.pending }} />
            <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por Nombre, Empresa o ID..."
                  value={filters.sellerSearch}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sellerSearch: e.target.value }))
                  }
                  className="w-full h-12 pl-14 pr-5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-sm font-semibold placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                />
              </div>
              <BaseButton onClick={handleExport} variant="secondary" leftIcon="Download" size="md" className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-sm">
                Exportar Padrón
              </BaseButton>
            </div>
            <SellerList sellers={filteredSellers} loading={loading} />
          </div>
        )}

        {currentTab === 'aprobacion' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                Control de Acciones Críticas
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                RF-03: Validación de productos nuevos y editados
              </p>
            </div>
            <ProductModeration
              products={products}
              isLoading={productsLoading}
              onAction={(product: any) =>
                setProductModal({
                  isOpen: true,
                  productId: product.id,
                  rejectionReason: product.rejectionReason || product.rejection_reason || null,
                })
              }
            />
          </div>
        )}

        {currentTab === 'auditoria' && (
          <div className="animate-fadeIn">
            <AuditLog entries={[]} />
          </div>
        )}

        {currentTab === 'validacion' && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                Validación de Datos de Vendedores
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                Aprobación de RUC, datos bancarios y representante legal
              </p>
            </div>

            {profileRequestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
              </div>
            ) : profileRequestsError ? (
              <div className="bg-red-50 p-6 rounded-2xl text-center">
                <p className="text-red-600">
                  Error al cargar solicitudes: {String(profileRequestsError)}
                </p>
                <button
                  type="button"
                  onClick={() => actions.refetchProfileRequests?.()}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl"
                >
                  Reintentar
                </button>
              </div>
            ) : profileRequests.length === 0 ? (
              <div className="bg-[var(--bg-card)] p-12 rounded-[2.5rem] border border-[var(--border-subtle)] text-center">
                <FileCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">
                  No hay solicitudes de validación pendientes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {profileRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-[var(--text-primary)]">
                          {request.store_name || `Tienda #${request.store_id}`}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {request.seller_name ||
                            request.seller_email ||
                            `ID: ${request.store_id}`}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {request.seller_email}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Solicitud #{request.id} •{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                            Pendiente
                          </span>
                        )}
                        {request.status === 'approved' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Aprobado
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            Rechazado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-2xl">
                      <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
                        Datos solicitados:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {request.data?.ruc ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              RUC:
                            </span>{' '}
                            <span className="font-mono">
                              {request.data.ruc}
                            </span>
                          </div>
                        ) : null}
                        {request.data?.razon_social ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              Razón Social:
                            </span>{' '}
                            {request.data.razon_social}
                          </div>
                        ) : null}
                        {request.data?.rep_legal_nombre ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              Rep. Legal:
                            </span>{' '}
                            {request.data.rep_legal_nombre}
                          </div>
                        ) : null}
                        {request.data?.rep_legal_dni ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              DNI Rep.:
                            </span>{' '}
                            {request.data.rep_legal_dni}
                          </div>
                        ) : null}
                        {request.data?.cuenta_bcp ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              Cuenta BCP:
                            </span>{' '}
                            <span className="font-mono">
                              {request.data.cuenta_bcp}
                            </span>
                          </div>
                        ) : null}
                        {request.data?.cci ? (
                          <div>
                            <span className="text-[var(--text-secondary)]">
                              CCI:
                            </span>{' '}
                            <span className="font-mono">
                              {request.data.cci}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {request.admin_notes && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                        <h4 className="text-xs font-bold text-red-600 uppercase mb-1">
                          Notas del admin:
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {request.admin_notes}
                        </p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            actions.approveProfileRequest(request.id)
                          }
                          className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Ingrese motivo del rechazo:');
                            if (notes)
                              actions.rejectProfileRequest(request.id, notes);
                          }}
                          className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'contratos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                  Control de Contratación y Organización
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                  Sistema de Contratos y Gestión Documental del Administrador (RF-16)
                </p>
              </div>
              <BaseButton 
                onClick={contractsActions.openTemplates} 
                variant="secondary" 
                leftIcon="FolderOpen" 
                size="md"
                className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white border-0 shadow-lg shadow-sky-500/25 dark:shadow-none transition-all duration-300"
              >
                Plantillas Legales
              </BaseButton>
            </div>
            <ContratosModule state={contractsState} actions={contractsActions} />
          </div>
        )}
      </div>

      <ManagementModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        type={statusModal.type}
        suggested={statusModal.suggested}
        isSubmitting={isSubmitting}
        sellerContractStatus={
          combinedSellers.find((s: any) => s.id === statusModal.id)?.contractStatus
        }
        onSubmit={handleStatusSubmit}
      />

      <ProductModerationModal
        isOpen={productModal.isOpen}
        productId={productModal.productId}
        rejectionReason={productModal.rejectionReason}
        isSubmitting={isSubmitting}
        onClose={() => setProductModal({ isOpen: false, productId: null })}
        onAction={async (productId, action, reason) => {
          setIsSubmitting(true);
          try {
            await actions.updateProductStatus(productId, action, reason);
            setProductModal({ isOpen: false, productId: null });
          } catch (err) {
            console.error('Error al moderar producto:', err);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {contractsState.selectedContract && (
        <ModalsPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              role="button"
              tabIndex={0}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md" 
              onClick={() => contractsActions.setSelectedContract(null)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') contractsActions.setSelectedContract(null);
              }}
            />
            <div className="relative z-10">
              <ContractDetailModal 
                contract={contractsState.selectedContract} 
                onClose={() => contractsActions.setSelectedContract(null)}
                onValidate={contractsActions.validateContract}
                onInvalidate={contractsActions.invalidateContract}
                onUpdateStatus={contractsActions.updateContractStatus}
              />
            </div>
          </div>
        </ModalsPortal>
      )}


    </div>
  );
}