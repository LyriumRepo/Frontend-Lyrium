'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface RegistroLoadingModalProps {
  isOpen: boolean;
  currentStep: string;
}

const STEP_MESSAGES: Record<string, string> = {
  validar: 'Verificando tu información...',
  sunat: 'Estamos consultando tu RUC en SUNAT...',
  evidencia: 'Estamos evaluando tu documentación...',
  score: 'Estamos analizando los resultados...',
  resultado: 'Preparando el resultado final...',
};

export function RegistroLoadingModal({ isOpen, currentStep }: RegistroLoadingModalProps) {
  const [message, setMessage] = useState(STEP_MESSAGES.validar);

  useEffect(() => {
    if (isOpen && currentStep && STEP_MESSAGES[currentStep]) {
      setMessage(STEP_MESSAGES[currentStep]);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-[var(--border-subtle)] text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-500 dark:text-teal-400 animate-spin" />
        </div>

        <p className="text-lg font-bold text-[var(--text-primary)]">
          {message}
        </p>

        <p className="text-xs text-[var(--text-muted)] mt-6">
          No cierres ni recargues esta ventana.
        </p>
      </div>
    </div>
  );
}