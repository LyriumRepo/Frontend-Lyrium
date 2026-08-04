'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { aboutData } from '@/features/public/nosotros/data/aboutData';
import { useScrollParallax, useScrollReveal, useScrollProgressLine } from '@/shared/hooks/useGsapScroll';
import { fadeUp, staggerContainer, cardItem, wordUp } from '@/shared/lib/motion/variants';

export default function AboutPage() {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const toggleExpanded = (letter: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(letter)) next.delete(letter);
            else next.add(letter);
            return next;
        });
    };

    const heroRef = useRef<HTMLElement>(null);
    const orb1Ref = useRef<HTMLDivElement>(null);
    const orb2Ref = useRef<HTMLDivElement>(null);
    const aboutImageRef = useRef<HTMLDivElement>(null);
    const acrosticLineRef = useRef<HTMLDivElement>(null);
    const acrosticSectionRef = useRef<HTMLElement>(null);

    // Scroll-linked choreography via the shared GSAP hooks (src/shared/hooks/useGsapScroll.ts):
    // hero parallax, image reveal, and timeline-growth lines. Each hook is self-cleaning and
    // reduced-motion-gated — no local gsap.context() bookkeeping needed here.
    useScrollParallax(orb1Ref, { yPercent: -30, xPercent: 10 }, { trigger: heroRef, start: 'top top', end: 'bottom top', scrub: 0.6 });
    useScrollParallax(orb2Ref, { yPercent: 24, xPercent: -8 }, { trigger: heroRef, start: 'top top', end: 'bottom top', scrub: 0.6 });
    useScrollReveal(aboutImageRef, { from: 'inset(0 0 100% 0 round 2.5rem)', to: 'inset(0 0 0% 0 round 2.5rem)' });
    useScrollProgressLine(acrosticLineRef, { trigger: acrosticSectionRef, start: 'top 65%', end: 'bottom 75%' });

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

                {/* Orbes decorativos — flotan ambientalmente y además responden al scroll */}
                <motion.div
                    ref={orb1Ref}
                    aria-hidden
                    className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-sky-400/25 dark:bg-[var(--icons-green)]/15 blur-[90px] pointer-events-none will-change-transform"
                    animate={{ y: [0, 22, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    ref={orb2Ref}
                    aria-hidden
                    className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-cyan-300/20 dark:bg-[var(--brand-green)]/25 blur-[100px] pointer-events-none will-change-transform"
                    animate={{ y: [0, -26, 0] }}
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
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Icon name="ChevronDown" className="w-6 h-6 text-white/60" />
                </motion.div>
            </section>

            {/* ── ¿Qué es Lyrium? ── */}
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

                        <motion.div variants={fadeUp} className="space-y-5 text-slate-600 dark:text-[var(--text-muted)] leading-relaxed text-base md:text-lg">
                            {aboutData.aboutSection.paragraphs.map((p, i) => (
                                <p
                                    key={`about-${i}`}
                                    className={`text-justify ${i === 0
                                        ? 'font-semibold text-slate-900 dark:text-[var(--text-primary)] border-l-4 border-sky-500 dark:border-[var(--icons-green)] pl-6 py-3 bg-sky-50/50 dark:bg-[var(--bg-secondary)]/50 rounded-r-2xl'
                                        : ''
                                    }`}
                                >
                                    {p}
                                </p>
                            ))}
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
                                sizes="(max-width: 768px) 100vw, 50vw"
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

            {/* ── Nuestros Valores ── */}
            <section className="py-24 md:py-32 px-6 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-start">

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="lg:sticky lg:top-32 space-y-5"
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
                        <motion.div variants={fadeUp} className="h-1 w-16 bg-gradient-to-r from-sky-400 to-sky-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)] rounded-full" />

                        {/* Imagen decorativa — flota en loop continuo, en cualquier dispositivo */}
                        <motion.div variants={fadeUp} className="relative mt-6">
                            <motion.div
                                aria-hidden
                                animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.05, 1] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-300/40 to-cyan-200/30 dark:from-[var(--icons-green)]/25 dark:to-transparent blur-2xl pointer-events-none"
                            />
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-100 dark:border-[var(--border-subtle)]"
                            >
                                <Image
                                    src="/img/nosotros/Mucho.jpg"
                                    alt="Equipo de salud Lyrium acompañando con cuidado a un paciente"
                                    width={640}
                                    height={480}
                                    className="w-full h-44 sm:h-52 md:h-60 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/0 to-transparent" />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <div style={{ perspective: '1000px' }}>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="space-y-3"
                    >
                        {aboutData.values.items.map((val, idx) => (
                            <motion.div
                                key={val.title}
                                variants={cardItem}
                                whileHover={{ y: -4, rotateX: 3, rotateY: -2, scale: 1.01 }}
                                className="group flex items-start gap-5 md:gap-6 p-6 md:p-7 rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] hover:border-sky-200 dark:hover:border-[var(--icons-green)]/40 hover:bg-[#f8f9fa] dark:hover:bg-[var(--bg-primary)]/60 transition-colors duration-300"
                            >
                                <span className="shrink-0 pt-1 text-sm font-black text-sky-200 dark:text-[var(--icons-green)]/40 tabular-nums tracking-tight">
                                    0{idx + 1}
                                </span>
                                <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] flex items-center justify-center text-sky-600 dark:text-[#6BAF7B] group-hover:scale-105 transition-transform duration-300">
                                    <Icon name={val.icon} className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-1 tracking-tight">
                                        {val.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                        {val.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Nuestra Relación Contigo · Acróstico LYRIUM ── */}
            <section ref={acrosticSectionRef} className="relative py-24 md:py-32 px-6 overflow-hidden bg-[#f8f9fa] dark:bg-[var(--bg-primary)]">
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

                        {/* Acróstico LYRIUM — word mark */}
                        <motion.div variants={fadeUp} className="flex items-center justify-center gap-1 pt-5">
                            {aboutData.acrosticSection.items.map((item) => (
                                <span
                                    key={item.letter}
                                    className={`text-4xl md:text-5xl font-black tracking-tighter transition-colors duration-300 ${
                                        expanded.has(item.letter)
                                            ? 'text-sky-600 dark:text-[var(--icons-green)]'
                                            : 'text-sky-500/70 dark:text-[var(--icons-green)]/60'
                                    }`}
                                >
                                    {item.letter}
                                </span>
                            ))}
                        </motion.div>

                        {/* Pista didáctica — visible en cualquier dispositivo hasta que el usuario toque una letra */}
                        {expanded.size === 0 && (
                            <motion.p
                                variants={fadeUp}
                                animate={{ opacity: [0.5, 1, 0.5], y: [2, -2, 2] }}
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
                        {/* Línea conectora del timeline — crece con el progreso real de scroll */}
                        <div className="absolute left-8 md:left-10 top-2 bottom-2 w-px bg-sky-100 dark:bg-[var(--border-subtle)] pointer-events-none overflow-hidden">
                            <div
                                ref={acrosticLineRef}
                                className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-sky-400 via-sky-500 to-sky-300 dark:from-[var(--icons-green)] dark:via-[var(--brand-green)] dark:to-transparent"
                                style={{ transform: 'scaleY(0)' }}
                            />
                        </div>

                        {aboutData.acrosticSection.items.map((item, idx) => {
                            const isOpen = expanded.has(item.letter);
                            return (
                                <motion.div
                                    key={item.letter}
                                    variants={cardItem}
                                    layout
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={isOpen}
                                    onClick={() => toggleExpanded(item.letter)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            toggleExpanded(item.letter);
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
                                        {!isOpen && (
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

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10 xl:gap-12"
                    >
                        {aboutData.premiumIcons.map((icon, idx) => (
                            <motion.div
                                key={icon.title}
                                variants={cardItem}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative w-36 h-36 md:w-44 md:h-44 xl:w-52 xl:h-52 mb-8">
                                    {/* Anillo tipo "manecilla de reloj" — gira en loop continuo, siempre en movimiento */}
                                    <motion.div
                                        aria-hidden
                                        className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(14,165,233,0.35)_10%,transparent_22%)] dark:bg-[conic-gradient(from_0deg,transparent_0%,rgba(107,175,123,0.4)_10%,transparent_22%)] pointer-events-none"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 7 + idx, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <div className="absolute -inset-2 border border-sky-100 dark:border-[var(--border-subtle)] rounded-full group-hover:border-sky-300 dark:group-hover:border-[var(--icons-green)]/50 transition-colors duration-500" />

                                    <div className="relative w-full h-full bg-white dark:bg-emerald-50 rounded-full shadow-md flex items-center justify-center p-6 border border-sky-50 dark:border-[var(--border-subtle)] group-hover:shadow-xl group-hover:shadow-sky-500/10 dark:group-hover:shadow-black/30 transition-all duration-500 transform group-hover:-translate-y-2">
                                        <Image
                                            src={`/${icon.image}`}
                                            alt={icon.title}
                                            width={160}
                                            height={160}
                                            className="w-4/5 h-4/5 object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                        />
                                    </div>

                                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-sky-500 dark:bg-[#4A7C59] rounded-xl shadow-lg flex items-center justify-center transform translate-x-1/2 translate-y-1/2 group-hover:rotate-12 transition-transform">
                                        <Icon name="Check" className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-4 tracking-tight group-hover:text-sky-500 dark:group-hover:text-[#6BAF7B] transition-colors">
                                    {icon.title}
                                </h3>
                                <p className="text-sm md:text-base text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed max-w-[220px]">
                                    {icon.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

        </main>
    );
}
