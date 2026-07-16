'use client';

import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/features/customer/onboarding/welcome-tour.css';

interface WelcomeGuideProps {
  userId: number | string;
}

const SPOTLIGHT_STEPS: DriveStep[] = [
  {
    element: '[data-tour="nav-mi-tienda"]',
    popover: {
      title: 'Configura tu tienda',
      description: 'Personaliza el logo, banners, colores y plantilla de tu escaparate. Es lo primero que ven tus clientes.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-catalogo"]',
    popover: {
      title: 'Gestiona tus productos',
      description: 'Agrega, edita y organiza tu catálogo. Sube fotos, define precios y controla las categorías.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-ventas"]',
    popover: {
      title: 'Monitorea tus ventas',
      description: 'Aquí ves el estado de cada transacción: pedidos, pagos, envíos y devoluciones en tiempo real.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-finanzas"]',
    popover: {
      title: 'Centro de Finanzas',
      description: 'Tus KPIs clave: ingresos, ROI, ticket promedio, desempeño y más. Todo lo que necesitas para tomar decisiones.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-chat"]',
    popover: {
      title: 'Chat con tus clientes',
      description: 'Responde consultas, resuelve dudas y brinda soporte directo. La comunicación en tiempo real fideliza.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-ayuda"]',
    popover: {
      title: '¿Necesitas ayuda?',
      description: 'Soporte Lyrium siempre disponible. Abre un ticket y un especialista te asiste con cualquier incidencia.',
      side: 'right',
      align: 'start',
    },
  },
];

const FALLBACK_STEPS: DriveStep[] = SPOTLIGHT_STEPS.map(({ popover }) => ({ popover }));

const INTRO_STEP: DriveStep = {
  popover: {
    title: '¡Bienvenido a tu panel de vendedor!',
    description: 'Te mostramos rápidamente las secciones más importantes para que arranques con todo.',
  },
};

function storageKey(userId: number | string) {
  return `lyrium_seller_welcome_guide_seen_${userId}`;
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

function waitForTargets(maxAttempts: number, onDone: (ready: boolean) => void) {
  waitFor(targetsReady, maxAttempts, onDone);
}

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
