'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

export default function PublicFooter() {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <footer className="bg-sky-500 dark:bg-[var(--bg-secondary)] dark:border-t dark:border-[var(--border-subtle)] text-white mt-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-2">
                <div className="relative h-px w-full max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-[var(--icons-green)]/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white dark:via-[var(--icons-green)] to-transparent blur-sm" />
                </div>
                <p className="mt-4 text-center text-xs sm:text-sm font-medium tracking-wide text-sky-50/90 dark:text-[var(--text-secondary)]">
                    🌿 El marketplace peruano de productos y servicios biológicos y orgánicos — compra, compara y agenda con tiendas verificadas.
                </p>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-10 text-base">
                <div className="footer-section space-y-4 flex flex-col items-center text-center lg:items-start lg:text-left">
                    <div className="flex items-center gap-2">
                        <Image src="/img/logo_lyrium_blanco_01-scaled.webp" alt="Lyrium" width={200} height={48} className="h-10 md:h-12 w-auto" />
                    </div>
                    <p className="text-sm text-sky-100 dark:text-[var(--text-secondary)] max-w-xs">Biomarketplace de productos y servicios saludables.</p>
                    <div className="flex flex-nowrap items-center justify-center lg:justify-start gap-1.5 min-[360px]:gap-2 mt-2">
                        <a href="https://www.instagram.com/lyrium_biomarketplace/" target="_blank" rel="noopener noreferrer" className="social-icon-btn w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors" title="Síguenos en Instagram">
                            <Icon name="Instagram" className="text-base" />
                        </a>
                        <a href="https://www.facebook.com/people/Lyrium-Biomarketplace/61579938364350/" target="_blank" rel="noopener noreferrer" className="social-icon-btn w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors" title="Síguenos en Facebook">
                            <Icon name="Facebook" className="text-base" />
                        </a>
                        <a href="https://www.tiktok.com/@lyrium.biomarkep" target="_blank" rel="noopener noreferrer" className="social-icon-btn w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors" title="Síguenos en TikTok">
                            <Icon name="Music" className="text-base" />
                        </a>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('lyrium:open-chatbot'))}
                            className="social-icon-btn w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors"
                            title="Chatea con nuestro asistente virtual"
                        >
                            <Icon name="Bot" className="text-base" />
                        </button>
                        <a href="https://wa.me/51937093420" target="_blank" rel="noopener noreferrer" className="social-icon-btn w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors" title="Escríbenos por WhatsApp">
                            <Icon name="MessageCircle" className="text-base" />
                        </a>
                    </div>
                </div>

                {/* Links: en mobile se apilan (acordeón); en tablet forman una
                    grilla propia de 4 columnas bien organizada; en desktop
                    "se disuelve" (display:contents) para volver a ser parte
                    del grid de 5 columnas de más arriba, junto a la marca. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:contents">
                <div className="footer-section min-w-0">
                    <button
                        onClick={() => toggleSection('contacto')}
                        className="footer-accordion-header md:cursor-default w-full flex items-center justify-between md:block focus:outline-none py-2 md:py-0 border-b border-white/10 dark:border-[var(--border-subtle)] md:border-0"
                    >
                        <h3 className="font-bold text-[15px] tracking-widest text-white/90 dark:text-[var(--text-primary)] uppercase text-left">CONTÁCTANOS</h3>
                        <Icon name="ChevronDown" className="md:hidden transition-transform duration-300" />
                    </button>
                    <div className={`footer-accordion-content ${openSections['contacto'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4 space-y-3`}>
                        <p className="flex items-center justify-center md:justify-start gap-3 text-sm dark:text-[var(--text-secondary)]">
                            <Icon name="PhoneCall" className="text-xl text-sky-200 dark:text-[var(--text-secondary)] shrink-0" />
                            +51 937 093 420
                        </p>
                        <p className="flex items-start justify-center md:justify-start gap-3 text-sm dark:text-[var(--text-secondary)] min-w-0">
                            <Icon name="EnvelopeSimple" className="text-xl text-sky-200 dark:text-[var(--text-secondary)] shrink-0 mt-0.5" />
                            <span className="break-all text-center md:text-left min-w-0">ventas@lyriumbiomarketplace.com</span>
                        </p>
                    </div>
                </div>

                <div className="footer-section">
                    <button
                        onClick={() => toggleSection('ayuda')}
                        className="footer-accordion-header md:cursor-default w-full flex items-center justify-between md:block focus:outline-none py-2 md:py-0 border-b border-white/10 dark:border-[var(--border-subtle)] md:border-0"
                    >
                        <h3 className="font-bold text-[15px] tracking-widest text-white/90 dark:text-[var(--text-primary)] uppercase text-left">¿TE AYUDAMOS?</h3>
                        <Icon name="ChevronDown" className="md:hidden transition-transform duration-300" />
                    </button>
                    <ul className={`footer-accordion-content ${openSections['ayuda'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4 space-y-3 text-sm`}>
                        <li><Link href="/preguntasfrecuentes" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Preguntas frecuentes</Link></li>
                        <li><Link href="/politicasdeprivacidad" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Políticas de privacidad</Link></li>
                        <li><Link href="/terminoscondiciones" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Términos y condiciones</Link></li>
                        <li><Link href="/manual-empaquetado" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Manual de empaquetado</Link></li>
                        <li><Link href="/contactanos" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Contáctanos</Link></li>
                        <li><Link href="/libroreclamaciones" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Libro de reclamaciones</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <button
                        onClick={() => toggleSection('informacion')}
                        className="footer-accordion-header md:cursor-default w-full flex items-center justify-between md:block focus:outline-none py-2 md:py-0 border-b border-white/10 dark:border-[var(--border-subtle)] md:border-0"
                    >
                        <h3 className="font-bold text-[15px] tracking-widest text-white/90 dark:text-[var(--text-primary)] uppercase text-left">INFORMACIÓN</h3>
                        <Icon name="ChevronDown" className="md:hidden transition-transform duration-300" />
                    </button>
                    <ul className={`footer-accordion-content ${openSections['informacion'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4 space-y-3 text-sm`}>
                        <li><Link href="/nosotros" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Nosotros</Link></li>
                        <li><Link href="/tiendasregistradas" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Tiendas registradas</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <button
                        onClick={() => toggleSection('pago')}
                        className="footer-accordion-header md:cursor-default w-full flex items-center justify-between md:block focus:outline-none py-2 md:py-0 border-b border-white/10 dark:border-[var(--border-subtle)] md:border-0"
                    >
                        <h3 className="font-bold text-[15px] tracking-widest text-white/90 dark:text-[var(--text-primary)] uppercase text-left">MÉTODOS DE PAGO</h3>
                        <Icon name="ChevronDown" className="md:hidden transition-transform duration-300" />
                    </button>
                    <div className={`footer-accordion-content ${openSections['pago'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4`}>
                        <p className="text-sm mb-3 text-sky-100 dark:text-[var(--text-secondary)]">Aceptamos tarjetas:</p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                            {/* VISA */}
                            <Image src="/img/intro/visa1.png" alt="Visa" width={50} height={30} className="h-10 w-auto object-contain" />
                            {/* MASTERCARD */}
                            <Image src="/img/intro/mastercard.png" alt="Mastercard" width={50} height={30} className="h-10 w-auto object-contain" />
                            {/* AMEX */}
                            <Image src="/img/intro/amex1.png" alt="American Express" width={50} height={30} className="h-10 w-auto object-contain" />
                            {/* YAPE */}
                            <Image src="/img/intro/yape.png" alt="Yape" width={50} height={30} className="h-10 w-auto object-contain" />
                            {/* PLIN */}
                            <Image src="/img/intro/logo-plin.png" alt="Plin" width={50} height={30} className="h-10 w-auto object-contain" />
                        </div>
                        <p className="flex items-center gap-2 text-sm text-sky-100 dark:text-[var(--text-secondary)]">
                            <Icon name="LockKey" className="text-xl" />
                            Tienda 100% segura
                        </p>
                    </div>
                </div>
                </div>
            </div>

            <div className="border-t border-white/20 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs md:text-sm text-sky-100 dark:text-[var(--text-secondary)] tracking-wide">
                    © 2025 LYRIUM BIOMARKETPLACE y sus afiliados. <br className="md:hidden" /> Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
