'use client';

import { useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/features/customer/onboarding/welcome-tour.css';
import { POST_WELCOME_DELAY_MS, waitFor, waitForWelcomeToastGone } from '@/features/customer/onboarding/tourHelpers';
import type { VendorProfileData } from '@/features/seller/profile/types';

interface SellerProfileCompletionGuideProps {
  userId: number | string;
  profile: VendorProfileData;
}

/**
 * Mismos campos y mismo orden que `requiredFields` en ProfilePageClient.tsx
 * (empresariales → admin del panel → fiscal/financiero) — la guía solo
 * resalta los que el propio formulario ya exige para operar al 100%.
 */
const REQUIRED_FIELDS: { key: keyof VendorProfileData; label: string }[] = [
  { key: 'razon_social', label: 'Razón Social' },
  { key: 'ruc', label: 'RUC' },
  { key: 'rep_legal_nombre', label: 'Representante Legal' },
  { key: 'rep_legal_dni', label: 'DNI Representante' },
  { key: 'admin_nombre', label: 'Nombres y Apellidos' },
  { key: 'admin_email', label: 'Email de Gestión' },
  { key: 'direccion_fiscal', label: 'Dirección Fiscal' },
  { key: 'cuenta_bcp', label: 'Cuenta BCP' },
  { key: 'cci', label: 'CCI' },
];

type Breakpoint = 'desktop' | 'tablet' | 'mobile';

function getBreakpoint(): Breakpoint {
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 768px)').matches) return 'tablet';
  return 'mobile';
}

/** El spotlight (overlay + recorte) se mantiene en los 3 rangos; solo cambian lado/holgura. */
const STAGE_CONFIG: Record<Breakpoint, { side: 'top' | 'bottom'; stagePadding: number; stageRadius: number }> = {
  desktop: { side: 'top', stagePadding: 6, stageRadius: 16 },
  tablet: { side: 'bottom', stagePadding: 6, stageRadius: 14 },
  mobile: { side: 'bottom', stagePadding: 2, stageRadius: 8 },
};

function storageKey(userId: number | string) {
  return `lyrium_seller_profile_reminder_seen_${userId}`;
}

// Recordatorio de "Mis Datos" incompleto para el vendedor: replica el patrón
// de ProfileCompletionGuide (cliente), una vez por sesión (sessionStorage),
// esperando la misma cadena de bienvenida del módulo vendedor. A diferencia
// del WelcomeGuide del vendedor, este NUNCA cae a popovers sin resaltado:
// el spotlight se ajusta por breakpoint pero siempre está presente.
export default function SellerProfileCompletionGuide({ userId, profile }: SellerProfileCompletionGuideProps) {
  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey(userId))) return;

    let cancelled = false;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    let activeTour: ReturnType<typeof driver> | null = null;

    // Cadena estricta: toast desaparece → popover del WelcomeGuide desaparece → 1.5s → tour
    waitForWelcomeToastGone(() => {
      if (cancelled) return;
      waitFor(() => !document.querySelector('.driver-popover'), 900, (guideGone) => {
        if (cancelled || !guideGone) return;

        delayTimer = setTimeout(() => {
          if (cancelled) return;

          const currentProfile = profileRef.current;
          const missing = REQUIRED_FIELDS.filter(
            ({ key }) => !String(currentProfile[key] ?? '').trim(),
          );

          const { side, stagePadding, stageRadius } = STAGE_CONFIG[getBreakpoint()];

          const steps: DriveStep[] = missing
            .filter(({ key }) => document.querySelector(`#${key}`))
            .map(({ key, label }) => ({
              element: `#${key}`,
              popover: {
                title: `Te falta: ${label}`,
                description: `Completa tu ${label.toLowerCase()} en Mis Datos para operar al 100%.`,
                side,
                align: 'start' as const,
              },
            }));

          if (steps.length === 0) return;

          sessionStorage.setItem(storageKey(userId), '1');

          const tour = driver({
            allowClose: true,
            overlayClickBehavior: 'close',
            overlayColor: document.documentElement.classList.contains('dark') ? '#000000' : '#0f172a',
            overlayOpacity: 0.6,
            stagePadding,
            stageRadius,
            popoverClass: 'lyrium-tour-popover',
            showProgress: steps.length > 1,
            progressText: 'Paso {{current}} de {{total}}',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Atrás',
            doneBtnText: 'Entendido',
            steps,
          });
          activeTour = tour;
          tour.drive();
        }, POST_WELCOME_DELAY_MS);
      });
    });

    return () => {
      cancelled = true;
      if (delayTimer) clearTimeout(delayTimer);
      activeTour?.destroy();
    };
  }, [userId]);

  return null;
}
