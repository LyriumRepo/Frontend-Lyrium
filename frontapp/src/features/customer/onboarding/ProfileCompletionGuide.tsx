'use client';

import { useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './welcome-tour.css';

interface MissingField {
  key: string;
  label: string;
}

interface ProfileCompletionGuideProps {
  userId: number | string;
  missing: MissingField[];
}

function sessionKey(userId: number | string) {
  return `lyrium_profile_reminder_shown_${userId}`;
}

function waitFor(condition: () => boolean, maxAttempts: number, onDone: (ok: boolean) => void) {
  let attempts = 0;
  const check = () => {
    if (condition()) return onDone(true);
    attempts += 1;
    if (attempts >= maxAttempts) return onDone(false);
    requestAnimationFrame(check);
  };
  check();
}

// Recordatorio de perfil incompleto: se muestra una vez por sesión de
// navegador (no una sola vez para siempre, como el WelcomeGuide) mientras
// falten campos. Espera a que el WelcomeGuide (si está activo) termine y
// da un respiro de 5–12s tras sus animaciones antes de aparecer, para no
// saturar al usuario apenas entra.
export default function ProfileCompletionGuide({ userId, missing }: ProfileCompletionGuideProps) {
  const missingRef = useRef(missing);

  useEffect(() => {
    missingRef.current = missing;
  }, [missing]);

  useEffect(() => {
    if (sessionStorage.getItem(sessionKey(userId))) return;

    let cancelled = false;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    let activeTour: ReturnType<typeof driver> | null = null;

    const startAfterGuide = setTimeout(() => {
      waitFor(() => !document.querySelector('.driver-popover'), 900, (guideGone) => {
        if (cancelled || !guideGone) return;

        const delay = 5000 + Math.round(Math.random() * 7000);
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

          sessionStorage.setItem(sessionKey(userId), '1');

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
        }, delay);
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(startAfterGuide);
      if (delayTimer) clearTimeout(delayTimer);
      activeTour?.destroy();
    };
  }, [userId]);

  return null;
}
