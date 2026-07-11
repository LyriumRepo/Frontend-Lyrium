// Tokens compartidos por los modales de bienvenida (vendedor, cliente) y cumpleaños.
// El texto en modo día usaba un verde-negro translúcido con contraste ~1.8:1
// (por debajo del mínimo WCAG AA de 4.5:1). Se reemplaza por tonos celeste sólidos.
// El modo noche no cambia.
export const WELCOME_MODAL_LIGHT_TEXT = {
    label: '#0c4a6e',
    subtitle: '#075985',
} as const;

export const WELCOME_MODAL_LIGHT_BADGE = {
    badgeBg: 'rgba(3,105,161,0.14)',
    badgeBorder: '1px solid rgba(3,105,161,0.45)',
    badgeColor: '#075985',
} as const;

// El fondo de tarjeta en modo día era casi blanco puro (rgba 255,255,255 con un
// dejo de teal casi imperceptible) más un shimmer blanco al 60% que lo lavaba
// más — se leía plano y con poco contraste. Se sube la saturación del tinte
// celeste/teal y se atenúa el shimmer para que el texto oscuro de arriba resalte.
export const WELCOME_MODAL_LIGHT_CARD = {
    cardBg: 'linear-gradient(158deg, rgba(207,250,244,0.97) 0%, rgba(186,246,255,0.97) 55%, rgba(219,253,249,0.97) 100%)',
    shimmer: 'linear-gradient(108deg, transparent 32%, rgba(255,255,255,0.35) 50%, transparent 68%)',
} as const;
