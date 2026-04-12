'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/Icon';
import { termsData, termsConfigs } from '@/features/public/terminoscondiciones/data/termsData';
import { sanitizeHtml } from '@/shared/lib/sanitize';

export default function TermsContent() {
    const [mode, setMode] = useState<'cliente' | 'vendedor'>('cliente');
    const [activeSection, setActiveSection] = useState<string>('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isBtnMini, setIsBtnMini] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const currentTerms = termsData[mode];
    const config = termsConfigs[mode];

    useEffect(() => {
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

        Object.values(sectionRefs.current).forEach(section => {
            if (section) observer.observe(section);
        });

        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                setIsBtnMini(window.pageYOffset > 100);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            observer.disconnect();
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [mode]);

    const scrollToSection = (id: string) => {
        if (typeof window === 'undefined') return;
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
        if (typeof window === 'undefined') return;
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
        if (typeof window === 'undefined') return;
        const url = `${window.location.origin}${window.location.pathname}#${mode}`;
        const text = encodeURIComponent(`Revisa los Términos y Condiciones de Lyrium Biomarketplace: ${url}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const shareOnFacebook = () => {
        if (typeof window === 'undefined') return;
        const url = encodeURIComponent(`${window.location.origin}${window.location.pathname}#${mode}`);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-12 relative animate-in bg-[#f7fbff] dark:bg-[var(--bg-primary)]">

            <section className="text-center space-y-6">
                <div className="inline-flex items-center gap-4 bg-sky-500 px-6 py-3 rounded-full shadow-lg text-white mb-4">
                    <Icon name="FileText" className="w-8 h-8 animate-float" />
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Términos y condiciones</h1>
                </div>
                <p className="text-gray-500 dark:text-[var(--text-secondary)] max-w-3xl mx-auto text-lg">
                    Revisa los términos aplicables al uso de <strong className="text-sky-600">LYRIUM BIO MARKETPLACE</strong>.
                    Usa las pestañas para cambiar entre Cliente y Vendedor.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <button
                        onClick={() => { setMode('cliente'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm border
              ${mode === 'cliente' ? 'bg-sky-500 text-white border-sky-400 shadow-sky-200' : 'bg-white dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-secondary)] border-gray-100 dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[#182420]'}`}
                    >
                        <Icon name="User" className="w-5 h-5" />
                        Del Cliente
                    </button>
                    <button
                        onClick={() => { setMode('vendedor'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-sm border
              ${mode === 'vendedor' ? 'bg-sky-500 text-white border-sky-400 shadow-sky-200' : 'bg-white dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-secondary)] border-gray-100 dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[#182420]'}`}
                    >
                        <Icon name="Store" className="w-5 h-5" />
                        Del Vendedor
                    </button>
                    <a
                        href={config.pdfHref}
                        download={config.pdfName}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white dark:bg-[var(--bg-secondary)] text-sky-600 border border-sky-100 dark:border-[var(--border-subtle)] shadow-sm hover:bg-sky-50 dark:hover:bg-[#182420] transition-all duration-300 shine-effect"
                    >
                        <Icon name="Download" className="w-5 h-5" />
                        {config.pdfLabel}
                    </a>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white dark:bg-[var(--bg-secondary)] text-sky-500 border border-sky-100 dark:border-[var(--border-subtle)] shadow-sm hover:bg-sky-50 dark:hover:bg-[#182420] transition-all duration-300"
                    >
                        <Icon name="Share2" className="w-5 h-5" />
                        Compartir
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">

                <aside className="hidden lg:block sticky top-28 bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <Icon name="List" className="w-5 h-5 text-sky-500" />
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">Contenido {mode === 'cliente' ? 'Cliente' : 'Vendedor'}</h4>
                    </div>
                    <nav className="space-y-1">
                        {currentTerms.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left text-[13.5px] font-semibold group
                  ${activeSection === section.id
                                        ? 'bg-sky-50 text-sky-600 border border-sky-100 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-sky-500'}`}
                            >
                                <span className="flex-1">{section.title}</span>
                                <Icon name="ChevronRight" className={`w-4 h-4 transition-all duration-300 
                  ${activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`}
                                />
                            </button>
                        ))}
                    </nav>
                </aside>

                <section className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 bg-[length:200%_100%] animate-shimmer-line"></div>

                    <div className="p-8 md:p-12 space-y-12">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter transition-all duration-500">{config.subtitle}</h2>
                            <div className="text-sky-500 font-bold text-sm tracking-widest">- LYRIUM BIOMARKETPLACE -</div>
                        </div>

                        <div className="space-y-12">
                            {currentTerms.map((section) => (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    ref={el => { sectionRefs.current[section.id] = el }}
                                    className="space-y-6 pt-10 border-t border-dashed border-gray-100 first:border-0 first:pt-0 group/section"
                                >
                                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight group-hover/section:text-sky-600 transition-colors">
                                        {section.title}
                                    </h3>
                                    <div
                                        className="text-gray-600 text-[16px] leading-relaxed terms-content"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 text-center text-sm text-gray-400 italic">
                            Última actualización: <strong>2025</strong>. Al usar LYRIUM BIO MARKETPLACE, aceptas los términos y condiciones.
                        </div>
                    </div>
                </section>
            </div>

            <button
                onClick={() => setIsPopupOpen(true)}
                className={`lg:hidden fixed bottom-[90px] right-6 z-40 bg-emerald-500 text-white flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95
          ${isBtnMini ? 'w-16 h-16 px-0 justify-center rounded-full' : 'w-auto'}`}
            >
                <Icon name="List" className="w-6 h-6" />
                {!isBtnMini && <span className="font-bold uppercase tracking-widest text-xs">Índice</span>}
            </button>

            <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isPopupOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 ${isPopupOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsPopupOpen(false)} role="presentation" aria-hidden="true" />
                <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-[3rem] shadow-2xl transition-transform duration-500 transform ${isPopupOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <span className="text-lg font-black uppercase tracking-tight text-gray-900">Contenido {mode === 'cliente' ? 'Cliente' : 'Vendedor'}</span>
                            <button onClick={() => setIsPopupOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900">
                                <Icon name="X" className="w-6 h-6" />
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
                                    <Icon name="ChevronRight" className="w-5 h-5 opacity-60" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isShareModalOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500 ${isShareModalOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsShareModalOpen(false)} role="presentation" aria-hidden="true" />
                <div className={`relative bg-white w-[90%] max-w-md rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 transform ${isShareModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Compartir Términos</h3>
                        <button onClick={() => setIsShareModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <Icon name="X" className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                            <button onClick={shareOnWhatsApp} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</span>
                            </button>
                            <button onClick={shareOnFacebook} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Facebook</span>
                            </button>
                            <button onClick={handleCopyLink} className="flex flex-col items-center gap-3 group transition-transform hover:-translate-y-1">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110
                  ${isCopied ? 'bg-green-100 text-green-600 shadow-green-50' : 'bg-gray-100 text-gray-500 shadow-gray-50 group-hover:bg-sky-50 group-hover:text-sky-500'}`}>
                                    {isCopied ? <Icon name="CheckCircle" className="w-8 h-8 animate-in" /> : <Icon name="Copy" className="w-8 h-8" />}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isCopied ? '¡Copiado!' : 'Enlace'}</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 group">
                            <div className="flex-1 truncate text-xs font-mono text-gray-400">
                                {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#${mode}` : ''}
                            </div>
                            <button onClick={handleCopyLink} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300
                ${isCopied ? 'bg-green-500 text-white' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-100'}`}>
                                {isCopied ? <Icon name="CheckCircle" className="w-4 h-4" /> : <Icon name="Copy" className="w-4 h-4" />}
                                {isCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
