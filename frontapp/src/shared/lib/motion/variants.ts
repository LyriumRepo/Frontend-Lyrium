import type { Variants } from 'framer-motion';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + rise on enter. Default choice for text blocks and cards revealed via whileInView. */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** Wraps a group of children so they enter one after another. Pair with fadeUp / cardItem / wordUp. */
export const staggerContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** Fade + rise + scale, for grid/list cards inside a staggerContainer. */
export const cardItem: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

/** Per-word 3D rise, for hero headlines split into <motion.span> words inside a staggerContainer. */
export const wordUp: Variants = {
    hidden: { opacity: 0, y: 36, rotateX: -40 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

/** Simple fade, for overlays, backdrops, and content that shouldn't move. */
export const fade: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Scale + fade, for modals, popovers, and dialog-like surfaces. */
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE_OUT } },
};
