// Helpers compartidos por los tours de onboarding (driver.js) — WelcomeGuide
// (cliente y vendedor) y ProfileCompletionGuide. Unifica la espera de la
// animación de bienvenida y el criterio de "usuario nuevo" para que ambas
// guías se comporten igual en los dos módulos.

/** Ventana de tiempo tras el registro durante la cual se considera "nuevo" al usuario. */
export const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/** Pausa tras el fin de la animación de bienvenida antes de lanzar la guía. */
export const POST_WELCOME_DELAY_MS = 1500;

// IMPORTANTE: la primera verificación se difiere un frame con requestAnimationFrame
// en vez de llamarse de forma síncrona. React monta los efectos de hijos ANTES que
// los de sus padres (post-order): si este helper revisara el DOM de inmediato, un
// componente hijo (p. ej. WelcomeGuide, anidado dentro de {children}) podría
// resolver su espera en el instante 0, antes de que sus hermanos posteriores en el
// JSX (los toasts / el marcador del secuenciador) alcancen a montar su propio efecto
// y escribir el marcador en el DOM. Diferir un frame le da tiempo a TODOS los
// efectos del commit inicial a correr antes de la primera comprobación real.
export function waitFor(condition: () => boolean, maxAttempts: number, onDone: (ok: boolean) => void) {
  let attempts = 0;
  const check = () => {
    if (condition()) return onDone(true);
    attempts += 1;
    if (attempts >= maxAttempts) return onDone(false);
    requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
}

// El toast de bienvenida (CustomerWelcomeToast / SellerWelcomeToast) y —solo en el
// módulo cliente— el BirthdayToast viven en el layout de cada módulo. En el módulo
// cliente, `CustomerLayoutClient` secuencia bienvenida → cumpleaños → fin y mantiene
// el marcador `[data-lyrium-welcome-toast]` presente de forma continua durante toda
// esa ventana (sin huecos entre una animación y la siguiente), así que basta con
// esperar a que ese único marcador desaparezca antes de lanzar cualquier guía.
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
