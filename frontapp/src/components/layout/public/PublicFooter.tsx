'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { useCarritoStore } from '@/store/carritoStore';

export default function PublicFooter() {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const cartOpen = useCarritoStore((s) => s.ui.cartOpen);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <footer className="bg-sky-500 dark:bg-[var(--bg-secondary)] dark:border-t dark:border-[var(--border-subtle)] text-white mt-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 text-base">
                <div className="footer-section space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2">
                        <Image src="/img/logo_lyrium_blanco_01-scaled.webp" alt="Lyrium" width={200} height={48} className="h-10 md:h-12 w-auto" />
                    </div>
                    <p className="text-sm text-sky-100 dark:text-[var(--text-secondary)] max-w-xs">Biomarketplace de productos y servicios especializados.</p>
                    <div className="flex items-center gap-4 mt-2">
                        <a href="https://www.instagram.com/lyrium_biomarketplace/" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]" title="Síguenos en Instagram">
                            <Icon name="Instagram" className="text-xl" />
                        </a>
                        <a href="https://www.facebook.com/people/Lyrium-Biomarketplace/61579938364350/" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]" title="Síguenos en Facebook">
                            <Icon name="Facebook" className="text-xl" />
                        </a>
                        <a href="https://www.tiktok.com/@lyrium.biomarkep" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]" title="Síguenos en TikTok">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .8.11V9.4a6.27 6.27 0 0 0-3.11-.3A6.34 6.34 0 0 0 1 15.42a6.34 6.34 0 0 0 6.16 6.58 6.34 6.34 0 0 0 6.64-6.3V8.84a8.28 8.28 0 0 0 5.79 2.27V7.69a4.89 4.89 0 0 1-.04-1z"/>
                            </svg>
                        </a>
                        <a href="https://wa.me/51937093420" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]" title="Escríbenos por WhatsApp">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12.004 2c-5.51 0-9.99 4.49-9.99 10 0 1.9.53 3.68 1.46 5.21l-1.47 5.39 5.51-1.44c1.48.81 3.16 1.24 4.89 1.24 5.5 0 9.98-4.49 9.98-10s-4.48-10-9.98-10zm0 1.78c4.54 0 8.22 3.69 8.22 8.22s-3.68 8.22-8.22 8.22c-1.57 0-3.04-.45-4.3-1.22l-.31-.18-3.23.85.86-3.15-.2-.32c-.85-1.34-1.3-2.9-1.3-4.52 0-4.53 3.68-8.22 8.22-8.22zm-3.69 3.69c-.19 0-.44.07-.63.26-.2.19-.77.75-.77 1.83s.78 2.12.89 2.27c.11.15 1.54 2.35 3.73 3.3.52.22.92.36 1.24.46.52.17.99.14 1.37.09.42-.06 1.29-.53 1.47-1.04.19-.51.19-.95.13-1.04-.06-.09-.2-.15-.43-.26-.22-.11-1.3-.64-1.5-.72-.2-.07-.35-.11-.5.11-.15.22-.58.73-.72.88-.13.15-.27.17-.49.06-.23-.11-.96-.35-1.83-1.13-.68-.6-1.13-1.35-1.27-1.57-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-.1.69-1.22-.19-.46-.35-.4-.48-.41-.12-.01-.27-.01-.41-.01z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <button
                        onClick={() => toggleSection('contacto')}
                        className="footer-accordion-header md:cursor-default w-full flex items-center justify-between md:block focus:outline-none py-2 md:py-0 border-b border-white/10 dark:border-[var(--border-subtle)] md:border-0"
                    >
                        <h3 className="font-bold text-[15px] tracking-widest text-white/90 dark:text-[var(--text-primary)] uppercase text-left">CONTÁCTANOS</h3>
                        <Icon name="ChevronDown" className="md:hidden transition-transform duration-300" />
                    </button>
                    <div className={`footer-accordion-content ${openSections['contacto'] ? 'block' : 'hidden'} md:block mt-4 md:mt-4 space-y-3`}>
                        <p className="flex items-center justify-center md:justify-start gap-3 text-sm dark:text-[var(--text-secondary)]">
                            <Icon name="PhoneCall" className="text-xl text-sky-200 dark:text-[var(--text-secondary)]" />
                            +51 937 093 420
                        </p>
                        <p className="flex items-center justify-center md:justify-start gap-3 text-sm dark:text-[var(--text-secondary)]">
                            <Icon name="EnvelopeSimple" className="text-xl text-sky-200 dark:text-[var(--text-secondary)]" />
                            ventas@lyriumbiomarketplace.com
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
                        <li><Link href="/contactanos" className="hover:text-sky-200 dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] transition-colors">Contáctanos</Link></li>
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

            <div className="border-t border-white/20 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs md:text-sm text-sky-100 dark:text-[var(--text-secondary)] tracking-wide">
                    © 2025 LYRIUM BIOMARKETPLACE y sus afiliados. <br className="md:hidden" /> Todos los derechos reservados.
                </div>
            </div>

            <Link
                href="https://wa.me/51937093420"
                target="_blank"
                className={`fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hidden lg:flex items-center gap-2 text-base z-[100] transition-opacity duration-300 ${
                    cartOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                <Icon name="WhatsAppLogo" className="text-2xl" />
                ¿Cómo puedo ayudarte?
            </Link>
        </footer>
    );
}
