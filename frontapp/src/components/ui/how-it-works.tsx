'use client';

/**
 * Layout de tarjetas "post-it" dispersas y conectadas por una línea punteada
 * animada. Adaptado del componente "how-it-works" de 21st.dev al sistema de
 * colores día/noche de Lyrium (sky-* en modo claro, var(--icons-green) /
 * var(--bg-secondary) en modo oscuro) — no trae paletas propias (naranja/
 * azul/morado) para no romper el theming del resto del sitio.
 *
 * Breakpoints:
 * - ≥768px (md, tablet y desktop): distribución dispersa izquierda/derecha
 *   con línea punteada animada. Tarjeta compacta (210px) entre 768–1023px,
 *   tamaño completo (280px) desde 1024px donde ya hay margen de sobra.
 * - <768px (móvil y phablets): columna única centrada con leve rotación
 *   alternada y línea punteada vertical — conserva el mismo espíritu visual
 *   sin que las tarjetas se salgan de pantalla ni se superpongan (el
 *   contenedor real es más angosto que el viewport por el padding de la
 *   sección, así que 640–767px no tiene margen seguro para el layout disperso).
 */

import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import Icon from '@/components/ui/Icon';

export interface HowItWorksStep {
    /** Letra o número corto mostrado en grande dentro de la tarjeta (ej. "L", "01") */
    marker: string;
    title: string;
    description: string;
    /** Nombre de ícono de lucide-react (ver ICON_MAP en Icon.tsx) */
    icon?: string;
}

interface CardPosition {
    top: number;
    side: 'left' | 'right';
    offset: string;
    rotate: string;
}

const CARD_POSITIONS: CardPosition[] = [
    { top: 0, side: 'left', offset: '15%', rotate: '' },
    { top: 160, side: 'right', offset: '13%', rotate: '' },
    { top: 440, side: 'left', offset: '13%', rotate: '' },
    { top: 580, side: 'right', offset: '15%', rotate: '' },
    { top: 860, side: 'left', offset: '15%', rotate: '' },
    { top: 1000, side: 'right', offset: '13%', rotate: '' },
];

const MOBILE_ROTATE = ['', '', '', '', '', ''];

/** Ancla aproximada (x,y) de cada tarjeta dentro del viewBox 1000×height, usada solo para la línea punteada decorativa. */
const PATH_ANCHORS = [
    { x: 290, y: 130 },
    { x: 710, y: 290 },
    { x: 290, y: 470 },
    { x: 710, y: 610 },
    { x: 290, y: 860 },
    { x: 710, y: 990 },
];

function buildDashedPath(count: number) {
    const pts = PATH_ANCHORS.slice(0, count);
    let d = '';
    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const midX = (a.x + b.x) / 2;
        d += i === 0 ? `M ${a.x} ${a.y} ` : '';
        d += `C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y} `;
    }
    return d.trim();
}

function Pin({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
        </svg>
    );
}

function CardBody({ step }: { step: HowItWorksStep }) {
    return (
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-2 rounded-[25px] shadow-[0px_10px_20px_0px_#D3D3D3] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-slate-100 dark:border-[var(--border-subtle)]">
            <Pin className="w-7 h-7 text-sky-500 dark:text-[var(--icons-green)] mb-4 mx-auto" />
            <div className="bg-sky-50 dark:bg-[var(--bg-primary)] border border-sky-100 dark:border-[var(--border-subtle)] rounded-[15px] p-[15px] h-full flex flex-col relative overflow-hidden">
                <div className="relative flex items-center justify-center mb-4">
                    <span className="text-3xl font-black tracking-tighter text-sky-600 dark:text-[var(--icons-green)]">
                        {step.marker}
                    </span>
                    {step.icon && (
                        <Icon name={step.icon} className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-[var(--icons-green)]" />
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] leading-snug mb-1.5 tracking-tight text-center">
                    {step.title}
                </h3>
                <p className="text-slate-500 dark:text-[var(--text-muted)] text-sm/5 tracking-tight text-center">
                    {step.description}
                </p>
            </div>
        </div>
    );
}

/** ≥640px: tarjeta posicionada de forma absoluta a izquierda/derecha, con rotación fija. */
function ScatteredCard({ step, position }: { step: HowItWorksStep; position: CardPosition }) {
    const sideStyle = position.side === 'left' ? { left: position.offset } : { right: position.offset };

    return (
        <div
            className={`absolute w-[210px] lg:w-[280px] transition-transform duration-300 hover:z-30 hover:scale-105 ${position.rotate}`}
            style={{ top: position.top, ...sideStyle }}
        >
            <CardBody step={step} />
        </div>
    );
}

/** <640px: columna única centrada, con leve rotación alternada por tarjeta. */
function StackedCard({ step, rotate }: { step: HowItWorksStep; rotate: string }) {
    return (
        <div className={`relative w-full max-w-[280px] mx-auto transition-transform duration-300 ${rotate}`}>
            <CardBody step={step} />
        </div>
    );
}

export default function HowItWorks({ steps, className }: { steps: HowItWorksStep[]; className?: string }) {
    const positions = CARD_POSITIONS.slice(0, steps.length);
    const lastTop = positions.length ? positions[positions.length - 1].top : 0;
    const height = lastTop + 300;

    return (
        <LazyMotion features={domAnimation}>
            <div className={`relative ${className ?? ''}`}>
                {/* ── ≥768px (tablet y desktop): distribución dispersa con línea punteada ── */}
                <div className="hidden md:block relative w-full max-w-[1000px] mx-auto" style={{ height }}>
                    {steps.length > 1 && (
                        <svg
                            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                            viewBox={`0 0 1000 ${height}`}
                            preserveAspectRatio="none"
                        >
                            <m.path
                                d={buildDashedPath(steps.length)}
                                stroke="currentColor"
                                className="text-sky-200 dark:text-[var(--border-subtle)]"
                                strokeWidth="2"
                                strokeDasharray="8 6"
                                fill="none"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                                initial={{ strokeDashoffset: 0 }}
                                animate={{ strokeDashoffset: -140 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                        </svg>
                    )}

                    {steps.map((step, idx) => (
                        <ScatteredCard key={step.marker} step={step} position={positions[idx]} />
                    ))}
                </div>

                {/* ── <768px (móvil): columna única, leve rotación alternada + línea vertical punteada ── */}
                <div className="relative md:hidden">
                    {steps.length > 1 && (
                        <div
                            aria-hidden
                            className="absolute left-1/2 top-6 bottom-6 w-0 border-l-2 border-dashed border-sky-200 dark:border-[var(--border-subtle)] -translate-x-1/2 pointer-events-none z-0"
                        />
                    )}
                    <div className="relative z-10 flex flex-col gap-8">
                        {steps.map((step, idx) => (
                            <StackedCard key={step.marker} step={step} rotate={MOBILE_ROTATE[idx % MOBILE_ROTATE.length]} />
                        ))}
                    </div>
                </div>
            </div>
        </LazyMotion>
    );
}
