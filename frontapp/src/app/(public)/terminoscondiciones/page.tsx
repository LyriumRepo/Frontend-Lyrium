'use client';

import { useState, useEffect, useRef } from 'react';
import {
    FileText,
    UserCircle,
    Store,
    Package,
    Download,
    Share2,
    List,
    X,
    ChevronRight,
    CheckCircle2,
    Copy,
    Facebook,
    Phone as WhatsApp
} from 'lucide-react';
import { termsData, termsConfigs } from '@/shared/lib/constants/termsData';
import { manualSections } from '@/shared/lib/constants/manualData';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import TriviaWidget from '@/features/public/terminoscondiciones/TriviaWidget';

export default function TermsAndConditionsPage() {
    const [mode, setMode] = useState<'cliente' | 'vendedor' | 'manual'>('cliente');

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'manual' || hash === 'vendedor') {
            setMode(hash as 'manual' | 'vendedor');
        }
    }, []);
    const [activeSection, setActiveSection] = useState<string>('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBtnMini, setIsBtnMini] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const currentTerms = mode === 'manual' ? manualSections : termsData[mode];
    const config = mode === 'manual'
        ? { subtitle: 'MANUAL DE EMPAQUETADO — SALUD EN CADA PEDIDO', pdfLabel: 'Descargar PDF Manual', pdfHref: '/pdf/manual-empaquetado.pdf', pdfName: 'manual-empaquetado.pdf' }
        : termsConfigs[mode];

    const isBrowser = typeof window !== 'undefined';

    useEffect(() => {
        // 1. Intersection Observer para resaltar el índice
        const observerOptions = {
            root: null,
            rootMargin: '-150px 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        // Observar todas las secciones actuales
        Object.values(sectionRefs.current).forEach(section => {
            if (section) observer.observe(section);
        });

        // 2. Lógica de botón mini en móvil
        const handleScroll = () => {
            setIsBtnMini(window.pageYOffset > 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [mode]); // Re-ejecutar cuando cambia el modo porque las secciones cambian

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setIsPopupOpen(false);
        }
    };

    const handleCopyLink = async () => {
        const url = `${window.location.origin}${window.location.pathname}#${mode}`;
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const shareOnWhatsApp = () => {
        const url = `${window.location.origin}${window.location.pathname}#${mode}`;
        const text = encodeURIComponent(`Revisa los Términos y Condiciones de Lyrium Biomarketplace: ${url}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const shareOnFacebook = () => {
        const url = encodeURIComponent(`${window.location.origin}${window.location.pathname}#${mode}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-12 relative animate-in">
            <style>{`
              .terms-content table th,
              .terms-content table td {
                border-color: #555 !important;
                border-width: 1px !important;
                border-style: solid !important;
              }
              .terms-content .bg-green-50,
              .terms-content .bg-red-50,
              .terms-content .bg-yellow-50 {
                background-color: #f0f0f0 !important;
              }
              .terms-content .border-green-400,
              .terms-content .border-red-400,
              .terms-content .border-yellow-400 {
                border-left-color: #999 !important;
              }
              .terms-content .text-green-800,
              .terms-content .text-green-700,
              .terms-content .text-red-800,
              .terms-content .text-red-700,
              .terms-content .text-yellow-800,
              .terms-content .text-yellow-700 {
                color: #222 !important;
              }
              .terms-content td {
                color: #000 !important;
              }
            `}</style>

            {/* ===================== HEADER SECTION ===================== */}
            <section className="text-center space-y-6">
                <div className="flex justify-center mb-6">
                <h1 className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 md:py-4
                    w-full rounded-full
                    bg-gradient-to-r from-sky-500 dark:from-[#1A3A32] to-sky-400 dark:to-[var(--brand-green)]
                    text-white
                    shadow-[0_10px_25px_rgba(14,165,233,0.2)]
                    dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)]
                    font-black tracking-tight text-center
                    text-base sm:text-lg md:text-[clamp(20px,2.6vw,34px)]" >
                <FileText className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 shrink-0 animate-float" /> Términos y condiciones </h1>
</div>
                <p className="text-gray-500 dark:text-[var(--text-primary)] max-w-3xl mx-auto text-lg">
                    {mode === 'manual'
                        ? 'Guía paso a paso para el equipo de empaque — Lyrium Biomarketplace.'
                        : <>Revisa los términos aplicables al uso de <strong className="text-sky-600 dark:text-[var(--icons-green)]">LYRIUM BIO MARKETPLACE</strong>.
                    Usa las pestañas para cambiar entre Cliente y Vendedor.</>}
                </p>

                {/* TABS & ACTIONS */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <button
                        onClick={() => { setMode('cliente'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm border
              ${mode === 'cliente' ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white border-sky-400 dark:border-[var(--icons-green)] shadow-sky-200 dark:shadow-[var(--icons-green)]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                        <UserCircle className="w-5 h-5" />
                        Del Cliente
                    </button>
                    <button
                        onClick={() => { setMode('vendedor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm border
              ${mode === 'vendedor' ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white border-sky-400 dark:border-[var(--icons-green)] shadow-sky-200 dark:shadow-[var(--icons-green)]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                        <Store className="w-5 h-5" />
                        Del Vendedor
                    </button>
                    <button
                        onClick={() => { setMode('manual'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm border
              ${mode === 'manual' ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white border-sky-400 dark:border-[var(--icons-green)] shadow-sky-200 dark:shadow-[var(--icons-green)]' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                        <Package className="w-5 h-5" />
                        Manual Empaque
                    </button>
                    <a
                        href={config.pdfHref}
                        download={config.pdfName}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white text-sky-600 dark:text-[var(--brand-green)] border border-sky-100 shadow-sm hover:bg-sky-50 transition-all duration-300 shine-effect"
                    >
                        <Download className="w-5 h-5" />
                        {config.pdfLabel}
                    </a>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white text-sky-500 dark:text-[var(--brand-green)] border border-sky-100 shadow-sm hover:bg-sky-50 transition-all duration-300"
                    >
                        <Share2 className="w-5 h-5" />
                        Compartir
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">

                {/* ===================== SIDEBAR INDEX (Desktop) ===================== */}
                <aside className="hidden lg:block sticky top-28 bg-white/90 dark:bg-[#dddddd] backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <List className="w-5 h-5 text-sky-500 dark:text-[var(--brand-green)]" />
                        <h4 className="font-black text-sm tracking-widest text-[#333333]">Contenido {mode === 'cliente' ? 'Cliente' : mode === 'vendedor' ? 'Vendedor' : 'Manual'}</h4>
                    </div>
                    <nav className="space-y-1">
                        {currentTerms.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left text-[13.5px] font-semibold group
                  ${activeSection === section.id
                                        ? 'bg-sky-50 text-sky-600 dark:text-[var(--brand-green)] border border-sky-100 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-sky-500 dark:hover:text-[var(--brand-green-hover)]'}`}
                            >
                                <span className="flex-1">{section.title}</span>
                                <ChevronRight className={`w-4 h-4 transition-all duration-300 
                  ${activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                />
                            </button>
                        ))}
                    </nav>
                    <TriviaWidget />
                </aside>

                {/* ===================== CONTENT CARD ===================== */}
                <section className="bg-white/90 dark:bg-[#dddddd] backdrop-blur-md border border-gray-100 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 dark:bg-gradient-to-r dark:from-[var(--brand-green)] dark:via-[var(--brand-green)] dark:to-[var(--icons-green)] bg-[length:200%_100%] animate-shimmer-line"></div>

                    <div className="p-8 md:p-12 space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-[#333333] uppercase tracking-tighter transition-all duration-500">{config.subtitle}</h2>
                            <div className="text-sky-500 dark:text-[var(--brand-green)] font-bold text-sm tracking-widest">- LYRIUM BIOMARKETPLACE -</div>
                        </div>

                        <div className="space-y-12">
                            {currentTerms.map((section) => (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    ref={el => { sectionRefs.current[section.id] = el }}
                                    className="space-y-6 pt-10 border-t border-dashed border-gray-100 first:border-0 first:pt-0 group/section"
                                >
                                    <h3 className="text-2xl md:text-2xl font-bold text-[#333333] tracking-tight group-hover/section:text-sky-600 dark:group-hover/section:text-[var(--brand-green)] transition-colors">
                                        {section.title}
                                    </h3>
                                    <div
                                        className="text-justify text-gray-600 text-[16px] leading-relaxed terms-content"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
                                    />
                                </div>
                            ))}
                        </div>

                        {mode !== 'manual' && (
                            <div className="mt-8 pt-8 border-t border-gray-50 text-center text-sm text-gray-400 italic">
                                Última actualización: <strong>2025</strong>. Al usar LYRIUM BIOMARKETPLACE, aceptas los términos y condiciones.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ===================== TRIVIA MOBILE ===================== */}
            <div className="lg:hidden max-w-md mx-auto">
                <TriviaWidget />
            </div>

            {/* ===================== MOBILE INDEX POPUP ===================== */}
            <button
                onClick={() => setIsPopupOpen(true)}
                className={`lg:hidden fixed bottom-[90px] right-6 z-40 bg-emerald-500 text-white flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95
          ${isBtnMini ? 'w-16 h-16 px-0 justify-center rounded-full' : 'w-auto'}`}
            >
                <List className="w-6 h-6" />
                {!isBtnMini && <span className="font-bold uppercase tracking-widest text-xs">Índice</span>}
            </button>

            {/* MOBILE POPUP OVERLAY */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isPopupOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 ${isPopupOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsPopupOpen(false)} role="presentation" aria-hidden="true" />
                <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[3rem] shadow-2xl transition-transform duration-500 transform ${isPopupOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-lg font-black uppercase tracking-tight text-gray-900">Contenido {mode === 'cliente' ? 'Cliente' : mode === 'vendedor' ? 'Vendedor' : 'Manual'}</span>
                            <button onClick={() => setIsPopupOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                            {currentTerms.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left text-sm font-bold
                    ${activeSection === section.id ? 'bg-sky-500 text-white shadow-lg' : 'text-gray-600 bg-gray-50'}`}
                                >
                                    <span className="flex-1 truncate pr-4">{section.title}</span>
                                    <ChevronRight className="w-5 h-5 opacity-60" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== SHARE MODAL ===================== */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isShareModalOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500 ${isShareModalOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsShareModalOpen(false)} role="presentation" aria-hidden="true" />
                <div className={`relative bg-white w-[90%] max-w-md rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 transform ${isShareModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Compartir Términos</h3>
                        <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                            <button onClick={shareOnWhatsApp} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
                                    <WhatsApp className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</span>
                            </button>
                            <button onClick={shareOnFacebook} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                    <Facebook className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Facebook</span>
                            </button>
                            <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110
                  ${isCopied ? 'bg-green-100 text-green-600 shadow-green-50' : 'bg-gray-100 text-gray-500 shadow-gray-50 group-hover:bg-sky-50 group-hover:text-sky-500'}`}>
                                    {isCopied ? <CheckCircle2 className="w-8 h-8 animate-in" /> : <Copy className="w-8 h-8" />}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isCopied ? '¡Copiado!' : 'Enlace'}</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 group">
                            <div className="flex-1 truncate text-xs font-mono text-gray-400">
                                {isBrowser ? `${window.location.origin}${window.location.pathname}#${mode}` : ''}
                            </div>
                            <button onClick={handleCopyLink} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300
                ${isCopied ? 'bg-green-500 text-white' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-100'}`}>
                                {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </main>
    );
}
