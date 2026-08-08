'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

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

/**
 * Escenario donde los slides del carrusel se transicionan con un círculo que se
 * cierra y luego se abre — el slide saliente se encoge hacia un punto central
 * (clip-path circle), y el entrante se revela desde ese mismo punto hacia afuera
 * hasta cubrir toda la tarjeta. Reemplaza al MotionPathPlugin de GSAP de la
 * referencia por `clipPath` animado con framer-motion (ya en el proyecto), sin
 * dependencias nuevas.
 */
export function CarouselStage({ activeKey, direction, className = '', children }: StageProps) {
    const reduceMotion = useReducedMotion();
    void direction; // el círculo no necesita saber la dirección, a diferencia del deslizamiento anterior

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeKey}
                    initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: reduceMotion ? 1 : 0.4 }}
                    animate={{ clipPath: 'circle(75% at 50% 50%)', opacity: 1 }}
                    exit={{ clipPath: 'circle(0% at 50% 50%)', opacity: reduceMotion ? 1 : 0.4 }}
                    transition={{ duration: reduceMotion ? 0.001 : 0.6, ease: [0.65, 0, 0.35, 1] }}
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

export type CarouselTab = {
    key: string;
    label: string;
    /** Ruta de imagen (relativa a /public) — para tabs con miniatura fotográfica, ej. los sellos de calidad. */
    image?: string;
    /** Nombre de ícono de lucide-react (ver ICON_MAP en Icon.tsx) — para tabs sin foto, ej. los valores. */
    icon?: string;
};

type TabsProps = {
    items: CarouselTab[];
    activeIndex: number;
    onSelect: (index: number) => void;
    label: string;
};

/**
 * Tabs circulares clicleables — cada uno con su miniatura (foto o ícono) — para saltar
 * directo a un slide del carrusel en vez de esperar el auto-avance. Inspirado en los
 * "tabs" de mini-círculo del componente de galería circular de 21st.dev, adaptado sin GSAP
 * ni CDN externo: solo framer-motion (ya en el proyecto) y los tokens de color día/noche.
 */
export function CarouselTabs({ items, activeIndex, onSelect, label }: TabsProps) {
    return (
        <div role="tablist" aria-label={label} className="flex items-center justify-center gap-3">
            {items.map((item, i) => {
                const isActive = i === activeIndex;
                return (
                    <button
                        key={item.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={item.label}
                        onClick={() => onSelect(i)}
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10 ${
                            isActive
                                ? 'scale-110 border-sky-500 shadow-md shadow-sky-500/20 dark:border-[var(--icons-green)] dark:shadow-black/30'
                                : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-sky-300 dark:border-[var(--border-subtle)] dark:hover:border-[var(--icons-green)]/60'
                        }`}
                    >
                        {item.image ? (
                            <Image src={`/${item.image}`} alt="" fill sizes="40px" className="object-contain p-1" />
                        ) : item.icon ? (
                            <Icon
                                name={item.icon}
                                className={`h-4 w-4 transition-colors duration-300 ${
                                    isActive ? 'text-sky-600 dark:text-[var(--icons-green)]' : 'text-slate-400 dark:text-[var(--text-muted)]'
                                }`}
                            />
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
