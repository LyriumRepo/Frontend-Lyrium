import React from 'react';
import {
  Supplier,
  SupplierFilters,
  Expense,
  OperationalRole,
  AuditLog,
} from '@/features/admin/operations/types/operations';
import {
  PlusCircle,
  Search,
  Edit,
  Users,
  Ban,
  CheckCircle,
  ShieldCheck,
  Fingerprint,
  Trash2,
} from 'lucide-react';

// ─── ProvidersTab ─────────────────────────────────────────────────────────────

export const ProvidersTab: React.FC<{
  providers: Supplier[];
  filters: SupplierFilters;
  onFilterChange: (filters: Partial<SupplierFilters>) => void;
  onNewProvider: () => void;
  onEditProvider: (provider: Supplier) => void;
  onDeleteProvider?: (provider: Supplier) => void;
}> = ({
  providers,
  filters,
  onFilterChange,
  onNewProvider,
  onEditProvider,
  onDeleteProvider,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tighter">
          Directorio Especializado
        </h3>
        <button
          onClick={onNewProvider}
          className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-sky-600 transition-all flex items-center gap-2 shadow-xl shadow-black/5"
        >
          <PlusCircle className="w-5 h-5" /> Nuevo Proveedor
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Buscador Inteligente
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUC..."
                value={filters.search ?? ''}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border-none rounded-2xl text-sm focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Perfil Profesional
            </label>
            <select
              value={filters.type ?? 'ALL'}
              onChange={(e) =>
                onFilterChange({
                  type: e.target.value === 'ALL' ? undefined : e.target.value,
                })
              }
              className="w-full p-3 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-bold text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">Todas las especialidades</option>
              <option value="Economista">Economista</option>
              <option value="Contador">Contador</option>
              <option value="Ingeniero">Ingeniero</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
              Estado Vínculo
            </label>
            <select
              value={filters.status ?? 'ALL'}
              onChange={(e) =>
                onFilterChange({
                  status: e.target.value === 'ALL' ? undefined : e.target.value,
                })
              }
              className="w-full p-3 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-bold text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="En Pausa">En Pausa</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Tabla de proveedores">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                <th scope="col" className="px-6 py-5">
                  Proveedor / Especialidad
                </th>
                <th scope="col" className="px-6 py-5">
                  RUC
                </th>
                <th scope="col" className="px-6 py-5">
                  Renovación
                </th>
                <th scope="col" className="px-6 py-5">
                  Estado
                </th>
                <th scope="col" className="px-6 py-5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] uppercase text-[10px] font-bold">
              {providers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-[var(--text-muted)] text-xs"
                  >
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
              {providers.map((p) => {
                // ── Acceso seguro a todos los campos ──────────────────
                const nombre = p.nombre ?? '(sin nombre)';
                const inicial = nombre.trim().charAt(0).toUpperCase() || '?';
                const especialidad = p.especialidad ?? p.tipo ?? '—';
                const ruc = p.ruc ?? '—';
                // fecha_renovacion viene como string "2026-12-31" o null
                const renovacion = p.fechaRenovacion
                  ? new Date(
                      p.fechaRenovacion + 'T00:00:00',
                    ).toLocaleDateString('es-PE')
                  : '—';
                const estado = p.estado ?? '—';
                const esActivo = estado === 'Activo';

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-black text-sm">
                          {inicial}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[var(--text-primary)] tracking-tight leading-none mb-1 normal-case">
                            {nombre}
                          </p>
                          <p className="text-[9px] text-indigo-500 uppercase">
                            {especialidad}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[var(--text-secondary)]">
                      {ruc}
                    </td>
                    <td className="px-6 py-5 text-[var(--text-secondary)] font-medium normal-case">
                      {renovacion}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                          esActivo
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditProvider(p)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                          title="Editar proveedor"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {onDeleteProvider && (
                          <button
                            onClick={() => onDeleteProvider(p)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-all"
                            title="Eliminar proveedor"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── ExpensesTab ──────────────────────────────────────────────────────────────

export const ExpensesTab: React.FC<{
  expenses: Expense[];
  totalInvestment: number;
}> = ({ expenses, totalInvestment }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 bg-[var(--bg-card)] p-6 h-fit space-y-6 rounded-3xl border border-[var(--border-subtle)] shadow-sm">
        <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight font-industrial">
          Resumen
        </h4>
        <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2 font-industrial">
              Cálculo de Inversión (RF-13)
            </p>
            <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter font-industrial">
              S/ {totalInvestment.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight font-industrial">
            Registro de Recibos y Comprobantes
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Tabla de recibos">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest font-industrial">
                <th scope="col" className="px-6 py-4">
                  N° Recibo
                </th>
                <th scope="col" className="px-6 py-4">
                  Proveedor
                </th>
                <th scope="col" className="px-6 py-4">
                  Concepto
                </th>
                <th scope="col" className="px-6 py-4">
                  Monto
                </th>
                <th scope="col" className="px-6 py-4">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-[var(--text-muted)] text-xs font-industrial"
                  >
                    No hay recibos registrados.
                  </td>
                </tr>
              )}
              {expenses.map((g) => (
                <tr
                  key={g.id}
                  className="hover:bg-[var(--bg-secondary)]/50 transition-colors text-[10px] font-bold font-industrial"
                >
                  <td className="px-6 py-4 text-[var(--text-muted)] font-mono normal-case">
                    {g.receipt_number}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[var(--text-primary)] normal-case">
                      {g.supplier?.name ?? '—'}
                    </p>
                    <p className="text-[9px] text-indigo-500 uppercase">
                      {g.supplier?.type ?? ''}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] normal-case">
                    {g.concept}
                  </td>
                  <td className="px-6 py-4 font-black text-[var(--text-primary)]">
                    S/ {Number(g.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md uppercase ${
                        g.status === 'Pagado'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : g.status === 'Anulado'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── CredentialsTab ───────────────────────────────────────────────────────────

export const CredentialsTab: React.FC<{
  roles: OperationalRole[];
  onNewRole: () => void;
  onEditRole: (role: OperationalRole) => void;
  onDeactivateRole: (role: OperationalRole) => void;
}> = ({ roles, onNewRole, onEditRole, onDeactivateRole }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tighter">
          Gestión de Roles y Permisos
        </h3>
        <button
          onClick={onNewRole}
          className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-sky-600 transition-all flex items-center gap-2 shadow-xl shadow-black/5"
        >
          <PlusCircle className="w-5 h-5" /> Nuevo Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <table
            className="w-full text-left"
            aria-label="Tabla de roles operativos"
          >
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-industrial">
                <th scope="col" className="px-6 py-5">
                  Rol Operativo
                </th>
                <th scope="col" className="px-6 py-5">
                  Módulos
                </th>
                <th scope="col" className="px-6 py-5">
                  Usuarios
                </th>
                <th scope="col" className="px-6 py-5 text-center">
                  Estado
                </th>
                <th scope="col" className="px-6 py-5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {roles.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-[var(--text-muted)] text-xs font-industrial"
                  >
                    No hay roles operativos registrados.
                  </td>
                </tr>
              )}
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-black text-xs font-industrial">
                        {(role.name ?? '??').substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight font-industrial">
                        {role.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {(role.modules ?? []).map((mod) => (
                        <span
                          key={mod}
                          className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-bold rounded-md border border-indigo-500/20 font-industrial uppercase"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-xs font-black text-[var(--text-secondary)] font-industrial">
                        {role.users_count ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`px-3 py-1 text-[9px] font-bold rounded-lg border font-industrial uppercase ${
                        role.is_active
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {role.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditRole(role)}
                        className="p-2 text-[var(--text-muted)] hover:text-indigo-500 transition-all"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDeactivateRole(role)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-all"
                        title="Desactivar"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-purple-500/10 p-6 h-fit rounded-3xl border border-purple-500/20 shadow-sm">
          <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight mb-3 font-industrial">
            Editor de Permisos
          </h4>
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-4 font-industrial">
            Gestione roles operativos y sus permisos. Todas las modificaciones
            requieren verificación 2FA.
          </p>
          <div className="space-y-2 pt-4 border-t border-purple-500/20">
            {[
              'Control granular de accesos',
              'Auditoría automática de cambios',
              'Seguridad con 2FA',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[9px] text-[var(--text-secondary)] font-industrial uppercase"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AuditTab ─────────────────────────────────────────────────────────────────

export const AuditTab: React.FC<{ logs: AuditLog[] }> = ({ logs = [] }) => {
  return (
    <div className="bg-[var(--bg-card)] p-0 overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm">
      <div className="p-6 bg-sky-500 text-white">
        <h3 className="font-black tracking-tight font-industrial uppercase">
          Log Avanzado de Auditoría
        </h3>
        <p className="text-[10px] text-sky-200 uppercase font-bold tracking-widest mt-1 font-industrial">
          Cumplimiento Estándar (RF-13)
        </p>
      </div>
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-center text-[var(--text-muted)] text-xs font-industrial py-8">
            No hay registros de auditoría.
          </p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-4 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-subtle)] shadow-sm"
          >
            <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1 gap-2">
                <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter font-industrial truncate">
                  {log.event}
                  <span className="text-[var(--text-muted)] mx-2">●</span>
                  {log.module}
                </p>
                <span className="text-[9px] font-bold text-[var(--text-muted)] font-industrial shrink-0">
                  {new Date(log.created_at).toLocaleString('es-PE')}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed font-industrial normal-case">
                {log.description}
              </p>
              {log.actor?.email && (
                <p className="text-[9px] text-[var(--text-muted)] mt-1 font-industrial">
                  Actor: {log.actor.email} ({log.actor.role ?? 'sistema'})
                </p>
              )}
            </div>
            {log.event === 'created' && (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
