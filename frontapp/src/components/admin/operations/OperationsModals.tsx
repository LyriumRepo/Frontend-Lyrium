import React, { useState, useEffect } from 'react';
import { Supplier } from '@/features/admin/operations/types/operations';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

// ─── ProviderModal ────────────────────────────────────────────────────────────

type ProviderType = 'Economista' | 'Contador' | 'Ingeniero';

function getDynamicFields(type: ProviderType) {
  const fields: Record<
    ProviderType,
    { label: string; key: keyof Supplier; placeholder: string }[]
  > = {
    Ingeniero: [
      {
        label: 'Historial de Proyectos',
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
        label: 'Auditorías Realizadas',
        key: 'proyectos',
        placeholder: 'Cierre 2024, Auditoría Interna',
      },
      {
        label: 'Matrícula Profesional',
        key: 'certificaciones',
        placeholder: 'CPC-12345',
      },
    ],
    Economista: [
      {
        label: 'Análisis Sectoriales',
        key: 'proyectos',
        placeholder: 'Estudio Mercado, Proyección IPC',
      },
      {
        label: 'Especialidad Académica',
        key: 'certificaciones',
        placeholder: 'Master en Microeconomía',
      },
    ],
  };
  return fields[type] ?? fields.Economista;
}

export const ProviderModal: React.FC<{
  provider: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (provider: Partial<Supplier>) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (provider === null) return null;

  const currentType = (formData.tipo ?? 'Economista') as ProviderType;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-8 font-industrial"
    >
      <div className="col-span-2 space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
          Nombre Completo del Proveedor
        </label>
        <input
          type="text"
          value={formData.nombre ?? ''}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          required
          placeholder="Ej: Ing. Marco Aurelio"
          className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-sm font-black text-[var(--text-primary)] focus:ring-4 focus:ring-sky-500/10"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
          RUC / DNI (Legal)
        </label>
        <input
          type="text"
          value={formData.ruc ?? ''}
          onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
          maxLength={11}
          className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-sm font-bold text-[var(--text-primary)]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
          Perfil Operativo
        </label>
        <select
          value={formData.tipo ?? 'Economista'}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)]"
        >
          <option value="Economista">Economista</option>
          <option value="Contador">Contador</option>
          <option value="Ingeniero">Ingeniero</option>
        </select>
      </div>

      <div className="col-span-2 p-6 bg-sky-500/10 rounded-[2rem] border border-sky-500/20 space-y-6">
        <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest text-center">
          Campos Dinámicos por Especialidad
        </p>
        <div className="grid grid-cols-2 gap-6">
          {getDynamicFields(currentType).map((field) => {
            const val = formData[field.key];
            const displayVal = Array.isArray(val)
              ? val.join(', ')
              : ((val as string) ?? '');
            return (
              <div key={String(field.key)} className="space-y-1">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={displayVal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.key]: e.target.value
                        .split(',')
                        .map((x) => x.trim()),
                    })
                  }
                  className="w-full p-2 bg-[var(--bg-card)] rounded-xl text-[11px] font-bold border-none text-[var(--text-primary)]"
                  placeholder={field.placeholder}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
          Estado de Vínculo
        </label>
        <select
          value={formData.estado ?? 'Activo'}
          onChange={(e) =>
            setFormData({
              ...formData,
              estado: e.target.value as Supplier['estado'],
            })
          }
          className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)]"
        >
          <option value="Activo">Activo</option>
          <option value="En Pausa">En Pausa</option>
          <option value="Suspendido">Suspendido</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
          Fecha de Renovación
        </label>
        <input
          type="date"
          value={formData.fechaRenovacion ?? ''}
          onChange={(e) =>
            setFormData({ ...formData, fechaRenovacion: e.target.value })
          }
          className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-bold text-[var(--text-primary)]"
        />
      </div>

      <div className="col-span-2 pt-6 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-5 border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-5 bg-sky-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl shadow-black/5"
        >
          {formData.id ? 'Actualizar Proveedor' : 'Crear Proveedor'}
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

  // Manejo de la cuenta regresiva del cooldown del botón "Reenviar"
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || code.length < 6) return;
    setLoading(true);

    try {
      const success = await onVerify(code);
      if (!success) {
        setCode(''); // Limpia el input para el siguiente intento si falla
      }
    } catch (err) {
      console.error('Error en submit de 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0 || !onResend) return;
    setResending(true);

    try {
      const success = await onResend();
      if (success) {
        setCooldown(60); // Inicia temporizador de 60 segundos tras el éxito
      }
    } catch (err) {
      console.error('Error al reenviar código:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-industrial">
      <div className="flex justify-center mb-2">
        <div className="w-14 h-14 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[11px] font-bold text-[var(--text-muted)] px-4">
          Ingresa el código de 6 dígitos enviado a tu correo corporativo.
        </p>
      </div>

      <input
        type="text"
        value={code}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          setCode(val);
        }}
        placeholder="------"
        maxLength={6}
        disabled={loading}
        autoFocus
        className={`w-full text-4xl font-black text-center tracking-[1rem] py-6 bg-[var(--bg-input)] border-none rounded-3xl focus:ring-4 focus:ring-sky-500/10 placeholder:text-[var(--text-muted)] text-[var(--text-primary)] ${
          errorMessage ? 'ring-2 ring-red-400' : ''
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {/* Mensaje de Error de Laravel (Rojo) */}
      {errorMessage && (
        <p className="text-center text-xs text-red-500 font-bold -mt-2 animate-pulse px-4">
          {errorMessage}
        </p>
      )}

      {/* Mensaje de Éxito de Reenvío de Laravel (Verde/Azul) */}
      {successMessage && !errorMessage && (
        <p className="text-center text-xs text-emerald-500 font-black -mt-2 px-4">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || code.length < 6}
        className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase hover:bg-sky-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Validando Código...
          </>
        ) : (
          'Validar Acceso'
        )}
      </button>

      {/* Botón de Reenviar Código con cuenta regresiva inteligente */}
      {onResend && (
        <div className="flex justify-center pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all py-2 px-4 rounded-xl ${
              cooldown > 0
                ? 'text-[var(--text-muted)] cursor-not-allowed bg-[var(--bg-secondary)]'
                : 'text-sky-500 hover:text-sky-600 hover:bg-sky-500/5 cursor-pointer'
            }`}
          >
            {resending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Reenviando...
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-[var(--text-muted)]" />
                Reenviar en {cooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                ¿No recibiste el código? Reenviar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};
