'use client';

import Icon from '@/components/ui/Icon';
import { useChangePassword } from './hooks/useChangePassword';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  show: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}

function PasswordField({ id, label, value, show, error, onChange, onToggle }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={id === 'actual' ? 'current-password' : 'new-password'}
          className={`
            w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]
            bg-transparent p-3 pr-12
            border-2 rounded-xl outline-none transition-colors
            ${error
              ? 'border-red-400 focus:border-red-500'
              : 'border-gray-200 dark:border-[var(--border-subtle)] focus:border-sky-500'
            }
          `}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <Icon name={show ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
          <Icon name="AlertCircle" className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function ChangePasswordForm() {
  const {
    formData,
    visibility,
    requirements,
    strength,
    error,
    fieldErrors,
    success,
    isPending,
    allRequirementsMet,
    passwordsMatch,
    handleFieldChange,
    toggleVisibility,
    handleSubmit,
    getStrengthColor,
    getStrengthLabel,
  } = useChangePassword();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* ── Alerta de éxito ───────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Icon name="CheckCircle" className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* ── Alerta de error global ────────────────────────────────────────── */}
      {error && !success && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <Icon name="AlertCircle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Campo: Contraseña actual ───────────────────────────────────────── */}
      <PasswordField
        id="actual"
        label="Contraseña Actual"
        value={formData.actual}
        show={visibility.actual}
        error={fieldErrors['actual']}
        onChange={(v) => handleFieldChange('actual', v)}
        onToggle={() => toggleVisibility('actual')}
      />

      {/* ── Campo: Nueva contraseña ───────────────────────────────────────── */}
      <div className="space-y-2">
        <PasswordField
          id="nueva"
          label="Nueva Contraseña"
          value={formData.nueva}
          show={visibility.nueva}
          error={fieldErrors['nueva']}
          onChange={(v) => handleFieldChange('nueva', v)}
          onToggle={() => toggleVisibility('nueva')}
        />

        {/* Barra de fortaleza */}
        {formData.nueva.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-[var(--border-subtle)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getStrengthColor()}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-20 text-right ${getStrengthColor().replace('bg-', 'text-')}`}>
                {getStrengthLabel()}
              </span>
            </div>

            {/* Requisitos */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
              {[
                { key: 'length',    label: 'Mínimo 8 caracteres' },
                { key: 'uppercase', label: 'Al menos una mayúscula' },
                { key: 'lowercase', label: 'Al menos una minúscula' },
                { key: 'number',    label: 'Al menos un número' },
                { key: 'symbol',    label: 'Al menos un símbolo (!@#$…)' },
              ].map(({ key, label }) => {
                const met = requirements[key as keyof typeof requirements];
                return (
                  <li
                    key={key}
                    className={`flex items-center gap-2 transition-colors ${
                      met ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <Icon
                      name={met ? 'CheckCircle' : 'Circle'}
                      className="w-3 h-3 shrink-0"
                    />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ── Campo: Confirmar contraseña ───────────────────────────────────── */}
      <div className="space-y-1">
        <PasswordField
          id="confirmar"
          label="Confirmar Nueva Contraseña"
          value={formData.confirmar}
          show={visibility.confirmar}
          onChange={(v) => handleFieldChange('confirmar', v)}
          onToggle={() => toggleVisibility('confirmar')}
        />
        {formData.confirmar.length > 0 && (
          <p
            className={`text-xs font-bold flex items-center gap-1 ${
              passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500'
            }`}
          >
            <Icon name={passwordsMatch ? 'CheckCircle' : 'XCircle'} className="w-3 h-3" />
            {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
          </p>
        )}
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending || !allRequirementsMet || !passwordsMatch || !formData.actual}
          className="
            w-full py-5 rounded-[2rem]
            bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600
            text-white font-black text-xs uppercase tracking-[0.2em]
            shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25
            hover:shadow-xl hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            flex items-center justify-center gap-3
            transition-all duration-200
          "
        >
          {isPending ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
              Actualizando…
            </>
          ) : (
            <>
              <Icon name="ShieldCheck" className="w-5 h-5" />
              Actualizar Contraseña
            </>
          )}
        </button>
      </div>
    </form>
  );
}