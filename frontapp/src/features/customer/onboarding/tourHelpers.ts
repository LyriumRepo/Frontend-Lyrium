// Helpers compartidos por los tours de onboarding (driver.js) — WelcomeGuide
// (cliente y vendedor) y ProfileCompletionGuide. Unifica la espera de la
// animación de bienvenida y el criterio de "usuario nuevo" para que ambas
// guías se comporten igual en los dos módulos.

/** Ventana de tiempo tras el registro durante la cual se considera "nuevo" al usuario. */
export const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/** Pausa tras el fin de la animación de bienvenida antes de lanzar la guía. */
export const POST_WELCOME_DELAY_MS = 1500;

export function waitFor(condition: () => boolean, maxAttempts: number, onDone: (ok: boolean) => void) {
  let attempts = 0;
  const check = () => {
    if (condition()) return onDone(true);
    attempts += 1;
    if (attempts >= maxAttempts) return onDone(false);
    requestAnimationFrame(check);
  };
  check();
}

// El toast de bienvenida (CustomerWelcomeToast / SellerWelcomeToast) vive en
// el layout de cada módulo y se autocierra tras su propia animación. Se
// espera explícitamente a que desaparezca (o a que nunca haya aparecido)
// antes de lanzar cualquier guía, en vez de depender de que las duraciones
// coincidan por casualidad.
export function waitForWelcomeToastGone(onDone: () => void) {
  waitFor(() => !document.querySelector('[data-lyrium-welcome-toast]'), 800, () => onDone());
}

/**
 * Un usuario es "nuevo" solo si su cuenta fue creada dentro de la ventana
 * definida — evita que las guías de onboarding reaparezcan para cuentas
 * antiguas que simplemente inician sesión en un navegador/dispositivo nuevo
 * (o que borraron su localStorage). Sin `createdAt` se asume que NO es nuevo
 * (fail-closed): mejor omitir la guía que mostrarla de más.
 */
export function isNewUser(createdAt: string | undefined, windowMs: number = NEW_USER_WINDOW_MS): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < windowMs;
}
