'use client';

import { useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useMotionValue, useTransform, type Variants } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { aboutData } from '@/features/public/nosotros/data/aboutData';
import { useScrollParallax, useScrollReveal } from '@/shared/hooks/useGsapScroll';
import { fadeUp, staggerContainer, cardItem, wordUp } from '@/shared/lib/motion/variants';
import { useAutoPingPong, useIsMobile, CarouselStage, CarouselDots } from '@/features/public/nosotros/components/AutoCarousel';

/** Ensambla cada letra del acróstico con un salto elástico + destello final, tipo "juego" Google Labs. */
const letterAssemble: Variants = {
    hidden: { opacity: 0, scale: 0.3, y: 24, rotate: -12 },
    show: (idx: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        textShadow: [
            '0 0 0px rgba(143,195,161,0)',
            '0 0 26px rgba(56,189,248,0.9)',
            '0 0 0px rgba(143,195,161,0)',
        ],
        transition: {
            default: { type: 'spring', stiffness: 260, damping: 15, delay: idx * 0.09 },
            textShadow: { duration: 0.9, times: [0, 0.5, 1], delay: idx * 0.09 + 0.15 },
        },
    }),
};

export default function AboutPage() {
    const reduceMotion = useReducedMotion();

    const [expandedLetters, setExpandedLetters] = useState<Set<string>>(new Set());
    const toggleLetter = (letter: string) => {
        setExpandedLetters((prev) => {
            const next = new Set(prev);
            if (next.has(letter)) next.delete(letter);
            else next.add(letter);
            return next;
        });
    };

    const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
    const toggleBlock = (idx: number) => {
        setExpandedBlocks((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const heroRef = useRef<HTMLElement>(null);
    const orb1Ref = useRef<HTMLDivElement>(null);
    const orb2Ref = useRef<HTMLDivElement>(null);
    const aboutImageRef = useRef<HTMLDivElement>(null);

    // Carruseles automáticos "ida y vuelta" — solo en móvil. En desktop se muestran los
    // tres/cuatro elementos completos en grilla, sin auto-avance.
    const isMobile = useIsMobile();
    const [valuesPaused, setValuesPaused] = useState(false);
    const values = useAutoPingPong(aboutData.values.items.length, { intervalMs: 3400, paused: reduceMotion || valuesPaused || !isMobile });
    const activeValue = aboutData.values.items[values.index];

    const [sealsPaused, setSealsPaused] = useState(false);
    const seals = useAutoPingPong(aboutData.premiumIcons.length, { intervalMs: 3800, paused: reduceMotion || sealsPaused || !isMobile });
    const activeSeal = aboutData.premiumIcons[seals.index];

    // Scroll-linked choreography via the shared GSAP hooks (src/shared/hooks/useGsapScroll.ts):
    // hero parallax and image reveal. Each hook is self-cleaning and reduced-motion-gated —
    // no local gsap.context() bookkeeping needed here.
    useScrollParallax(orb1Ref, { yPercent: -30, xPercent: 10 }, { trigger: heroRef, start: 'top top', end: 'bottom top', scrub: 0.6 });
    useScrollParallax(orb2Ref, { yPercent: 24, xPercent: -8 }, { trigger: heroRef, start: 'top top', end: 'bottom top', scrub: 0.6 });
    useScrollReveal(aboutImageRef, { from: 'inset(0 0 100% 0 round 2.5rem)', to: 'inset(0 0 0% 0 round 2.5rem)' });

    return (
        <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] overflow-hidden">

            {/* ── Hero ── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed"
                    style={{ backgroundImage: `url('/${aboutData.hero.bgImage1}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/70 dark:from-black/80 dark:via-black/55 dark:to-[var(--bg-primary)]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-cyan-300/10 dark:from-[var(--brand-green)]/30 dark:to-transparent" />

                {/* Orbes decorativos — respiran en calma y además responden al scroll */}
                <motion.div
                    ref={orb1Ref}
                    aria-hidden
                    className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-sky-400/25 dark:bg-[var(--icons-green)]/15 blur-[90px] pointer-events-none will-change-transform"
                    animate={reduceMotion ? undefined : { y: [0, 22, 0], scale: [1, 1.06, 1] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    ref={orb2Ref}
                    aria-hidden
                    className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-cyan-300/20 dark:bg-[var(--brand-green)]/25 blur-[100px] pointer-events-none will-change-transform"
                    animate={reduceMotion ? undefined : { y: [0, -26, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center py-16">

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={staggerContainer}
                        className="text-center"
                    >
                        <motion.p
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 text-white/90 text-[10px] md:text-xs tracking-[0.35em] uppercase font-bold mb-5 px-4 py-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md"
                        >
                            <Icon name="Leaf" className="w-3.5 h-3.5 text-sky-400 dark:text-[var(--icons-green)]" />
                            {aboutData.hero.tagline}
                        </motion.p>

                        <motion.h1
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tighter drop-shadow-2xl flex flex-wrap items-center justify-center gap-x-4"
                            style={{ perspective: 800 }}
                        >
                            {aboutData.hero.title.split(' ').map((word, i) => (
                                <motion.span key={`${word}-${i}`} variants={wordUp} className="inline-block">
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mt-5 text-base md:text-xl text-white/85 font-semibold max-w-xl mx-auto tracking-tight"
                        >
                            {aboutData.hero.subtitle}
                        </motion.p>

                        <motion.div variants={fadeUp} className="mt-9 flex items-center justify-center gap-4">
                            <motion.div
                                whileHover={{ rotateY: 18, rotateX: -8, scale: 1.06 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                                style={{ perspective: 600 }}
                                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-4 ring-white/30 shadow-[0_0_24px_rgba(56,189,248,0.45)] dark:shadow-[0_0_24px_rgba(143,195,161,0.4)]"
                            >
                                <Image
                                    src="/img/nosotros/organic-1024x1024.avif"
                                    alt="Lyrium BioMarketplace — bienestar natural"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </motion.div>
                            <div className="h-8 w-px bg-white/25" />
                            <p className="text-white/75 text-xs md:text-sm font-semibold uppercase tracking-widest text-left">
                                Bio comunidad<br className="hidden sm:block" /> certificada
                            </p>
                        </motion.div>
                    </motion.div>

                </div>

                {/* Indicador de scroll */}
                <motion.div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
                    animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Icon name="ChevronDown" className="w-6 h-6 text-white/60" />
                </motion.div>
            </section>

            {/* ── ¿Qué es Lyrium? — bloques jugables ── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="space-y-6"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-[var(--bg-secondary)] border border-sky-100 dark:border-[var(--border-subtle)] rounded-full"
                        >
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-sky-500 dark:bg-[var(--icons-green)] opacity-75 animate-ping" />
                                <span className="relative inline-flex w-2 h-2 rounded-full bg-sky-500 dark:bg-[var(--icons-green)]" />
                            </span>
                            <span className="text-xs font-bold text-sky-600 dark:text-[#6BAF7B] uppercase tracking-widest">
                                Vida · Salud · Bienestar
                            </span>
                        </motion.div>

                        <motion.h2
                            variants={fadeUp}
                            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] leading-[1.1] tracking-tight"
                        >
                            {aboutData.aboutSection.title}
                        </motion.h2>

                        {/* Tarjetas jugables — toca para expandir/colapsar cada bloque */}
                        <motion.div variants={fadeUp} className="space-y-3">
                            {aboutData.aboutSection.paragraphs.map((p, i) => {
                                const isOpen = expandedBlocks.has(i);
                                return (
                                    <motion.div
                                        key={`about-${i}`}
                                        layout
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={isOpen}
                                        onClick={() => toggleBlock(i)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleBlock(i);
                                            }
                                        }}
                                        whileHover={{ y: -3 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={`group cursor-pointer select-none rounded-2xl border transition-colors duration-300 p-5 md:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-[var(--icons-green)] ${
                                            i === 0
                                                ? 'border-l-4 border-sky-500 dark:border-[var(--icons-green)] bg-sky-50/50 dark:bg-[var(--bg-secondary)]/50'
                                                : 'border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] hover:border-sky-200 dark:hover:border-[var(--icons-green)]/40'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p
                                                className={`text-justify text-slate-600 dark:text-[var(--text-muted)] leading-relaxed text-base md:text-lg ${
                                                    i === 0 ? 'font-semibold text-slate-900 dark:text-[var(--text-primary)]' : ''
                                                } ${isOpen ? '' : 'line-clamp-2'}`}
                                            >
                                                {p}
                                            </p>
                                            <Icon
                                                name="ChevronDown"
                                                className={`shrink-0 mt-1 w-4 h-4 text-slate-300 dark:text-[var(--text-muted)] transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180 text-sky-500 dark:text-[var(--icons-green)]' : 'group-hover:translate-y-0.5'
                                                }`}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-sky-400/20 dark:bg-[var(--brand-green)]/60 rounded-[3rem] blur-2xl group-hover:bg-sky-400/30 dark:group-hover:bg-[var(--icons-green)]/30 transition-all duration-700" />
                        <div
                            ref={aboutImageRef}
                            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-[#111A15] aspect-[4/3]"
                        >
                            <Image
                                src={`/${aboutData.aboutSection.image}`}
                                alt="Lyrium BioMarketplace"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover object-[center_25%] transform group-hover:scale-105 transition-transform duration-[2000ms]"
                            />
                            <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-[var(--border-subtle)]">
                                <p className="text-sky-600 dark:text-[#6BAF7B] font-black uppercase text-xs tracking-widest mb-1">Especialistas en BioSalud</p>
                                <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)] text-lg">Compromiso Lyrium</h4>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* ── Nuestros Valores — tiles estilo Google Labs ── */}
            <section className="py-24 md:py-32 px-6 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="max-w-7xl mx-auto">

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="max-w-2xl mx-auto text-center space-y-5 mb-14 md:mb-20"
                    >
                        <motion.span
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-[#6BAF7B] uppercase tracking-widest"
                        >
                            <Icon name="Star" className="w-3.5 h-3.5 fill-sky-600 dark:fill-[#6BAF7B]" />
                            Lo que nos define
                        </motion.span>
                        <motion.h2
                            variants={fadeUp}
                            className="text-3xl md:text-5xl font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tighter leading-[1.05] text-balance"
                        >
                            {aboutData.values.title}
                        </motion.h2>
                        <motion.div variants={fadeUp} className="h-1 w-16 bg-gradient-to-r from-sky-400 to-sky-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)] rounded-full mx-auto" />
                    </motion.div>

                    {/* ── Móvil: carrusel automático "ida y vuelta" ── */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        onMouseEnter={() => setValuesPaused(true)}
                        onMouseLeave={() => setValuesPaused(false)}
                        onFocus={() => setValuesPaused(true)}
                        onBlur={() => setValuesPaused(false)}
                        className="mx-auto max-w-2xl md:hidden"
                    >
                        <CarouselStage activeKey={activeValue.title} direction={values.direction} className="min-h-[260px] sm:min-h-[240px]">
                            <div className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-[#f8f9fa]/80 p-7 backdrop-blur-sm sm:min-h-[240px] md:p-9 dark:border-[var(--border-subtle)] dark:bg-[var(--bg-primary)]/60">
                                {/* Barrido de luz diagonal — loop suave */}
                                {!reduceMotion && (
                                    <motion.div
                                        aria-hidden
                                        className="pointer-events-none absolute -inset-y-16 -left-1/4 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10"
                                        animate={{ x: ['-40%', '340%'] }}
                                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.8 }}
                                    />
                                )}

                                <div className="relative flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 md:h-14 md:w-14 dark:bg-[var(--bg-muted)] dark:text-[#6BAF7B]">
                                        <Icon name={activeValue.icon} className="h-6 w-6 md:h-7 md:w-7" />
                                    </div>
                                    <span className="text-sm font-black tabular-nums tracking-tight text-sky-200 dark:text-[var(--icons-green)]/40">
                                        0{values.index + 1}
                                    </span>
                                </div>

                                <div className="relative min-w-0">
                                    <h3 className="mb-1.5 text-lg font-black tracking-tight text-slate-800 md:text-xl dark:text-[var(--text-primary)]">
                                        {activeValue.title}
                                    </h3>
                                    <p className="text-sm font-medium leading-relaxed text-slate-500 md:text-base dark:text-[var(--text-muted)]">
                                        {activeValue.description}
                                    </p>
                                </div>
                            </div>
                        </CarouselStage>

                        <div className="mt-6">
                            <CarouselDots total={aboutData.values.items.length} activeIndex={values.index} label="Nuestros valores" />
                        </div>
                    </motion.div>

                    {/* ── Desktop/tablet: los tres valores completos, en grilla, sin carrusel ── */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="hidden md:grid grid-cols-3 gap-5 md:gap-6"
                    >
                        {aboutData.values.items.map((val, idx) => (
                            <motion.div
                                key={val.title}
                                variants={cardItem}
                                whileHover={{ y: -6, scale: 1.015 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                className="group relative overflow-hidden rounded-3xl border border-slate-100 dark:border-[var(--border-subtle)] bg-[#f8f9fa]/80 dark:bg-[var(--bg-primary)]/60 backdrop-blur-sm p-7 md:p-8 flex flex-col justify-between min-h-[240px] md:min-h-[260px]"
                            >
                                {/* Barrido de luz diagonal — loop suave y escalonado */}
                                {!reduceMotion && (
                                    <motion.div
                                        aria-hidden
                                        className="pointer-events-none absolute -inset-y-16 -left-1/4 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"
                                        animate={{ x: ['-40%', '340%'] }}
                                        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.6, repeatDelay: 1.6 }}
                                    />
                                )}

                                <div className="relative flex items-center justify-between">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sky-50 dark:bg-[var(--bg-muted)] flex items-center justify-center text-sky-600 dark:text-[#6BAF7B] group-hover:scale-105 transition-transform duration-300">
                                        <Icon name={val.icon} className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <span className="text-sm font-black text-sky-200 dark:text-[var(--icons-green)]/40 tabular-nums tracking-tight">
                                        0{idx + 1}
                                    </span>
                                </div>

                                <div className="relative min-w-0">
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-1.5 tracking-tight">
                                        {val.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                        {val.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Imagen decorativa — flota en loop continuo */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative mt-10 md:mt-12 max-w-3xl mx-auto"
                    >
                        <motion.div
                            aria-hidden
                            animate={reduceMotion ? undefined : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.05, 1] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-300/40 to-cyan-200/30 dark:from-[var(--icons-green)]/25 dark:to-transparent blur-2xl pointer-events-none"
                        />
                        <motion.div
                            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 dark:border-[var(--border-subtle)]"
                        >
                            <Image
                                src="/img/nosotros/Mucho.jpg"
                                alt="Equipo de salud Lyrium acompañando con cuidado a un paciente"
                                width={960}
                                height={420}
                                className="w-full h-56 sm:h-64 md:h-72 object-cover object-[center_20%]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/0 to-transparent" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Nuestra Relación Contigo · Acróstico LYRIUM — el juego estrella ── */}
            <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#f8f9fa] dark:bg-[var(--bg-primary)]">
                <div className="relative max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="text-center mb-16 space-y-4"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-sky-100 dark:border-[var(--border-subtle)] rounded-full mb-2 shadow-sm"
                        >
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 dark:bg-[var(--icons-green)] opacity-75 animate-ping" />
                                <span className="relative inline-flex w-2 h-2 rounded-full bg-sky-400 dark:bg-[var(--icons-green)]" />
                            </span>
                            <span className="text-xs font-bold text-sky-600 dark:text-[var(--icons-green)] uppercase tracking-widest">
                                Compromiso
                            </span>
                        </motion.div>
                        <motion.h2
                            variants={fadeUp}
                            className="text-3xl md:text-5xl font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tighter"
                        >
                            {aboutData.acrosticSection.title}
                        </motion.h2>
                        <motion.p
                            variants={fadeUp}
                            className="text-base md:text-lg text-slate-500 dark:text-[var(--text-muted)] font-medium max-w-2xl mx-auto"
                        >
                            {aboutData.acrosticSection.subtitle}
                        </motion.p>

                        {/* Acróstico LYRIUM — se ensambla solo con salto elástico + destello, y luego respira */}
                        <div className="flex items-center justify-center gap-1 pt-5">
                            {aboutData.acrosticSection.items.map((item, idx) => (
                                <motion.span
                                    key={item.letter}
                                    custom={idx}
                                    variants={letterAssemble}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true, margin: '-40px' }}
                                    className="inline-block"
                                >
                                    <motion.span
                                        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                                        transition={{ duration: 3 + idx * 0.3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.15 + 1.1 }}
                                        className={`inline-block text-4xl md:text-5xl font-black tracking-tighter transition-colors duration-300 ${
                                            expandedLetters.has(item.letter)
                                                ? 'text-sky-600 dark:text-[var(--icons-green)]'
                                                : 'text-sky-500/70 dark:text-[var(--icons-green)]/60'
                                        }`}
                                    >
                                        {item.letter}
                                    </motion.span>
                                </motion.span>
                            ))}
                        </div>

                        {/* Pista didáctica — visible en cualquier dispositivo hasta que el usuario toque una letra */}
                        {expandedLetters.size === 0 && (
                            <motion.p
                                variants={fadeUp}
                                animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5], y: [2, -2, 2] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-500 dark:text-[var(--icons-green)] pt-1"
                            >
                                <Icon name="MousePointerClick" className="w-3.5 h-3.5" />
                                Toca cualquier letra para descubrirla
                            </motion.p>
                        )}
                    </motion.div>

                    {/* ── Lista vertical: una letra por fila ── */}
                    <div style={{ perspective: '1000px' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={staggerContainer}
                        className="relative flex flex-col gap-4 md:gap-5"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Línea conectora — decorativa, ya no es una barra de progreso de scroll */}
                        <motion.div
                            initial={{ opacity: 0, scaleY: 0.6 }}
                            whileInView={{ opacity: 1, scaleY: 1 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformOrigin: 'top' }}
                            className="absolute left-8 md:left-10 top-2 bottom-2 w-px bg-gradient-to-b from-sky-300 via-sky-200 to-transparent dark:from-[var(--icons-green)]/70 dark:via-[var(--border-subtle)] dark:to-transparent pointer-events-none"
                        />

                        {aboutData.acrosticSection.items.map((item, idx) => {
                            const isOpen = expandedLetters.has(item.letter);
                            return (
                                <motion.div
                                    key={item.letter}
                                    variants={cardItem}
                                    layout
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={isOpen}
                                    onClick={() => toggleLetter(item.letter)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleLetter(item.letter);
                                        }
                                    }}
                                    whileHover={{ y: -4, rotateX: 3, rotateY: -1 }}
                                    className={`group relative flex items-center gap-4 sm:gap-5 md:gap-7 cursor-pointer select-none bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border transition-all duration-500 p-5 md:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-[var(--icons-green)] ${
                                        isOpen
                                            ? 'border-sky-400 dark:border-[var(--icons-green)] shadow-xl ring-1 ring-sky-100 dark:ring-[var(--icons-green)]/30'
                                            : 'border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]'
                                    }`}
                                >
                                    {/* ── Insignia de letra ── */}
                                    <div
                                        className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:via-[var(--brand-green-hover)] dark:to-[var(--icons-green)] flex items-center justify-center shadow-md transition-all duration-500 ${
                                            isOpen ? 'scale-110 shadow-lg ring-4 ring-sky-200/60 dark:ring-[var(--icons-green)]/25' : 'group-hover:scale-105 group-hover:shadow-lg'
                                        }`}
                                    >
                                        {/* Pulso continuo — invita a tocar en cualquier dispositivo, no solo hover */}
                                        {!isOpen && !reduceMotion && (
                                            <motion.span
                                                aria-hidden
                                                className="absolute inset-0 rounded-2xl ring-2 ring-sky-300 dark:ring-[var(--icons-green)]/70 pointer-events-none"
                                                animate={{ opacity: [0.7, 0, 0.7], scale: [1, 1.22, 1] }}
                                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: idx * 0.15 }}
                                            />
                                        )}
                                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] select-none">
                                            {item.letter}
                                        </span>
                                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-[var(--bg-primary)] border border-slate-100 dark:border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-sky-600 dark:text-[#6BAF7B] shadow-sm">
                                            {idx + 1}
                                        </span>
                                    </div>

                                    {/* ── Contenido ── */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] mb-1 tracking-tight leading-snug transition-colors duration-300">
                                            <Icon name={item.icon} className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-sky-500 dark:text-[#6BAF7B]" />
                                            {item.title}
                                        </h3>
                                        <p
                                            className={`text-sm md:text-[15px] font-medium leading-relaxed transition-colors duration-300 ${
                                                isOpen ? 'text-slate-700 dark:text-[var(--text-primary)]' : 'text-slate-500 dark:text-[var(--text-muted)]'
                                            }`}
                                        >
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* ── Indicador de expansión ── */}
                                    <Icon
                                        name="ChevronDown"
                                        className={`shrink-0 w-5 h-5 text-slate-300 dark:text-[var(--text-muted)] transition-transform duration-500 ${
                                            isOpen ? 'rotate-180 text-sky-500 dark:text-[var(--icons-green)]' : 'group-hover:translate-y-0.5'
                                        }`}
                                    />

                                    {/* Barra lateral */}
                                    <div
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-gradient-to-b from-sky-400 to-sky-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)] rounded-r-full transition-all duration-500 ${
                                            isOpen ? 'h-2/3' : 'h-0 group-hover:h-2/3'
                                        }`}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Premium Icons: Orgánico · Natural · Bienestar · Saludable ── */}
            <section className="py-24 md:py-32 bg-white dark:bg-[var(--bg-secondary)] relative overflow-hidden">
                <div className="w-full px-4 md:px-10">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-[#6BAF7B] uppercase tracking-widest"
                        >
                            Sello de calidad
                        </motion.span>
                    </motion.div>

                    {/* ── Móvil: carrusel automático "ida y vuelta" ── */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        onMouseEnter={() => setSealsPaused(true)}
                        onMouseLeave={() => setSealsPaused(false)}
                        onFocus={() => setSealsPaused(true)}
                        onBlur={() => setSealsPaused(false)}
                        className="mx-auto max-w-xs md:hidden"
                    >
                        <CarouselStage activeKey={activeSeal.title} direction={seals.direction} className="min-h-[360px]">
                            <TiltMedallion icon={activeSeal} idx={seals.index} reduceMotion={reduceMotion} />
                        </CarouselStage>

                        <div className="mt-8">
                            <CarouselDots total={aboutData.premiumIcons.length} activeIndex={seals.index} label="Sellos de calidad" />
                        </div>
                    </motion.div>

                    {/* ── Desktop/tablet: los cuatro sellos completos, en grilla, sin carrusel ── */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="hidden md:grid grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12"
                    >
                        {aboutData.premiumIcons.map((icon, idx) => (
                            <motion.div key={icon.title} variants={cardItem}>
                                <TiltMedallion icon={icon} idx={idx} reduceMotion={reduceMotion} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

        </main>
    );
}

type PremiumIcon = (typeof aboutData.premiumIcons)[number];

/**
 * Medallón de "sello de calidad" con tilt 3D que sigue el cursor (desktop) y respira
 * en loop continuo (todo dispositivo). Vive en su propio componente porque necesita
 * hooks (useMotionValue/useTransform) que no pueden llamarse dentro de un .map().
 */
function TiltMedallion({ icon, idx, reduceMotion }: { icon: PremiumIcon; idx: number; reduceMotion: boolean | null }) {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
    const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

    const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (reduceMotion) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };
    const resetTilt = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div className="flex flex-col items-center text-center group">
            <div
                className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 mb-8"
                style={{ perspective: 700 }}
                onPointerMove={handlePointerMove}
                onPointerLeave={resetTilt}
            >
                {/* Anillo tipo "manecilla de reloj" — gira en loop continuo, siempre en movimiento */}
                {!reduceMotion && (
                    <motion.div
                        aria-hidden
                        className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(14,165,233,0.35)_10%,transparent_22%)] dark:bg-[conic-gradient(from_0deg,transparent_0%,rgba(107,175,123,0.4)_10%,transparent_22%)] pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 7 + idx, repeat: Infinity, ease: 'linear' }}
                    />
                )}
                <div className="absolute -inset-2 border border-sky-100 dark:border-[var(--border-subtle)] rounded-full group-hover:border-sky-300 dark:group-hover:border-[var(--icons-green)]/50 transition-colors duration-500" />

                {/* Medallón — sigue el cursor en 3D (desktop) y respira en loop, escalonado por índice */}
                <motion.div
                    style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
                    animate={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
                    whileHover={reduceMotion ? undefined : { y: -8 }}
                    transition={{ duration: 4 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                    className="relative w-full h-full bg-white dark:bg-emerald-50 rounded-full shadow-md flex items-center justify-center p-6 border border-sky-50 dark:border-[var(--border-subtle)] group-hover:shadow-xl group-hover:shadow-sky-500/10 dark:group-hover:shadow-black/30 transition-shadow duration-500"
                >
                    <Image
                        src={`/${icon.image}`}
                        alt={icon.title}
                        width={160}
                        height={160}
                        className="w-4/5 h-4/5 object-contain transform translate-z-[28px] group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                    />
                </motion.div>

                <div className="absolute bottom-0 right-0 w-10 h-10 bg-sky-500 dark:bg-[#4A7C59] rounded-xl shadow-lg flex items-center justify-center transform translate-x-1/2 translate-y-1/2 group-hover:rotate-12 transition-transform">
                    <Icon name="Check" className="w-6 h-6 text-white" />
                </div>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-4 tracking-tight group-hover:text-sky-500 dark:group-hover:text-[#6BAF7B] transition-colors">
                {icon.title}
            </h3>
            <p className="text-sm md:text-base text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed max-w-[280px]">
                {icon.description}
            </p>
        </div>
    );
}
