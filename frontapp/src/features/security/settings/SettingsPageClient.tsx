'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseErrorState from '@/components/ui/BaseErrorState';
import BaseModal from '@/components/ui/BaseModal';
import { useSecuritySettings } from '@/features/admin/security/hooks/useSecuritySettings';

export default function SettingsPageClient() {
  const { settings, loading, error, refetch, updateSettings, resetSettings, isMutating } = useSecuritySettings();
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        autoblock_enabled: settings.autoblock_enabled,
        autoblock_threshold: String(settings.autoblock_threshold),
        autoblock_window_minutes: String(settings.autoblock_window_minutes),
        autoblock_duration_minutes: String(settings.autoblock_duration_minutes),
        whitelist_enabled: settings.whitelist_enabled,
        max_login_attempts: String(settings.max_login_attempts),
      });
    }
  }, [settings]);

  const handleToggle = (key: string) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumber = (key: string, value: string) => {
    if (/^\d*$/.test(value)) setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaved(false);
    await updateSettings({
      autoblock_enabled: Boolean(form.autoblock_enabled),
      autoblock_threshold: parseInt(form.autoblock_threshold as string) || 10,
      autoblock_window_minutes: parseInt(form.autoblock_window_minutes as string) || 10,
      autoblock_duration_minutes: parseInt(form.autoblock_duration_minutes as string) || 20,
      whitelist_enabled: Boolean(form.whitelist_enabled),
      max_login_attempts: parseInt(form.max_login_attempts as string) || 10,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    await resetSettings();
    setShowResetConfirm(false);
  };

  if (loading) return <BaseLoading message="Cargando configuración..." />;
  if (error) return <BaseErrorState title="Error" message={error} onRetry={refetch} icon="Settings" />;

  const FieldCard = ({ label, description, children }: { label: string; description: string; children: React.ReactNode }) => (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-[var(--text-primary)]">{label}</h4>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center">
            <Settings className="w-7 h-7 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Configuración de Seguridad</h1>
            <p className="text-sm text-[var(--text-secondary)] font-semibold">Ajusta los parámetros de protección del sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <BaseButton onClick={() => refetch()} variant="outline" leftIcon="RefreshCw" size="sm">Refrescar</BaseButton>
          <BaseButton onClick={() => setShowResetConfirm(true)} variant="outline" leftIcon="RotateCcw" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">Restablecer</BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldCard label="Auto-bloqueo" description="Bloqueo automático de IPs por intentos fallidos consecutivos">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">{form.autoblock_enabled ? 'Activado' : 'Desactivado'}</span>
            <Toggle value={Boolean(form.autoblock_enabled)} onChange={() => handleToggle('autoblock_enabled')} />
          </div>
        </FieldCard>

        <FieldCard label="Whitelist" description="Permite a IPs en lista blanca saltar el rate limiting">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">{form.whitelist_enabled ? 'Activada' : 'Desactivada'}</span>
            <Toggle value={Boolean(form.whitelist_enabled)} onChange={() => handleToggle('whitelist_enabled')} />
          </div>
        </FieldCard>

        <FieldCard label="Umbral de auto-bloqueo" description="Intentos fallidos de login antes de bloquear la IP">
          <input type="text" inputMode="numeric" value={form.autoblock_threshold as string}
            onChange={(e) => handleNumber('autoblock_threshold', e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
        </FieldCard>

        <FieldCard label="Ventana de tiempo" description="Minutos en los que se evalúan los intentos fallidos">
          <input type="text" inputMode="numeric" value={form.autoblock_window_minutes as string}
            onChange={(e) => handleNumber('autoblock_window_minutes', e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
        </FieldCard>

        <FieldCard label="Duración del bloqueo" description="Minutos que dura un bloqueo automático (0 = indefinido)">
          <input type="text" inputMode="numeric" value={form.autoblock_duration_minutes as string}
            onChange={(e) => handleNumber('autoblock_duration_minutes', e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
        </FieldCard>

        <FieldCard label="Intentos máximos de login" description="Intentos por minuto antes de aplicar rate limiting">
          <input type="text" inputMode="numeric" value={form.max_login_attempts as string}
            onChange={(e) => handleNumber('max_login_attempts', e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
        </FieldCard>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
              Configuración guardada correctamente
            </span>
          )}
        </div>
        <BaseButton onClick={handleSave} variant="primary" isLoading={isMutating} leftIcon="Save" size="lg">
          Guardar Configuración
        </BaseButton>
      </div>

      {/* Reset Confirmation */}
      <BaseModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Restablecer configuración"
        subtitle="SEGURIDAD"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-sm text-[var(--text-secondary)]">Se perderán todos los cambios personalizados y se volverá a los valores por defecto.</p>
          </div>
          <div className="flex justify-end gap-3">
            <BaseButton variant="outline" onClick={() => setShowResetConfirm(false)}>Cancelar</BaseButton>
            <BaseButton variant="danger" onClick={handleReset} isLoading={isMutating}>Restablecer</BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
