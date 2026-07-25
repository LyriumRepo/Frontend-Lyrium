// Tokens compartidos por los modales de bienvenida (vendedor, cliente) y cumpleaños.
// Modo día: degradado de marca teal → lima → celeste (mismo que .bg-brand-gradient).
// Modo noche: sin cambios.
export const WELCOME_MODAL_LIGHT_TEXT = {
    label: '#0f766e',
    subtitle: '#0369a1',
} as const;

export const WELCOME_MODAL_LIGHT_BADGE = {
    badgeBg: 'linear-gradient(90deg, rgba(13,148,136,0.14), rgba(190,242,100,0.22), rgba(14,165,233,0.14))',
    badgeBorder: '1px solid rgba(13,148,136,0.40)',
    badgeColor: '#0f766e',
} as const;

export const WELCOME_MODAL_LIGHT_CARD = {
    // Fondo con el mismo recorrido arcoíris del membrete, en tonos pastel (teal-100 → lima-100 → celeste-100)
    cardBg: 'linear-gradient(158deg, rgba(204,251,241,0.97) 0%, rgba(236,252,203,0.95) 50%, rgba(224,242,254,0.97) 100%)',
    shimmer: 'linear-gradient(108deg, transparent 32%, rgba(255,255,255,0.4) 50%, transparent 68%)',
} as const;

// Acentos "arcoíris" (teal → lima → celeste) — mismo degradado que el membrete
// de los módulos (.bg-brand-gradient en globals.css). Solo para modo día: borde
// de la tarjeta, nombre en degradado, orbitas, halo, divisor y barra inferior.
export const WELCOME_MODAL_LIGHT_ACCENT = {
    overlay:        'radial-gradient(ellipse 72% 62% at 50% 38%, rgba(13,148,136,0.16) 0%, rgba(15,23,42,0.70) 82%)',
    cardShadow:     'inset 0 0 0 1.5px rgba(13,148,136,0.25), inset 0 0 80px rgba(190,242,100,0.06), 0 32px 80px rgba(0,0,0,0.30), 0 0 120px rgba(13,148,136,0.10)',
    glowTop:        'radial-gradient(ellipse at 50% -20%, rgba(13,148,136,0.10) 0%, transparent 70%)',
    // Fondo casi blanco (no un tinte translúcido) para que el logo destaque sobre
    // el degradado pastel de la tarjeta — con solo tinte, el logo se perdía.
    logoBg:         'rgba(255,255,255,0.92)',
    logoBorder:     '1px solid rgba(13,148,136,0.28)',
    logoShadow:     '0 4px 16px rgba(13,148,136,0.18)',
    divider:        'linear-gradient(90deg, transparent, rgba(13,148,136,0.42), rgba(190,242,100,0.4), rgba(14,165,233,0.35), transparent)',
    spark1:         'rgba(13,148,136,0.55)',
    spark2:         'rgba(14,165,233,0.5)',
    halo:           'radial-gradient(ellipse, rgba(13,148,136,0.28) 0%, rgba(190,242,100,0.16) 45%, rgba(14,165,233,0.10) 78%, transparent 100%)',
    orb1Border:     '1px solid rgba(13,148,136,0.22)',
    orb1Dot:        '#0d9488',
    orb1Shadow:     '0 0 10px #0d9488, 0 0 22px rgba(13,148,136,0.55)',
    orb2Border:     '1px solid rgba(14,165,233,0.16)',
    orb2Dot:        '#0ea5e9',
    orb2Shadow:     '0 0 8px #0ea5e9, 0 0 16px rgba(14,165,233,0.5)',
    gradientBorder: 'linear-gradient(135deg, #0d9488 0%, #bef264 50%, #0ea5e9 100%)',
    ripple:         (i: number) => `1px solid rgba(13,148,136,${0.25 - i * 0.06})`,
    logoGlow:       'radial-gradient(circle, rgba(13,148,136,0.32) 0%, rgba(190,242,100,0.16) 45%, transparent 78%)',
    nameGradient:   'linear-gradient(135deg, #0d9488 0%, #65a30d 45%, #0ea5e9 100%)',
    bottomBar:      'linear-gradient(90deg, #0d9488, #bef264, #0ea5e9, #bef264, #0d9488)',
    conicRays:      'conic-gradient(from 0deg, transparent 0deg, rgba(13,148,136,0.06) 25deg, transparent 50deg, rgba(190,242,100,0.05) 85deg, transparent 110deg, rgba(14,165,233,0.06) 145deg, transparent 170deg, rgba(13,148,136,0.05) 205deg, transparent 230deg, rgba(190,242,100,0.04) 265deg, transparent 290deg, rgba(14,165,233,0.05) 330deg, transparent 360deg)',
    closeHover:     'rgba(13,148,136,0.12)',
} as const;
