'use client';

import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { aboutData } from '@/features/public/nosotros/data/aboutData';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] overflow-hidden">

            {/* ── Hero ── */}
            <section className="relative min-h-[420px] md:min-h-[520px] flex items-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('/${aboutData.hero.bgImage1}')` }}
                />
                <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

                <div className="relative z-10 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    <div className="animate-in text-center lg:text-left">
                        <p className="text-white/90 text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold mb-4 drop-shadow-lg">
                            {aboutData.hero.tagline}
                        </p>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                            {aboutData.hero.title}
                        </h1>
                        <div className="mt-8 mx-auto lg:mx-0 w-24 h-1 bg-sky-400 dark:bg-[var(--icons-green)] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)] animate-pulse" />
                    </div>

                    <div className="hidden lg:flex justify-center animate-in animate-delay-2">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 dark:from-[var(--icons-green)] dark:via-[var(--brand-green)] dark:to-[var(--icons-green)] rounded-[2rem] opacity-0 group-hover:opacity-70 blur-xl transition-all duration-700" />
                            <div className="absolute -inset-1 bg-gradient-to-br from-pink-400/30 via-transparent to-sky-400/30 dark:from-[var(--icons-green)]/20 dark:to-[var(--brand-green)]/20 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-md transition-all duration-500" />

                            <div className="relative bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-2 border border-white/30 group-hover:border-white/50 dark:border-[var(--border-subtle)] dark:group-hover:border-[var(--icons-green)]/50 transition-colors duration-500 shadow-2xl">
                                <Image
                                    src={`/${aboutData.aboutSection.image}`}
                                    alt="Lyrium BioMarketplace"
                                    width={420}
                                    height={320}
                                    className="rounded-[1.25rem] object-cover w-full h-[280px] md:h-[320px] transform group-hover:scale-[1.02] transition-transform duration-700"
                                />
                                <div className="absolute bottom-5 left-5 right-5 p-3 bg-white/80 dark:bg-[var(--bg-secondary)]/80 backdrop-blur-md rounded-xl text-center shadow-lg border border-white/40 dark:border-[var(--border-subtle)]">
                                    <p className="text-sky-600 dark:text-[var(--icons-green)] font-black text-xs uppercase tracking-widest">
                                        Lyrium BioMarketplace
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── ¿Qué es Lyrium? ── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <div className="space-y-6 animate-in animate-delay-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-[var(--bg-secondary)] border border-sky-100 dark:border-[var(--border-subtle)] rounded-full">
                            <span className="w-2 h-2 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full animate-ping" />
                            <span className="text-xs font-bold text-sky-600 dark:text-[#6BAF7B] uppercase tracking-widest">
                                Vida · Salud · Bienestar
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 dark:text-[var(--text-primary)] leading-[1.1] tracking-tight">
                            {aboutData.aboutSection.title}
                        </h2>

                        <div className="space-y-5 text-slate-600 dark:text-[var(--text-muted)] leading-relaxed text-base md:text-lg">
                            {aboutData.aboutSection.paragraphs.map((p, i) => (
                                <p
                                    key={`about-${i}`}
                                    className={`text-justify ${i === 0
                                        ? 'font-semibold text-slate-900 dark:text-[var(--text-primary)] border-l-4 border-sky-500 dark:border-[var(--icons-green)] pl-6 py-2 bg-sky-50/30 dark:bg-[var(--bg-secondary)]/30 rounded-r-2xl'
                                        : ''
                                    }`}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="relative group animate-in animate-delay-2">
                        <div className="absolute -inset-4 bg-sky-400/20 dark:bg-[var(--brand-green)] rounded-[3rem] blur-2xl group-hover:bg-sky-400/30 dark:group-hover:bg-[var(--icons-green)] transition-all duration-700" />
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-[#111A15]">
                            <Image
                                src={`/${aboutData.aboutSection.image}`}
                                alt="Lyrium BioMarketplace"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]"
                            />
                            <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/90 dark:bg-[var(--bg-secondary)]/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-[var(--border-subtle)]">
                                <p className="text-sky-600 dark:text-[#6BAF7B] font-black uppercase text-xs tracking-widest mb-1">Especialistas en BioSalud</p>
                                <h4 className="font-bold text-slate-800 dark:text-[var(--text-primary)] text-lg">Compromiso Lyrium</h4>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── Nuestros Valores ── */}
            <section className="py-20 md:py-28 px-6 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-block p-3 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-2xl text-sky-600 dark:text-[#6BAF7B] mb-2 animate-bounce">
                            <Icon name="Star" className="w-6 h-6 fill-sky-600 dark:fill-[#6BAF7B]" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tighter">
                            {aboutData.values.title}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aboutData.values.items.map((val) => (
                            <div
                                key={val.title}
                                className="group relative p-8 md:p-10 bg-[#f8f9fa] dark:bg-[var(--bg-primary)] rounded-[2.5rem] border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="w-14 h-14 bg-sky-100 dark:bg-[var(--bg-muted)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                    <Icon name={val.icon} className="w-7 h-7 text-sky-600 dark:text-[#6BAF7B]" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-[var(--text-primary)] mb-3 tracking-tight">
                                    {val.title}
                                </h3>
                                <p className="text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                    {val.description}
                                </p>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-sky-400 dark:bg-[var(--icons-green)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Nuestra Relación Contigo · Acróstico LYRIUM ── */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] border border-sky-100 dark:border-[var(--border-subtle)] rounded-full mb-2 shadow-sm">
                            <span className="w-2 h-2 bg-sky-400 dark:bg-[var(--icons-green)] rounded-full animate-ping" />
                            <span className="text-xs font-bold text-sky-600 dark:text-[var(--icons-green)] uppercase tracking-widest">
                                Compromiso
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tighter">
                            {aboutData.acrosticSection.title}
                        </h2>
                        <p className="text-base md:text-lg text-slate-500 dark:text-[var(--text-muted)] font-medium max-w-2xl mx-auto">
                            {aboutData.acrosticSection.subtitle}
                        </p>

                        {/* Acróstico LYRIUM — word mark */}
                        <div className="flex items-center justify-center gap-1 pt-5">
                            {aboutData.acrosticSection.items.map((item, i) => (
                                <span
                                    key={item.letter}
                                    className="text-4xl md:text-5xl font-black text-sky-500 dark:text-[var(--icons-green)] tracking-tighter"
                                >
                                    {item.letter}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Grid de cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        {aboutData.acrosticSection.items.map((item, idx) => (
                            <div
                                key={item.letter}
                                className="group relative bg-white dark:bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] shadow-sm hover:shadow-2xl dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1"
                            >
                                {/* ── Bloque de letra ── */}
                                <div className="relative h-36 md:h-40 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:via-[var(--brand-green-hover)] dark:to-[var(--icons-green)] flex items-center justify-center overflow-hidden group-hover:from-sky-500 group-hover:to-sky-700 dark:group-hover:from-[var(--icons-green)] dark:group-hover:to-[var(--brand-green)] transition-all duration-700">
                                    {/* Círculos decorativos */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.07] rounded-full group-hover:bg-white/[0.12] transition-colors duration-700" />
                                    <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/[0.05] rounded-full group-hover:bg-white/[0.09] transition-colors duration-700" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.03] rounded-full group-hover:scale-110 transition-transform duration-700" />

                                    {/* Número de orden */}
                                    <span className="absolute top-4 right-5 text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                                        0{idx + 1}
                                    </span>

                                    {/* Letra principal */}
                                    <span className="relative text-7xl md:text-8xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:drop-shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-500 select-none">
                                        {item.letter}
                                    </span>
                                </div>

                                {/* ── Contenido ── */}
                                <div className="p-6 md:p-7">
                                    <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-[var(--text-primary)] mb-2.5 tracking-tight leading-snug group-hover:text-sky-700 dark:group-hover:text-[var(--icons-green)] transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm md:text-[15px] text-slate-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Barra inferior sutil en hover */}
                                <div className="h-[3px] w-0 group-hover:w-full bg-gradient-to-r from-sky-400 to-sky-600 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)] transition-all duration-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}
