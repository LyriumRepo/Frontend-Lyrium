'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

interface RegistroLoadingModalProps {
  isOpen: boolean;
  currentStep: string;
}

const STEPS: Step[] = [
  { id: 'validar', label: 'Validando datos del formulario', status: 'pending' },
  { id: 'sunat', label: 'Consultando SUNAT', status: 'pending' },
  { id: 'evidencia', label: 'Evaluando evidencia', status: 'pending' },
  { id: 'score', label: 'Calculando puntaje de riesgo', status: 'pending' },
  { id: 'resultado', label: 'Generando resultado', status: 'pending' },
];

const STEP_ORDER = ['validar', 'sunat', 'evidencia', 'score', 'resultado'];

export function RegistroLoadingModal({ isOpen, currentStep }: RegistroLoadingModalProps) {
  const [steps, setSteps] = useState<Step[]>(STEPS);

  useEffect(() => {
    if (!isOpen) {
      setSteps(STEPS);
      return;
    }
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    setSteps(STEPS.map((s, i) => {
      if (i < currentIndex) return { ...s, status: 'done' };
      if (i === currentIndex) return { ...s, status: 'loading' };
      return { ...s, status: 'pending' };
    }));
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-md p-8 border border-[var(--border-subtle)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-500 dark:text-[var(--icons-green)] animate-spin" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Evaluando tu solicitud
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            El RPA está analizando la información...
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                step.status === 'loading'
                  ? 'bg-sky-50 dark:bg-sky-900/10'
                  : step.status === 'done'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10'
                  : ''
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {step.status === 'loading' && (
                  <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                )}
                {step.status === 'done' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {step.status === 'pending' && (
                  <div className="w-3 h-3 rounded-full bg-[var(--border-subtle)]" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  step.status === 'loading'
                    ? 'text-sky-600 dark:text-sky-400'
                    : step.status === 'done'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : step.status === 'pending'
                    ? 'text-[var(--text-secondary)]'
                    : 'text-rose-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
