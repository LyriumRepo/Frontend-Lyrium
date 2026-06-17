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
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('lyrium:open-chatbot'))}
                            className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]"
                            title="Chatea con nuestro asistente virtual"
                        >
                            <Icon name="MessageCircle" className="text-xl" />
                        </button>
                        <a href="mailto:soporte@lyrium.pe" target="_blank" className="social-icon-btn dark:text-[var(--text-secondary)] dark:hover:text-[#9BAF9F]" title="Envíanos un correo">
                            <Icon name="Mail" className="text-xl text-sky-200 dark:text-[var(--text-secondary)]" />
                        </a>
                    </div>
                    <p className="flex items-center gap-2 text-xs text-sky-100 dark:text-[var(--text-secondary)]">
                        <Icon name="Lock" className="text-xl" />
                        Tienda 100% segura
                    </p>
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
