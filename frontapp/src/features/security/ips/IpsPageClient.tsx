'use client';

import React, { useState } from 'react';
import { Shield, ShieldOff, ShieldCheck, Search, Plus, Trash2, AlertTriangle } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import BaseButton from '@/components/ui/BaseButton';
import BaseModal from '@/components/ui/BaseModal';
import Pagination from '@/components/ui/Pagination';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import type { Column } from '@/components/ui/DataTable';
import { useBlockedIps } from '@/features/admin/security/hooks/useBlockedIps';
import type { BlockedIpItem, BlockedIpStatus } from '@/shared/lib/api/ipRepository';

const IP_STATUS_MAPPINGS = [
  { status: 'blocked', label: 'Bloqueado', class: 'bg-red-50 text-red-600 border-red-100', icon: 'ShieldOff' },
  { status: 'unblocked', label: 'Desbloqueado', class: 'bg-gray-50 text-gray-600 border-gray-100', icon: 'CheckCircle' },
  { status: 'flagged', label: 'Sospechosa', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'AlertTriangle' },
  { status: 'whitelisted', label: 'Lista Blanca', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'ShieldCheck' },
];

export default function IpsPageClient() {
  const {
    ips,
    pagination,
    loading,
    error,
    filters,
    setFilter,
    search,
    setSearch,
    goToPage,
    refetch,
    createIp,
    blockIp,
    unblockIp,
    whitelistIp,
    deleteIp,
    isMutating,
  } = useBlockedIps();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{
    type: 'block' | 'unblock' | 'whitelist' | 'delete';
    ip: BlockedIpItem;
  } | null>(null);

  const columns: Column<BlockedIpItem>[] = [
    {
      key: 'ip_address',
      header: 'Dirección IP',
      render: (item) => (
        <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
          {item.ip_address}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => (
        <BaseStatusBadge
          status={item.status}
          mappings={IP_STATUS_MAPPINGS}
          size="sm"
        />
      ),
    },
    {
      key: 'reason',
      header: 'Motivo',
      render: (item) => (
        <span className="text-xs text-[var(--text-secondary)] max-w-[200px] truncate block">
          {item.reason || '—'}
        </span>
      ),
    },
    {
      key: 'blocked_at',
      header: 'Bloqueado',
      render: (item) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {item.blocked_at ? new Date(item.blocked_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'expires_at',
      header: 'Expira',
      render: (item) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'blocker',
      header: 'Bloqueado por',
      render: (item) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {item.blocker?.name || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === 'blocked' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowActionModal({ type: 'unblock', ip: item }); }}
              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
              title="Desbloquear IP"
            >
              <ShieldOff className="w-4 h-4" />
            </button>
          )}
          {item.status !== 'blocked' && item.status !== 'whitelisted' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowActionModal({ type: 'block', ip: item }); }}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
              title="Bloquear IP"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}
          {item.status !== 'whitelisted' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowActionModal({ type: 'whitelist', ip: item }); }}
              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
              title="Añadir a lista blanca"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowActionModal({ type: 'delete', ip: item }); }}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    await createIp({
      ip_address: data.get('ip_address') as string,
      reason: data.get('reason') as string,
      status: (data.get('status') as BlockedIpStatus) || 'blocked',
      expires_at: (data.get('expires_at') as string) || null,
    });
    form.reset();
    setShowCreateModal(false);
  };

  const handleQuickAction = async () => {
    if (!showActionModal) return;
    const { type, ip } = showActionModal;
    try {
      switch (type) {
        case 'unblock':
          await unblockIp(ip.id);
          break;
        case 'block':
          await blockIp(ip.id, 'Bloqueado desde el panel de IPs');
          break;
        case 'whitelist':
          await whitelistIp(ip.id, 'Añadido a lista blanca desde el panel de IPs');
          break;
        case 'delete':
          await deleteIp(ip.id);
          break;
      }
    } finally {
      setShowActionModal(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-cyan-500" />
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Gestión de IPs
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
                  {pagination ? `${pagination.total} IPs registradas` : 'Cargando...'}
                </p>
              </div>
            </div>
            <BaseButton
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              leftIcon="Plus"
              size="sm"
            >
              Nueva IP
            </BaseButton>
          </div>
        </div>

        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/20">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar IP..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilter('status', e.target.value || undefined)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Todos los estados</option>
              <option value="blocked">Bloqueado</option>
              <option value="whitelisted">Lista Blanca</option>
              <option value="flagged">Sospechosa</option>
              <option value="unblocked">Desbloqueado</option>
            </select>
          </div>
        </div>

        <DataTable<BlockedIpItem>
          data={ips}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={refetch}
          keyField="id"
          countLabel="IPs"
          emptyTitle="Sin IPs registradas"
          emptyDescription="No hay direcciones IP gestionadas. Agrega la primera usando el botón superior."
          emptyIcon="Shield"
        />
      </div>

      {pagination && (
        <Pagination page={pagination.current_page} totalPages={pagination.last_page} onPageChange={goToPage} totalItems={pagination.total} itemLabel="IPs" />
      )}

      {/* Create Modal */}
      <BaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva IP"
        subtitle="Registrar una dirección IP para bloqueo, lista blanca o marcación"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Dirección IP *
            </label>
            <input
              name="ip_address"
              type="text"
              required
              placeholder="192.168.1.1"
              pattern="^(\d{1,3}\.){3}\d{1,3}$"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Motivo *
            </label>
            <textarea
              name="reason"
              required
              rows={3}
              placeholder="Ej: Intento de acceso no autorizado detectado"
              className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Estado
              </label>
              <select
                name="status"
                defaultValue="blocked"
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="blocked">Bloqueado</option>
                <option value="flagged">Sospechosa</option>
                <option value="whitelisted">Lista Blanca</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Expira (opcional)
              </label>
              <input
                name="expires_at"
                type="datetime-local"
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <BaseButton type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </BaseButton>
            <BaseButton type="submit" variant="primary" isLoading={isMutating}>
              Registrar IP
            </BaseButton>
          </div>
        </form>
      </BaseModal>

      {/* Action Confirmation Modal */}
      <BaseModal
        isOpen={!!showActionModal}
        onClose={() => setShowActionModal(null)}
        title={showActionModal?.type === 'unblock' ? 'Desbloquear IP' : showActionModal?.type === 'block' ? 'Bloquear IP' : showActionModal?.type === 'whitelist' ? 'Añadir a Lista Blanca' : 'Eliminar IP'}
        subtitle={
          showActionModal
            ? `${showActionModal.ip.ip_address} — ${showActionModal.ip.reason || 'Sin motivo'}`
            : undefined
        }
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            {showActionModal?.type === 'delete'
              ? 'Esta acción eliminará permanentemente el registro. ¿Continuar?'
              : '¿Confirmar la operación sobre esta IP?'}
          </p>
          <div className="flex justify-end gap-3">
            <BaseButton variant="outline" onClick={() => setShowActionModal(null)}>
              Cancelar
            </BaseButton>
            <BaseButton
              variant={showActionModal?.type === 'delete' ? 'danger' : 'primary'}
              onClick={handleQuickAction}
              isLoading={isMutating}
            >
              {showActionModal?.type === 'unblock' ? 'Desbloquear' : showActionModal?.type === 'block' ? 'Bloquear' : showActionModal?.type === 'whitelist' ? 'Añadir a Blanca' : 'Eliminar'}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
