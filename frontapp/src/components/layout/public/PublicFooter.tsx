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
                            <Icon name="Music" className="text-xl" />
                        </a>
                        <a href="https://wa.me/51937093420" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F] flex items-center justify-center" title="Escríbenos por WhatsApp">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
                            <Icon name="Mail" className="text-xl text-sky-200 dark:text-[var(--text-secondary)]" />
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
                            <Icon name="Lock" className="text-xl" />
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
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                ¿Cómo puedo ayudarte?
            </Link>
        </footer>
    );
}
