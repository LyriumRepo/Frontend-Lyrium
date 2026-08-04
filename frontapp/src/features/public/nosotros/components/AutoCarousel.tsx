'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * `true` mientras el viewport esté por debajo del breakpoint `md` (768px) de Tailwind —
 * el carrusel de estas secciones es solo para móvil; en desktop se corta el auto-avance.
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 767.98px)');
        const update = () => setIsMobile(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);

    return isMobile;
}

/**
 * Avanza un índice automáticamente de 0 a `length - 1` y, al llegar al final,
 * se devuelve hasta 0 — un ciclo de "ida y vuelta" continuo, sin saltos bruscos
 * ni repetición del extremo. Se pausa si `paused` es true (hover/foco/reduced motion).
 */
export function useAutoPingPong(length: number, options: { intervalMs?: number; paused?: boolean } = {}) {
    const { intervalMs = 3200, paused = false } = options;
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const directionRef = useRef(1);

    useEffect(() => {
        if (length <= 1 || paused) return;

        const id = setInterval(() => {
            setIndex((prev) => {
                let dir = directionRef.current;
                let next = prev + dir;
                if (next < 0 || next >= length) {
                    dir = -dir;
                    next = prev + dir;
                }
                directionRef.current = dir;
                setDirection(dir);
                return next;
            });
        }, intervalMs);

        return () => clearInterval(id);
    }, [length, intervalMs, paused]);

    return { index, direction, setIndex };
}

type StageProps = {
    /** Clave del slide visible — dispara el crossfade al cambiar. */
    activeKey: string;
    /** +1 si avanza, -1 si retrocede. Da dirección al desplazamiento. */
    direction: number;
    className?: string;
    children: ReactNode;
};

/** Escenario donde los slides del carrusel se cruzan con fundido + desplazamiento corto. */
export function CarouselStage({ activeKey, direction, className = '', children }: StageProps) {
    const reduceMotion = useReducedMotion();
    const shift = reduceMotion ? 0 : 24 * (direction >= 0 ? 1 : -1);

    return (
        <div className={`relative ${className}`}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeKey}
                    initial={{ opacity: 0, x: shift }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -shift }}
                    transition={{ duration: reduceMotion ? 0.001 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

type DotsProps = {
    total: number;
    activeIndex: number;
    label: string;
};

/** Indicador de progreso del carrusel — puramente visual, el avance es automático. */
export function CarouselDots({ total, activeIndex, label }: DotsProps) {
    return (
        <div role="status" aria-label={label} className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    aria-hidden
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === activeIndex
                            ? 'w-7 bg-gradient-to-r from-sky-400 to-sky-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)]'
                            : 'w-1.5 bg-slate-200 dark:bg-[var(--border-subtle)]'
                    }`}
                />
            ))}
            <span className="sr-only">
                {activeIndex + 1} de {total}
            </span>
        </div>
    );
}
