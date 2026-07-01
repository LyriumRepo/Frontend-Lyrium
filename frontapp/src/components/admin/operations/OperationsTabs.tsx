import React from 'react';
import {
  Supplier,
  SupplierFilters,
  Expense,
  OperationalRole,
  AuditLog,
} from '@/features/admin/operations/types/operations';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-green)] w-full';
const selectCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-green)] w-full';
const thCls =
  'text-left text-[11px] font-medium text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border-subtle)]';
const tdCls = 'px-3 py-2.5 text-[13px] text-[var(--text-secondary)]';

// ─── Badges ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Activo: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
    Suspendido: 'bg-[var(--color-error)]/15 text-[var(--color-error)]',
    'En Pausa': 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
    Inactivo: 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
    Pagado: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
    Pendiente: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
    Anulado: 'bg-[var(--color-error)]/15 text-[var(--color-error)]',
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
    >
      {status}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, string> = {
    Honorarios: 'bg-[var(--color-info)]/15 text-[var(--color-info)]',
    Factura: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
    Boleta: 'bg-[var(--color-info)]/15 text-[var(--color-info)]',
    Servicio: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
  };
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${map[tipo] ?? 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
    >
      {tipo || '—'}
    </span>
  );
}

// ─── Icon buttons ─────────────────────────────────────────────────────────────
function IconBtn({
  onClick,
  title,
  variant = 'default',
  children,
}: {
  onClick?: () => void;
  title?: string;
  variant?: 'default' | 'green' | 'red' | 'blue';
  children: React.ReactNode;
}) {
  const cls = {
    default:
      'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]',
    green: 'border-[var(--color-success)]/30 text-[var(--color-success)] hover:bg-[var(--color-success)]/10',
    red: 'border-[var(--color-error)]/30 text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
    blue: 'border-[var(--color-info)]/30 text-[var(--color-info)] hover:bg-[var(--color-info)]/10',
  }[variant];
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 inline-flex items-center justify-center border rounded-[6px] transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

// SVG icons
const IcoEdit = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.83a4 4 0 01-1.897 1.06l-2.796.7.7-2.796A4 4 0 019 13z"
    />
  </svg>
);
const IcoTrash = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2"
    />
  </svg>
);
const IcoBan = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M6.343 6.343l11.314 11.314" />
  </svg>
);
const IcoPlus = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IcoSearch = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
    />
  </svg>
);
const IcoFinger = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v3m-4-3c0-1.1-.9-2-2-2s-2 .9-2 2v5a6 6 0 0012 0v-5"
    />
  </svg>
);
const IcoCheck = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IcoShield = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

