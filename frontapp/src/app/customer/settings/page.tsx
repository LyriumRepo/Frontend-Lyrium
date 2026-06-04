'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { settingsApi, NotificationSettings } from '@/shared/lib/api/settingsRepository';

const defaultSettings: NotificationSettings = {
  id: 0,
  user_id: 0,
  email_order: true,
  email_promotions: true,
  email_newsletter: false,
  sms_order: false,
  push_notifications: true,
};

const NOTIFICATION_LEGEND: { key: keyof NotificationSettings; icon: string; label: string; description: string; channel: string }[] = [
  { key: 'email_order', icon: 'ShoppingBag', label: 'Pedidos (Correo)', description: 'Actualizaciones de estado de tus pedidos: confirmación, envío, entrega.', channel: 'Email' },
  { key: 'email_promotions', icon: 'Tag', label: 'Promociones (Correo)', description: 'Ofertas especiales, descuentos y cupones exclusivos para ti.', channel: 'Email' },
  { key: 'email_newsletter', icon: 'Newspaper', label: 'Boletín Informativo (Correo)', description: 'Novedades, artículos de bienestar y contenido educativo.', channel: 'Email' },
  { key: 'sms_order', icon: 'MessageSquare', label: 'SMS de Pedidos', description: 'Mensajes de texto al celular con actualizaciones importantes de tus pedidos.', channel: 'SMS' },
  { key: 'push_notifications', icon: 'Bell', label: 'Notificaciones Push', description: 'Alertas instantáneas en tu dispositivo móvil sobre pedidos y promociones.', channel: 'Push' },
];

export default function CustomerSettingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setFetching(true);
      const data = await settingsApi.get();
      setSettings(data);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, [loading, isAuthenticated, router, loadSettings]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsApi.update({
        email_order: settings.email_order,
        email_promotions: settings.email_promotions,
        email_newsletter: settings.email_newsletter,
        sms_order: settings.sms_order,
        push_notifications: settings.push_notifications,
      });
      setSettings(updated);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Configuración
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
            Gestiona tus preferencias y notificaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLegend(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all border border-gray-200 dark:border-[var(--border-subtle)]"
          >
            <Icon name="Info" className="w-4 h-4" />
            Leyenda
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm bg-sky-500 dark:bg-[var(--brand-green)] text-white hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all disabled:opacity-60"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 flex items-center gap-5 relative overflow-hidden">
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[var(--bg-muted)] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="ShoppingBag" className="w-4 h-4 text-sky-500 dark:text-[var(--icons-green)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Pedidos</p>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Actualizaciones de estado de tus pedidos por correo</p>
                    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Predeterminado</span>
                  </div>
                </div>
              <button
                onClick={() => handleToggle('email_order')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.email_order ? 'bg-sky-500 dark:bg-[var(--icons-green)]' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                  }`}
              >
                <span className={`absolute left-0 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.email_order ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[var(--bg-muted)] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Tag" className="w-4 h-4 text-sky-500 dark:text-[var(--icons-green)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Promociones</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Ofertas, descuentos y cupones exclusivos por correo</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email_promotions')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.email_promotions ? 'bg-sky-500 dark:bg-[var(--icons-green)]' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                  }`}
              >
                <span className={`absolute left-0 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.email_promotions ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[var(--bg-muted)] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Newspaper" className="w-4 h-4 text-sky-500 dark:text-[var(--icons-green)]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Boletín Informativo</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Novedades, artículos de bienestar y contenido educativo</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email_newsletter')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.email_newsletter ? 'bg-sky-500 dark:bg-[var(--icons-green)]' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                  }`}
              >
                <span className={`absolute left-0 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.email_newsletter ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 via-sky-400 to-sky-500 dark:from-[var(--brand-green)] dark:via-[var(--brand-green-hover)] dark:to-[var(--brand-green)] p-8 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="Phone" className="w-6 h-6 text-white" />
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
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="MessageSquare" className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">SMS de Pedidos</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Mensajes de texto al celular con actualizaciones de tus pedidos</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sms_order')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.sms_order ? 'bg-sky-500 dark:bg-[var(--icons-green)]' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                  }`}
              >
                <span className={`absolute left-0 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.sms_order ? 'translate-x-7' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Bell" className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Notificaciones Push</p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Alertas instantáneas en tu dispositivo móvil sobre pedidos y promociones</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('push_notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.push_notifications ? 'bg-sky-500 dark:bg-[var(--icons-green)]' : 'bg-gray-300 dark:bg-[var(--border-subtle)]'
                  }`}
              >
                <span
                  className={`absolute left-0 top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.push_notifications
                      ? 'translate-x-7': 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLegend(false)}>
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon name="BookOpen" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Leyenda de Notificaciones</h3>
                    <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Conoce cada tipo de notificación</p>
                  </div>
                </div>
                <button onClick={() => setShowLegend(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {NOTIFICATION_LEGEND.map((item) => (
                <div key={item.key} className="p-5 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-center shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] shrink-0">
                      <Icon name={item.icon as any} className="w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-black text-sm text-gray-800 dark:text-[var(--text-primary)]">{item.label}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-[#2A5A4D] text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-[var(--icons-green)]">
                          {item.channel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-3">
                <Icon name="Info" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Los cambios que realices se aplicarán automáticamente al guardar. Las notificaciones de pedidos (correo y SMS) y las notificaciones push son independientes: puedes activar una sin afectar a las otras.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowLegend(false)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
