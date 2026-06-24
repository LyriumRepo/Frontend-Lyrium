'use client';

import { useState, useTransition } from 'react';
import { changePasswordAction } from '@/shared/lib/actions/change-password';
import type {
  PasswordFormData,
  PasswordVisibility,
  PasswordRequirements,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: PasswordFormData = { actual: '', nueva: '', confirmar: '' };
const EMPTY_VISIBILITY: PasswordVisibility = {
  actual: false,
  nueva: false,
  confirmar: false,
};
const EMPTY_REQUIREMENTS: PasswordRequirements = {
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  symbol: false,
};

function evaluateRequirements(password: string): PasswordRequirements {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function calcStrength(req: PasswordRequirements): number {
  return Object.values(req).filter(Boolean).length * 20;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChangePassword() {
  const [formData, setFormData] = useState<PasswordFormData>(EMPTY_FORM);
  const [visibility, setVisibility] =
    useState<PasswordVisibility>(EMPTY_VISIBILITY);
  const [requirements, setRequirements] =
    useState<PasswordRequirements>(EMPTY_REQUIREMENTS);
  const [strength, setStrength] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const allRequirementsMet = Object.values(requirements).every(Boolean);
  const passwordsMatch =
    formData.confirmar.length > 0 && formData.nueva === formData.confirmar;

  function handleFieldChange(field: keyof PasswordFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'nueva') {
      const req = evaluateRequirements(value);
      setRequirements(req);
      setStrength(calcStrength(req));
    }
  }

  function toggleVisibility(field: keyof PasswordVisibility) {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function resetForm() {
    setFormData(EMPTY_FORM);
    setVisibility(EMPTY_VISIBILITY);
    setRequirements(EMPTY_REQUIREMENTS);
    setStrength(0);
    setError(null);
    setFieldErrors({});
    setSuccess(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    if (!allRequirementsMet) {
      setError(
        'La nueva contraseña no cumple todos los requisitos de seguridad.',
      );
      return;
    }
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // ── Leer el token aquí, en el cliente, antes de entrar al Server Action ──
    const token = localStorage.getItem('laravel_token') ?? '';

    startTransition(async () => {
      const result = await changePasswordAction({
        current_password: formData.actual,
        password: formData.nueva,
        password_confirmation: formData.confirmar,
        token, // ← se pasa al server action
      });

      if (result.success) {
        setSuccess(result.message);
        resetForm();
      } else {
        if (result.errors) {
          const mapped: Record<string, string> = {};
          if (result.errors.actual?.[0]) {
            mapped['actual'] = result.errors.actual[0];
          }
          if (result.errors.nueva?.[0]) {
            mapped['nueva'] = result.errors.nueva[0];
          }
          setFieldErrors(mapped);
        }
        setError(result.message);
      }
    });
  }

  function getStrengthColor(): string {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-sky-500';
    return 'bg-green-500';
  }

  function getStrengthLabel(): string {
    if (strength <= 20) return 'Muy débil';
    if (strength <= 40) return 'Débil';
    if (strength <= 60) return 'Regular';
    if (strength <= 80) return 'Buena';
    return 'Muy fuerte';
  }

  return {
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
    resetForm,
    getStrengthColor,
    getStrengthLabel,
  };
}
