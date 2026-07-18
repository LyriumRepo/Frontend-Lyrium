'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import BaseButton from '@/components/ui/BaseButton';
import BaseModal from '@/components/ui/BaseModal';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import type { Column } from '@/components/ui/DataTable';
import { useProtectionRules } from '@/features/admin/security/hooks/useProtectionRules';
import type { ProtectionRuleItem, ProtectionRuleType, ProtectionRuleSeverity, ProtectionRuleStatus } from '@/shared/lib/api/protectionRuleRepository';

const RULE_TYPE_MAPPINGS = [
  { status: 'rate_limit', label: 'Rate Limit', class: 'bg-sky-50 text-sky-600 border-sky-100', icon: 'Gauge' },
  { status: 'ip_block', label: 'Bloqueo IP', class: 'bg-red-50 text-red-600 border-red-100', icon: 'ShieldOff' },
  { status: 'geo', label: 'Geográfica', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'Globe' },
  { status: 'device', label: 'Dispositivo', class: 'bg-purple-50 text-purple-600 border-purple-100', icon: 'Smartphone' },
  { status: 'custom', label: 'Personalizada', class: 'bg-gray-50 text-gray-600 border-gray-100', icon: 'Settings' },
];

const RULE_STATUS_MAPPINGS = [
  { status: 'active', label: 'Activa', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'Power' },
  { status: 'inactive', label: 'Inactiva', class: 'bg-gray-50 text-gray-600 border-gray-100', icon: 'PowerOff' },
  { status: 'triggered', label: 'Disparada', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'AlertTriangle' },
];

export default function ProtectionPageClient() {
  const { rules, activeCount, loading, error, refetch, createRule, updateRule, toggleRule, deleteRule, isMutating } = useProtectionRules();
  const [showCreate, setShowCreate] = useState(false);
  const [editRule, setEditRule] = useState<ProtectionRuleItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProtectionRuleItem | null>(null);

  const columns: Column<ProtectionRuleItem>[] = [
    {
      key: 'name',
      header: 'Regla',
      render: (item) => (
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
          {item.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => <BaseStatusBadge status={item.type} mappings={RULE_TYPE_MAPPINGS} size="sm" />,
    },
    {
      key: 'severity',
      header: 'Severidad',
      render: (item) => (
        <span className={`text-[10px] font-black uppercase tracking-wider ${
          item.severity === 'critical' ? 'text-red-500' : item.severity === 'warning' ? 'text-amber-500' : 'text-sky-500'
        }`}>
          {item.severity === 'critical' ? 'Crítica' : item.severity === 'warning' ? 'Media' : 'Baja'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => <BaseStatusBadge status={item.status} mappings={RULE_STATUS_MAPPINGS} size="sm" />,
    },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (item) => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">{item.priority}</span>
      ),
    },
    {
      key: 'trigger_count',
      header: 'Disparos',
      render: (item) => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {item.trigger_count > 0 ? item.trigger_count : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleRule(item.id); }}
            className={`p-1.5 rounded-lg transition-colors ${
              item.status === 'active'
                ? 'hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-500'
                : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-500'
            }`}
            title={item.status === 'active' ? 'Desactivar' : 'Activar'}
          >
            {item.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditRule(item); }}
            className="p-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/20 text-sky-500 transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(item); }}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const isEdit = !!editRule;
    const payload = {
      name: f.get('name') as string,
      type: f.get('type') as ProtectionRuleType,
      severity: f.get('severity') as ProtectionRuleSeverity,
      status: (f.get('status') as ProtectionRuleStatus) || 'active',
      pattern: (f.get('pattern') as string) || null,
      priority: parseInt(f.get('priority') as string) || 0,
      description: (f.get('description') as string) || null,
    };
    if (isEdit) {
      await updateRule(editRule.id, payload);
      setEditRule(null);
    } else {
      await createRule(payload);
      setShowCreate(false);
    }
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Reglas de Protección
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
                  {activeCount > 0 ? `${activeCount} regla${activeCount > 1 ? 's' : ''} activa${activeCount > 1 ? 's' : ''}` : 'Sin reglas activas'}
                </p>
              </div>
            </div>
            <BaseButton onClick={() => setShowCreate(true)} variant="primary" leftIcon="Plus" size="sm">
              Nueva Regla
            </BaseButton>
          </div>
        </div>

        <DataTable<ProtectionRuleItem>
          data={rules}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={refetch}
          keyField="id"
          countLabel="reglas"
          emptyTitle="Sin reglas de protección"
          emptyDescription="Crea la primera regla de protección usando el botón superior."
          emptyIcon="ShieldCheck"
        />
      </div>

      {/* Create/Edit Modal */}
      <BaseModal
        isOpen={showCreate || !!editRule}
        onClose={() => { setShowCreate(false); setEditRule(null); }}
        title={editRule ? 'Editar Regla' : 'Nueva Regla de Protección'}
        subtitle={editRule ? `Editando: ${editRule.name}` : 'Define una regla para proteger la plataforma'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Nombre *</label>
              <input name="name" defaultValue={editRule?.name ?? ''} required maxLength={255}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Tipo</label>
              <select name="type" defaultValue={editRule?.type ?? 'rate_limit'}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                <option value="rate_limit">Rate Limit</option>
                <option value="ip_block">Bloqueo IP</option>
                <option value="geo">Geográfica</option>
                <option value="device">Dispositivo</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Severidad</label>
              <select name="severity" defaultValue={editRule?.severity ?? 'warning'}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                <option value="info">Baja</option>
                <option value="warning">Media</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Estado</label>
              <select name="status" defaultValue={editRule?.status ?? 'active'}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Prioridad</label>
              <input name="priority" type="number" defaultValue={editRule?.priority ?? 0} min={0} max={999}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Patrón (opcional)</label>
              <input name="pattern" defaultValue={editRule?.pattern ?? ''} maxLength={255}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Descripción</label>
              <textarea name="description" rows={3} defaultValue={editRule?.description ?? ''} maxLength={1000}
                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <BaseButton type="button" variant="outline" onClick={() => { setShowCreate(false); setEditRule(null); }}>Cancelar</BaseButton>
            <BaseButton type="submit" variant="primary" isLoading={isMutating}>{editRule ? 'Actualizar' : 'Crear Regla'}</BaseButton>
          </div>
        </form>
      </BaseModal>

      {/* Delete Confirmation */}
      <BaseModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        title="Eliminar Regla" subtitle={`${confirmDelete?.name ?? ''} — se eliminará permanentemente`} size="sm">
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">¿Estás seguro de eliminar esta regla de protección? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <BaseButton variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</BaseButton>
            <BaseButton variant="danger" onClick={async () => { if (confirmDelete) { await deleteRule(confirmDelete.id); setConfirmDelete(null); } }} isLoading={isMutating}>Eliminar</BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
