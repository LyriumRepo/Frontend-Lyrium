'use client';

import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import './welcome-tour.css';

interface WelcomeGuideProps {
  userId: number | string;
}

// Pasos que señalan el ítem real del menú lateral (requiere que el sidebar esté
// visible — en móvil el sidebar vive fuera de pantalla salvo que se abra manualmente).
const SPOTLIGHT_STEPS: DriveStep[] = [
  {
    element: '[data-tour="nav-profile"]',
    popover: {
      title: 'Completa tu perfil',
      description: 'Agrega tu teléfono, fecha de cumpleaños y foto. Así te reconocemos mejor y no te perderás ninguna promoción.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-orders"]',
    popover: {
      title: 'Sigue tus pedidos y favoritos',
      description: '"Mis Pedidos" muestra el estado de tus compras en tiempo real. Y no olvides revisar tu "Lista de Deseos".',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-support"]',
    popover: {
      title: '¿Necesitas ayuda?',
      description: 'Escríbenos por el chat con vendedores o entra a Soporte Lyrium — un especialista te responde a la brevedad.',
      side: 'right',
      align: 'start',
    },
  },
];

// Alternativa sin resaltar elementos — mismo contenido, popovers centrados.
// Se usa en pantallas angostas o si el sidebar aún no está en el DOM.
const FALLBACK_STEPS: DriveStep[] = SPOTLIGHT_STEPS.map(({ popover }) => ({ popover }));

const INTRO_STEP: DriveStep = {
  popover: {
    title: '¡Bienvenido a Lyrium!',
    description: 'Esta es tu cuenta personal. Te mostramos rápidamente por dónde empezar — puedes omitir esto cuando quieras.',
  },
};

function storageKey(userId: number | string) {
  return `lyrium_welcome_guide_seen_${userId}`;
}

function targetsReady() {
  return SPOTLIGHT_STEPS.every(
    (step) => typeof step.element === 'string' && document.querySelector(step.element),
  );
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

// El sidebar (SmartSidebar) renderiza un esqueleto vacío en su primer render
// (evita mismatch de hidratación) y recién monta los links reales en su propio
// useEffect — se espera unos frames a que ese ciclo termine antes de resolver
// si el spotlight tiene dónde apuntar; si no, siempre caería al fallback.
function waitForTargets(maxAttempts: number, onDone: (ready: boolean) => void) {
  waitFor(targetsReady, maxAttempts, onDone);
}

// El toast "¡Bienvenido/a de vuelta!" (CustomerWelcomeToast) vive en el layout
// y se autocierra a los ~8s. Se espera explícitamente a que desaparezca (o a
// que nunca haya aparecido) antes de arrancar el tour, en vez de depender de
// que las duraciones de ambas animaciones coincidan por casualidad.
function waitForWelcomeToastGone(onDone: () => void) {
  waitFor(() => !document.querySelector('[data-lyrium-welcome-toast]'), 800, () => onDone());
}

export default function WelcomeGuide({ userId }: WelcomeGuideProps) {
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

    waitForWelcomeToastGone(() => {
      if (cancelled) return;
      waitForTargets(30, (ready) => {
        if (cancelled) return;
        startTour(isDesktop && ready ? SPOTLIGHT_STEPS : FALLBACK_STEPS);
      });
    });

    return () => {
      cancelled = true;
      activeTour?.destroy();
    };
  }, [userId]);

  return null;
}
