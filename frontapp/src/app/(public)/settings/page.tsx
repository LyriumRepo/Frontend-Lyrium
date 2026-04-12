'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-[var(--text-primary)]">
            Configuración
          </h1>
          <p className="text-slate-500 dark:text-[var(--text-muted)] mt-2">
            Personaliza tu experiencia
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Icon name="Moon" className="w-5 h-5 text-sky-500" />
              Apariencia
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-[var(--text-primary)]">Modo Oscuro</p>
                <p className="text-sm text-slate-500 dark:text-[var(--text-muted)]">Cambia el tema de la aplicación</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-sky-500' : 'bg-slate-200 dark:bg-[var(--border-subtle)]'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Icon name="Bell" className="w-5 h-5 text-sky-500" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 dark:text-[var(--text-primary)]">Notificaciones push</p>
                  <p className="text-sm text-slate-500 dark:text-[var(--text-muted)]">Recibe alertas en tu dispositivo</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-14 h-8 rounded-full transition-colors ${notifications ? 'bg-sky-500' : 'bg-slate-200 dark:bg-[var(--border-subtle)]'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700 dark:text-[var(--text-primary)]">Actualizaciones por email</p>
                  <p className="text-sm text-slate-500 dark:text-[var(--text-muted)]">Recibe noticias y ofertas</p>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`w-14 h-8 rounded-full transition-colors ${emailUpdates ? 'bg-sky-500' : 'bg-slate-200 dark:bg-[var(--border-subtle)]'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${emailUpdates ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Icon name="Shield" className="w-5 h-5 text-sky-500" />
              Privacidad
            </h2>
            <div className="space-y-3">
              <a href="/politicasdeprivacidad" className="block p-3 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-xl hover:bg-sky-100 dark:hover:bg-[#2A3F33] transition-colors">
                <p className="font-medium text-slate-700 dark:text-[var(--text-primary)]">Política de Privacidad</p>
              </a>
              <a href="/terminoscondiciones" className="block p-3 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-xl hover:bg-sky-100 dark:hover:bg-[#2A3F33] transition-colors">
                <p className="font-medium text-slate-700 dark:text-[var(--text-primary)]">Términos y Condiciones</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
