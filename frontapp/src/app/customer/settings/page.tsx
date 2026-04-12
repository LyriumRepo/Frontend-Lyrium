'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface NotificationSettings {
  email_order: boolean;
  email_promotions: boolean;
  email_newsletter: boolean;
  sms_order: boolean;
  push_notifications: boolean;
}

const defaultSettings: NotificationSettings = {
  email_order: true,
  email_promotions: true,
  email_newsletter: false,
  sms_order: false,
  push_notifications: true,
};

export default function CustomerSettingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Configuración guardada correctamente');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Configuración
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tus preferencias y notificaciones
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 text-white hover:bg-sky-600 transition-all"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Icon name="Check" className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 via-violet-500 to-fuchsia-500 p-8 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="Mail" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter leading-none text-white">
                Notificaciones
              </h3>
              <p className="text-[10px] font-bold text-violet-100 uppercase tracking-[0.2em] mt-1">
                Correo Electrónico
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Pedidos</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Recibe actualizaciones de tus pedidos</p>
              </div>
              <button
                onClick={() => handleToggle('email_order')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.email_order ? 'bg-sky-500' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.email_order ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Promociones</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Ofertas y descuentos especiales</p>
              </div>
              <button
                onClick={() => handleToggle('email_promotions')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.email_promotions ? 'bg-sky-500' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.email_promotions ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Newsletter</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Novedades y noticias</p>
              </div>
              <button
                onClick={() => handleToggle('email_newsletter')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.email_newsletter ? 'bg-sky-500' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.email_newsletter ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 p-8 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="Smartphone" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter leading-none text-white">
                Móvil
              </h3>
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-[0.2em] mt-1">
                SMS y Push
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">SMS de Pedidos</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Recibe mensajes de texto</p>
              </div>
              <button
                onClick={() => handleToggle('sms_order')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.sms_order ? 'bg-sky-500' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.sms_order ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Notificaciones Push</p>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Alertas en tu dispositivo</p>
              </div>
              <button
                onClick={() => handleToggle('push_notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.push_notifications ? 'bg-sky-500' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.push_notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
