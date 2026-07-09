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
