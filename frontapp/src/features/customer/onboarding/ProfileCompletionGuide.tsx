'use client';

import { useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './welcome-tour.css';
import { POST_WELCOME_DELAY_MS, waitFor, waitForWelcomeToastGone } from './tourHelpers';

interface MissingField {
  key: string;
  label: string;
}

interface ProfileCompletionGuideProps {
  userId: number | string;
  missing: MissingField[];
}

function storageKey(userId: number | string) {
  return `lyrium_profile_reminder_seen_${userId}`;
}

// Recordatorio de perfil incompleto: se muestra una vez por sesión (sessionStorage)
// para que cada vez que el usuario inicie sesión le recuerde completar su perfil
// si tiene campos faltantes. Espera a que el toast de bienvenida desaparezca,
// luego a que el WelcomeGuide termine, y da 1.5s de respiro antes de aparecer.
export default function ProfileCompletionGuide({ userId, missing }: ProfileCompletionGuideProps) {
  const missingRef = useRef(missing);

  useEffect(() => {
    missingRef.current = missing;
  }, [missing]);

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

          const steps: DriveStep[] = missingRef.current
            .filter(({ key }) => document.querySelector(`#${key}`))
            .map(({ key, label }) => ({
              element: `#${key}`,
              popover: {
                title: `Te falta: ${label}`,
                description: `Añade tu ${label.toLowerCase()} para acercarte al 100% de tu perfil.`,
                side: 'top',
                align: 'start',
              },
            }));

          if (steps.length === 0) return;

          sessionStorage.setItem(storageKey(userId), '1');

          const tour = driver({
            allowClose: true,
            overlayClickBehavior: 'close',
            overlayColor: document.documentElement.classList.contains('dark') ? '#000000' : '#0f172a',
            overlayOpacity: 0.6,
            stagePadding: 6,
            stageRadius: 16,
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
