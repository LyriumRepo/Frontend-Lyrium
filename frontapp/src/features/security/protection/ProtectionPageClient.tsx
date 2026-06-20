'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';

export default function ProtectionPageClient() {
  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader title="Protección" subtitle="Reglas y políticas de protección de la plataforma" icon="ShieldCheck" />
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-12">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="ShieldCheck" className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Protección</h3>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
          Módulo en preparación. Aquí se gestionarán las políticas de protección y reglas de seguridad.
        </p>
      </div>
    </div>
  );
}