// ─── ProvidersTab ─────────────────────────────────────────────────────────────
export const ProvidersTab: React.FC<{
  providers: Supplier[];
  filters: SupplierFilters;
  onFilterChange: (f: Partial<SupplierFilters>) => void;
  onNewProvider: () => void;
  onEditProvider: (p: Supplier) => void;
  onDeleteProvider?: (p: Supplier) => void;
}> = ({
  providers,
  filters,
  onFilterChange,
  onNewProvider,
  onEditProvider,
  onDeleteProvider,
}) => (
  <div className="flex flex-col gap-4">
    {/* Filtros */}
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          <IcoSearch />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o RUC..."
          value={filters.search ?? ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className={inputCls + ' pl-8'}
        />
      </div>
      <select
        value={filters.type ?? ''}
        onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
        className={selectCls + ' w-auto'}
      >
        <option value="">Todas las especialidades</option>
        <option value="Economista">Economista</option>
        <option value="Contador">Contador</option>
        <option value="Ingeniero">Ingeniero</option>
      </select>
      <select
        value={filters.status ?? ''}
        onChange={(e) =>
          onFilterChange({ status: e.target.value || undefined })
        }
        className={selectCls + ' w-auto'}
      >
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="Suspendido">Suspendido</option>
        <option value="En Pausa">En pausa</option>
        <option value="Inactivo">Inactivo</option>
      </select>
      <button
        onClick={onNewProvider}
        className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors shrink-0"
      >
        <IcoPlus /> Nuevo proveedor
      </button>
    </div>

    {/* Tabla */}
    <div className="overflow-x-auto rounded-xl">
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden min-w-[620px]">
      <table
        className="w-full border-collapse"
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: '220px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '110px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '80px' }} />
        </colgroup>
        <thead>
          <tr>
            <th className={thCls}>Proveedor / Especialidad</th>
            <th className={thCls}>RUC</th>
            <th className={thCls}>Renovación</th>
            <th className={thCls}>Estado</th>
            <th className={thCls}></th>
          </tr>
        </thead>
        <tbody>
          {providers.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-10 text-center text-[13px] text-[var(--text-muted)]"
              >
                No hay proveedores registrados.
              </td>
            </tr>
          )}
          {providers.map((p) => {
            const nombre = p.nombre ?? '(sin nombre)';
            const inicial = nombre.trim().charAt(0).toUpperCase();
            const renovacion = p.fechaRenovacion
              ? new Date(p.fechaRenovacion + 'T00:00:00').toLocaleDateString(
                  'es-PE',
                )
              : '—';
            return (
              <tr
                key={p.id}
                className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                <td className={tdCls}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[var(--color-info)]/15 text-[var(--color-info)] rounded-lg flex items-center justify-center text-[12px] font-medium shrink-0">
                      {inicial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-[var(--text-primary)] font-medium truncate">
                        {nombre}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {p.especialidad ?? p.tipo ?? '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={tdCls + ' font-mono text-[12px] text-[var(--text-muted)]'}>
                  {p.ruc ?? '—'}
                </td>
                <td className={tdCls + ' text-[var(--text-muted)]'}>{renovacion}</td>
                <td className={tdCls}>
                  <StatusBadge status={p.estado ?? '—'} />
                </td>
                <td className={tdCls}>
                  <div className="flex gap-1 justify-end">
                    <IconBtn
                      title="Editar"
                      variant="blue"
                      onClick={() => onEditProvider(p)}
                    >
                      <IcoEdit />
                    </IconBtn>
                    {onDeleteProvider && (
                      <IconBtn
                        title="Eliminar"
                        variant="red"
                        onClick={() => onDeleteProvider(p)}
                      >
                        <IcoTrash />
                      </IconBtn>
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

// ─── ExpensesTab ──────────────────────────────────────────────────────────────
export const ExpensesTab: React.FC<{
  expenses: Expense[];
  totalInvestment: number;
}> = ({ expenses, totalInvestment }) => (
  <div className="flex flex-col gap-4">
    {/* Resumen */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <div className="bg-[var(--bg-muted)] rounded-[10px] p-4">
        <p className="text-[12px] text-[var(--text-muted)] mb-1">Total inversión</p>
        <p className="text-[22px] font-medium text-[var(--text-primary)]">
          S/ {totalInvestment.toLocaleString()}
        </p>
      </div>
      <div className="bg-[var(--bg-muted)] rounded-[10px] p-4">
        <p className="text-[12px] text-[var(--text-muted)] mb-1">Comprobantes</p>
        <p className="text-[22px] font-medium text-[var(--text-primary)]">
          {expenses.length}
        </p>
      </div>
      <div className="bg-[var(--bg-muted)] rounded-[10px] p-4">
        <p className="text-[12px] text-[var(--text-muted)] mb-1">Pendientes</p>
        <p className="text-[22px] font-medium text-[var(--text-primary)]">
          {expenses.filter((e) => e.status === 'Pendiente').length}
        </p>
      </div>
    </div>

    {/* Tabla */}
    <div className="overflow-x-auto rounded-xl">
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden min-w-[825px]">
      <table
        className="w-full border-collapse"
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: '110px' }} />
          <col style={{ width: '130px' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '85px' }} />
        </colgroup>
        <thead>
          <tr>
            <th className={thCls}>Tipo</th>
            <th className={thCls}>Nro. comprobante</th>
            <th className={thCls}>Proveedor</th>
            <th className={thCls}>Concepto</th>
            <th className={thCls}>Fecha</th>
            <th className={thCls}>Monto</th>
            <th className={thCls}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="py-10 text-center text-[13px] text-[var(--text-muted)]"
              >
                No hay recibos registrados.
              </td>
            </tr>
          )}
          {expenses.map((g) => (
            <tr
              key={g.id}
              className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
            >
              <td className={tdCls}>
                <TipoBadge tipo={g.voucher_type ?? ''} />
              </td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--text-muted)] truncate">
                {g.receipt_number}
              </td>
              <td className={tdCls + ' truncate'}>{g.supplier?.name ?? '—'}</td>
              <td className={tdCls + ' truncate'}>{g.concept}</td>
              <td className="px-3 py-2.5 text-[13px] text-[var(--text-muted)]">
                {g.issued_at}
              </td>
              <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">
                S/ {Number(g.amount).toLocaleString()}
              </td>
              <td className={tdCls}>
                <StatusBadge status={g.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  </div>
);

// ─── CredentialsTab ───────────────────────────────────────────────────────────
export const CredentialsTab: React.FC<{
  roles: OperationalRole[];
  onNewRole: () => void;
  onEditRole: (r: OperationalRole) => void;
  onDeactivateRole: (r: OperationalRole) => void;
}> = ({ roles, onNewRole, onEditRole, onDeactivateRole }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <p className="text-[13px] font-medium text-[var(--text-primary)]">
        Roles y permisos operativos
      </p>
      <button
        onClick={onNewRole}
        className="inline-flex items-center gap-1.5 border border-[var(--border-subtle)] rounded-lg px-3.5 py-[7px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
      >
        <IcoPlus /> Nuevo rol
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 overflow-x-auto rounded-xl">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden min-w-[400px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thCls}>Rol operativo</th>
              <th className={thCls}>Módulos</th>
              <th className={thCls}>Usuarios</th>
              <th className={thCls}>Estado</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-[13px] text-[var(--text-muted)]"
                >
                  No hay roles registrados.
                </td>
              </tr>
            )}
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                <td className={tdCls}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[var(--color-info)]/15 text-[var(--color-info)] rounded-lg flex items-center justify-center text-[11px] font-medium shrink-0">
                      {(role.name ?? '??').substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[13px] text-[var(--text-primary)] font-medium">
                      {role.name}
                    </span>
                  </div>
                </td>
                <td className={tdCls}>
                  <div className="flex flex-wrap gap-1">
                    {(role.modules ?? []).map((mod) => (
                      <span
                        key={mod}
                        className="text-[11px] px-1.5 py-0.5 bg-[var(--color-info)]/15 text-[var(--color-info)] rounded-md"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[13px] text-[var(--text-muted)]">
                  {role.users_count ?? 0}
                </td>
                <td className={tdCls}>
                  <StatusBadge
                    status={role.is_active ? 'Activo' : 'Inactivo'}
                  />
                </td>
                <td className={tdCls}>
                  <div className="flex gap-1 justify-end">
                    <IconBtn
                      title="Editar"
                      variant="blue"
                      onClick={() => onEditRole(role)}
                    >
                      <IcoEdit />
                    </IconBtn>
                    <IconBtn
                      title="Desactivar"
                      variant="red"
                      onClick={() => onDeactivateRole(role)}
                    >
                      <IcoBan />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Panel info */}
      <div className="bg-[var(--bg-muted)] rounded-xl p-5 h-fit flex flex-col gap-3">
        <div className="w-9 h-9 bg-[var(--color-info)]/15 text-[var(--color-info)] rounded-lg flex items-center justify-center">
          <IcoShield />
        </div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">
          Editor de permisos
        </p>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          Gestiona roles operativos y sus permisos. Todas las modificaciones
          requieren verificación 2FA.
        </p>
        <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)]">
          {[
            'Control granular de accesos',
            'Auditoría automática de cambios',
            'Seguridad con 2FA',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]"
            >
              <IcoCheck />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── AuditTab ─────────────────────────────────────────────────────────────────
export const AuditTab: React.FC<{ logs: AuditLog[] }> = ({ logs = [] }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
    <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
      <p className="text-[13px] font-medium text-[var(--text-primary)]">Log de auditoría</p>
      <p className="text-[12px] text-[var(--text-muted)]">
        Registro de todas las acciones del sistema
      </p>
    </div>
    <div className="divide-y divide-[var(--border-subtle)] max-h-[560px] overflow-y-auto">
      {logs.length === 0 && (
        <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">
          No hay registros de auditoría.
        </p>
      )}
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-muted)] transition-colors"
        >
          <div className="w-7 h-7 bg-[var(--color-info)]/15 text-[var(--color-info)] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <IcoFinger />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                {log.event}
                <span className="text-[var(--border-subtle)] mx-1.5">·</span>
                <span className="text-[var(--text-muted)] font-normal">{log.module}</span>
              </p>
              <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                {new Date(log.created_at).toLocaleString('es-PE')}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              {log.description}
            </p>
            {log.actor?.email && (
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {log.actor.email} · {log.actor.role ?? 'sistema'}
              </p>
            )}
          </div>
          {log.event === 'created' && (
            <span className="text-[var(--color-success)] mt-0.5 shrink-0">
              <IcoCheck />
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);
