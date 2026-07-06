import React, { useState, useEffect } from 'react';
import { Supplier } from '@/features/admin/operations/types/operations';

type ProviderType = 'Economista' | 'Contador' | 'Ingeniero';

function getDynamicFields(type: ProviderType) {
  const fields: Record<
    ProviderType,
    { label: string; key: keyof Supplier; placeholder: string }[]
  > = {
    Ingeniero: [
      {
        label: 'Proyectos',
        key: 'proyectos',
        placeholder: 'Proyecto A, Proyecto B',
      },
      {
        label: 'Certificaciones IT',
        key: 'certificaciones',
        placeholder: 'AWS, Azure',
      },
    ],
    Contador: [
      {
        label: 'Auditorías realizadas',
        key: 'proyectos',
        placeholder: 'Cierre 2024',
      },
      {
        label: 'Matrícula profesional',
        key: 'certificaciones',
        placeholder: 'CPC-12345',
      },
    ],
    Economista: [
      {
        label: 'Análisis sectoriales',
        key: 'proyectos',
        placeholder: 'Estudio Mercado',
      },
      {
        label: 'Especialidad académica',
        key: 'certificaciones',
        placeholder: 'Master en Microeconomía',
      },
    ],
  };
  return fields[type] ?? fields.Economista;
}

const inputCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] w-full';
const selectCls =
  'text-[13px] border border-[var(--border-subtle)] rounded-lg px-3 py-[7px] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-full';
const labelCls = 'block text-[11px] font-medium text-[var(--text-secondary)] mb-1';

// ─── ProviderModal ────────────────────────────────────────────────────────────
export const ProviderModal: React.FC<{
  provider: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (p: Partial<Supplier>) => void;
}> = ({ provider, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    provider && Object.keys(provider).length > 0
      ? provider
      : {
          tipo: 'Economista',
          estado: 'Activo',
          proyectos: [],
          certificaciones: [],
        },
  );

  if (provider === null) return null;

  const currentType = (formData.tipo ?? 'Economista') as ProviderType;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nombre */}
      <div>
        <label className={labelCls}>Nombre completo</label>
        <input
          type="text"
          required
          placeholder="Ej: Ing. Marco Aurelio"
          value={formData.nombre ?? ''}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>RUC / DNI</label>
          <input
            type="text"
            maxLength={11}
            value={formData.ruc ?? ''}
            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Perfil operativo</label>
          <select
            value={formData.tipo ?? 'Economista'}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className={selectCls}
          >
            <option value="Economista">Economista</option>
            <option value="Contador">Contador</option>
            <option value="Ingeniero">Ingeniero</option>
          </select>
        </div>
      </div>

      {/* Campos dinámicos */}
      <div className="bg-[var(--bg-muted)] rounded-xl p-4 flex flex-col gap-3">
        <p className="text-[11px] font-medium text-[var(--text-secondary)]">
          Campos por especialidad — {currentType}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {getDynamicFields(currentType).map((field) => {
            const val = formData[field.key];
            const displayVal = Array.isArray(val)
              ? val.join(', ')
              : ((val as string) ?? '');
            return (
              <div key={String(field.key)}>
                <label className={labelCls}>{field.label}</label>
                <input
                  type="text"
                  value={displayVal}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.key]: e.target.value
                        .split(',')
                        .map((x) => x.trim()),
                    })
                  }
                  className={inputCls}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Estado de vínculo</label>
          <select
            value={formData.estado ?? 'Activo'}
            onChange={(e) =>
              setFormData({
                ...formData,
                estado: e.target.value as Supplier['estado'],
              })
            }
            className={selectCls}
          >
            <option value="Activo">Activo</option>
            <option value="En Pausa">En pausa</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Fecha de renovación</label>
          <input
            type="date"
            value={formData.fechaRenovacion ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, fechaRenovacion: e.target.value })
            }
            className={inputCls}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onClose}
          className="text-[13px] px-3.5 py-[6px] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="text-[13px] px-3.5 py-[6px] border border-[var(--border-default)] rounded-lg font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
        >
          {formData.id ? 'Actualizar proveedor' : 'Crear proveedor'}
        </button>
      </div>
    </form>
  );
};

// ─── TwoFactorModalContent ────────────────────────────────────────────────────
export const TwoFactorModalContent: React.FC<{
  onVerify: (code: string) => Promise<boolean> | boolean;
  onClose: () => void;
  errorMessage?: string | null;
  onResend?: () => Promise<boolean>;
  successMessage?: string | null;
}> = ({ onVerify, onClose, errorMessage, onResend, successMessage }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || code.length < 6) return;
    setLoading(true);
    try {
      const ok = await onVerify(code);
      if (!ok) setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0 || !onResend) return;
    setResending(true);
    try {
      const ok = await onResend();
      if (ok) setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  // Shield icon
  const IcoShield = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Ícono */}
      <div className="flex justify-center pt-1">
        <div className="w-12 h-12 bg-[var(--bg-card)] text-[var(--color-info)] rounded-xl flex items-center justify-center">
          {loading ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            <IcoShield />
          )}
        </div>
      </div>

      <p className="text-[13px] text-[var(--text-secondary)] text-center leading-relaxed">
        Ingresa el código de 6 dígitos enviado a tu correo corporativo.
      </p>

      {/* Input código */}
      <input
        type="text"
        autoFocus
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
        disabled={loading}
        placeholder="------"
        className={`w-full text-[32px] font-medium text-center tracking-[0.6em] py-4 border rounded-xl bg-[var(--bg-muted)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)] transition-colors ${
          errorMessage ? 'border-[var(--color-error)]' : 'border-[var(--border-subtle)]'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {errorMessage && (
        <p className="text-center text-[12px] text-[var(--color-error)] -mt-1">
          {errorMessage}
        </p>
      )}
      {successMessage && !errorMessage && (
        <p className="text-center text-[12px] text-[var(--color-success)] -mt-1">
          {successMessage}
        </p>
      )}

      {/* Botón validar */}
      <button
        type="submit"
        disabled={loading || code.length < 6}
        className="w-full py-2.5 border border-[var(--border-default)] rounded-lg text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Validando...' : 'Validar acceso'}
      </button>

      {/* Reenviar */}
      {onResend && (
        <div className="flex justify-center pt-1 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className={`text-[12px] flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors ${
              cooldown > 0
                ? 'text-[var(--text-muted)] cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {resending
              ? 'Reenviando...'
              : cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : '¿No recibiste el código? Reenviar'}
          </button>
        </div>
      )}
    </form>
  );
};
