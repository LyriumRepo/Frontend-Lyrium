'use client';

import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/features/customer/onboarding/welcome-tour.css';

interface TrainingGuideProps {
  userId: number | string;
}

const SPOTLIGHT_STEPS: DriveStep[] = [
  {
    element: '[data-tour="training-stats"]',
    popover: {
      title: 'Resumen rápido',
      description: 'Aquí ves tus números clave: total de capacitaciones, completadas, obligatorias y categorías disponibles.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="training-progress"]',
    popover: {
      title: 'Tu progreso general',
      description: 'La barra muestra qué porcentaje has completado. ¡Llega al 100% y domina todas las herramientas!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="training-continue"]',
    popover: {
      title: 'Continúa aprendiendo',
      description: 'El siguiente video pendiente aparece aquí. Un solo clic y sigues desde donde lo dejaste.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="training-filters"]',
    popover: {
      title: 'Busca y filtra',
      description: 'Filtra por estado (pendientes / completadas / obligatorias) o por categoría. También puedes buscar por nombre.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="training-card"]',
    popover: {
      title: 'Reproduce un video',
      description: 'Cada tarjeta abre un reproductor. Al terminar, márcala como completada y sigue con la siguiente.',
      side: 'bottom',
      align: 'start',
    },
  },
];

const FALLBACK_STEPS: DriveStep[] = SPOTLIGHT_STEPS.map(({ popover }) => ({ popover }));

const INTRO_STEP: DriveStep = {
  popover: {
    title: '¡Capacitaciones para tu negocio!',
    description: 'Aquí encontrarás videos formativos para impulsar tu tienda. Te mostramos rápidamente los elementos clave de esta pantalla.',
  },
};

function storageKey(userId: number | string) {
  return `lyrium_training_guide_seen_${userId}`;
}

function stepElementExists(step: DriveStep) {
  return typeof step.element === 'string' && !!document.querySelector(step.element);
}

// A diferencia del WelcomeGuide (donde los 5 elementos siempre existen), acá
// "Continúa aprendiendo" y la primera tarjeta solo se renderizan si el
// vendedor tiene capacitaciones pendientes / al menos una categoría con
// resultados. Exigir que existan los 5 a la vez hacía que el tour cayera
// siempre al modo centrado (sin señalar nada) apenas faltaba uno. En vez de
// eso, se resalta cada elemento que sí existe y se omiten los que no.
function waitAndBuildSteps(maxAttempts: number, onDone: (steps: DriveStep[]) => void) {
  let attempts = 0;
  const check = () => {
    const present = SPOTLIGHT_STEPS.filter(stepElementExists);
    // Espera unos frames por si el DOM todavía no terminó de pintar, salvo
    // que ya estén todos — ahí no hay nada más que esperar.
    if (present.length === SPOTLIGHT_STEPS.length || attempts >= maxAttempts) {
      return onDone(present);
    }
    attempts += 1;
    requestAnimationFrame(check);
  };
  check();
}

export default function TrainingGuide({ userId }: TrainingGuideProps) {
  useEffect(() => {
    if (localStorage.getItem(storageKey(userId))) return;

    let cancelled = false;
    let activeTour: ReturnType<typeof driver> | null = null;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    const startTour = (bodySteps: DriveStep[]) => {
      const tour = driver({
        allowClose: true,
        overlayClickBehavior: 'close',
        overlayColor: document.documentElement.classList.contains('dark') ? '#000000' : '#0f172a',
        overlayOpacity: 0.6,
        stagePadding: 6,
        stageRadius: 16,
        popoverClass: 'lyrium-tour-popover',
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Atrás',
        doneBtnText: 'Entendido',
        onDestroyed: () => {
          localStorage.setItem(storageKey(userId), '1');
        },
        steps: [INTRO_STEP, ...bodySteps],
      });
      activeTour = tour;
      tour.drive();
    };

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      if (!isDesktop) {
        startTour(FALLBACK_STEPS);
        return;
      }

      waitAndBuildSteps(30, (presentSteps) => {
        if (cancelled) return;
        startTour(presentSteps.length > 0 ? presentSteps : FALLBACK_STEPS);
      });
    });

    return () => {
      cancelled = true;
      activeTour?.destroy();
      cancelAnimationFrame(raf);
    };
  }, [userId]);

  return null;
}
