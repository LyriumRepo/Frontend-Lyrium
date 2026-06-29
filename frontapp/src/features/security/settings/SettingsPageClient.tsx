'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';

export default function SettingsPageClient() {
  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader title="Configuración" subtitle="Ajustes del panel de seguridad" icon="Settings" />
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-12">
        <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="Settings" className="w-8 h-8 text-sky-500" />
        </div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Configuración</h3>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
          Módulo en preparación. Aquí se gestionarán las configuraciones avanzadas de seguridad.
        </p>
      </div>
    </div>
  );
}
